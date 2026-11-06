/* Journey controller: intro → name → fireworks → couple → gift → message → finale */
(function(){
'use strict';
var $ = function(id){ return document.getElementById(id); };
var body = document.body, name = '', current = 'intro', timers = [], opened = {}, giftOpened = false, busy = false;
var MOB = Math.min(innerWidth, innerHeight) < 700;
var EMOJI = /(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)/gu;

function rich(el, text){
  el.textContent = '';
  String(text).split(EMOJI).forEach(function(part){
    if (!part) return;
    if (EMOJI.test(part)){ EMOJI.lastIndex = 0; var i = document.createElement('i'); i.className = 'em'; i.textContent = part; el.appendChild(i); }
    else el.appendChild(document.createTextNode(part));
    EMOJI.lastIndex = 0;
  });
}
function later(fn, ms){ var t = setTimeout(fn, ms); timers.push(t); return t; }
function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
function snd(n, a){ if (window.DAudio) DAudio.sfx(n, a); }
function size(){ return FX.size(); }
function esc(s){ return s; }

/* ---------- static render ---------- */
document.querySelectorAll('[data-rich]').forEach(function(e){ rich(e, e.getAttribute('data-rich')); });
ART.stars(); ART.dust(); ART.city(); ART.lights(); ART.diyas(); ART.giftbox();
document.querySelectorAll('.gic').forEach(function(e){ var k = e.getAttribute('data-ic'); e.innerHTML = k === 'letter' ? ART.icons.letter() : (k === 'rose' ? ART.icons.rose() : ART.icons.heart()); });
var rsz; addEventListener('resize', function(){ clearTimeout(rsz); rsz = setTimeout(function(){ ART.stars(); ART.diyas(); }, 250); });
setInterval(function(){ if (!document.hidden && Math.random() < .55) ART.shooting(); }, 5200);

/* ---------- floating petals / hearts (DOM, capped) ---------- */
var deco = $('decor');
function petal(){
  if (deco.childElementCount > (MOB ? 26 : 46)) return;
  var p = document.createElement('i'); p.className = 'petal'; var s = .7 + Math.random()*.9;
  p.style.cssText = 'left:'+(Math.random()*100)+'%;transform:scale('+s+');animation-duration:'+(7+Math.random()*7)+'s;--sx:'+(Math.random()*120-30)+'px;--ex:'+(Math.random()*160-80)+'px;animation-delay:0s';
  p.style.background = 'linear-gradient(135deg,'+['#ff9ab8','#ffb3c8','#ff7aa0'][Math.floor(Math.random()*3)]+',#e0224f 70%,#8a0f2c)';
  deco.appendChild(p); p.addEventListener('animationend', function(){ p.remove(); });
}
function heart(gold){
  if (deco.childElementCount > (MOB ? 26 : 46)) return;
  var h = document.createElement('i'); h.className = 'heart-f'; h.textContent = gold ? '♥' : '❤'; var sz = 14 + Math.random()*22;
  h.style.cssText = 'left:'+(5+Math.random()*90)+'%;font-size:'+sz+'px;color:'+(gold ? ['#ffd36e','#ffe9a8','#f3b84e'][Math.floor(Math.random()*3)] : ['#ff5c93','#ff86ad','#ff3d78'][Math.floor(Math.random()*3)])+';animation-duration:'+(6+Math.random()*6)+'s;--hx:'+(Math.random()*80-40)+'px;--hr:'+(Math.random()*40-20)+'deg;font-style:normal';
  deco.appendChild(h); h.addEventListener('animationend', function(){ h.remove(); });
}
var rain = {petal:0, heart:0, gold:0};
function setRain(p, h, g){ rain = {petal:p, heart:h, gold:g}; }
(function loop(){
  var acc = {petal:0, heart:0, gold:0}, last = performance.now();
  setInterval(function(){
    if (document.hidden) return; var now = performance.now(), dt = (now - last)/1000; last = now;
    ['petal','heart','gold'].forEach(function(k){ acc[k] += dt*rain[k]*(MOB ? .6 : 1); while (acc[k] >= 1){ acc[k]--; if (k === 'petal') petal(); else heart(k === 'gold'); } });
  }, 120);
})();

/* ---------- scene switching ---------- */
var ORDER = ['intro','name','reveal','play','couple','gift','message','finale'];
function go(id){
  clearTimers();
  document.querySelectorAll('.scene.active').forEach(function(s){ if (s.id !== 'sc-' + id) s.classList.remove('active'); });
  var sc = $('sc-' + id); if (!sc) return; sc.classList.add('active'); current = id;
  body.dataset.scene = id; body.classList.remove('ov');
  var f = ENTER[id]; if (f) f();
}
var ENTER = {
  intro: function(){ FX.tapEnabled(true); FX.setType('rocket'); FX.auto(0); setRain(0,0,0);
    later(function(){ FX.auto(0); }, 10); },
  name: function(){ FX.tapEnabled(false); FX.auto(0); later(function(){ try { $('nameInput').focus({preventScroll:true}); } catch(e){} }, 1100); },
  reveal: function(){ rich($('revealName'), name); },
  play: function(){
    FX.tapEnabled(true); FX.setType(selType); FX.auto(0); setRain(.2,.2,0);
    rich($('playNote'), name + ', pick a cracker and tap the sky 🎆'); $('playNote').classList.add('glass-lite');
    later(function(){ rich($('playNote'), 'Light as many as you like, ' + name + ' ✨'); }, 9000);
  },
  couple: function(){
    FX.tapEnabled(true); FX.setType('aerial'); FX.auto(MOB ? 2.6 : 1.9); setRain(1.3,.4,0);
    rich($('coupleNote'), 'Every light tonight is for you, ' + name + ' 🪔'); $('coupleNote').classList.add('glass-lite');
  },
  gift: function(){
    FX.tapEnabled(false); FX.auto(0); setRain(.3,.5,0); resetGift();
    rich($('giftFor'), 'For ' + name);
  },
  message: function(){ FX.tapEnabled(true); FX.setType('rocket'); FX.auto(MOB ? 2.8 : 2.1); setRain(.5,.25,.3); playMessage(); },
  finale: function(){ playFinale(); }
};

/* ---------- audio controls ---------- */
var ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  vol: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.6 3 2.4-2.4-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4 2.4 2.4-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4z"/></svg>'
};
function syncCtrl(){
  var on = DAudio.isMusic(), m = DAudio.isMuted();
  $('btnMusic').innerHTML = on ? ICON.pause : ICON.play; $('btnMusic').setAttribute('aria-label', on ? 'Pause music' : 'Play music'); $('btnMusic').setAttribute('aria-pressed', on ? 'true' : 'false');
  $('btnMute').innerHTML = m ? ICON.mute : ICON.vol; $('btnMute').setAttribute('aria-label', m ? 'Unmute sound' : 'Mute sound'); $('btnMute').setAttribute('aria-pressed', m ? 'true' : 'false');
}
$('btnMusic').addEventListener('click', function(){ DAudio.unlock(); DAudio.toggleMusic(); $('btnMusic').classList.remove('hint'); if (DAudio.isMusic() && DAudio.isMuted()) DAudio.setMuted(false); syncCtrl(); });
$('btnMute').addEventListener('click', function(){ DAudio.unlock(); DAudio.toggleMute(); syncCtrl(); });
syncCtrl(); $('btnMusic').classList.add('hint');

/* ---------- 1 · intro → name ---------- */
$('btnBegin').addEventListener('click', function(){
  DAudio.unlock(); if (!DAudio.isMusic()) DAudio.startMusic(); syncCtrl(); $('btnMusic').classList.remove('hint');
  snd('sparkle'); FX.fire('sparkler', size().w*.5, size().h*.5); FX.shell(size().w*.3, size().h*.28, 'peony', 2, false); FX.shell(size().w*.7, size().h*.3, 'ring', 4, false);
  go('name');
});

/* ---------- 2 · name ---------- */
var nameForm = $('nameForm'), nameInput = $('nameInput');
nameForm.addEventListener('submit', function(ev){
  ev.preventDefault(); if (busy) return;
  var v = nameInput.value.replace(/\s+/g,' ').trim();
  if (!v){ $('nameHint').textContent = 'Please tell me your name first ❤️'; var f = nameInput.parentNode; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); nameInput.focus(); return; }
  name = v; $('nameHint').textContent = ''; busy = true; nameInput.blur();
  DAudio.unlock(); snd('unlock');
  var fl = $('flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
  var s = size();
  FX.tapEnabled(true);
  [[.2,.3,'peony',2],[.8,.26,'ring',4],[.5,.2,'heart',2],[.35,.4,'willow',0],[.65,.4,'peony',3]].forEach(function(a,i){ later(function(){ FX.shell(s.w*a[0], s.h*a[1], a[2], a[3], i===2); }, 120 + i*260); });
  go('reveal'); document.querySelectorAll('.name-big').forEach(function(e){ e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
  setRain(.5,.5,.4);
  later(function(){ busy = false; go('play'); }, 3700);
});

/* ---------- 3 · playground ---------- */
var TYPES = [['sparkler','🎇','Sparkler'],['rocket','🎆','Rocket'],['fountain','✨','Fountain'],['chakri','🌀','Chakri'],['flowerpot','🎇','Flower Pot'],['aerial','💥','Aerial'],['crackers','🌈','Colorful Crackers']];
var selType = 'rocket';
(function(){
  var box = $('chips');
  TYPES.forEach(function(t){ var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('role','radio'); b.dataset.type = t[0];
    b.setAttribute('aria-checked', t[0] === selType ? 'true' : 'false'); b.innerHTML = '<span class="ci">'+t[1]+'</span><span>'+t[2].replace('Colorful Crackers','Crackers')+'</span>'; b.setAttribute('aria-label', t[2]);
    b.addEventListener('click', function(){ selType = t[0]; FX.setType(selType); snd('click'); box.querySelectorAll('.chip').forEach(function(c){ c.setAttribute('aria-checked', c === b ? 'true' : 'false'); });
      var s = size(); FX.fire(selType, s.w*.5, selType === 'rocket' || selType === 'aerial' ? s.h*.3 : s.h*.55); }); box.appendChild(b); });
})();
var celebrating = false;
$('btnCelebrate').addEventListener('click', function(){
  DAudio.unlock(); if (celebrating) return; celebrating = true; var b = $('btnCelebrate'); b.classList.add('pulse'); b.style.opacity = .7;
  snd('whoosh'); FX.celebrate(MOB ? 11 : 14, function(){ celebrating = false; b.classList.remove('pulse'); b.style.opacity = ''; });
  rich($('playNote'), 'A little Diwali show, just for you ✨');
});
$('btnToCouple').addEventListener('click', function(){ DAudio.unlock(); snd('sparkle'); go('couple'); });

/* ---------- 4 · couple ---------- */
ART.couple();
$('btnToGift').addEventListener('click', function(){ snd('sparkle'); go('gift'); });

/* ---------- 5 · gift ---------- */
var giftSway = $('giftSway'), box3d = $('gbox');
function resetGift(){
  giftOpened = false; $('gbLid').style.transform = ''; $('gbLid').style.opacity = ''; $('beam').classList.remove('on'); $('glowball').classList.remove('burst');
  $('giftStage').classList.remove('gone'); $('gifts').hidden = true; $('gifts').classList.remove('show'); $('btnOpenGift').hidden = false; $('btnToMessage').hidden = true; $('giftHint').hidden = true;
  $('giftStage').style.display = ''; $('btnOpenGift').disabled = false;
  $('gifts').querySelectorAll('.gcard').forEach(function(c){ c.classList.remove('seen'); }); opened = {};
  var iv = setInterval(function(){ if (current !== 'gift' || document.hidden) { if (current !== 'gift') clearInterval(iv); return; } if (!giftOpened) heartAroundGift(); }, 900); timers.push(iv);
}
function giftCenter(){ var r = $('giftStage').getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height*.45}; }
function heartAroundGift(){ heart(Math.random() < .35); }
$('btnOpenGift').addEventListener('click', function(){
  if (giftOpened) return; giftOpened = true; DAudio.unlock(); $('btnOpenGift').disabled = true; $('btnOpenGift').hidden = true;
  snd('open');
  /* stop sway so the open lid is seen clearly: freeze at a nice angle */
  var cs = getComputedStyle(giftSway).transform; giftSway.style.animation = 'none'; giftSway.style.transform = 'rotateX(-24deg) rotateY(-24deg)'; giftSway.style.transition = 'transform .6s ease';
  var lid = $('gbLid');
  lid.style.transform = 'translate3d(0,calc(var(--bw)*-.75),calc(var(--bw)*-.2)) rotateZ(-34deg) rotateX(18deg)';
  later(function(){ lid.style.transform = 'translate3d(calc(var(--bw)*-.9),calc(var(--bw)*-1.4),calc(var(--bw)*-.6)) rotateZ(-95deg) rotateX(45deg)'; lid.style.opacity = '0'; }, 1100);
  $('beam').classList.add('on'); $('glowball').classList.add('burst');
  var fl = $('flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
  var c = giftCenter();
  FX.shower(c.x, c.y, MOB ? 40 : 90, ['petal','petal','heart','star'], {up:true, min:4, max:13, gr:.14});
  later(function(){ var c2 = giftCenter(); FX.shower(c2.x, c2.y, MOB ? 30 : 60, ['heart','star','petal'], {min:2, max:9, gr:.05}); snd('sparkle'); }, 650);
  FX.burst(c.x, c.y - 80, 'peony', 0, true);
  setRain(.5,2.2,.6);
  later(function(){ $('giftStage').classList.add('gone'); }, 2300);
  later(function(){ $('giftStage').style.display = 'none'; $('beam').classList.remove('on'); var g = $('gifts'); g.hidden = false; void g.offsetWidth; g.classList.add('show'); snd('chime');
    $('giftHint').hidden = false; $('giftHint').textContent = 'Tap each gift to open it 💝'; rich($('giftHint'), 'Tap each gift to open it 💝'); setRain(.3,1,.3); }, 3100);
});
$('gifts').addEventListener('click', function(ev){
  var b = ev.target.closest('.gcard'); if (!b) return; openGift(b.dataset.gift, b);
});
function countOpened(){ return Object.keys(opened).length; }

var GIFT = {
  letter: { text: 'Every moment becomes special because of you. You are one of the most beautiful parts of my life.', cls:'script' },
  roses:  { text: 'These roses are a little symbol of my endless love for you.' },
  promise:{ text: 'No matter how many Diwalis come and go, I wish to keep celebrating every beautiful moment with you.' }
};
var gTimers = [];
function gLater(fn, ms){ var t = setTimeout(fn, ms); gTimers.push(t); }
function openGift(kind, btn){
  gTimers.forEach(clearTimeout); gTimers = [];
  var art = $('gdArt'), txt = $('gdText'), data = GIFT[kind];
  txt.className = 'gd-text'; txt.textContent = ''; art.innerHTML = '';
  body.classList.add('ov'); $('sc-gdetail').classList.add('active'); DAudio.unlock();
  var w = size().w, h = size().h;
  if (kind === 'letter'){
    art.innerHTML = ART.envelope(); snd('flip');
    gLater(function(){ $('envEl').classList.add('open'); snd('chime'); FX.shower(w/2, h*.38, 22, ['heart','star'], {up:true, min:3, max:9, gr:.08}); }, 700);
    gLater(function(){ txt.classList.add('script'); txt.classList.add('show'); rich(txt, 'Dear ' + name + ',\n'.replace('\n','') ); var s = document.createElement('span'); s.style.display = 'block'; s.textContent = data.text; txt.appendChild(s); heart(); heart(); heart(); }, 2300);
  } else if (kind === 'roses'){
    art.innerHTML = '<div class="rose-art">' + ART.bouquet() + '</div>'; snd('sparkle');
    gLater(function(){ FX.shower(w/2, h*.36, MOB ? 30 : 60, ['petal','petal','star'], {up:true, min:3, max:11, gr:.1}); snd('chime'); }, 900);
    gLater(function(){ txt.textContent = data.text; txt.classList.add('show'); }, 1500);
    for (var i=0;i<6;i++) gLater(function(){ petal(); petal(); }, 1200 + i*500);
  } else {
    art.innerHTML = ART.promise(); snd('heart');
    gLater(function(){ snd('heart'); FX.shower(w/2, h*.38, 24, ['heart','star'], {min:2, max:8, gr:.02}); }, 1300);
    gLater(function(){ txt.textContent = data.text; txt.classList.add('show'); }, 900);
    for (var j=0;j<5;j++) gLater(function(){ heart(true); heart(); }, 800 + j*600);
  }
  opened[kind] = 1; btn.classList.add('seen');
}
$('btnGBack').addEventListener('click', function(){
  gTimers.forEach(clearTimeout); gTimers = []; snd('click');
  $('sc-gdetail').classList.remove('active'); body.classList.remove('ov');
  var n = countOpened();
  if (n >= 1){ $('btnToMessage').hidden = false; }
  rich($('giftHint'), n >= 3 ? 'All three opened ❤️ Ready for the message?' : (n + ' of 3 opened · tap another 💝'));
});
$('btnToMessage').addEventListener('click', function(){ snd('sparkle'); go('message'); });

/* ---------- 6 · message ---------- */
function playMessage(){
  var ids = ['msgFor','m1','m2','m3','m4','m5'], box = $('msgBox');
  var T = {
    msgFor: 'For ' + name,
    m1: 'Happy Diwali, My Love! ❤️',
    m2: "Happy Diwali, My Life's Light ✨🪔",
    m3: 'You are the brightest light in my life, the sweetest reason behind my smile, and my most beautiful blessing.',
    m4: 'May your life always shine brighter than a thousand diyas. May happiness surround you, dreams come true, and our bond grow stronger with every passing day.',
    m5: 'Tonight, the entire sky is filled with lights, but nothing shines brighter in my world than YOU. ❤️'
  };
  ids.forEach(function(id){ var e = $(id); e.classList.remove('in'); rich(e, T[id]); e.style.opacity = ''; });
  $('btnToFinale').hidden = true; box.scrollTop = 0;
  var tl = [300, 1500, 3300, 5000, 8200, 11800];
  ids.forEach(function(id, i){ later(function(){ var e = $(id); e.classList.add('in'); if (i > 1) snd('flip'); if (i === 1){ snd('chime'); var s = size(); FX.shell(s.w*.5, s.h*.2, 'heart', 2, true); }
    if (box.scrollHeight > box.clientHeight + 4) box.scrollTo({top: box.scrollHeight, behavior:'smooth'}); }, tl[i]); });
  later(function(){ $('btnToFinale').hidden = false; snd('sparkle'); }, 14200);
}
$('btnToFinale').addEventListener('click', function(){ snd('sparkle'); go('finale'); });

/* ---------- 7 · finale ---------- */
function playFinale(){
  FX.tapEnabled(true); FX.setType('aerial'); FX.auto(0); setRain(1.2,1.4,1.3);
  var s = size();
  var T = { finFor: 'Forever yours, ' + name, f1: "Happy Diwali, My Life's Light ❤️", f2: 'Keep Smiling. Keep Shining. Keep Being Mine. ❤️', f3: 'Forever Yours ✨', f4: 'Made With Endless Love, Just For You ❤️' };
  var map = {finFor:'finFor', f1:'f1', f2:'f2', f3:'f3', f4:'f4'};
  Object.keys(T).forEach(function(id){ var e = $(id); e.classList.remove('in'); rich(e, T[id]); });
  $('finDock').hidden = true; $('finDock').classList.remove('show');
  FX.celebrate(MOB ? 14 : 18, function(){ FX.auto(MOB ? 1.1 : .8); });
  snd('finale');
  var tl = {finFor: 1200, f1: 2600, f2: 5600, f3: 8600, f4: 11800};
  Object.keys(tl).forEach(function(id){ later(function(){ $(id).classList.add('in'); if (id === 'f1') snd('chime'); if (id === 'f3') snd('sparkle'); if (id === 'f4'){ snd('finale'); FX.shell(s.w*.5, s.h*.18, 'heart', 2, true); FX.shell(s.w*.25, s.h*.25, 'peony', 0, true); FX.shell(s.w*.75, s.h*.25, 'peony', 4, true); } }, tl[id]); });
  later(function(){ var d = $('finDock'); d.hidden = false; d.classList.add('show'); }, 14000);
}
$('btnMore').addEventListener('click', function(){ DAudio.unlock(); FX.celebrate(MOB ? 8 : 10); });
$('btnReplay').addEventListener('click', function(){
  snd('click'); FX.auto(0); FX.clear(); $('finDock').hidden = true; $('flash').classList.remove('go'); celebrating = false; selType = 'rocket'; FX.setType('rocket');
  document.querySelectorAll('#chips .chip').forEach(function(c){ c.setAttribute('aria-checked', c.dataset.type === 'rocket' ? 'true' : 'false'); });
  $('sc-gdetail').classList.remove('active'); busy = false; go('intro');
});

/* ---------- global ---------- */
document.addEventListener('visibilitychange', function(){ /* fx loop + audio pause themselves; DOM rain skips while hidden */ });
document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && $('sc-gdetail').classList.contains('active')) $('btnGBack').click(); });
go('intro');
window.__surprise = { go: go, setName: function(n){ name = n; }, state: function(){ return {scene: current, name: name, opened: Object.keys(opened), particles: FX.count()}; } };
})();
