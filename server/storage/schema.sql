-- FOOTY vs HOOPS - PostgreSQL Authoritative Relational Schema
-- Version: 1.0.0 (Stage G Persistent Storage Migration)

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    applied_at BIGINT NOT NULL
);

-- 1. Athletes & Account Identity
CREATE TABLE IF NOT EXISTS players (
    player_id TEXT PRIMARY KEY,
    player_name VARCHAR(128),
    selected_team VARCHAR(16) CHECK (selected_team IS NULL OR selected_team IN ('footy', 'hoops')),
    selected_character VARCHAR(16) CHECK (selected_character IS NULL OR selected_character IN ('footy', 'hoops')),
    team_chosen BOOLEAN NOT NULL DEFAULT FALSE,
    coins INTEGER NOT NULL DEFAULT 350 CHECK (coins >= 0),
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    owned_items JSONB NOT NULL DEFAULT '["skin_rookie","std_footy_classic","std_hoops_street","ball_footy_classic","ball_hoops_street","frame_default","trail_default"]'::jsonb,
    equipped_items JSONB NOT NULL DEFAULT '{"skin":"skin_rookie","ball.footy":"ball_footy_classic","ball.hoops":"ball_hoops_street","stadium.footy":"std_footy_classic","stadium.hoops":"std_hoops_street","trail":"trail_default","frame":"frame_default"}'::jsonb,
    boost_charges JSONB NOT NULL DEFAULT '{}'::jsonb,
    armed_boost VARCHAR(64),
    packs JSONB NOT NULL DEFAULT '{"free":{},"paid":{}}'::jsonb,
    battle_pass JSONB NOT NULL DEFAULT '{"claimedFree":[],"claimedPremium":[],"isPremium":false,"premiumUnlockedAt":null}'::jsonb,
    claimed_quests JSONB NOT NULL DEFAULT '[]'::jsonb,
    rewarded_matches JSONB NOT NULL DEFAULT '[]'::jsonb,
    stats JSONB NOT NULL DEFAULT '{"wins":0,"losses":0,"draws":0,"goals":0,"baskets":0}'::jsonb,
    telegram_user JSONB,
    photo_url TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 2. Immutable Financial Audit Ledger
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(128) PRIMARY KEY,
    tx_id VARCHAR(128) NOT NULL,
    player_id TEXT NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    delta_coins INTEGER NOT NULL,
    delta_xp INTEGER NOT NULL,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reason TEXT,
    item_id VARCHAR(128),
    meta JSONB,
    timestamp BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_transactions_player ON transactions(player_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_txid ON transactions(tx_id);

-- 3. Completed Matches & Anti-Cheat Tokens
CREATE TABLE IF NOT EXISTS completed_matches (
    match_id VARCHAR(128) PRIMARY KEY,
    host JSONB NOT NULL,
    guest JSONB NOT NULL,
    final_score JSONB NOT NULL,
    winner INTEGER,
    phase VARCHAR(32) NOT NULL DEFAULT 'regulation',
    mode VARCHAR(16) NOT NULL,
    stats JSONB,
    completed_at BIGINT NOT NULL,
    match_token VARCHAR(128) UNIQUE NOT NULL,
    rewarded_players JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_completed_matches_token ON completed_matches(match_token);

-- 4. Idempotency Cache
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(128) PRIMARY KEY,
    response JSONB NOT NULL,
    created_at BIGINT NOT NULL
);

-- 5. Referral Hub
CREATE TABLE IF NOT EXISTS referrals (
    owner_id TEXT PRIMARY KEY,
    referred JSONB NOT NULL DEFAULT '[]'::jsonb,
    claimed_milestones JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 6. Stars Invoices
CREATE TABLE IF NOT EXISTS stars_invoices (
    invoice_id VARCHAR(128) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    player_id TEXT NOT NULL,
    stars_amount INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at BIGINT NOT NULL,
    paid_at BIGINT,
    charge_id VARCHAR(128)
);

-- 7. TON Invoices
CREATE TABLE IF NOT EXISTS ton_invoices (
    tx_id VARCHAR(128) PRIMARY KEY,
    memo VARCHAR(128) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    player_id TEXT NOT NULL,
    ton_amount NUMERIC NOT NULL,
    nano_ton VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at BIGINT NOT NULL,
    paid_at BIGINT,
    tx_hash VARCHAR(128)
);

-- 8. Processed TON Hashes
CREATE TABLE IF NOT EXISTS processed_ton_hashes (
    tx_hash VARCHAR(128) PRIMARY KEY,
    tx_id VARCHAR(128) NOT NULL,
    player_id TEXT NOT NULL,
    timestamp BIGINT NOT NULL
);

-- 9. Payments Ledger
CREATE TABLE IF NOT EXISTS payments_ledger (
    id VARCHAR(128) PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    invoice_id VARCHAR(128) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    player_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency VARCHAR(16) NOT NULL,
    timestamp BIGINT NOT NULL
);
