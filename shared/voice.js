/* =========================================
   voice.js — الصوت (mp3 + TTS احتياطي)
   ========================================= */
const Voice = (function () {
  let audioCache = {};

  // 1. نجرب نشغلو ملف mp3 الأول
  function playMp3(name) {
    return new Promise((resolve) => {
      if (!audioCache[name]) {
        const a = new Audio('sounds/' + name + '.mp3');
        audioCache[name] = a;
      }
      const a = audioCache[name];
      a.currentTime = 0;
      a.onended = () => resolve(true);
      a.onerror = () => resolve(false);
      a.play().catch(() => resolve(false));
    });
  }

  // 2. إذا mp3 ما كانش، نستعملو صوت المتصفح (TTS)
  function tts(text) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(false); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      u.rate = 0.7; // صوت بطيء وواضح للصغار
      u.pitch = 1.2;
      u.volume = 1;
      const v = window.speechSynthesis.getVoices().find(x => x.lang.startsWith('ar'));
      if (v) u.voice = v;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      window.speechSynthesis.speak(u);
    });
  }

  // 3. الدالة الرئيسية لي نستعملوها فـ اللعبة
  async function say(text, mp3Name) {
    if (mp3Name) {
      const ok = await playMp3(mp3Name);
      if (ok) return true;
    }
    return await tts(text);
  }

  function stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  return { say, stop, playMp3, tts };
})();
