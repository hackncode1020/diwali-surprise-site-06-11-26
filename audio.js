/* WebAudio only: no files. Music = soft pads + arpeggio + pentatonic melody. SFX = synthesized. Nothing starts before a user tap. */
(function(){
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master, musicBus, sfxBus, reverb, noiseBuf;
  var muted = false, musicOn = false, timer = null, nextT = 0, step = 0, bar = 0;
  var API = { ready:false };

  function mkImpulse(c, secs, decay){
    var len = Math.floor(c.sampleRate * secs), b = c.createBuffer(2, len, c.sampleRate);
    for (var ch = 0; ch < 2; ch++){ var d = b.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, decay); }
    return b;
  }
  function init(){
    if (!AC) return false;
    if (ctx){ if (ctx.state === 'suspended' && !document.hidden) ctx.resume(); return true; }
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
      master.connect(comp); comp.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0;
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8;
      reverb = ctx.createConvolver(); reverb.buffer = mkImpulse(ctx, 3.2, 2.4);
      var rg = ctx.createGain(); rg.gain.value = 0.55; reverb.connect(rg); rg.connect(master);
      var dry = ctx.createGain(); dry.gain.value = 0.8;
      musicBus.connect(dry); dry.connect(master); musicBus.connect(reverb);
      sfxBus.connect(master);
      var sr = ctx.createGain(); sr.gain.value = 0.35; sfxBus.connect(sr); sr.connect(reverb);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
      var nd = noiseBuf.getChannelData(0); for (var i=0;i<nd.length;i++) nd[i] = Math.random()*2-1;
      API.ready = true;
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    } catch(e){ ctx = null; return false; }
  }
  function mtof(m){ return 440 * Math.pow(2, (m-69)/12); }

  /* ---- instruments ---- */
  function pad(t, midi, dur, vol){
    [-6, 6].forEach(function(det){
      var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = mtof(midi); o.detune.value = det;
      f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = .3;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur*.35);
      g.gain.linearRampToValueAtTime(vol*.7, t + dur*.7); g.gain.linearRampToValueAtTime(0, t + dur + .6);
      o.connect(f); f.connect(g); g.connect(musicBus); o.start(t); o.stop(t + dur + .7);
    });
  }
  function pluck(t, midi, vol, dur){
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = mtof(midi); o2.frequency.value = mtof(midi)*2;
    var g2 = ctx.createGain(); g2.gain.value = .22;
    f.type = 'lowpass'; f.frequency.setValueAtTime(3800, t); f.frequency.exponentialRampToValueAtTime(900, t + .6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + (dur||1.6));
    o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(musicBus);
    o.start(t); o2.start(t); o.stop(t + (dur||1.6) + .1); o2.stop(t + (dur||1.6) + .1);
  }
  function bell(t, midi, vol, bus){
    [[1,1],[2.76,.35],[5.4,.12]].forEach(function(p){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = mtof(midi)*p[0];
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol*p[1], t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + 2.2/p[0]**.4);
      o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + 2.4);
    });
  }
  function noise(t, dur, type, f0, f1, vol, bus, q){
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    var f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q || 1;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20,f1), t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(.03, dur/3)); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(t, Math.random()); s.stop(t + dur + .05);
  }

  /* ---- music: Am - F - C - G, pentatonic melody (raag-flavoured) ---- */
  var CH = [[45,52,57,60,64],[41,48,53,57,60],[48,55,60,64,67],[43,50,55,59,62]];
  var ARP = [[0,2,3,4,3,2,4,3],[0,2,3,4,3,2,4,3],[0,2,3,4,3,2,4,3],[0,2,3,4,3,2,4,3]];
  var PENT = [60,62,64,67,69,72,74,76,79]; // C D E G A
  var mel = 4, BPM = 66, S = 60/BPM/2; // eighth
  var MELODIES = [
    [5,null,6,5,null,4,3,null, 2,null,3,4,null,null,null,null],
    [4,null,5,6,null,5,4,null, 3,null,2,3,null,null,null,null],
    [3,4,null,5,6,null,7,6, 5,null,null,4,null,3,null,null],
    [6,null,5,4,null,3,null,4, 5,null,null,null,null,null,null,null]
  ];
  function schedule(){
    if (!ctx || !musicOn) return;
    while (nextT < ctx.currentTime + 0.35){
      var b = bar % 4, s = step % 8;
      if (s === 0){
        var ch = CH[b];
        pad(nextT, ch[0], S*8, .07);
        [1,2,3].forEach(function(i){ pad(nextT, ch[i], S*8, .035); });
        pluck(nextT, ch[0] - 0, .16, 2.6);
      }
      var a = ARP[b][s]; pluck(nextT, CH[b][a] + (a>=3?12:0), .06 + (s%2?0:.02), 1.3);
      // melody every other bar pair (two 8-step phrases per 16 slots)
      var m = MELODIES[Math.floor(bar/2) % 4], mi = (bar%2)*8 + s, note = m[mi];
      if (note != null && bar >= 2){ bell(nextT + .01, PENT[note] - 0, .07, musicBus); }
      nextT += S; step++; if (step % 8 === 0) bar++;
    }
  }
  function startMusic(){
    if (!init()) return false;
    if (musicOn) return true;
    musicOn = true; nextT = ctx.currentTime + .1; step = 0; bar = 0;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(.8, ctx.currentTime + 2.5);
    timer = setInterval(schedule, 90); schedule();
    return true;
  }
  function stopMusic(){
    if (!ctx) { musicOn = false; return; }
    musicOn = false; clearInterval(timer);
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + .8);
  }

  /* ---- sfx ---- */
  var last = {};
  function can(key, gap){ var n = performance.now(); if (last[key] && n - last[key] < gap) return false; last[key] = n; return true; }
  var SFX = {
    click: function(){ var t = ctx.currentTime; bell(t, 88, .05); },
    launch: function(){ if(!can('launch',70)) return; var t = ctx.currentTime;
      noise(t, .75, 'bandpass', 500, 2600, .16, sfxBus, 2);
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type='sine';
      o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(1500, t+.7);
      g.gain.setValueAtTime(.025, t); g.gain.exponentialRampToValueAtTime(.0005, t+.75); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t+.8); },
    burst: function(big){ if(!can('burst',50)) return; var t = ctx.currentTime, v = big ? .5 : .32;
      noise(t, .5, 'lowpass', 900, 70, v, sfxBus, .7);
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type='sine';
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(38, t+.4);
      g.gain.setValueAtTime(v*.9, t); g.gain.exponentialRampToValueAtTime(.001, t+.45); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t+.5);
      for (var i=0;i<(big?7:4);i++) noise(t+.15+Math.random()*.9, .06, 'highpass', 5000+Math.random()*3000, 3000, .08, sfxBus, .5); },
    crackle: function(){ if(!can('crackle',40)) return; var t = ctx.currentTime;
      for (var i=0;i<7;i++) noise(t+i*.035+Math.random()*.03, .035, 'highpass', 3000+Math.random()*5000, 2500, .13, sfxBus, .5); },
    hiss: function(){ if(!can('hiss',90)) return; var t = ctx.currentTime; noise(t, .5, 'highpass', 4000, 6500, .06, sfxBus, .4); },
    whirr: function(){ if(!can('whirr',160)) return; var t = ctx.currentTime; noise(t, .5, 'bandpass', 900, 1600, .07, sfxBus, 3); },
    pop: function(){ if(!can('pop',60)) return; var t = ctx.currentTime; noise(t, .13, 'bandpass', 1800, 400, .24, sfxBus, 1.2); },
    whoosh: function(){ var t = ctx.currentTime; noise(t, 1.4, 'bandpass', 300, 3200, .2, sfxBus, 1.5); },
    sparkle: function(){ var t = ctx.currentTime; [84,88,91,96,100].forEach(function(m,i){ bell(t+i*.07, m, .05); }); },
    chime: function(){ var t = ctx.currentTime; [72,76,79,84,88].forEach(function(m,i){ bell(t+i*.12, m, .09); }); },
    open: function(){ var t = ctx.currentTime;
      noise(t, 1.6, 'bandpass', 400, 5200, .14, sfxBus, 1.2);
      [67,72,76,79,84,88,91,96].forEach(function(m,i){ bell(t+.1+i*.1, m, .09); });
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(220,t+1);
      g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.12,t+.5); g.gain.exponentialRampToValueAtTime(.0005,t+1.6); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t+1.7); },
    unlock: function(){ var t = ctx.currentTime; [60,64,67,72,76,79,84].forEach(function(m,i){ bell(t+i*.09, m, .08); }); },
    flip: function(){ var t = ctx.currentTime; noise(t, .35, 'bandpass', 1200, 3000, .08, sfxBus, 1); },
    heart: function(){ var t = ctx.currentTime;
      [0,.28].forEach(function(d){ var o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(90,t+d); o.frequency.exponentialRampToValueAtTime(45,t+d+.18);
        g.gain.setValueAtTime(.3,t+d); g.gain.exponentialRampToValueAtTime(.001,t+d+.25); o.connect(g); g.connect(sfxBus); o.start(t+d); o.stop(t+d+.3); });
      bell(t+.5, 84, .05); },
    finale: function(){ var t = ctx.currentTime; [60,64,67,72,76,79,84,88,91,96].forEach(function(m,i){ bell(t+i*.11, m, .09); }); }
  };

  API.unlock = init;
  API.sfx = function(name, a){ if (!ctx || muted || !SFX[name]) return; try { SFX[name](a); } catch(e){} };
  API.isMusic = function(){ return musicOn; };
  API.isMuted = function(){ return muted; };
  API.toggleMusic = function(){ if (musicOn) stopMusic(); else startMusic(); return musicOn; };
  API.startMusic = startMusic; API.stopMusic = stopMusic;
  API.setMuted = function(m){ muted = !!m; if (ctx){ master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(muted ? 0 : .9, ctx.currentTime, .05); } return muted; };
  API.toggleMute = function(){ return API.setMuted(!muted); };
  document.addEventListener('visibilitychange', function(){
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (ctx.state === 'suspended') ctx.resume();
  });
  window.DAudio = API;
})();
