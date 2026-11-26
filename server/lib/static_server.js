'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

function serveStaticFile(req, res, pathname, rootDir) {
  let decodedPath = pathname;
  try { decodedPath = decodeURIComponent(pathname); } catch (e) {}
  const safeRel = path.posix.normalize(decodedPath === '/' ? '/index.html' : decodedPath).replace(/^(\.\.\/)+/, '');
  if (!global.__fvhStaticCache) {
    global.__fvhStaticCache = { map: new Map(), totalBytes: 0, maxBytes: 72 * 1024 * 1024 };
  }
  const sCache = global.__fvhStaticCache;
  const allowMemCache = !pathname.includes('/benchmark/') && !pathname.includes('/scratch/');

  function serveCachedEntry(entry) {
    const headers = { 'Content-Type': entry.contentType, 'ETag': entry.etag };
    if (entry.ext === '.html' || !allowMemCache) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (['.glb', '.gltf', '.png', '.jpg', '.mp3', '.wav', '.ogg', '.svg', '.ico'].includes(entry.ext)) {
      headers['Cache-Control'] = 'public, max-age=86400';
    } else {
      headers['Cache-Control'] = 'no-cache, must-revalidate';
    }
    if (req.headers['if-none-match'] === entry.etag) {
      res.writeHead(304, headers);
      return res.end();
    }
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (entry.gzipBuf && acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      headers['Content-Length'] = entry.gzipBuf.length;
      res.writeHead(200, headers);
      return res.end(entry.gzipBuf);
    }
    headers['Content-Length'] = entry.rawBuf.length;
    res.writeHead(200, headers);
    return res.end(entry.rawBuf);
  }

  if (allowMemCache && sCache.map.has(safeRel)) {
    const cached = sCache.map.get(safeRel);
    sCache.map.delete(safeRel);
    sCache.map.set(safeRel, cached);
    return serveCachedEntry(cached);
  }

  let fullPath = path.join(rootDir, safeRel);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    const publicCandidate = path.join(rootDir, 'public', safeRel);
    if (fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
      fullPath = publicCandidate;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(fullPath);

  if (allowMemCache && stat.size <= 8 * 1024 * 1024) {
    fs.readFile(fullPath, (err, rawBuf) => {
      if (err) { res.writeHead(500, { 'Content-Type': 'text/plain' }); return res.end('Read error'); }
      const compressible = ['.html', '.css', '.js', '.json', '.svg', '.glb'].includes(ext);
      const gzipBuf = compressible ? zlib.gzipSync(rawBuf, { level: 6 }) : null;
      const etag = `"${stat.size.toString(16)}-${Math.round(stat.mtimeMs).toString(16)}"`;
      const entry = { ext, contentType, rawBuf, gzipBuf, etag, bytes: rawBuf.length + (gzipBuf ? gzipBuf.length : 0) };
      while (sCache.totalBytes + entry.bytes > sCache.maxBytes && sCache.map.size > 0) {
        const oldestKey = sCache.map.keys().next().value;
        const old = sCache.map.get(oldestKey);
        sCache.map.delete(oldestKey);
        if (old) sCache.totalBytes -= old.bytes;
      }
      sCache.map.set(safeRel, entry);
      sCache.totalBytes += entry.bytes;
      serveCachedEntry(entry);
    });
  } else {
    const headers = { 'Content-Type': contentType, 'Cache-Control': 'no-cache' };
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const compressible = ['.html', '.css', '.js', '.json', '.svg'].includes(ext);
    if (compressible && acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      fs.createReadStream(fullPath).pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, headers);
      fs.createReadStream(fullPath).pipe(res);
    }
  }
}

module.exports = { serveStaticFile };
