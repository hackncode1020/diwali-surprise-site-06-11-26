/* Fireworks engine: particles + trails on a transparent canvas, additive glow. */
(function(){
'use strict';
var cv = document.getElementById('fx'), g = cv.getContext('2d');
var cv2 = document.getElementById('fx2'), g2 = cv2.getContext('2d');
var W = 0, H = 0, DPR = 1, S = 1, MOB = false, CAP = 1800;
var P = [], SH = [], EM = [], FL = [], TIM = [], CF = [];
var PAL = [[43,100,66],[46,100,82],[335,100,70],[285,90,72],[215,100,68],[24,100,62],[352,100,64],[170,100,62],[0,0,100],[52,100,64]];
var GOLD=0, CHAMP=1, PINK=2, PURPLE=3, BLUE=4, ORANGE=5, RED=6, TEAL=7, WHITE=8, YELLOW=9;
var COL = PAL.map(function(c){ return 'hsl('+c[0]+','+c[1]+'%,'+c[2]+'%)'; });
var SPR = PAL.map(function(c){
  var s = document.createElement('canvas'); s.width = s.height = 64; var x = s.getContext('2d');
  var gr = x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.18,'hsla('+c[0]+','+c[1]+'%,'+Math.min(92,c[2]+16)+'%,.95)');
  gr.addColorStop(.45,'hsla('+c[0]+','+c[1]+'%,'+c[2]+'%,.35)'); gr.addColorStop(1,'hsla('+c[0]+','+c[1]+'%,'+c[2]+'%,0)');
  x.fillStyle = gr; x.fillRect(0,0,64,64); return s;
});
var running = false, last = 0, raf = 0, autoEvery = 0, autoT = 0, tapOn = true, curType = 'rocket';
var rnd = Math.random;
function R(a,b){ return a + rnd()*(b-a); }
function pick(a){ return a[(rnd()*a.length)|0]; }
function snd(n,a){ if (window.DAudio) DAudio.sfx(n,a); }

function resize(){
  MOB = Math.min(innerWidth, innerHeight) < 700 || matchMedia('(pointer:coarse)').matches;
  DPR = Math.min(window.devicePixelRatio || 1, MOB ? 1.5 : 2);
  W = innerWidth; H = innerHeight; S = Math.max(.62, Math.min(1.35, Math.min(W, H*0.9) / 640));
  CAP = MOB ? 650 : 1900;
  [[cv,g],[cv2,g2]].forEach(function(p){ p[0].width = Math.round(W*DPR); p[0].height = Math.round(H*DPR); p[1].setTransform(DPR,0,0,DPR,0,0); });
}
resize(); addEventListener('resize', resize); addEventListener('orientationchange', function(){ setTimeout(resize, 200); });

function add(x,y,vx,vy,life,ci,sz,o){
  var p = {x:x,y:y,px:x,py:y,vx:vx,vy:vy,l:life,m:life,ci:ci,sz:sz||1.4,gr:.04,dr:.97,tw:0,glow:0,dth:0};
  if (o) for (var k in o) p[k] = o[k];
  if (P.length >= CAP){ if (!(o && o.imp)) return; P[(rnd()*P.length)|0] = p; } else P.push(p);
  return p;
}
function flash(x,y,ci,r,life){ FL.push({x:x,y:y,ci:ci,r:r*S,l:life||.4,m:life||.4}); }
function later(sec, fn){ TIM.push({t:sec, fn:fn}); }
function budget(n){ var f = 1 - P.length/CAP; return Math.max(8, Math.round(n*Math.min(1, .25 + f))); }

/* ---------- bursts ---------- */
function cluster(ci){ return [ci, pick([GOLD,CHAMP,PINK,PURPLE,BLUE,ORANGE])]; }
function burst(x,y,type,ci,big){
  var n = budget((MOB ? 78 : 140) * (big ? 1.45 : 1)), k = big ? 1.28 : 1, i, a, sp, c2 = pick([GOLD,CHAMP,PINK,BLUE,PURPLE]);
  flash(x,y,ci, big ? 300 : 190); snd('burst', big);
  if (type === 'peony'){
    for (i=0;i<n;i++){ a = rnd()*6.283; sp = (2.0 + Math.pow(rnd(),.6)*3.4)*S*k;
      add(x,y,Math.cos(a)*sp,Math.sin(a)*sp,R(1.3,2.0),rnd()<.3?c2:ci,R(1.2,2),{dr:.962,gr:.034,imp:i<20}); }
    glitter(x,y,Math.round(n*.3),S*k*3.2);
  } else if (type === 'ring'){
    var tilt = R(.35,1), rot = R(0,3.14), cr = Math.cos(rot), sr = Math.sin(rot);
    for (i=0;i<n;i++){ a = i/n*6.283; var vx = Math.cos(a)*4.4*S*k, vy = Math.sin(a)*4.4*S*k*tilt;
      add(x,y,vx*cr - vy*sr, vx*sr + vy*cr, R(1.4,1.8), ci, 1.8, {dr:.955,gr:.03,imp:1}); }
    for (i=0;i<n*.4;i++){ a = rnd()*6.283; sp = R(.3,2)*S*k; add(x,y,Math.cos(a)*sp,Math.sin(a)*sp,R(1,1.5),c2,1.3,{dr:.95,gr:.03}); }
  } else if (type === 'heart'){
    var m = n*1.0;
    for (i=0;i<m;i++){ var t = i/m*6.283, hx = 16*Math.pow(Math.sin(t),3), hy = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
      add(x,y,hx*.27*S*k,hy*.27*S*k,R(1.8,2.3),ci,2,{dr:.968,gr:.012,imp:1,tw:1}); }
    for (i=0;i<m*.5;i++){ a = rnd()*6.283; sp = R(.2,1.6)*S; add(x,y,Math.cos(a)*sp,Math.sin(a)*sp - .3,R(1.4,2.2),GOLD,1.3,{dr:.96,gr:.01,tw:1}); }
  } else if (type === 'willow'){
    for (i=0;i<n;i++){ a = rnd()*6.283; sp = (1.2 + rnd()*2.9)*S*k;
      add(x,y,Math.cos(a)*sp,Math.sin(a)*sp,R(2.4,3.5),rnd()<.85?GOLD:CHAMP,1.5,{dr:.972,gr:.05,tw:1}); }
  } else if (type === 'crossette'){
    var arms = 7;
    for (i=0;i<arms;i++){ a = i/arms*6.283 + R(0,.3); sp = 3.3*S*k;
      add(x,y,Math.cos(a)*sp,Math.sin(a)*sp,R(.7,.95),ci,2.4,{dr:.96,gr:.02,dth:'split',imp:1}); }
    glitter(x,y,Math.round(n*.25),S*2.4);
  } else if (type === 'palm'){
    var ar = 9;
    for (i=0;i<ar;i++){ a = i/ar*6.283 + R(-.08,.08);
      for (var j=0;j<(MOB?7:11);j++){ sp = (1.4 + j*.42)*S*k;
        add(x,y,Math.cos(a)*sp,Math.sin(a)*sp,R(1.7,2.2)+j*.03,j%3===0?GOLD:ci,2,{dr:.96,gr:.04,imp:j<4}); } }
  } else if (type === 'multi'){   /* aerial: ring + inner peony + delayed pop */
    burst2(x,y,'ring',ci,false);
    for (i=0;i<n*.6;i++){ a = rnd()*6.283; sp = R(.4,2.6)*S*k; add(x,y,Math.cos(a)*sp,Math.sin(a)*sp,R(1.2,1.8),c2,1.6,{dr:.955,gr:.03}); }
    later(.38, function(){ burst2(x+R(-30,30)*S,y+R(-20,20)*S,'peony',c2,false); });
    later(.7, function(){ glitter(x,y,40,S*3.4); snd('crackle'); });
  }
}
function burst2(x,y,t,ci,b){ burst(x,y,t,ci,b); }
function glitter(x,y,n,v){
  n = budget(n);
  for (var i=0;i<n;i++){ var a = rnd()*6.283, sp = rnd()*v; add(x,y,Math.cos(a)*sp,Math.sin(a)*sp,R(1.6,2.8),rnd()<.7?GOLD:WHITE,1.1,{dr:.95,gr:.025,tw:1}); }
}

/* ---------- shells (rocket / aerial) ---------- */
function shell(tx,ty,type,ci,big,sx){
  var x0 = sx != null ? sx : tx + R(-40,40)*S, y0 = H + 12, gr = .1*S, dist = Math.max(120, y0 - ty);
  var vy = -Math.sqrt(2*gr*dist), fr = -vy/gr;
  SH.push({x:x0,y:y0,vx:(tx-x0)/fr,vy:vy,gr:gr,ty:ty,type:type,ci:ci,big:big,age:0});
  snd('launch');
}
function updShell(s,f,dt){
  s.vy += s.gr*f; s.x += s.vx*f; s.y += s.vy*f; s.age += dt;
  for (var i=0;i<(MOB?1:2);i++) add(s.x + R(-1,1), s.y + R(0,6), R(-.3,.3), R(.4,1.2), R(.35,.7), rnd()<.7?GOLD:ORANGE, 1.1, {dr:.93,gr:.02,tw:1});
  if (s.vy >= -.6 || s.y <= s.ty - 20){ burst(s.x,s.y,s.type,s.ci,s.big); return false; }
  return true;
}

/* ---------- ground / handheld emitters ---------- */
function emitter(o){ o.t = 0; o.hiss = 0; EM.push(o); return o; }
function updEm(e,f,dt){
  e.t += dt; var env = Math.min(1, e.t/.35) * Math.min(1, Math.max(0,(e.dur - e.t)/.6)), i, n, a, sp;
  if (e.hold && !e.released) { env = Math.min(1, e.t/.15); } 
  if (e.released){ e.rel = (e.rel||0) + dt; env *= Math.max(0, 1 - e.rel/1.0); if (e.rel > 1.0){ return false; } }
  else if (!e.hold && e.t >= e.dur){ if (e.end) e.end(e); return false; }
  e.hiss -= dt;
  if (e.type === 'sparkler'){
    n = Math.round((MOB ? 6 : 10) * env);
    for (i=0;i<n;i++){ a = rnd()*6.283; sp = R(1,4.6)*S;
      add(e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp - .6,R(.22,.6),rnd()<.2?WHITE:(rnd()<.6?GOLD:CHAMP),1,{dr:.92,gr:.07,tw:1,dth:rnd()<.1?'fork':0}); }
    if (e.hiss <= 0){ snd('hiss'); e.hiss = .1; }
  } else if (e.type === 'fountain'){
    n = Math.round((MOB ? 5 : 9) * env);
    for (i=0;i<n;i++){ a = -1.5708 + R(-.26,.26); sp = R(5,9.5)*S;
      add(e.x + R(-3,3)*S,e.y,Math.cos(a)*sp,Math.sin(a)*sp,R(.9,1.5),pick([GOLD,GOLD,CHAMP,ORANGE,YELLOW]),1.5,{dr:.985,gr:.15*S,tw:1}); }
    if (rnd()<.4) add(e.x,e.y - 4*S,R(-.5,.5),R(-2,-.5),.25,WHITE,3.2,{glow:1,dr:.9,gr:0});
    if (e.hiss <= 0){ snd('hiss'); e.hiss = .12; }
  } else if (e.type === 'flowerpot'){
    var cols = [GOLD,PINK,BLUE,PURPLE,ORANGE,CHAMP], cc = cols[Math.floor(e.t/.7) % cols.length];
    n = Math.round((MOB ? 7 : 13) * env);
    for (i=0;i<n;i++){ a = -1.5708 + R(-.42,.42); sp = R(6,12.5)*S;
      add(e.x + R(-4,4)*S,e.y,Math.cos(a)*sp,Math.sin(a)*sp,R(1.1,1.9),rnd()<.6?cc:pick([GOLD,WHITE,CHAMP]),1.6,{dr:.984,gr:.16*S,tw:1}); }
    add(e.x,e.y - 6*S,R(-.6,.6),R(-2.4,-.6),.3,cc,4,{glow:1,dr:.9,gr:0});
    if (e.hiss <= 0){ snd('hiss'); e.hiss = .1; }
  } else if (e.type === 'chakri'){
    e.ang = (e.ang||0) + (.35 + env*.28)*f; e.x += Math.cos(e.t*1.7)*.7*f*S; e.y += Math.sin(e.t*1.3)*.5*f*S;
    n = Math.round((MOB ? 3 : 5) * env);
    for (i=0;i<n;i++){ var b = e.ang + i*(6.283/n/1.2); sp = R(3,5.4)*S;
      add(e.x + Math.cos(b)*12*S,e.y + Math.sin(b)*12*S,Math.cos(b + 1.45)*sp,Math.sin(b + 1.45)*sp,R(.5,.9),pick([GOLD,CHAMP,ORANGE,WHITE]),1.3,{dr:.955,gr:.03,tw:1}); }
    add(e.x,e.y,0,0,.12,ORANGE,5,{glow:1,gr:0});
    if (e.hiss <= 0){ snd('whirr'); e.hiss = .16; }
  } else if (e.type === 'crackers'){
    while (e.n < e.N && e.t >= e.n*.085){
      var px = e.x + (e.n - e.N/2)*24*S, py = e.y + Math.sin(e.n*.8)*14*S, ci = pick([PINK,GOLD,BLUE,PURPLE,ORANGE,RED,TEAL]);
      flash(px,py,ci,70,.22); snd('pop');
      for (i=0;i<(MOB?14:22);i++){ a = rnd()*6.283; sp = R(1.2,5.2)*S; add(px,py,Math.cos(a)*sp,Math.sin(a)*sp - 1.2,R(.3,.7),rnd()<.5?ci:WHITE,1.4,{dr:.93,gr:.12,tw:1}); }
      for (i=0;i<4;i++) add(px,py,R(-3,3)*S,R(-4,-1)*S,R(.8,1.3),RED,2.3,{dr:.96,gr:.18,paper:1});
      e.n++;
      if (e.n === e.N){ later(.12,function(){ snd('crackle'); burst(e.x,e.y - 60*S,'peony',pick([PINK,GOLD,BLUE]),false); }); }
    }
    return e.n < e.N || e.t < e.N*.085 + .2;
  }
  return true;
}

/* ---------- loop ---------- */
function frame(now){
  raf = requestAnimationFrame(frame);
  var dt = Math.min(.05, (now - last)/1000 || .016); last = now; var f = dt*60, i;
  if (autoEvery > 0 && (autoT -= dt) <= 0){ autoT = autoEvery*R(.55,1.4); autoShot(); }
  for (i=TIM.length-1;i>=0;i--){ if ((TIM[i].t -= dt) <= 0){ var fn = TIM[i].fn; TIM.splice(i,1); fn(); } }
  for (i=SH.length-1;i>=0;i--) if (!updShell(SH[i],f,dt)) SH.splice(i,1);
  for (i=EM.length-1;i>=0;i--) if (!updEm(EM[i],f,dt)) EM.splice(i,1);
  g.clearRect(0,0,W,H);
  if (P.length + SH.length + EM.length + FL.length + CF.length === 0){ g2.clearRect(0,0,W,H); return; }
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (i=FL.length-1;i>=0;i--){ var fl = FL[i]; fl.l -= dt; if (fl.l <= 0){ FL.splice(i,1); continue; }
    var q = fl.l/fl.m; g.globalAlpha = q*.55; var r = fl.r*(1.2 - q*.4); g.drawImage(SPR[fl.ci], fl.x - r, fl.y - r, r*2, r*2); }
  var dead = 0;
  for (i=0;i<P.length;i++){
    var p = P[i];
    p.px = p.x; p.py = p.y;
    p.vx *= 1 - (1-p.dr)*f; p.vy = p.vy*(1 - (1-p.dr)*f) + p.gr*f; p.x += p.vx*f; p.y += p.vy*f; p.l -= dt;
    if (p.l <= 0){
      if (p.dth === 'split'){ for (var k=0;k<(MOB?5:8);k++){ var a = rnd()*6.283, sp = R(1.2,3)*S; add(p.x,p.y,Math.cos(a)*sp,Math.sin(a)*sp,R(.6,1),p.ci,1.5,{dr:.95,gr:.04}); } snd('pop'); }
      else if (p.dth === 'fork'){ for (var k2=0;k2<3;k2++){ var a2 = rnd()*6.283; add(p.x,p.y,Math.cos(a2)*1.6,Math.sin(a2)*1.6,.2,GOLD,.8,{dr:.9,gr:.05}); } }
      P[i] = P[P.length-1]; P.pop(); i--; continue;
    }
    var al = Math.min(1, p.l/p.m*1.7); if (p.tw) al *= .45 + rnd()*.55;
    if (p.glow){ g.globalAlpha = al*.9; var rr = p.sz*S*5; g.drawImage(SPR[p.ci], p.x - rr, p.y - rr, rr*2, rr*2); continue; }
    g.globalAlpha = al; g.strokeStyle = COL[p.ci]; g.lineWidth = p.sz*S*(p.paper ? 1.4 : (.7 + al*.5));
    g.beginPath(); g.moveTo(p.px - p.vx*.6, p.py - p.vy*.6); g.lineTo(p.x, p.y); g.stroke();
    if (p.sz > 1.7){ var hr = p.sz*S*3.2; g.globalAlpha = al*.7; g.drawImage(SPR[p.ci], p.x - hr, p.y - hr, hr*2, hr*2); }
  }
  /* emitter bodies + shell heads */
  g.globalAlpha = 1;
  for (i=0;i<SH.length;i++){ var s = SH[i], hr2 = 9*S; g.globalAlpha = .9; g.drawImage(SPR[WHITE], s.x - hr2, s.y - hr2, hr2*2, hr2*2); }
  for (i=0;i<EM.length;i++){ var e = EM[i], hr3 = (e.type === 'sparkler' ? 22 : 16)*S*(.8 + rnd()*.4);
    g.globalAlpha = .85; g.drawImage(SPR[e.type === 'sparkler' ? WHITE : ORANGE], e.x - hr3, e.y - hr3, hr3*2, hr3*2); }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  for (i=0;i<EM.length;i++) drawBody(EM[i]);
  confettiFrame(dt);
}
function drawBody(e){
  g.save(); g.translate(e.x, e.y);
  if (e.type === 'sparkler'){ g.strokeStyle = '#8a6a43'; g.lineWidth = 2.2*S; g.lineCap = 'round'; g.beginPath(); g.moveTo(0,0); g.lineTo(-26*S, 92*S); g.stroke();
    g.strokeStyle = '#d9b36b'; g.lineWidth = 1.4*S; g.beginPath(); g.moveTo(0,0); g.lineTo(-9*S, 32*S); g.stroke(); }
  else if (e.type === 'fountain' || e.type === 'flowerpot'){ var w = e.type === 'flowerpot' ? 20 : 15, h = e.type === 'flowerpot' ? 30 : 24;
    var gr = g.createLinearGradient(-w*S,0,w*S,0); gr.addColorStop(0,'#5a2410'); gr.addColorStop(.5,'#c0572a'); gr.addColorStop(1,'#4a1c0c');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-w*.6*S,0); g.lineTo(w*.6*S,0); g.lineTo(w*S,h*S); g.lineTo(-w*S,h*S); g.closePath(); g.fill();
    g.fillStyle = '#e9b04a'; g.fillRect(-w*S,h*S*.45,w*2*S,3*S); }
  else if (e.type === 'chakri'){ g.rotate(e.ang||0); g.strokeStyle = '#d6a14e'; g.lineWidth = 2*S; g.beginPath(); g.arc(0,0,11*S,0,6.283); g.stroke();
    for (var k=0;k<3;k++){ g.rotate(2.094); g.beginPath(); g.moveTo(0,0); g.lineTo(11*S,0); g.stroke(); } }
  g.restore();
}

/* ---------- confetti-ish shapes on fx2 (gift opening etc.) ---------- */
function shower(x,y,n,kinds,o){
  o = o || {}; n = Math.min(n, MOB ? 60 : 130);
  for (var i=0;i<n;i++){ var a = (o.up ? -1.5708 + R(-.9,.9) : rnd()*6.283), sp = R(o.min||2,o.max||9)*S;
    CF.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,rot:rnd()*6.283,vr:R(-.12,.12),sz:R(7,17)*S*(o.big||1),kind:pick(kinds),
      l:R(2.4,4.2),m:0,gr:o.gr!=null?o.gr:.07,sw:rnd()*6.283,col:pick(['#ff4d79','#ff7ba2','#ffd36e','#fff0b8','#ff9a3c','#d8338a','#ffffff'])}); CF[CF.length-1].m = CF[CF.length-1].l; }
}
function shape(c){
  var s = c.sz;
  if (c.kind === 'heart'){ g2.beginPath(); g2.moveTo(0,s*.35); g2.bezierCurveTo(-s*.9,-s*.2,-s*.5,-s*.85,0,-s*.35); g2.bezierCurveTo(s*.5,-s*.85,s*.9,-s*.2,0,s*.35); g2.fill(); }
  else if (c.kind === 'star'){ g2.beginPath(); for (var i=0;i<10;i++){ var r = i%2 ? s*.22 : s*.55, a = i/10*6.283 - 1.5708; g2.lineTo(Math.cos(a)*r, Math.sin(a)*r); } g2.closePath(); g2.fill(); }
  else { g2.beginPath(); g2.moveTo(0,-s*.5); g2.bezierCurveTo(s*.55,-s*.35,s*.5,s*.3,0,s*.5); g2.bezierCurveTo(-s*.5,s*.3,-s*.55,-s*.35,0,-s*.5); g2.fill(); }
}
function confettiFrame(dt){
  if (!CF.length){ g2.clearRect(0,0,W,H); return; }
  g2.clearRect(0,0,W,H); g2.globalCompositeOperation = 'lighter';
  for (var i=CF.length-1;i>=0;i--){ var c = CF[i]; c.l -= dt; if (c.l <= 0 || c.y > H + 40){ CF.splice(i,1); continue; }
    c.vx *= .985; c.vy = c.vy*.985 + c.gr; c.sw += dt*3; c.x += c.vx + Math.sin(c.sw)*.5; c.y += c.vy; c.rot += c.vr;
    g2.save(); g2.translate(c.x,c.y); g2.rotate(c.rot); g2.scale(1, c.kind === 'petal' ? Math.cos(c.sw*1.4)*.7 + .35 : 1);
    g2.globalAlpha = Math.min(1, c.l/c.m*2.2) * (c.kind === 'petal' ? .85 : .95); g2.fillStyle = c.kind === 'petal' ? (c.col === '#ffffff' ? '#ff6a8d' : c.col) : (c.kind === 'heart' ? '#ff5e8e' : '#ffd878'); shape(c); g2.restore(); }
  g2.globalCompositeOperation = 'source-over'; g2.globalAlpha = 1;
}

/* ---------- auto / show ---------- */
var AUTO_TYPES = ['peony','peony','ring','willow','crossette','palm','multi'];
function autoShot(){
  if (P.length > CAP*.75) return;
  shell(R(.12,.88)*W, R(.1,.45)*H, pick(AUTO_TYPES), pick([GOLD,PINK,PURPLE,BLUE,ORANGE,CHAMP,RED]), rnd()<.25);
}
function celebrate(sec, done){
  sec = sec || 14; var n = MOB ? 22 : 34, i;
  for (i=0;i<n;i++){ (function(i){ var tt = (i/n)*sec*.82 + R(0,.3), pro = i/n;
    later(tt, function(){
      var big = pro > .6, cnt = pro > .85 ? 3 : (pro > .5 ? 2 : 1);
      for (var j=0;j<cnt;j++) shell(R(.08,.92)*W, R(.1,.5)*H, pick(AUTO_TYPES), pick([GOLD,PINK,PURPLE,BLUE,ORANGE,CHAMP,RED,TEAL]), big, j? R(.1,.9)*W : null);
      if (i % 5 === 3) emitter({type:'fountain',x:R(.15,.85)*W,y:H - 30*S,dur:3});
    }); })(i); }
  later(sec*.88, function(){ for (var j=0;j<7;j++) (function(j){ later(j*.12, function(){ shell((.1 + j*.13)*W, R(.12,.4)*H, j%3===0?'heart':pick(['peony','ring','willow','multi']), [GOLD,PINK,PURPLE,BLUE,ORANGE,PINK,GOLD][j], true); }); })(j); });
  later(sec + 1.8, function(){ if (done) done(); snd('finale'); });
}
function fire(type, x, y){
  if (type === 'sparkler') return emitter({type:'sparkler',x:x,y:y,dur:4});
  if (type === 'rocket') return shell(x,y,pick(['peony','peony','ring','willow']),pick([GOLD,PINK,PURPLE,BLUE,ORANGE]),false);
  if (type === 'aerial') { shell(x,y,'multi',pick([PINK,PURPLE,BLUE,GOLD]),true); return; }
  if (type === 'fountain') return emitter({type:'fountain',x:x,y:y,dur:3.8});
  if (type === 'flowerpot') return emitter({type:'flowerpot',x:x,y:y,dur:4.2,end:function(e){ snd('pop'); burst(e.x,e.y - 90*S,'peony',PINK,false); }});
  if (type === 'chakri') return emitter({type:'chakri',x:x,y:y,dur:4.2,end:function(e){ burst(e.x,e.y,'peony',GOLD,false); }});
  if (type === 'crackers') return emitter({type:'crackers',x:x,y:y,N:14,dur:99,n:0});
}

/* pointer */
var held = {};
cv.addEventListener('pointerdown', function(ev){
  if (!tapOn) return; ev.preventDefault();
  var x = ev.clientX, y = ev.clientY; if (window.DAudio) DAudio.unlock();
  if (curType === 'sparkler'){ held[ev.pointerId] = fire('sparkler', x, y); held[ev.pointerId].hold = true; try { cv.setPointerCapture(ev.pointerId); } catch(e){} }
  else fire(curType, x, y);
  if (window.FXhooks && FXhooks.tap) FXhooks.tap(curType);
});
cv.addEventListener('pointermove', function(ev){ var e = held[ev.pointerId]; if (e){ e.x = ev.clientX; e.y = ev.clientY; } });
function rel(ev){ var e = held[ev.pointerId]; if (e){ if (e.t < 3){ e.hold = false; e.dur = Math.max(e.dur, 3.6); } else e.released = true; delete held[ev.pointerId]; } }
cv.addEventListener('pointerup', rel); cv.addEventListener('pointercancel', rel);
cv.style.touchAction = 'none';

function start(){ if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
function stop(){ running = false; cancelAnimationFrame(raf); }
document.addEventListener('visibilitychange', function(){ if (document.hidden) { cancelAnimationFrame(raf); } else if (running) { last = performance.now(); raf = requestAnimationFrame(frame); } });
start();

window.FX = {
  fire: fire, burst: function(x,y,t,ci,b){ burst(x,y,t||'peony',ci==null?GOLD:ci,b); }, shell: shell, celebrate: celebrate, shower: shower, glitter: glitter,
  setType: function(t){ curType = t; }, getType: function(){ return curType; }, tapEnabled: function(b){ tapOn = !!b; cv.style.pointerEvents = b ? 'auto' : 'none'; },
  auto: function(sec){ autoEvery = sec || 0; autoT = 0.3; }, count: function(){ return P.length; }, mobile: function(){ return MOB; },
  clear: function(){ P.length = 0; SH.length = 0; EM.length = 0; FL.length = 0; TIM.length = 0; CF.length = 0; },
  COLORS: {GOLD:GOLD,CHAMP:CHAMP,PINK:PINK,PURPLE:PURPLE,BLUE:BLUE,ORANGE:ORANGE,RED:RED,TEAL:TEAL,WHITE:WHITE},
  size: function(){ return {w:W,h:H}; }
};
})();
