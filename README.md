# Magical Diwali Surprise 🪔

A romantic, fully interactive Diwali surprise website: plain HTML, CSS and JavaScript, no frameworks, no external images or audio files.

**Live:** https://diwali-surprise-love-hackncode.sites.tab.bot/

## Journey
Magical night → enter your name → fireworks playground → romantic couple scene → open the 3D gift → Love Letter / Forever Roses / A Promise → Happy Diwali message → grand fireworks finale.

## What's inside
- `index.html` – structure of all scenes
- `styles.css` – midnight-blue / royal-purple / champagne-gold look, glassmorphism, CSS 3D gift box
- `fx.js` – canvas fireworks engine (Sparkler, Rocket, Fountain, Chakri, Flower Pot, Aerial, Colorful Crackers), particle caps on mobile, pauses when the tab is hidden
- `art.js` – canvas stars, SVG Indian skyline, fairy lights, diyas, couple illustration, roses, gift box
- `audio.js` – WebAudio-synthesised romantic music and sound effects (starts only after a tap; play/pause + mute buttons)
- `app.js` – scene controller, personalisation with the visitor's typed name
- `test/site.test.js` – `node --test test/`

## Run locally
```
python3 -m http.server 8000
```
then open http://localhost:8000 (best on a phone-sized viewport).
