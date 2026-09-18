const fs = require('fs');
const assert = require('assert');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');
assert.match(html, /lang="zh-CN"/);
assert.match(html, /跨境 AI 工作台/);
for (const view of ['overview','products','research','listing','assets','store','seo','tasks','settings']) {
  assert.match(html, new RegExp(`id="view-${view}"`));
}
assert.ok(css.includes('.page-view.active'));
assert.ok(js.includes('function navigate'));
assert.ok(js.includes("createProductConfirm"));
console.log('Demo smoke test passed');
