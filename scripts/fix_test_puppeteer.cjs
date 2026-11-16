const fs = require('fs');

const f = 'tests/test_stage6_1_comprehensive_verification.cjs';
let code = fs.readFileSync(f, 'utf8');

code = code.replace(
  "const puppeteer = require('puppeteer-core');",
  "let puppeteer;\ntry { puppeteer = require('puppeteer-core'); } catch (e) { puppeteer = require('C:/Users/ASUS/Desktop/FOOTY vs HOOPS/node_modules/puppeteer-core'); }"
);

fs.writeFileSync(f, code, 'utf8');
console.log('✓ Updated puppeteer require in', f);
