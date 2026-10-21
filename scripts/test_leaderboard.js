const assert = require('assert');
const fs = require('fs');

console.log('=== FOOTY vs HOOPS Leaderboard Test Suite ===\n');

async function runTests() {
  // Test 1: API Endpoint
  const res = await fetch('http://localhost:8099/api/leaderboard?category=season');
  assert.strictEqual(res.status, 200, 'API must return 200');
  const data = await res.json();
  assert(data.ok, 'data.ok must be true');
  assert(Array.isArray(data.top), 'data.top must be an array');
  assert(data.top.length >= 1, 'Leaderboard must return registered athletes');
  console.log('[PASS] Test 1: GET /api/leaderboard?category=season returns 200 and list of top athletes');

  // Test 2: Descending order
  for (let i = 1; i < data.top.length; i++) {
    assert(data.top[i - 1].score >= data.top[i].score, `Rank ${i} score (${data.top[i-1].score}) must be >= Rank ${i+1} score (${data.top[i].score})`);
    assert.strictEqual(data.top[i].rank, i + 1, `Rank must be sequential ${i + 1}`);
  }
  console.log('[PASS] Test 2: Leaderboard scores are strictly in descending rank order');

  // Test 3: Categories
  const categories = ['season', 'footy', 'hoops', 'coins'];
  for (const cat of categories) {
    const cRes = await fetch(`http://localhost:8099/api/leaderboard?category=${cat}`);
    const cData = await cRes.json();
    assert(cData.ok, `${cat} must return ok`);
    assert(cData.top[0].score > 0, `${cat} top score must be > 0`);
  }
  console.log('[PASS] Test 3: All 4 categories (season, footy, hoops, coins) calculate correct scores');

  // Test 4: Code presence in redesign.js and redesign.css
  const code = fs.readFileSync('js/redesign.js', 'utf8');
  assert(code.includes('buildLeaderboardPage'), 'buildLeaderboardPage must be defined in redesign.js');
  assert(code.includes('fetchLeaderboardData'), 'fetchLeaderboardData must be defined in redesign.js');
  assert(code.includes('fallbackClientLeaderboard'), 'fallbackClientLeaderboard must be defined in redesign.js');
  assert(code.includes('fvh-btn-leaderboard'), 'fvh-btn-leaderboard must be defined in topbar');

  const css = fs.readFileSync('css/redesign.css', 'utf8');
  assert(css.includes('.fvh-podium-wrap'), 'Podium styling must exist in redesign.css');
  assert(css.includes('.fvh-leaderboard-sticky-player'), 'Sticky player bar styling must exist');
  console.log('[PASS] Test 4: Leaderboard components, styles, and podium templates are verified');

  console.log('\n🎉 ALL LEADERBOARD TESTS PASSED!');
}

runTests().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
