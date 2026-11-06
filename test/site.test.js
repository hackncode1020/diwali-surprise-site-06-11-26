
const test = require('node:test'); const assert = require('node:assert'); const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, '..', 'site'); const rd = f => fs.readFileSync(path.join(dir, f), 'utf8');
const html = rd('index.html'), app = rd('app.js'), all = ['index.html','app.js','art.js','fx.js','audio.js','styles.css'].map(rd).join('\n');
test('title and viewport', () => { assert.match(html, /<title>[^<]+<\/title>/); assert.match(html, /name="viewport"[^>]*width=device-width/); });
test('local assets exist', () => { for (const m of html.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css))"/g)) assert.ok(fs.existsSync(path.join(dir, m[1])), m[1]); });
test('exact required copy', () => {
  const need = ['A Little Surprise Is Waiting For You','Someone special has prepared something magical for you...','Before We Begin... Tell Me Your Name','Enter Your Name Here...','Unlock My Surprise','A Special Diwali Gift For You','Open Your Gift','Celebrate Diwali',
   'Every moment becomes special because of you. You are one of the most beautiful parts of my life.','These roses are a little symbol of my endless love for you.','No matter how many Diwalis come and go, I wish to keep celebrating every beautiful moment with you.',
   'Happy Diwali, My Love! ❤️',"Happy Diwali, My Life's Light ✨🪔",'You are the brightest light in my life, the sweetest reason behind my smile, and my most beautiful blessing.',
   'May your life always shine brighter than a thousand diyas. May happiness surround you, dreams come true, and our bond grow stronger with every passing day.','Tonight, the entire sky is filled with lights, but nothing shines brighter in my world than YOU. ❤️',
   "Happy Diwali, My Life's Light ❤️",'Keep Smiling. Keep Shining. Keep Being Mine. ❤️','Forever Yours ✨','Made With Endless Love, Just For You ❤️'];
  for (const n of need) assert.ok(all.includes(n), 'missing: ' + n);
});
test('all seven fireworks types', () => { for (const t of ['Sparkler','Rocket','Fountain','Chakri','Flower Pot','Aerial','Colorful Crackers']) assert.ok(app.includes(t), t); });
test('no banned words, no hotlinked images, no placeholders', () => {
  assert.ok(!/jaan/i.test(all)); assert.ok(!/<img\b/i.test(html)); assert.ok(!/(lorem|placeholder text|TODO|coming soon)/i.test(all.replace(/placeholder="Enter Your Name Here\.\.\."/g,'')));
  assert.ok(!/\.(png|jpe?g|gif|webp|mp3|wav|ogg)\b/i.test(all.replace(/data:image/g,'')), 'external media file referenced');
});
test('audio is WebAudio and never autoplays', () => { const a = rd('audio.js'); assert.match(a, /AudioContext/); assert.ok(!/autoplay/i.test(html)); assert.ok(!/<audio/i.test(html)); assert.match(app, /btnBegin'\)\.addEventListener\('click'/); });
test('perf guards present', () => { const f = rd('fx.js'); assert.match(f, /requestAnimationFrame/); assert.match(f, /visibilitychange/); assert.match(f, /CAP = MOB/); });
test('controls exist', () => { for (const id of ['btnMusic','btnMute','btnBegin','btnUnlock','btnCelebrate','btnToCouple','btnToGift','btnOpenGift','btnToMessage','btnToFinale','btnReplay']) assert.ok(html.includes('id="'+id+'"'), id); });
