/* All artwork is drawn in code: canvas stars + inline SVG. No images are loaded. */
(function(){
'use strict';
var NS = 'http://www.w3.org/2000/svg';
var seed = 7; function rr(){ seed = (seed*16807) % 2147483647; return (seed-1)/2147483646; }
function rg(a,b){ return a + rr()*(b-a); }
function $(id){ return document.getElementById(id); }

/* ---------- stars ---------- */
function stars(){
  var W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio||1, 2);
  var total = Math.max(1800, Math.min(3200, Math.round(W*H/110)));
  var layers = [['st1',.66,.5,.95],['st2',.30,.8,1.25],['st3',.035,1.2,2.0]];
  layers.forEach(function(L){
    var c = $(L[0]); c.width = W*dpr; c.height = H*dpr; var x = c.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H);
    var n = Math.round(total*L[1]); seed = 11 + L[0].length*3;
    for (var i=0;i<n;i++){
      var px = rr()*W, py = Math.pow(rr(),1.25)*H*.88, r = rg(L[2]*.55, L[3]);
      var hue = rr(); var col = hue < .6 ? '255,255,255' : (hue < .8 ? '255,236,190' : (hue < .92 ? '200,215,255' : '255,200,230'));
      x.globalAlpha = rg(.35,.95);
      if (L[0] === 'st3'){
        var g = x.createRadialGradient(px,py,0,px,py,r*3.6); g.addColorStop(0,'rgba('+col+',.95)'); g.addColorStop(.25,'rgba('+col+',.35)'); g.addColorStop(1,'rgba('+col+',0)');
        x.fillStyle = g; x.fillRect(px-r*4,py-r*4,r*8,r*8);
        x.strokeStyle = 'rgba('+col+',.55)'; x.lineWidth = .6; x.beginPath(); x.moveTo(px-r*3,py); x.lineTo(px+r*3,py); x.moveTo(px,py-r*3); x.lineTo(px,py+r*3); x.stroke();
      } else { x.fillStyle = 'rgb('+col+')'; x.beginPath(); x.arc(px,py,r,0,6.283); x.fill(); }
    }
    x.globalAlpha = 1;
  });
}

function shooting(){
  var box = $('shooting'), i = document.createElement('i');
  i.style.left = Math.round(rg(5,70)) + '%'; i.style.top = Math.round(rg(3,30)) + '%'; box.appendChild(i);
  i.addEventListener('animationend', function(){ i.remove(); });
}

/* ---------- dust (golden particles) ---------- */
function dust(){
  var box = $('dust'), n = (innerWidth < 700 ? 26 : 46);
  for (var i=0;i<n;i++){ var d = document.createElement('i'), s = rg(3,8);
    d.style.cssText = 'left:'+rg(0,100)+'%;width:'+s+'px;height:'+s+'px;animation-duration:'+rg(9,22)+'s;animation-delay:'+(-rg(0,22))+'s;--dx:'+rg(-60,60)+'px';
    box.appendChild(d); }
}

/* ---------- skyline ---------- */
function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function city(){
  var svg = $('city'); svg.setAttribute('viewBox','0 0 1200 520'); svg.innerHTML = '';
  var defs = el('defs',{},svg);
  var lg = el('linearGradient',{id:'cgFar',x1:0,y1:0,x2:0,y2:1},defs);
  el('stop',{offset:0,'stop-color':'#3b2a86'},lg); el('stop',{offset:1,'stop-color':'#201457'},lg);
  var lg2 = el('linearGradient',{id:'cgNear',x1:0,y1:0,x2:0,y2:1},defs);
  el('stop',{offset:0,'stop-color':'#1a1050'},lg2); el('stop',{offset:1,'stop-color':'#0a0630'},lg2);
  var rad = el('radialGradient',{id:'winG'},defs); el('stop',{offset:0,'stop-color':'#fff3b8'},rad); el('stop',{offset:1,'stop-color':'#ffb44a'},rad);
  var far = el('g',{fill:'url(#cgFar)',opacity:.9},svg), near = el('g',{fill:'url(#cgNear)'},svg), lit = el('g',{},svg), deco = el('g',{},svg);
  seed = 23;

  function dome(g,cx,by,r,h,fin){
    el('path',{d:'M'+(cx-r)+','+by+' C'+(cx-r*1.2)+','+(by-h*.55)+' '+(cx-r*.28)+','+(by-h*.72)+' '+cx+','+(by-h)+' C'+(cx+r*.28)+','+(by-h*.72)+' '+(cx+r*1.2)+','+(by-h*.55)+' '+(cx+r)+','+by+' Z'},g);
    el('rect',{x:cx-r*1.05,y:by-3,width:r*2.1,height:5,rx:1.5},g);
    if (fin !== false){ el('rect',{x:cx-1,y:by-h-fin_(h),width:2,height:fin_(h)},g); el('circle',{cx:cx,cy:by-h-fin_(h),r:2.4},g); }
  }
  function fin_(h){ return Math.max(10,h*.28); }
  function chhatri(g,cx,by,w){ var h = w*.6; for (var i=0;i<4;i++) el('rect',{x:cx-w/2+i*(w-3)/3,y:by-w*.62,width:3,height:w*.62},g); el('rect',{x:cx-w/2-3,y:by-w*.66,width:w+6,height:5},g); dome(g,cx,by-w*.66,w*.5,h,true); }
  function minaret(g,x,by,w,h){ el('path',{d:'M'+(x-w/2)+','+by+' L'+(x-w*.36)+','+(by-h)+' L'+(x+w*.36)+','+(by-h)+' L'+(x+w/2)+','+by+' Z'},g);
    el('rect',{x:x-w*.8,y:by-h-4,width:w*1.6,height:6,rx:2},g); dome(g,x,by-h-4,w*.55,w*1.2,true); }
  function shikhara(g,x,by,w,h){ el('path',{d:'M'+(x-w/2)+','+by+' C'+(x-w*.5)+','+(by-h*.5)+' '+(x-w*.2)+','+(by-h*.85)+' '+x+','+(by-h)+' C'+(x+w*.2)+','+(by-h*.85)+' '+(x+w*.5)+','+(by-h*.5)+' '+(x+w/2)+','+by+' Z'},g);
    for (var i=1;i<5;i++) el('rect',{x:x-w*(.5-i*.04),y:by-h*i*.18,width:w*(1-i*.08),height:3,rx:1.5,opacity:.5,fill:'#000'},g);
    el('circle',{cx:x,cy:by-h-2,r:w*.09},g); el('rect',{x:x-1,y:by-h-w*.26,width:2,height:w*.2},g); }
  function windows(x,by,w,h,rows,cols,arched){
    for (var r=0;r<rows;r++) for (var c=0;c<cols;c++){
      var ww = Math.min(11, w/cols*.5), wx = x + (c+.5)*w/cols - ww/2, wy = by - h + 14 + r*((h-26)/rows);
      if (rr() < .28) continue;
      var d = arched ? 'M'+wx+','+(wy+15)+' L'+wx+','+(wy+5)+' Q'+(wx+ww/2)+','+(wy-5)+' '+(wx+ww)+','+(wy+5)+' L'+(wx+ww)+','+(wy+15)+' Z' : 'M'+wx+','+wy+' h'+ww+' v15 h-'+ww+' Z';
      var p = el('path',{d:d,fill:'url(#winG)',class:'win'},lit); p.style.animationDelay = (-rr()*3)+'s'; p.setAttribute('opacity', (.55+rr()*.4).toFixed(2));
    }
  }
  function haveli(g,x,by,w,h,rows,cols,balc){
    el('rect',{x:x,y:by-h,width:w,height:h+4},g);
    for (var i=0;i<Math.round(w/16);i++) el('path',{d:'M'+(x+i*16)+','+(by-h)+' l8,-9 l8,9 Z'},g);
    windows(x,by,w,h,rows,cols,true);
    if (balc){ for (var b=0;b<balc;b++){ var bx = x + w*(b+.5)/balc - 14, byy = by - h*(.28+.3*(b%2));
      el('rect',{x:bx,y:byy,width:28,height:5},g); el('rect',{x:bx-1,y:byy-14,width:30,height:3},lit).setAttribute('fill','#5a3a9a');
      for (var q=0;q<7;q++) el('rect',{x:bx+2+q*4,y:byy-14,width:1.2,height:14,fill:'#7b52c8',opacity:.8},lit);
      dome(g,bx+14,byy-14,13,15,true);
      /* marigold garland + lamp */
      var gd = 'M'+(bx-2)+','+(byy-1)+' Q'+(bx+14)+','+(byy+13)+' '+(bx+30)+','+(byy-1);
      var gp = el('path',{d:gd,fill:'none',stroke:'#ff9a2e','stroke-width':3,'stroke-dasharray':'3 2.2','stroke-linecap':'round',opacity:.95},deco);
      var lamp = el('circle',{cx:bx+14,cy:byy+11,r:2.6,fill:'#ffd36e',class:'bulb'},deco); lamp.style.animationDelay = (-rr()*2)+'s';
    } }
  }
  /* far layer */
  var x = -20; while (x < 1220){ var bw = rg(46,90), bh = rg(70,150); el('rect',{x:x,y:520-bh-40,width:bw,height:bh+40},far); if (rr()<.5) dome(far,x+bw/2,520-bh-40,bw*.32,bw*.38,true); x += bw + rg(-6,8); }
  minaret(far,90,480,16,210); minaret(far,1110,480,16,230); shikhara(far,280,480,70,190); shikhara(far,930,480,70,200); minaret(far,430,480,14,170); minaret(far,790,480,14,175);
  /* near layer: palace centre */
  var by = 520;
  el('rect',{x:420,y:by-170,width:360,height:170},near);
  dome(near,600,by-170,70,100,true);
  dome(near,500,by-170,34,52,true); dome(near,700,by-170,34,52,true); dome(near,440,by-170,22,32,true); dome(near,760,by-170,22,32,true);
  minaret(near,420,by,16,230); minaret(near,780,by,16,230);
  windows(430,by,340,170,3,11,true);
  el('path',{d:'M575,'+by+' L575,'+(by-62)+' Q600,'+(by-92)+' 625,'+(by-62)+' L625,'+by+' Z',fill:'#ffd488',class:'win'},lit);
  /* sides */
  haveli(near,0,by,150,210,5,7,3); haveli(near,150,by,110,150,4,5,2); chhatri(near,296,by-150,34); haveli(near,260,by,120,120,3,5,2);
  shikhara(near,380,by,60,250);
  haveli(near,800,by,120,140,4,5,2); shikhara(near,935,by,64,235); haveli(near,960,by,100,170,4,5,2); haveli(near,1060,by,150,215,5,7,3);
  chhatri(near,880,by-140,30); chhatri(near,1010,by-170,30); chhatri(near,60,by-210,34);
  el('rect',{x:-10,y:by-34,width:1220,height:60},near);
  /* string bulbs between buildings */
  var strands = [[0,300,330,60],[300,300,240,320],[880,120,300,250],[420,0,200,60]];
  [[20,330,250,300],[260,300,420,320],[780,300,930,300],[930,280,1190,330],[420,310,780,310]].forEach(function(s,i){
    var x1=s[0],y1=s[1]+ (i%2?30:0),x2=s[2],y2=s[3]; var mid = (x1+x2)/2;
    el('path',{d:'M'+x1+','+y1+' Q'+mid+','+(Math.max(y1,y2)+36)+' '+x2+','+y2,fill:'none',stroke:'#c79a4a','stroke-width':1,opacity:.7},deco);
    for (var t=0;t<=1.001;t+=.07){ var px = (1-t)*(1-t)*x1 + 2*(1-t)*t*mid + t*t*x2, py = (1-t)*(1-t)*y1 + 2*(1-t)*t*(Math.max(y1,y2)+36) + t*t*y2;
      var b = el('circle',{cx:px,cy:py,r:2.3,fill:['#ffd36e','#ff9fc0','#ffe9a8','#ffb25c'][Math.floor(rr()*4)],class:'bulb'},deco); b.style.animationDelay = (-rr()*2.4)+'s'; }
  });
}

/* ---------- hanging fairy lights (top) ---------- */
function lights(){
  var svg = $('lights'); svg.setAttribute('viewBox','0 0 1000 230'); svg.innerHTML = ''; seed = 5;
  var strands = [[0,10,1000,10,60],[ -20,40,1020,30,95],[0,70,1000,70,130]];
  strands.forEach(function(s,idx){
    var x1=s[0],y1=s[1],x2=s[2],y2=s[3],sag=s[4]; var mid=(x1+x2)/2;
    /* three scallops per strand */
    var d = 'M'+x1+','+y1; var segs = 3, pts = [];
    for (var k=0;k<segs;k++){ var ax = x1 + (x2-x1)*k/segs, bx = x1 + (x2-x1)*(k+1)/segs, ay = y1 + (y2-y1)*k/segs, by = y1 + (y2-y1)*(k+1)/segs;
      d += ' Q'+((ax+bx)/2)+','+(Math.max(ay,by)+sag*(idx? .7:.55))+' '+bx+','+by; pts.push([ax,ay,(ax+bx)/2,Math.max(ay,by)+sag*(idx?.7:.55),bx,by]); }
    el('path',{d:d,fill:'none',stroke:'#b8893f','stroke-width':1.2,opacity:.75},svg);
    pts.forEach(function(p){ for (var t=.05;t<1;t+=.075){ var px=(1-t)*(1-t)*p[0]+2*(1-t)*t*p[2]+t*t*p[4], py=(1-t)*(1-t)*p[1]+2*(1-t)*t*p[3]+t*t*p[5];
      var col = ['#ffd36e','#fff0b8','#ffb25c','#ff9fc0'][Math.floor(rr()*4)];
      el('circle',{cx:px,cy:py+4,r:9,fill:col,opacity:.16},svg);
      var b = el('circle',{cx:px,cy:py+4,r:3.1,fill:col,class:'bulb'},svg); b.style.animationDelay = (-rr()*2.4)+'s'; } });
  });
}

/* ---------- diyas ---------- */
function diyaHTML(){
  return '<svg viewBox="0 0 44 22"><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb35a"/><stop offset=".45" stop-color="#d0642a"/><stop offset="1" stop-color="#6d2512"/></linearGradient></defs>'+
    '<path d="M1,4 Q22,-2 43,4 Q40,20 22,21 Q4,20 1,4Z" fill="url(#dg)"/><path d="M1,4 Q22,-1 43,4" stroke="#ffe29a" stroke-width="1.6" fill="none"/>'+
    '<g fill="#ffe29a" opacity=".85"><circle cx="11" cy="11" r="1.3"/><circle cx="17" cy="14" r="1.3"/><circle cx="22" cy="15.5" r="1.3"/><circle cx="27" cy="14" r="1.3"/><circle cx="33" cy="11" r="1.3"/></g></svg><div class="fl"></div>';
}
function diyas(){
  var box = $('diyas'); box.innerHTML = ''; var n = innerWidth < 500 ? 6 : (innerWidth < 900 ? 9 : 14);
  for (var i=0;i<n;i++){ var d = document.createElement('div'); d.className = 'diya'; d.style.left = ((i+.5)/n*100) + '%';
    var sc = .9 + (i%3)*.12; d.style.transform = 'translateX(-50%) scale('+sc+')'; d.innerHTML = diyaHTML();
    d.querySelector('.fl').classList.add(i%3===0?'s2':(i%3===1?'s3':'s1')); box.appendChild(d); }
}

/* ---------- couple illustration ---------- */
function couple(){
  var s = $('coupleSvg'); var H = '';
  H += '<defs>'+
   '<linearGradient id="skinW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1c39a"/><stop offset=".6" stop-color="#d89a6c"/><stop offset="1" stop-color="#b9764a"/></linearGradient>'+
   '<linearGradient id="skinM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2ad82"/><stop offset=".6" stop-color="#c48457"/><stop offset="1" stop-color="#9e603b"/></linearGradient>'+
   '<linearGradient id="lehenga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2123f"/><stop offset=".55" stop-color="#8f0b30"/><stop offset="1" stop-color="#4d0519"/></linearGradient>'+
   '<linearGradient id="blouse" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8b04e"/><stop offset=".5" stop-color="#b57a22"/><stop offset="1" stop-color="#7a4a10"/></linearGradient>'+
   '<linearGradient id="sherwani" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfa55c"/><stop offset=".35" stop-color="#f3e0b0"/><stop offset=".75" stop-color="#d9b97a"/><stop offset="1" stop-color="#a47c3a"/></linearGradient>'+
   '<linearGradient id="stole" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8e1d4f"/><stop offset="1" stop-color="#4a0b2b"/></linearGradient>'+
   '<linearGradient id="dupatta" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3cf" stop-opacity=".8"/><stop offset="1" stop-color="#c04a8a" stop-opacity=".55"/></linearGradient>'+
   '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#e5b45c"/><stop offset="1" stop-color="#a8741f"/></linearGradient>'+
   '<linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1a2e"/><stop offset="1" stop-color="#0d0714"/></linearGradient>'+
   '<linearGradient id="stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b3b86"/><stop offset="1" stop-color="#1c1450"/></linearGradient>'+
   '<radialGradient id="diyaGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".95"/><stop offset=".3" stop-color="#ffb04a" stop-opacity=".5"/><stop offset="1" stop-color="#ff7a20" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="rimMoon" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".35"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="fl2" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#ffe9a0"/><stop offset=".7" stop-color="#ffab2e"/><stop offset="1" stop-color="#ff6a10" stop-opacity="0"/></radialGradient>'+
   '<filter id="soft"><feGaussianBlur stdDeviation="6"/></filter><filter id="soft2"><feGaussianBlur stdDeviation="2.2"/></filter>'+
  '</defs>';

  /* terrace: left & right balustrades with arches, floor */
  var bal = function(x0,x1){ var o = ''; o += '<rect x="'+x0+'" y="598" width="'+(x1-x0)+'" height="22" fill="#2a1d66"/><rect x="'+x0+'" y="590" width="'+(x1-x0)+'" height="9" rx="3" fill="#4a3794"/>';
    for (var x=x0+8; x<x1-6; x+=26){ o += '<path d="M'+x+',598 q3,-6 4,-16 q-1,-8 -4,-10 q8,-2 16,0 q-3,2 -4,10 q1,10 4,16Z" fill="url(#stone)" opacity=".95"/>'; }
    o += '<rect x="'+x0+'" y="560" width="'+(x1-x0)+'" height="10" rx="3" fill="#5a45aa"/>'; return o; };
  H += '<g opacity=".92">'+bal(-260,150)+bal(450,860)+'</g>';
  H += '<rect x="-260" y="618" width="1120" height="140" fill="#140c3f"/>';
  H += '<path d="M-260,640 L860,640" stroke="#6b52c4" stroke-width="2" opacity=".45"/>';
  /* arches pillars at sides */
  [[ -90,0],[ 690,0]].forEach(function(p){ H += '<rect x="'+p[0]+'" y="60" width="34" height="530" fill="#1d1350"/><path d="M'+(p[0]-10)+',60 q27,-56 54,0Z" fill="#241862"/><rect x="'+(p[0]-8)+'" y="560" width="50" height="30" fill="#2a1d66"/>'; });
  /* marigold garlands on pillars */
  [[-73,60],[707,60]].forEach(function(p){ var x=p[0]; H += '<path d="M'+x+','+p[1]+' L'+x+',560" stroke="#ff9a2e" stroke-width="7" stroke-dasharray="4 3" stroke-linecap="round" opacity=".95"/><path d="M'+(x+8)+','+p[1]+' L'+(x+8)+',540" stroke="#ffcf5a" stroke-width="4" stroke-dasharray="3 3" stroke-linecap="round" opacity=".9"/>'; });
  /* hanging garland strand between pillars */
  H += '<path d="M-73,60 Q300,140 707,60" fill="none" stroke="#ff9a2e" stroke-width="6" stroke-dasharray="4 3" stroke-linecap="round" opacity=".9"/>';
  for (var i=1;i<=13;i++){ var t=i/14, bx=(1-t)*(1-t)*-73 + 2*(1-t)*t*300 + t*t*707, by=(1-t)*(1-t)*60 + 2*(1-t)*t*140 + t*t*60;
    H += '<circle cx="'+bx.toFixed(1)+'" cy="'+(by+5).toFixed(1)+'" r="9" fill="#ffd36e" opacity=".18"/><circle class="bulb" style="animation-delay:'+(-i*.23).toFixed(2)+'s" cx="'+bx.toFixed(1)+'" cy="'+(by+5).toFixed(1)+'" r="3.6" fill="'+(i%3?'#ffe9a8':'#ff9fc0')+'"/>'; }

  /* big warm glow from diya on the pair */
  H += '<circle cx="300" cy="352" r="230" fill="url(#diyaGlow)" opacity=".5" class="glowpulse"/>';

  H += '<g class="pair">';
  /* ---------- WOMAN (left, faces right) ---------- */
  H += '<g id="woman">';
  /* lehenga skirt */
  H += '<path d="M222,372 C190,450 150,540 120,640 L330,640 C310,540 290,450 276,372 Z" fill="url(#lehenga)"/>';
  H += '<path d="M222,372 C200,430 170,500 145,570" stroke="#000" stroke-opacity=".25" stroke-width="10" fill="none" filter="url(#soft2)"/>';
  for (var k=0;k<7;k++){ var yy = 470 + k*24; H += '<path d="M'+(200-k*12)+','+yy+' q40,10 '+(110+k*24)+',-2" stroke="#e5b45c" stroke-opacity="'+(k==5?.9:.38)+'" stroke-width="'+(k==5?5:1.4)+'" fill="none"/>'; }
  H += '<path d="M126,628 q100,14 202,0 L330,640 L120,640Z" fill="url(#gold)" opacity=".9"/>';
  /* gold motifs on skirt */
  for (var m=0;m<9;m++){ var mx=165+m*16+(m%2)*5, my=520+ (m%3)*34; H += '<path d="M'+mx+','+my+' l3,-6 l3,6 l-3,6Z" fill="#f3d58a" opacity=".6"/>'; }
  /* torso/blouse */
  H += '<path d="M214,286 C228,278 270,278 288,290 L296,376 C270,386 238,386 218,376 Z" fill="url(#blouse)"/>';
  H += '<path d="M222,300 q34,26 64,0" stroke="#fff2c4" stroke-width="2" fill="none" opacity=".7"/>';
  H += '<path d="M218,376 q40,12 78,0 l0,10 q-40,12 -78,0Z" fill="url(#gold)"/>';
  /* back arm (far) */
  /* neck */
  H += '<path d="M240,240 L244,284 C254,292 270,292 276,282 L272,236 Z" fill="url(#skinW)"/>';
  /* dupatta over shoulder */
  H += '<path d="M276,236 C300,262 318,320 304,420 C296,470 300,540 316,620 L338,620 C326,540 328,470 336,416 C342,330 312,252 276,236Z" fill="url(#dupatta)"/>';
  H += '<path d="M190,236 C170,300 176,390 164,470 C158,520 164,570 176,600 L196,600 C184,560 184,500 194,440 C204,370 206,300 214,256Z" fill="url(#dupatta)" opacity=".85"/>';
  /* head: profile facing right, center ~ (255,200) */
  H += '<g transform="translate(252,198)">';
  H += '<path d="M-26,-36 C-30,-6 -24,26 -4,44 L-6,60 L-34,40 C-48,10 -44,-34 -26,-36Z" fill="url(#hair)"/>';
  H += '<path d="M-22,-38 C-8,-52 20,-48 26,-28 L27,-14 Q27,-8 29,-4 Q39,4 33,9 Q28,10 28,13 Q31,16 28,19 Q31,22 28,25 Q29,31 24,35 Q14,43 -2,39 L-14,31 L-22,-10 Z" fill="url(#skinW)"/>';
  H += '<path d="M-26,-34 C-10,-56 18,-52 26,-30 C16,-40 -6,-42 -22,-26 Z" fill="url(#hair)"/>';
  H += '<path d="M10,-9 q5,-3 10,0" stroke="#2a1218" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M8,-18 q8,-6 17,-2" stroke="#2a1218" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  H += '<path d="M24,19 q4,1.5 4,5 q-4,1 -8,-.5Z" fill="#b8283f"/><path d="M20,19 q5,-2 9,0" stroke="#8e1a30" stroke-width="1" fill="none"/>';
  H += '<circle cx="25" cy="-22" r="2.2" fill="#d1103a"/><circle cx="30.5" cy="5" r="1.3" fill="#ffe29a"/>';
  H += '<path d="M0,10 q-2,6 0,10" stroke="#e5b45c" stroke-width="1.6" fill="none"/><path d="M-3,22 q3,-2 6,0 l-1.6,8 q-1.4,1 -2.8,0Z" fill="url(#gold)"/><circle cx="0" cy="33" r="1.4" fill="#ffd36e"/>';
  /* maang tikka & hair accessories */
  H += '<path d="M2,-47 L20,-33" stroke="#e5b45c" stroke-width="1.4"/><circle cx="14" cy="-37" r="2.6" fill="#ff5a7e"/>';
  H += '<circle cx="-36" cy="-4" r="22" fill="url(#hair)"/><g fill="#ffd36e" opacity=".95"><circle cx="-47" cy="-12" r="2"/><circle cx="-42" cy="4" r="2"/><circle cx="-30" cy="-14" r="2"/></g>';
  H += '<path d="M-4,-52 C20,-62 36,-44 34,-26 L30,-34 C24,-44 8,-50 -4,-52Z" fill="url(#dupatta)" opacity=".9"/>';
  H += '</g>';
  /* arm toward diya */
  H += '<path d="M222,296 C214,330 226,372 262,396 C282,408 298,404 304,392 L298,372 C282,376 270,364 266,340 C262,320 262,300 262,292Z" fill="url(#blouse)"/>';
  H += '<path d="M262,392 C278,404 296,404 306,386 C304,374 296,368 286,374 C282,382 272,382 262,376Z" fill="url(#skinW)"/>';
  H += '<g fill="url(#gold)"><rect x="262" y="386" width="22" height="4" rx="2" transform="rotate(14 262 386)"/></g>';
  H += '</g>';

  /* ---------- MAN (right, faces left) ---------- */
  H += '<g id="man">';
  H += '<path d="M312,246 C340,236 400,238 428,252 C440,300 446,350 444,400 C449,500 442,570 446,640 L318,640 C322,570 324,500 330,404 Z" fill="url(#sherwani)"/>';
  H += '<path d="M372,250 L376,640" stroke="#b58a3e" stroke-width="2.4" opacity=".7"/>';
  for (var b=0;b<6;b++) H += '<circle cx="372" cy="'+(282+b*40)+'" r="3.4" fill="url(#gold)"/>';
  H += '<path d="M326,640 L444,640 L446,624 L322,624Z" fill="url(#gold)" opacity=".8"/>';
  for (var e=0;e<5;e++) H += '<path d="M'+(340+e*20)+',590 q8,-14 16,0 q-8,10 -16,0Z" fill="#a47c3a" opacity=".35"/>';
  /* stole */
  H += '<path d="M334,248 C352,262 374,300 392,340 C410,380 428,440 428,520 L408,520 C410,450 392,390 372,350 C352,310 336,276 322,258Z" fill="url(#stole)"/>';
  H += '<path d="M410,520 l18,0 l0,4 l-18,0Z" fill="url(#gold)"/>';
  /* collar & neck */
  H += '<path d="M350,214 L352,248 C362,256 380,256 388,248 L386,208Z" fill="url(#skinM)"/>';
  H += '<path d="M344,244 C356,234 384,234 396,246 L394,256 C380,248 360,248 346,256Z" fill="url(#gold)"/>';
  /* head facing left, center (350,168) */
  H += '<g transform="translate(352,170) scale(-1,1)">';
  H += '<path d="M-24,-34 C-32,-4 -26,22 -8,40 L-12,52 L-34,32 C-46,6 -44,-28 -24,-34Z" fill="url(#hair)"/>';
  H += '<path d="M-22,-38 C-6,-54 22,-48 28,-28 L29,-14 Q29,-8 31,-4 Q42,4 35,10 Q30,11 30,14 Q33,17 30,20 Q33,23 30,26 Q31,34 25,38 Q14,48 -3,43 L-16,33 L-23,-10Z" fill="url(#skinM)"/>';
  H += '<path d="M-26,-34 C-8,-60 22,-54 28,-30 C18,-44 -6,-48 -22,-28Z" fill="url(#hair)"/>';
  H += '<path d="M12,-9 q5,-3 10,0" stroke="#1f120f" stroke-width="1.9" fill="none" stroke-linecap="round"/><path d="M9,-19 q9,-6 19,-1" stroke="#1f120f" stroke-width="2.3" fill="none" stroke-linecap="round"/>';
  H += '<path d="M28,20 q5,2 4,5 q-5,1.5 -9,-1Z" fill="#a8454f"/><path d="M6,40 C16,46 26,40 31,28 L28,22 C24,30 14,36 6,36Z" fill="#1f120f" opacity=".5"/>';
  H += '<path d="M24,17 q4,-2 8,0" stroke="#1f120f" stroke-width="1.6" fill="none"/>';
  H += '</g>';
  /* arm toward diya */
  H += '<path d="M318,262 C300,300 296,352 308,384 C318,404 330,410 344,402 L338,384 C330,380 326,366 326,350 C326,320 334,290 344,270Z" fill="url(#sherwani)"/>';
  H += '<path d="M296,386 C304,402 322,408 338,398 C340,386 332,376 318,376 C308,378 300,380 296,386Z" fill="url(#skinM)"/>';
  H += '</g>';
  H += '</g>';

  /* ---------- the diya they share ---------- */
  H += '<g id="shareDiya">';
  H += '<circle cx="300" cy="384" r="70" fill="url(#diyaGlow)" class="glowpulse"/>';
  H += '<path d="M270,394 Q300,382 330,394 Q324,418 300,420 Q276,418 270,394Z" fill="url(#gold)"/><path d="M270,394 Q300,386 330,394" stroke="#fff2c4" stroke-width="2" fill="none"/>';
  H += '<g class="flame"><path d="M300,330 C288,352 286,374 300,386 C314,374 312,352 300,330Z" fill="url(#fl2)"/><ellipse cx="300" cy="374" rx="4" ry="8" fill="#fff"/></g>';
  H += '<path d="M268,396 C276,406 288,402 296,396 C288,392 276,392 268,396Z" fill="url(#skinW)"/><path d="M332,396 C324,406 312,402 304,396 C312,392 324,392 332,396Z" fill="url(#skinM)"/>';
  H += '</g>';

  /* rim light overlay */

  /* floor diyas around */
  var pos = [[40,628,1],[110,640,1.1],[190,648,1.2],[420,648,1.2],[500,640,1.1],[570,628,1],[258,664,1.3],[352,664,1.3]];
  pos.forEach(function(p,i){ H += '<g transform="translate('+p[0]+' '+p[1]+') scale('+p[2]+')"><circle cx="0" cy="-6" r="36" fill="url(#diyaGlow)" class="glowpulse" style="animation-delay:'+(-i*.3).toFixed(1)+'s"/>'+
    '<path d="M-14,0 Q0,-6 14,0 Q11,10 0,11 Q-11,10 -14,0Z" fill="url(#gold)"/><g class="flame" style="animation-delay:'+(-i*.17).toFixed(2)+'s"><path d="M0,-20 C-6,-11 -6,-3 0,1 C6,-3 6,-11 0,-20Z" fill="url(#fl2)"/></g></g>'; });
  /* rangoli petals on floor */
  for (var rg_=0;rg_<18;rg_++){ var a_=rg_/18*6.283; H += '<ellipse cx="'+(300+Math.cos(a_)*74).toFixed(1)+'" cy="'+(690+Math.sin(a_)*16).toFixed(1)+'" rx="9" ry="3.4" fill="'+(rg_%2?'#ff8a3d':'#ffd36e')+'" opacity=".55" transform="rotate('+(a_*57.3).toFixed(0)+' '+(300+Math.cos(a_)*74).toFixed(1)+' '+(690+Math.sin(a_)*16).toFixed(1)+')"/>'; }
  s.innerHTML = H;
}

/* ---------- gift box (CSS 3D) ---------- */
function giftbox(){
  var body = $('gbBody'), lid = $('gbLid'); if (!body) return;
  function face(cls, style, inner){ return '<div class="face '+cls+'" style="'+style+'">'+(inner||'')+'</div>'; }
  var bw = 'var(--bw)', bh = 'var(--bh)', lh = 'var(--lh)', half = 'calc(var(--bw)/2)', halfh = 'calc(var(--bh)/2)';
  var rbV = '<i class="rb-v"></i>';
  body.innerHTML =
    face('red','width:'+bw+';height:'+bh+';transform:translateZ('+half+')',rbV) +
    face('red','width:'+bw+';height:'+bh+';transform:rotateY(180deg) translateZ('+half+')',rbV) +
    face('red','width:'+bw+';height:'+bh+';transform:rotateY(90deg) translateZ('+half+')',rbV) +
    face('red','width:'+bw+';height:'+bh+';transform:rotateY(-90deg) translateZ('+half+')',rbV) +
    face('red','width:'+bw+';height:'+bw+';top:calc(('+bh+' - '+bw+')/2);transform:rotateX(-90deg) translateZ('+halfh+')') +
    face('int','width:calc('+bw+' - 8px);height:calc('+bw+' - 8px);left:4px;top:calc(('+bh+' - '+bw+')/2 + 4px);transform:rotateX(90deg) translateZ(calc('+halfh+' - 3px))');
  var lw = 'calc(var(--bw)*1.1)', lhalf = 'calc(var(--bw)*.55)', lhh = 'calc(var(--lh)/2)';
  lid.style.width = lw; lid.style.left = 'calc(var(--bw)*-.05)'; lid.style.height = lh;
  lid.innerHTML =
    face('red','width:'+lw+';height:'+lh+';transform:translateZ('+lhalf+')',rbV) +
    face('red','width:'+lw+';height:'+lh+';transform:rotateY(180deg) translateZ('+lhalf+')',rbV) +
    face('red','width:'+lw+';height:'+lh+';transform:rotateY(90deg) translateZ('+lhalf+')',rbV) +
    face('red','width:'+lw+';height:'+lh+';transform:rotateY(-90deg) translateZ('+lhalf+')',rbV) +
    face('red','width:'+lw+';height:'+lw+';top:calc(('+lh+' - '+lw+')/2);transform:rotateX(90deg) translateZ('+lhh+')','<i class="rb-v"></i><i class="rb-h"></i>') +
    '<div class="bow" style="left:50%;top:0">'+
      '<div class="plane" style="transform:translateY(calc(var(--bw)*-.04))">'+bowSVG()+'</div>'+
      '<div class="plane p2" style="transform:rotateY(90deg) translateY(calc(var(--bw)*-.04))">'+bowSVG()+'</div></div>';
}
function bowSVG(){
  return '<svg viewBox="0 0 100 60"><defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#f0bf5a"/><stop offset="1" stop-color="#b57a22"/></linearGradient></defs>'+
  '<path d="M50,48 C26,58 2,46 4,24 C6,6 30,2 50,40Z" fill="url(#bg1)" stroke="#8c5a14" stroke-width="1"/><path d="M50,48 C74,58 98,46 96,24 C94,6 70,2 50,40Z" fill="url(#bg1)" stroke="#8c5a14" stroke-width="1"/>'+
  '<path d="M44,40 L30,58 L40,56 L46,46Z M56,40 L70,58 L60,56 L54,46Z" fill="#d9a23f"/>'+
  '<path d="M20,22 C26,14 36,18 44,34" stroke="#fff6d4" stroke-width="2" fill="none" opacity=".7"/><path d="M80,22 C74,14 64,18 56,34" stroke="#fff6d4" stroke-width="2" fill="none" opacity=".7"/>'+
  '<ellipse cx="50" cy="42" rx="8" ry="9" fill="url(#bg1)" stroke="#8c5a14" stroke-width="1"/></svg>';
}

/* ---------- icons + roses + heart ---------- */
var HEART = 'M50 88C20 64 3 46 3 27 3 14 13 5 25 5c10 0 20 6 25 16C55 11 65 5 75 5c12 0 22 9 22 22 0 19-17 37-47 61z';
function heartSVG(id){
  return '<svg viewBox="0 0 100 92"><defs><radialGradient id="'+id+'" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#ffd0e0"/><stop offset=".4" stop-color="#ff4d85"/><stop offset="1" stop-color="#a80f48"/></radialGradient></defs><path d="'+HEART+'" fill="url(#'+id+')"/><path d="M22 20c6-7 15-7 20 2" stroke="#fff" stroke-opacity=".75" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
}
function roseG(cx,cy,r,delay,idp){
  var o = '<g transform="translate('+cx+' '+cy+') scale('+r+')"><g class="rs" style="animation-delay:'+delay+'s;transform-origin:0 1px">'+
   '<circle r="1.1" fill="#000" opacity=".28" cx=".05" cy=".12"/><circle r="1" fill="url(#rg'+idp+')"/>';
  for (var i=0;i<7;i++){ var a=i/7*6.283+.3; o += '<circle cx="'+(Math.cos(a)*.62).toFixed(2)+'" cy="'+(Math.sin(a)*.62).toFixed(2)+'" r=".42" fill="url(#rg'+idp+')" stroke="#5a0016" stroke-opacity=".55" stroke-width=".035"/>'; }
  o += '<circle r=".6" fill="url(#rc'+idp+')" stroke="#4a0010" stroke-opacity=".6" stroke-width=".04"/>';
  for (var j=0;j<5;j++){ var b=j/5*6.283+1; o += '<path d="M'+(Math.cos(b)*.42).toFixed(2)+' '+(Math.sin(b)*.42).toFixed(2)+' q'+(Math.cos(b+1.2)*.3).toFixed(2)+' '+(Math.sin(b+1.2)*.3).toFixed(2)+' '+(Math.cos(b+2.2)*.38).toFixed(2)+' '+(Math.sin(b+2.2)*.38).toFixed(2)+'" fill="none" stroke="#ffb0c0" stroke-opacity=".5" stroke-width=".05" stroke-linecap="round"/>'; }
  o += '<circle r=".28" fill="#7a0420" stroke="#3a000c" stroke-opacity=".6" stroke-width=".04"/><path d="M-.12 .02C-.1-.14 .12-.14 .12 .02 .1 .12-.06 .12-.06 .03" fill="none" stroke="#2a0008" stroke-opacity=".7" stroke-width=".05" stroke-linecap="round"/>';
  o += '<path d="M-.7-.45C-.5-.8 -.1-.92 .25-.88" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".07" stroke-linecap="round"/></g></g>';
  return o;
}
function bouquet(){
  var h = '<svg viewBox="0 0 300 300"><defs><radialGradient id="rgA" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#ff6b88"/><stop offset=".55" stop-color="#d1123a"/><stop offset="1" stop-color="#6e0220"/></radialGradient>'+
   '<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f9c5a"/><stop offset="1" stop-color="#0d4a2a"/></linearGradient>'+
   '<linearGradient id="bgq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#f0bf5a"/><stop offset="1" stop-color="#b57a22"/></linearGradient><radialGradient id="roseGlow"><stop offset="0" stop-color="#ff7a9a" stop-opacity=".7"/><stop offset="1" stop-color="#ff7a9a" stop-opacity="0"/></radialGradient></defs>'+
   '<circle class="glow" cx="150" cy="130" r="140" fill="url(#roseGlow)"/>';
  /* stems */
  [[150,175],[112,150],[188,150],[85,128],[215,128],[130,110],[170,110]].forEach(function(p){ h += '<path d="M'+p[0]+','+p[1]+' Q'+(150+(p[0]-150)*.4)+',230 150,262" stroke="#1d7a44" stroke-width="5" fill="none" stroke-linecap="round"/>'; });
  /* leaves */
  [[-1,230,70],[1,228,70],[-1,205,52],[1,203,52]].forEach(function(l){ var sg=l[0], y=l[1], L=l[2]; h += '<path d="M150,'+y+' q'+(sg*L*.55)+',-14 '+(sg*L)+',-'+(L*.62)+' q'+(-sg*L*.14)+','+(L*.5)+' '+(-sg*L)+','+(L*.62)+'Z" fill="url(#leaf)" opacity=".92"/>'; });
  h += '<path d="M118,236 L182,236 L168,276 L132,276Z" fill="url(#bgq)"/><path d="M118,236 L182,236" stroke="#fff2c4" stroke-width="3"/>';
  h += '<path d="M130,252 q20,10 40,0" stroke="#8c5a14" stroke-width="1.5" fill="none"/>';
  var rs = [[150,170,34,.9],[110,146,30,.5],[190,146,30,.6],[84,122,26,.3],[216,122,26,.4],[132,106,28,.2],[170,104,28,.7]];
  rs.forEach(function(r){ h += roseG(r[0],r[1],r[2],r[3],'A'); });
  h += '</svg>';
  return h;
}
function iconLetter(){ return '<svg viewBox="0 0 80 80"><defs><linearGradient id="il" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9b8"/><stop offset="1" stop-color="#e0a24a"/></linearGradient></defs><rect x="8" y="20" width="64" height="44" rx="6" fill="url(#il)"/><path d="M8,24 L40,46 L72,24" fill="none" stroke="#b97a22" stroke-width="3" stroke-linejoin="round"/><path d="M40,56 c-6-4-9-7-9-11 0-3 2-5 5-5 2 0 3 1 4 2 1-1 2-2 4-2 3 0 5 2 5 5 0 4-3 7-9 11z" transform="translate(0 -12) scale(1)" fill="#ff4d85"/></svg>'; }
function iconRose(){ return '<svg viewBox="0 0 80 80"><defs><radialGradient id="ir" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#ff6b88"/><stop offset=".6" stop-color="#d1123a"/><stop offset="1" stop-color="#6e0220"/></radialGradient></defs><path d="M40,52 L40,76" stroke="#1d7a44" stroke-width="4" stroke-linecap="round"/><path d="M40,64 q14,-10 20,-2 q-10,8 -20,2z" fill="#2f9c5a"/><circle cx="40" cy="34" r="22" fill="url(#ir)"/><path d="M28,36C28,22 52,22 52,34 50,46 34,46 32,36 33,28 46,28 46,35" fill="none" stroke="#4a0010" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/></svg>'; }
function iconHeart(){ return heartSVG('ihg'); }

/* ---------- envelope (detail) ---------- */
function envelopeHTML(){
  return '<div class="env" id="envEl"><div class="e-back"></div><div class="e-letter"></div><div class="e-front"></div><div class="e-flap"></div>'+
   '<svg class="seal" viewBox="0 0 100 92"><defs><radialGradient id="sealg" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#ff9aba"/><stop offset=".5" stop-color="#d1124a"/><stop offset="1" stop-color="#7a0526"/></radialGradient></defs><path d="'+HEART+'" fill="url(#sealg)"/></svg></div>';
}
function promiseHTML(){
  return '<div class="pheart"><i class="pr"></i><i class="pr"></i><i class="pr"></i>'+heartSVG('phg')+'<div class="orb"><i>✦</i></div><div class="orb" style="animation-duration:13s;animation-direction:reverse"><i style="color:#ff9fc0;text-shadow:0 0 12px #ff6a9a">❤</i></div></div>';
}

window.ART = { stars:stars, shooting:shooting, dust:dust, city:city, lights:lights, diyas:diyas, couple:couple, giftbox:giftbox, bouquet:bouquet, envelope:envelopeHTML, promise:promiseHTML,
  icons:{letter:iconLetter, rose:iconRose, heart:iconHeart}, HEART:HEART };
})();
