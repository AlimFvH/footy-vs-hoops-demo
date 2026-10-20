const fs = require('fs');
const { execFileSync } = require('child_process');

for (let i = 1; i <= 9; i++) {
  const file = `temp_build/part${i}.js`;
  console.log(`Checking syntax of ${file}...`);
  try {
    // Wrap in function to check expression syntax
    const code = fs.readFileSync(file, 'utf8');
    new Function(code);
    console.log(`✓ ${file} syntax OK`);
  } catch (err) {
    console.error(`✗ ${file} syntax error:`, err.message);
  }
}
