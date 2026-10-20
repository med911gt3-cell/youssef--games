/* =========================================
   game-engine.js — محرك اللعبة المشترك
   ========================================= */
const Game = (function () {
  let config = {};
  let currentTarget = null;
  let stars = 0;
  let locked = false;
  let questionsThisRound = 0;
  const MAX_QUESTIONS = 5; // 5 أسئلة فـ الجولة

  // ألوان الأرقام باش كل رقم يبان بلونو
  const COLORS = [
    '#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6',
    '#1abc9c','#e91e63','#34495e','#ff6b6b','#00b894'
  ];

  function colorOf(n) { return COLORS[(n - 1) % COLORS.length]; }

  function init(options) {
    // إعدادات افتراضية تتبدل حسب القسم (أرقام، ألوان، أشكال)
    config = Object.assign({
      title: '',
      items: [],
      speakItem: (i) => String(i),
      targetSpeak: (i) => `وين راه ${i}؟`,
      correctMsg: 'أحسنت! 🌟',
      wrongMsg: 'عاود حاول 💪',
      choicesCount: 3, // 3 خيارات فقط كيما اتفقنا
      colorMode: 'number',
      speechKey: 'num'
    }, options);

    document.getElementById('gameTitle').innerText = config.title;
    buildLearnGrid();
    switchMode('learn');
  }

  // بناء شبكة وضع التعليم
  function buildLearnGrid() {
    const grid = document.getElementById('learnGrid');
    grid.innerHTML = '';
    config.items.forEach(item => {
      const box = document.createElement('div');
      box.className = 'box';
      box.innerText = item;
      
      if (config.colorMode === 'number') {
        box.style.background = colorOf(parseInt(item));
      } else {
        box.style.background = '#0984e3'; // لون موحد للألوان والأشكال
      }
      
      box.onclick = () => {
        document.getElementById('info').innerText = `${item} 🎈`;
        Voice.say(config.speakItem(item), config.speechKey + item);
      };
      grid.appendChild(box);
    });
  }

  // التنقل بين وضع التعليم ووضع الاختبار
  function switchMode(mode) {
    document.getElementById('pLearn').classList.remove('on');
    document.getElementById('pQuiz').classList.remove('on');
    document.getElementById('mLearn').classList.remove('on');
    document.getElementById('mQuiz').classList.remove('on');

    if (mode === 'learn') {
      document.getElementById('pLearn').classList.add('on');
      document.getElementById('mLearn').classList.add('on');
    } else {
      document.getElementById('pQuiz').classList.add('on');
      document.getElementById('mQuiz').classList.add('on');
      resetRound();
    }
  }

  // تصفير الجولة
  function resetRound() {
    stars = 0;
    questionsThisRound = 0;
    updateStars();
    newRound();
  }

  // تحديث النجوم (⭐ ولا ☆)
  function updateStars() {
    const el = document.getElementById('stars');
    if (el) {
      el.innerText = '⭐'.repeat(stars) + '☆'.repeat(MAX_QUESTIONS - stars);
    }
  }

  // بداية سؤال جديد
  function newRound() {
    locked = false;

    if (questionsThisRound >= MAX_QUESTIONS) {
      showFinalScreen();
      return;
    }

    document.getElementById('result').innerText = '';
    document.getElementById('question').innerText = 'وين راه المطلوب؟';

    // اختيار الهدف بشكل عشوائي
    currentTarget = config.items[Math.floor(Math.random() * config.items.length)];

    // خلط 3 خيارات
    let choices = [currentTarget];
    let safety = 0;
    while (choices.length < config.choicesCount && safety < 100) {
      const r = config.items[Math.floor(Math.random() * config.items.length)];
      if (!choices.includes(r)) choices.push(r);
      safety++;
    }
    choices.sort(() => Math.random() - 0.5);

    // عرض الخيارات
    const grid = document.getElementById('quizGrid');
    grid.innerHTML = '';
    choices.forEach(item => {
      const box = document.createElement('div');
      box.className = 'box';
      box.innerText = item;
      
      if (config.colorMode === 'number') {
        box.style.background = colorOf(parseInt(item));
      } else {
        box.style.background = '#0984e3';
      }
      
      box.onclick = () => checkAnswer(item);
      grid.appendChild(box);
    });
  }

  // نطق السؤال
  async function hear() {
    if (!currentTarget) newRound();
    await Voice.say(`وين راه ${currentTarget}؟`, 'question');
  }

  // كشف الإجابة
  async function checkAnswer(selected) {
    if (locked) return;
    locked = true;

    const resultEl = document.getElementById('result');

    if (selected === currentTarget) {
      // إجابة صحيحة
      stars++;
      questionsThisRound++;
      updateStars();
      resultEl.style.color = '#00b894';
      resultEl.innerText = config.correctMsg;
      await Voice.say('أحسنت!', 'ahsant');
      setTimeout(newRound, 1200);
    } else {
      // إجابة خاطئة
      resultEl.style.color = '#d63031';
      resultEl.innerText = config.wrongMsg;
      await Voice.say('عاود حاول!', 'khata');
      locked = false;
    }
  }

  // شاشة النتيجة النهائية
  function showFinalScreen() {
    const container = document.getElementById('pQuiz');
    const emoji = stars >= 4 ? '🎉' : stars >= 2 ? '😊' : '💪';
    const msg = stars >= 4 ? 'برافو! أنت بطل!' :
                stars >= 2 ? 'عمل جيد!' : 'عاود المحاولة!';
                
    container.innerHTML = `
      <div class="final-screen">
        <div class="big-emoji">${emoji}</div>
        <h2>${msg}</h2>
        <p>جمعت ${stars} من ${MAX_QUESTIONS} نجوم</p>
        <div class="stars" style="font-size:2.5rem">${'⭐'.repeat(stars)}${'☆'.repeat(MAX_QUESTIONS - stars)}</div>
        <button class="back-btn" onclick="location.reload()">🔄 عاود</button>
        <button class="back-btn" onclick="location.href='index.html'">🏠 الرئيسية</button>
      </div>
    `;
    Voice.say(msg, stars >= 4 ? 'bravo' : 'ahsant');
  }

  return { init, switchMode, hear, colorOf };
})();
