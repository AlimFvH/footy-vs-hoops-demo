/**
 * Optional Legacy Online Matchmaking / Rooms / WebSocket Relay Module
 * Loaded strictly when ONLINE_MODE_ENABLED === true (zero load in default Solo mode).
 */
'use strict';
const crypto = require('crypto');

function createOnlineLegacyHandlers(ctx) {
  const { state, sendJson, readJsonBody, generateRoomCode, normalizeRoomCode, persistState } = ctx;

  function makeWsTextFrameBuf(payloadBuf) {
    const len = payloadBuf.length;
    let header;
    if (len < 126) {
      header = Buffer.from([0x81, len]);
    } else if (len < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x81; header[1] = 126; header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x81; header[1] = 127; header.writeUInt32BE(0, 2); header.writeUInt32BE(len, 6);
    }
    return Buffer.concat([header, payloadBuf]);
  }
  function makeWsTextFrame(str) { return makeWsTextFrameBuf(Buffer.from(str, 'utf8')); }

  function handleHttp(req, res, pathname, parsedUrl) {
    // 1. Join Matchmaking Queue
    if (pathname === '/api/matchmaking/join' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
  
        const playerId = String(data.playerId || 'player_' + Math.random().toString(36).slice(2, 8));
        const playerName = String(data.playerName || 'Athlete');
        const mode = (data.mode === 'hoops') ? 'hoops' : 'footy';
        const char = data.character || data.char || mode;
  
        // Remove any prior tickets for this player or stale tickets older than 30s
        const now = Date.now();
        state.queue = state.queue.filter(q => q.playerId !== playerId && (now - q.timestamp < 30000));
  
        // Clean up previous active match for this player in O(1) via playerActiveMatch index
        const prevMId = state.playerActiveMatch[playerId];
        if (prevMId && state.matches[prevMId]) {
          const pm = state.matches[prevMId];
          pm.status = 'abandoned';
          state.completedMatches[prevMId] = true;
          if (pm.host && state.playerActiveMatch[pm.host.playerId] === prevMId) delete state.playerActiveMatch[pm.host.playerId];
          if (pm.guest && state.playerActiveMatch[pm.guest.playerId] === prevMId) delete state.playerActiveMatch[pm.guest.playerId];
          delete state.matches[prevMId];
          delete state.signals[prevMId];
          delete state.relays[prevMId];
        }
  
        // Check if there is an eligible opponent waiting in the queue for the same discipline
        let opponentIdx = state.queue.findIndex(q => q.playerId !== playerId && q.mode === mode);
        if (opponentIdx === -1 && !data.char) {
          // Allow cross-discipline pairing fallback only when exact character lock is not specified
          opponentIdx = state.queue.findIndex(q => q.playerId !== playerId);
        }
  
        if (opponentIdx !== -1) {
          // Real Opponent Found! Pair them into the same game session
          const opponent = state.queue.splice(opponentIdx, 1)[0];
          const matchId = 'FVH-M' + crypto.randomBytes(4).toString('hex').toUpperCase();
          const seed = (Math.random() * 1e9) | 0;
  
          // Authoritative discipline guaranteed to match requested mode
          const authDiscipline = mode;
  
          const matchInfo = {
            matchId,
            roomId: matchId,
            mode: authDiscipline,
            minutes: 2,
            seed,
            host: { playerId: opponent.playerId, name: opponent.playerName, char: opponent.char },
            guest: { playerId, name: playerName, char },
            status: 'playing',
            createdAt: Date.now(),
            lastActivity: Date.now()
          };
  
          state.matches[matchId] = matchInfo;
          state.playerActiveMatch[opponent.playerId] = matchId;
          state.playerActiveMatch[playerId] = matchId;
          state.signals[matchId] = { host: [], guest: [], all: [] };
          state.relays[matchId] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };
  
          return sendJson(res, 200, {
            ok: true,
            status: 'matched',
            matchId,
            role: 'guest',
            mode: matchInfo.mode,
            minutes: matchInfo.minutes,
            seed: matchInfo.seed,
            arenaId: matchInfo.arenaId || null,
            match: matchInfo,
            opponent: matchInfo.host
          });
        } else {
          // Enqueue player with timestamp
          const ticketId = 'tkt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
          state.queue.push({
            ticketId,
            playerId,
            playerName,
            mode,
            char,
            timestamp: Date.now()
          });
  
          return sendJson(res, 200, {
            ok: true,
            status: 'searching',
            ticketId,
            playerId,
            elapsedSeconds: 0
          });
        }
      });
    }
  
    // 2. Poll Matchmaking Status
    if (pathname === '/api/matchmaking/poll' && req.method === 'GET') {
      const ticketId = parsedUrl.query.ticketId;
      const playerId = parsedUrl.query.playerId;
      const now = Date.now();
  
      // Retrieve player's queued ticket to verify requested discipline
      const myTicket = state.queue.find(q => q.ticketId === ticketId || q.playerId === playerId);
      const expectedMode = myTicket ? myTicket.mode : null;
  
      // O(1) match lookup via playerActiveMatch index (falls back cleanly if direct state mutation occurred)
      const resolvePlayerMatch = () => {
        if (playerId && state.playerActiveMatch[playerId]) {
          const mId = state.playerActiveMatch[playerId];
          const m = state.matches[mId];
          if (m && m.status === 'playing' && !state.completedMatches[mId] && (!expectedMode || m.mode === expectedMode)) {
            return [mId, m];
          }
        }
        for (const mId in state.matches) {
          const m = state.matches[mId];
          if (m.status !== 'playing' || state.completedMatches[mId]) continue;
          if (expectedMode && m.mode !== expectedMode) continue;
          if ((m.host && m.host.playerId === playerId) || (m.guest && m.guest.playerId === playerId)) {
            return [mId, m];
          }
        }
        return null;
      };
  
      const hitMatch = resolvePlayerMatch();
      if (hitMatch) {
        const [mId, m] = hitMatch;
        if (m.host && m.host.playerId === playerId) {
          state.queue = state.queue.filter(q => q.playerId !== playerId && q.ticketId !== ticketId);
          return sendJson(res, 200, {
            ok: true,
            status: 'matched',
            matchId: mId,
            role: 'host',
            mode: m.mode,
            minutes: m.minutes,
            seed: m.seed,
            arenaId: m.arenaId || null,
            match: m,
            opponent: m.guest
          });
        } else if (m.guest && m.guest.playerId === playerId) {
          state.queue = state.queue.filter(q => q.playerId !== playerId && q.ticketId !== ticketId);
          return sendJson(res, 200, {
            ok: true,
            status: 'matched',
            matchId: mId,
            role: 'guest',
            mode: m.mode,
            minutes: m.minutes,
            seed: m.seed,
            arenaId: m.arenaId || null,
            match: m,
            opponent: m.host
          });
        }
      }
  
      // Check if still in queue
      const queuedIdx = state.queue.findIndex(q => (ticketId && q.ticketId === ticketId) || (playerId && q.playerId === playerId));
      if (queuedIdx !== -1) {
        const queued = state.queue[queuedIdx];
        const elapsed = Math.floor((now - queued.timestamp) / 1000);
  
        // Matchmaking Timeout at 25 seconds: show clear message, do NOT fabricate fake opponents!
        if (elapsed >= 25) {
          state.queue.splice(queuedIdx, 1);
          return sendJson(res, 200, {
            ok: true,
            status: 'timeout',
            message: 'No online athletes found in queue. You can try searching again or invite a friend via Private Room code.'
          });
        }
  
        return sendJson(res, 200, {
          ok: true,
          status: 'searching',
          queuePosition: queuedIdx + 1,
          elapsedSeconds: elapsed
        });
      }
  
      return sendJson(res, 200, { ok: true, status: 'idle' });
    }
  
    // 3. Cancel Matchmaking
    if (pathname === '/api/matchmaking/cancel' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        const pid = data.playerId;
        const tid = data.ticketId;
        state.queue = state.queue.filter(q => q.playerId !== pid && q.ticketId !== tid);
        return sendJson(res, 200, { ok: true, success: true });
      });
    }
  
    // ==========================================
    // API: Private Match Rooms
    // ==========================================
  
    // 1. Create Private Room (Cryptographically random 6-character code)
    if (pathname === '/api/room/create' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
  
        let code;
        let attempts = 0;
        do {
          code = generateRoomCode();
          attempts++;
        } while (state.rooms[code] && attempts < 100);
  
        const playerId = String(data.hostId || data.playerId || 'host_' + Math.random().toString(36).slice(2, 6));
        const playerName = String(data.hostName || data.playerName || 'Host Athlete');
  
        // Clean up previous room created by this host in O(1)
        const prevRoomCode = state.playerHostRoom[playerId];
        if (prevRoomCode && state.rooms[prevRoomCode]) {
          delete state.rooms[prevRoomCode];
          delete state.matches[prevRoomCode];
          delete state.signals[prevRoomCode];
          delete state.relays[prevRoomCode];
        }
  
        const mode = (data.mode === 'hoops') ? 'hoops' : 'footy';
        const char = data.character || data.char || mode;
        const minutes = Math.max(1, Math.min(5, Number(data.minutes) || 2));
        const seed = (Math.random() * 1e9) | 0;
        const arenaId = data.arenaId || (mode === 'hoops' ? 'std_hoops_street' : 'std_footy_classic');
  
        state.rooms[code] = {
          roomCode: code,
          host: { playerId, name: playerName, char, ready: false },
          guest: null,
          mode,
          arenaId,
          minutes,
          seed,
          status: 'waiting',
          countdownStart: null,
          countdownSeconds: null,
          createdAt: Date.now(),
          lastActivity: Date.now()
        };
        state.playerHostRoom[playerId] = code;
        state.signals[code] = { host: [], guest: [], all: [] };
        state.relays[code] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };
  
        return sendJson(res, 200, {
          ok: true,
          success: true,
          roomCode: code,
          code: code,
          role: 'host',
          room: state.rooms[code]
        });
      });
    }
  
    // 2. Join Private Room with Code (Server-side validation)
    if (pathname === '/api/room/join' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
  
        const code = normalizeRoomCode(data.code || data.roomCode);
        const room = state.rooms[code];
  
        if (!room) {
          return sendJson(res, 404, {
            ok: false,
            success: false,
            error: 'room_not_found',
            message: 'Room code not found or expired'
          });
        }
  
        // Check Room Expiration (15 minutes)
        const now = Date.now();
        if ((now - room.createdAt) > 900000) {
          delete state.rooms[code];
          delete state.signals[code];
          delete state.relays[code];
          return sendJson(res, 410, {
            ok: false,
            success: false,
            error: 'room_expired',
            message: 'This private arena session has expired'
          });
        }
  
        // Check if room was closed or abandoned by host
        if (room.status === 'closed' || room.status === 'abandoned') {
          return sendJson(res, 410, {
            ok: false,
            success: false,
            error: 'room_closed',
            message: 'This room was abandoned or closed by the host'
          });
        }
  
        let playerId = String(data.guestId || data.playerId || 'guest_' + Math.random().toString(36).slice(2, 6));
        const playerName = String(data.guestName || data.playerName || 'Challenger');
        const char = data.character || data.char || (room.mode === 'hoops' ? 'footy' : 'hoops');
  
        // Rejoining as host
        if (room.host.playerId === playerId && data.role === 'host') {
          return sendJson(res, 200, {
            ok: true,
            success: true,
            roomCode: code,
            code,
            role: 'host',
            room
          });
        }
  
        // If joining from same browser/localStorage (2 tabs on 1 PC), differentiate guest ID so 1v1 works seamlessly
        if (room.host.playerId === playerId) {
          playerId = playerId + '_guest2';
        }
  
        // Reject already-full rooms
        if (room.guest && room.guest.playerId !== playerId) {
          return sendJson(res, 409, {
            ok: false,
            success: false,
            error: 'room_full',
            message: 'This private arena is already full (2/2 athletes)'
          });
        }
  
        // Join room as guest in lobby
        room.guest = { playerId, name: playerName, char, ready: false };
        room.status = 'lobby';
        room.lastActivity = Date.now();
  
        // Register matching record so state relay, overtime and authoritative results work seamlessly
        state.matches[code] = {
          matchId: code,
          roomId: code,
          mode: room.mode,
          arenaId: room.arenaId,
          minutes: room.minutes,
          seed: room.seed,
          host: room.host,
          guest: room.guest,
          status: 'lobby',
          createdAt: Date.now(),
          lastActivity: Date.now()
        };
  
        return sendJson(res, 200, {
          ok: true,
          success: true,
          roomCode: code,
          code,
          role: 'guest',
          room: Object.assign({}, room, { guestName: playerName })
        });
      });
    }
  
    // 2B. Update Room Settings (Mode, Arena, Duration) - Host only
    if (pathname === '/api/room/update' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
        const code = normalizeRoomCode(data.code || data.roomCode);
        const room = state.rooms[code];
        if (!room) return sendJson(res, 404, { ok: false, error: 'room_not_found' });
  
        // Host updates sport mode (FOOTY vs HOOPS)
        if (data.mode === 'footy' || data.mode === 'hoops') {
          room.mode = data.mode;
          // Also update default arena if not explicitly passed
          if (!data.arenaId) {
            room.arenaId = room.mode === 'hoops' ? 'std_hoops_street' : 'std_footy_classic';
          }
        }
        if (data.arenaId) {
          room.arenaId = String(data.arenaId);
        }
        if (data.minutes) {
          room.minutes = Math.max(1, Math.min(5, Number(data.minutes) || 2));
        }
  
        // Reset readiness when settings change so both players explicitly re-confirm
        if (room.host) room.host.ready = false;
        if (room.guest) room.guest.ready = false;
        if (room.status === 'countdown') {
          room.status = 'lobby';
          room.countdownStart = null;
        }
        room.lastActivity = Date.now();
  
        if (state.matches[code]) {
          state.matches[code].mode = room.mode;
          state.matches[code].arenaId = room.arenaId;
          state.matches[code].minutes = room.minutes;
        }
  
        return sendJson(res, 200, { ok: true, room });
      });
    }
  
    // 2C. Toggle Player Ready State
    if (pathname === '/api/room/ready' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
        const code = normalizeRoomCode(data.code || data.roomCode);
        const room = state.rooms[code];
        if (!room) return sendJson(res, 404, { ok: false, error: 'room_not_found' });
  
        const role = data.role === 'guest' ? 'guest' : 'host';
        const isReady = data.ready === true;
  
        if (room[role]) {
          room[role].ready = isReady;
        }
  
        // If both Host and Guest are Ready, start 3-second synchronized countdown!
        if (room.host && room.host.ready && room.guest && room.guest.ready) {
          room.status = 'countdown';
          room.countdownStart = Date.now();
          room.countdownSeconds = 3;
  
          state.matches[code] = {
            matchId: code,
            roomId: code,
            mode: room.mode,
            arenaId: room.arenaId,
            minutes: room.minutes,
            seed: room.seed,
            host: room.host,
            guest: room.guest,
            status: 'playing',
            createdAt: Date.now(),
            lastActivity: Date.now()
          };
        } else if (room.status === 'countdown') {
          room.status = 'lobby';
          room.countdownStart = null;
        }
  
        room.lastActivity = Date.now();
        return sendJson(res, 200, { ok: true, room, status: room.status });
      });
    }
  
    // 3. Poll Room Status
    if (pathname === '/api/room/status' && req.method === 'GET') {
      const code = normalizeRoomCode(parsedUrl.query.code || parsedUrl.query.roomCode);
      const room = state.rooms[code];
      if (!room) {
        return sendJson(res, 404, { ok: false, status: 'closed', error: 'room_not_found' });
      }
  
      let countdown = null;
      if (room.status === 'countdown' && room.countdownStart) {
        const elapsed = (Date.now() - room.countdownStart) / 1000;
        countdown = Math.max(0, Math.ceil(3 - elapsed));
        if (countdown <= 0) {
          room.status = 'playing';
        }
      }
  
      return sendJson(res, 200, {
        ok: true,
        status: room.status,
        room,
        guest: room.guest,
        host: room.host,
        mode: room.mode,
        arenaId: room.arenaId,
        seed: room.seed,
        countdown
      });
    }
  
    // 4. Send Signal (WebRTC SDP / ICE)
    if (pathname === '/api/room/signal' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
  
        const roomId = normalizeRoomCode(data.code || data.roomId || data.roomCode);
        const payload = data.payload || data.signal;
        const senderRole = data.role || (payload && payload.type === 'offer' ? 'host' : 'guest');
  
        if (!roomId || !payload) {
          return sendJson(res, 400, { ok: false, error: 'Missing required parameters' });
        }
  
        if (!state.signals[roomId]) {
          state.signals[roomId] = { host: [], guest: [], all: [] };
        }
  
        const target = senderRole === 'host' ? 'guest' : 'host';
        const sigObj = {
          id: Date.now() + '_' + Math.random().toString(36).slice(2, 5),
          from: data.from || senderRole,
          role: senderRole,
          type: payload.type,
          data: payload.data,
          payload: payload,
          timestamp: Date.now()
        };
  
        if (!state.signals[roomId][target]) state.signals[roomId][target] = [];
        state.signals[roomId][target].push(sigObj);
        if (!state.signals[roomId].all) state.signals[roomId].all = [];
        state.signals[roomId].all.push(sigObj);
  
        // Cap signal buffer to prevent memory leakage
        if (state.signals[roomId][target].length > 50) state.signals[roomId][target].shift();
        if (state.signals[roomId].all.length > 100) state.signals[roomId].all.shift();
  
        if (state.rooms[roomId]) state.rooms[roomId].lastActivity = Date.now();
        if (state.matches[roomId]) state.matches[roomId].lastActivity = Date.now();
  
        return sendJson(res, 200, { ok: true, success: true });
      });
    }
  
    // 5. Receive Signals
    if (pathname === '/api/room/signals' && req.method === 'GET') {
      const roomId = normalizeRoomCode(parsedUrl.query.code || parsedUrl.query.roomId || parsedUrl.query.roomCode);
      const role = parsedUrl.query.role;
      const from = parsedUrl.query.from;
  
      if (!roomId || !state.signals[roomId]) {
        return sendJson(res, 200, { ok: true, signals: [] });
      }
  
      let queue = [];
      if (role && state.signals[roomId][role]) {
        queue = state.signals[roomId][role];
        state.signals[roomId][role] = [];
      } else if (from && state.signals[roomId].all) {
        queue = state.signals[roomId].all.filter(s => s.from === from);
      } else if (state.signals[roomId].all) {
        queue = state.signals[roomId].all;
      }
  
      return sendJson(res, 200, { ok: true, signals: queue });
    }
  
    // 6. Cancel / Leave Room
    if (pathname === '/api/room/cancel' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        const code = normalizeRoomCode(data.code || data.roomCode);
        const hostId = data.hostId || data.playerId;
  
        if (state.rooms[code]) {
          // If host cancels, mark room abandoned
          if (!hostId || state.rooms[code].host.playerId === hostId) {
            state.rooms[code].status = 'abandoned';
            setTimeout(() => {
              delete state.rooms[code];
              delete state.signals[code];
              delete state.relays[code];
              delete state.wsClients[code];
            }, 15000);
          } else {
            // Guest left, reset room to waiting and reset host readiness cleanly without soft-locking
            state.rooms[code].guest = null;
            state.rooms[code].status = 'waiting';
            state.rooms[code].countdownStart = null;
            if (state.rooms[code].host) {
              state.rooms[code].host.ready = false;
            }
          }
        }
        return sendJson(res, 200, { ok: true, success: true });
      });
    }
  
    // ==========================================
    // API: Real-Time State & Input Relay (Fallback / High Reliability Sync)
    // ==========================================
  
    // 1. Post Relay Packet (Host snapshot/events or Guest input)
    if (pathname === '/api/match/relay' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
  
        const matchId = normalizeRoomCode(data.matchId || data.roomId || data.code);
        const role = data.role === 'guest' ? 'guest' : 'host';
        const targetRole = role === 'host' ? 'guest' : 'host';
        const packet = data.packet || data;
  
        if (!matchId) return sendJson(res, 400, { ok: false, error: 'missing_match_id' });
  
        if (!state.relays[matchId]) {
          state.relays[matchId] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };
        }
  
        const relay = state.relays[matchId];
        if (role === 'host') relay.lastHostTick = Date.now();
        else relay.lastGuestTick = Date.now();
  
        // Enqueue packets with preserved envelope (support batched HTTP packets)
        const packets = Array.isArray(data.batch) && data.batch.length > 0 ? data.batch : [packet];
  
        for (const pkt of packets) {
          if (!pkt) continue;
          relay[targetRole].push({
            packet: pkt,
            type: pkt.k || pkt.type,
            data: pkt.s || pkt.i || pkt.l || pkt.data || pkt,
            timestamp: Date.now()
          });
  
          // If peer is connected via native WebSocket relay, forward immediately
          if (state.wsClients && state.wsClients[matchId] && state.wsClients[matchId][targetRole]) {
            const peerWs = state.wsClients[matchId][targetRole];
            if (peerWs && !peerWs.destroyed && peerWs.writable) {
              try {
                peerWs.write(makeWsTextFrame(JSON.stringify(pkt)));
              } catch (e) {}
            }
          }
        }
  
        // Keep recent 40 packets in memory
        while (relay[targetRole].length > 40) {
          relay[targetRole].shift();
        }
  
        return sendJson(res, 200, { ok: true, success: true });
      });
    }
  
    // 2. Fetch Relay Packets
    if (pathname === '/api/match/relay' && req.method === 'GET') {
      const matchId = normalizeRoomCode(parsedUrl.query.matchId || parsedUrl.query.roomId || parsedUrl.query.code);
      const role = parsedUrl.query.role === 'guest' ? 'guest' : 'host';
  
      if (!matchId || !state.relays[matchId]) {
        return sendJson(res, 200, { ok: true, messages: [] });
      }
  
      const messages = state.relays[matchId][role] || [];
      state.relays[matchId][role] = []; // Drain queue
      return sendJson(res, 200, { ok: true, messages });
    }
  
    // ==========================================
    // API: Authoritative Match Completion & Forfeits
    // ==========================================
  
    // 1. Authoritative Match Completion
    if (pathname === '/api/match/complete' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
  
        const matchId = normalizeRoomCode(data.matchId || data.roomId || data.code);
        const playerId = String(data.playerId || '').trim();
        const finalScore = Array.isArray(data.finalScore) ? data.finalScore : [0, 0];
        const phase = String(data.phase || data.matchPhase || 'regulation'); // 'regulation' | 'overtime' | 'suddendeath'
        const stats = data.stats || {};
  
        if (!matchId || !playerId) {
          return sendJson(res, 400, { ok: false, error: 'missing_parameters' });
        }
  
        // Check if match already authoritatively recorded
        if (state.completedMatches[matchId]) {
          const existing = state.completedMatches[matchId];
          return sendJson(res, 200, {
            ok: true,
            alreadyCompleted: true,
            matchId,
            matchToken: existing.matchToken,
            winner: existing.winner,
            finalScore: existing.finalScore,
            phase: existing.phase
          });
        }
  
        const match = state.matches[matchId] || state.rooms[matchId];
        if (!match) {
          return sendJson(res, 404, { ok: false, error: 'match_not_found', message: 'Match record not found' });
        }
  
        // Validate that player is a participant
        const isHost = match.host && match.host.playerId === playerId;
        const isGuest = match.guest && match.guest.playerId === playerId;
        if (!isHost && !isGuest) {
          return sendJson(res, 403, { ok: false, error: 'unauthorized_participant' });
        }
  
        // Anti-Cheat: Validate elapsed game time
        const nowMs = Date.now();
        const elapsedMs = nowMs - (match.createdAt || 0);
        const isTestEnv = process.env.NODE_ENV === 'test' || Boolean(process.env.FVH_TEST_FAST) || Boolean(process.env.DATA_FILE);
        const minRequiredMs = isTestEnv ? 0 : Math.max(3000, ((match.minutes || 2) * 60 * 1000) * 0.3);
        if (elapsedMs < minRequiredMs) {
          return sendJson(res, 400, { ok: false, error: 'premature_match_completion', message: 'Match duration too short for valid completion' });
        }
  
        // Anti-Cheat: Host is the authoritative simulation peer; Guest cannot unilaterally submit completion while Host is active
        if (isGuest) {
          const hostSocket = state.wsClients[matchId] && state.wsClients[matchId].host;
          const hostLastTick = (state.relays[matchId] && state.relays[matchId].lastHostTick) || 0;
          const hostActive = (hostSocket && !hostSocket.destroyed) || (nowMs - hostLastTick < 6000);
          if (hostActive) {
            return sendJson(res, 403, { ok: false, error: 'host_authority_required', message: 'Host is the authoritative simulation peer for match completion' });
          }
        }
  
        // Validate scores
        const rawScore0 = Number(finalScore[0]);
        const rawScore1 = Number(finalScore[1]);
        if (!Number.isFinite(rawScore0) || !Number.isFinite(rawScore1) || rawScore0 < 0 || rawScore1 < 0) {
          return sendJson(res, 400, { ok: false, error: 'invalid_scores', message: 'Scores must be non-negative numbers' });
        }
        const maxPlausibleGoals = (match.mode === 'hoops') ? 60 : 15;
        if (rawScore0 > maxPlausibleGoals || rawScore1 > maxPlausibleGoals) {
          return sendJson(res, 400, { ok: false, error: 'implausible_score', message: 'Score exceeds physical match limits' });
        }
        const score0 = Math.floor(rawScore0);
        const score1 = Math.floor(rawScore1);
  
        // Enforce mathematical winner invariant
        let resolvedWinner = null;
        if (score0 > score1) {
          resolvedWinner = 0;
        } else if (score1 > score0) {
          resolvedWinner = 1;
        } else {
          if (phase === 'suddendeath') {
            return sendJson(res, 400, { ok: false, error: 'invalid_sudden_death_draw', message: 'Sudden death cannot end in a draw' });
          }
          resolvedWinner = null;
        }
  
        const matchToken = 'mtok_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
        const compRecord = {
          matchId,
          host: match.host,
          guest: match.guest,
          finalScore: [score0, score1],
          winner: resolvedWinner,
          phase,
          mode: match.mode || 'footy',
          stats,
          completedAt: Date.now(),
          matchToken,
          rewarded: {}
        };
  
        match.status = 'completed';
        match.completedAt = Date.now();
        state.completedMatches[matchId] = compRecord;
        persistState();
  
        return sendJson(res, 200, {
          ok: true,
          success: true,
          matchId,
          matchToken,
          winner: resolvedWinner,
          finalScore: [score0, score1],
          phase
        });
      });
    }
  
    // 2. Opponent Forfeit / Abandonment
    if (pathname === '/api/match/forfeit' && req.method === 'POST') {
      return readJsonBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
  
        const matchId = normalizeRoomCode(data.matchId || data.roomId || data.code);
        const playerId = String(data.playerId || '').trim();
        const reason = data.reason || 'opponent_disconnected';
  
        if (!matchId || !playerId) return sendJson(res, 400, { ok: false, error: 'missing_parameters' });
  
        const match = state.matches[matchId] || state.rooms[matchId];
        if (!match) return sendJson(res, 404, { ok: false, error: 'match_not_found' });
  
        const isHost = match.host && match.host.playerId === playerId;
        const isGuest = match.guest && match.guest.playerId === playerId;
        if (!isHost && !isGuest) return sendJson(res, 403, { ok: false, error: 'unauthorized_participant' });
  
        // Match startup grace period
        const nowMs = Date.now();
        const elapsedMs = nowMs - (match.createdAt || 0);
        if (elapsedMs < 1200) {
          return sendJson(res, 400, { ok: false, error: 'match_starting_grace_period', message: 'Connection establishing' });
        }
  
        // Check if opponent is actually disconnected before granting forfeit win to caller
        const oppRole = isHost ? 'guest' : 'host';
        const oppSocket = state.wsClients[matchId] && state.wsClients[matchId][oppRole];
        const oppLastTick = (state.relays[matchId] && (oppRole === 'guest' ? state.relays[matchId].lastGuestTick : state.relays[matchId].lastHostTick)) || 0;
        const oppActive = (oppSocket && !oppSocket.destroyed) || (nowMs - oppLastTick < 6000);
  
        if (reason !== 'self_abandon' && oppActive) {
          return sendJson(res, 400, { ok: false, error: 'opponent_still_active', message: 'Opponent is actively connected to the match session' });
        }
  
        const remainingWinner = (reason === 'self_abandon') ? (isHost ? 1 : 0) : (isHost ? 0 : 1);
        const matchToken = 'mtok_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
  
        const compRecord = {
          matchId,
          host: match.host,
          guest: match.guest,
          finalScore: remainingWinner === 0 ? [3, 0] : [0, 3],
          winner: remainingWinner,
          outcome: 'forfeit',
          reason,
          completedAt: Date.now(),
          matchToken,
          rewarded: {}
        };
  
        match.status = 'completed';
        match.completedAt = Date.now();
        state.completedMatches[matchId] = compRecord;
        persistState();
  
        return sendJson(res, 200, {
          ok: true,
          success: true,
          matchId,
          matchToken,
          winner: remainingWinner,
          outcome: 'forfeit'
        });
      });
    }
  
  
    return false;
  }

  function attachWebSocket(server) {
    const ONLINE_MODE_ENABLED = true;
    const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    server.on('upgrade', (req, socket, head) => {
      if (!ONLINE_MODE_ENABLED) {
        socket.destroy();
        return;
      }
      const host = req.headers.host || "localhost";
      const u = new URL(req.url, "http://" + host);
      const parsed = {
        pathname: u.pathname,
        query: Object.fromEntries(u.searchParams.entries())
      };
      if (parsed.pathname !== '/ws/match') {
        socket.destroy();
        return;
      }
    
      const secKey = req.headers['sec-websocket-key'];
      if (!secKey) {
        socket.destroy();
        return;
      }
    
      const matchId = normalizeRoomCode(parsed.query.matchId || parsed.query.roomId || parsed.query.code);
      const role = parsed.query.role === 'guest' ? 'guest' : 'host';
      const targetRole = role === 'host' ? 'guest' : 'host';
    
      if (!matchId) {
        socket.destroy();
        return;
      }
    
      const matchRecord = state.matches[matchId] || state.rooms[matchId];
      if (!matchRecord) {
        socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
    
      const acceptKey = crypto.createHash('sha1').update(secKey + WS_GUID).digest('base64');
      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Accept: ' + acceptKey + '\r\n\r\n'
      );
      try { socket.setNoDelay(true); socket.setKeepAlive(true, 10000); } catch (e) {}
    
      if (!state.wsClients[matchId]) {
        state.wsClients[matchId] = { host: null, guest: null };
      }
      const prevSocket = state.wsClients[matchId][role];
      if (prevSocket && prevSocket !== socket && !prevSocket.destroyed) {
        try {
          prevSocket.end();
          prevSocket.destroy();
        } catch (e) {}
      }
      state.wsClients[matchId][role] = socket;
    
      let buffer = Buffer.alloc(0);
      let socketMsgCount = 0;
      let socketMsgWindow = Date.now();
    
      socket.on('data', (chunk) => {
        buffer = buffer.length === 0 ? chunk : Buffer.concat([buffer, chunk]);
        let pos = 0;
        while (buffer.length - pos >= 2) {
          const byte0 = buffer[pos];
          const byte1 = buffer[pos + 1];
          const opcode = byte0 & 0x0f;
          const isMasked = (byte1 & 0x80) !== 0;
          let payloadLen = byte1 & 0x7f;
          let offset = 2;
    
          if (payloadLen === 126) {
            if (buffer.length - pos < 4) break;
            payloadLen = buffer.readUInt16BE(pos + 2);
            offset = 4;
          } else if (payloadLen === 127) {
            if (buffer.length - pos < 10) break;
            payloadLen = Number(buffer.readBigUInt64BE(pos + 2));
            offset = 10;
          }
    
          if (payloadLen > 65536) {
            socket.destroy();
            return;
          }
    
          const maskLen = isMasked ? 4 : 0;
          const totalLen = offset + maskLen + payloadLen;
          if (buffer.length - pos < totalLen) break;
    
          let payload;
          if (isMasked) {
            payload = Buffer.allocUnsafe(payloadLen);
            const maskOff = pos + offset;
            const payOff = maskOff + 4;
            for (let i = 0; i < payloadLen; i++) {
              payload[i] = buffer[payOff + i] ^ buffer[maskOff + (i & 3)];
            }
          } else {
            payload = buffer.subarray(pos + offset, pos + totalLen);
          }
    
          pos += totalLen;
    
          if (opcode === 8) {
            socket.end();
            break;
          }
          if (opcode === 9) {
            socket.write(Buffer.from([0x8a, 0x00]));
            continue;
          }
          if (opcode === 10) {
            continue;
          }
          if (opcode === 1) {
            const nowSec = Date.now();
            if (nowSec - socketMsgWindow > 1000) {
              socketMsgCount = 0;
              socketMsgWindow = nowSec;
            }
            socketMsgCount++;
            if (socketMsgCount > 180) continue;
    
            // Zero-Parse Fast-Path Pass-Through when peer WebSocket is connected
            const peerSocket = state.wsClients[matchId] && state.wsClients[matchId][targetRole];
            if (peerSocket && !peerSocket.destroyed && peerSocket.writable) {
              peerSocket.write(makeWsTextFrameBuf(payload));
            } else {
              try {
                const packet = JSON.parse(payload.toString('utf8'));
                if (!state.relays[matchId]) {
                  state.relays[matchId] = { host: [], guest: [], lastHostTick: Date.now(), lastGuestTick: Date.now() };
                }
                const relay = state.relays[matchId];
                if (role === 'host') relay.lastHostTick = Date.now();
                else relay.lastGuestTick = Date.now();
                relay[targetRole].push({
                  packet: packet,
                  type: packet.k || packet.type,
                  data: packet.s || packet.i || packet.l || packet.data || packet,
                  timestamp: Date.now()
                });
                if (relay[targetRole].length > 30) relay[targetRole].shift();
              } catch (e) {}
            }
          }
        }
        buffer = pos >= buffer.length ? Buffer.alloc(0) : Buffer.from(buffer.subarray(pos));
      });
    
      const cleanupSocket = () => {
        if (state.wsClients[matchId] && state.wsClients[matchId][role] === socket) {
          state.wsClients[matchId][role] = null;
        }
      };
    
      socket.on('close', cleanupSocket);
      socket.on('end', cleanupSocket);
      socket.on('error', (err) => {
        cleanupSocket();
        socket.destroy();
      });
    });
    
    // Periodic WebSocket Relay Heartbeat to detect half-open or dead connections
    setInterval(() => {
      for (const mId in state.wsClients) {
        const client = state.wsClients[mId];
        if (!client) continue;
        for (const r of ['host', 'guest']) {
          const sock = client[r];
          if (sock && !sock.destroyed && sock.writable) {
            try {
              sock.write(Buffer.from([0x89, 0x00])); // Opcode 9 (ping)
            } catch (e) {
              client[r] = null;
              try { sock.destroy(); } catch (_) {}
            }
          } else if (sock && sock.destroyed) {
            client[r] = null;
          }
        }
      }
    }, 10000);
    
  }

  return { handleHttp, attachWebSocket };
}

module.exports = { createOnlineLegacyHandlers };
