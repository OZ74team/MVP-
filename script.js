/* =========================================================
   MVP 둥지 script.js (2.0, 11/4 병합)
   블록 네 개로 나뉩니다. 담당자는 자기 블록만 고쳐 주세요.
   0) 섹션 1 첫 화면 | 담당: 백종현 (맨 아래)
      알이 깨어나는 무대: 피드백 도착 → 모이 → 금 → 아기새 → 어른새, 마우스 기울기
   1) 섹션 3 체험용 예시 | 담당: 노화성
      피드백을 남기면 모이가 쌓이고 등급이 오른다. 저장하지 않아서 새로고침하면 처음(알, 모이 0)으로.
   2) 섹션 2 문제·해결 | 담당: 김승주
      고민-해결 연결하기, 아침→하늘 배경, 카드 기울이기
   3) 섹션 4 MVP 등록 | 담당: 노화성
      등록한 MVP를 이 브라우저의 localStorage에 저장한다 (다른 방문자에게는 안 보임)
   - HTML에서 JS가 쓰는 요소는 id로 찾습니다(섹션 2는 data- 속성). CSS는 class를 씁니다.
     그래서 디자인 담당이 class 이름을 바꿔도 JS는 깨지지 않습니다.
   ========================================================= */


/* ===== 섹션 3. 사용 방법·예시 | 담당: 노화성 ===== */

// 1. 화면에서 쓸 요소를 id로 찾아 둔다
const feedbackInput = document.querySelector('#feedbackInput');
const feedbackButton = document.querySelector('#feedbackButton');
const feedbackMessage = document.querySelector('#feedbackMessage');
const feedbackList = document.querySelector('#feedbackList');
const resetButton = document.querySelector('#resetButton');

const gradeIcon = document.querySelector('#gradeIcon');
const gradeName = document.querySelector('#gradeName');
const pointValue = document.querySelector('#pointValue');
const progressBar = document.querySelector('#progressBar');
const nextGrade = document.querySelector('#nextGrade');


// 2. 등급표: 모이가 min 이상이면 그 등급 (낮은 등급부터 순서대로)
const grades = [
  { name: '알', icon: '🥚', min: 0 },
  { name: '아기새', icon: '🐣', min: 30 },
  { name: '어른새', icon: '🐦', min: 60 },
];

const POINT_PER_FEEDBACK = 10; // 피드백 한 번에 받는 모이


// 3. 지금 상태: 모은 모이
let points = 0;


// 4. 모이에 맞는 등급의 번호(grades 배열의 위치)를 찾는다
//    높은 등급부터 확인해서, 처음 조건에 맞는 등급을 돌려준다
function getGradeIndex(currentPoints) {
  for (let i = grades.length - 1; i >= 0; i--) {
    if (currentPoints >= grades[i].min) {
      return i;
    }
  }
  return 0;
}


// 5. 지금 모이에 맞게 등급·모이·막대·안내 문구를 다시 그린다
function render() {
  const gradeIndex = getGradeIndex(points);
  const grade = grades[gradeIndex];
  const next = grades[gradeIndex + 1]; // 다음 등급 (가장 높은 등급이면 undefined)

  gradeIcon.textContent = grade.icon;
  gradeName.textContent = grade.name;
  pointValue.textContent = points;

  if (next) {
    // 이번 등급 안에서 다음 등급까지 얼마나 왔는지 (0~100)
    const percent = ((points - grade.min) / (next.min - grade.min)) * 100;
    progressBar.style.width = percent + '%';
    nextGrade.textContent = `${next.name}까지 모이 ${next.min - points} 남았어요`;
  } else {
    progressBar.style.width = '100%';
    nextGrade.textContent = '가장 높은 등급이에요! 이제 다른 둥지를 도와줄 차례예요.';
  }
}


// 6. [피드백 남기기] 버튼을 눌렀을 때
feedbackButton.addEventListener('click', function () {
  const text = feedbackInput.value.trim(); // 앞뒤 빈칸을 뺀 글

  // 빈칸이면 안내만 하고 끝낸다
  if (text === '') {
    feedbackMessage.textContent = '피드백 칸이 비어 있어요. 한 줄이라도 적어 주세요.';
    feedbackInput.focus();
    return;
  }

  const beforeIndex = getGradeIndex(points);
  points = points + POINT_PER_FEEDBACK;
  const afterIndex = getGradeIndex(points);

  // 남긴 피드백을 목록 맨 위에 붙인다
  // (textContent를 쓰면 입력한 글이 HTML로 해석되지 않아 안전하다)
  const item = document.createElement('li');
  item.textContent = text;
  feedbackList.prepend(item);

  // 등급이 올랐는지에 따라 다른 안내
  if (afterIndex > beforeIndex) {
    feedbackMessage.textContent = `${grades[afterIndex].name}로 자랐어요! 모이 +${POINT_PER_FEEDBACK}`;
  } else {
    feedbackMessage.textContent = `피드백을 남겼어요. 모이 +${POINT_PER_FEEDBACK}`;
  }

  feedbackInput.value = ''; // 입력 칸 비우기
  render();
});


// 7. [처음부터 다시] 버튼을 눌렀을 때
resetButton.addEventListener('click', function () {
  points = 0;
  feedbackList.innerHTML = '';
  feedbackMessage.textContent = '';
  feedbackInput.value = '';
  render();
});


// 8. 페이지를 처음 열었을 때 한 번 그린다
render();


/* =========================================================
   ===== 섹션 2. 문제·해결 (주요 기능) | 담당: 김승주 =====
   - 이름은 problem으로 시작, 요소는 data- 속성으로 찾음
   ========================================================= */


// 2-1. 요소 찾기
const problemSection = document.querySelector('#problem');
const problemLinkButtons = problemSection.querySelectorAll('[data-problem-link]');
const problemTiltCards = problemSection.querySelectorAll('[data-problem-tilt]');


// 2-2. 고민 말풍선 → 해결 카드 연결
const PROBLEM_LINK_TIME = 1800; // 빛나는 시간(ms)

problemLinkButtons.forEach(function (button) {
  const pair = button.closest('[data-problem-pair]');
  const card = pair.querySelector('[data-problem-card]');
  let timer = null;

  button.addEventListener('click', function () {
    pair.classList.remove('is-linked');
    void pair.offsetWidth;
    pair.classList.add('is-linked');

    clearTimeout(timer);
    timer = setTimeout(function () {
      pair.classList.remove('is-linked');
    }, PROBLEM_LINK_TIME);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });
});


// 2-3. 스크롤할수록 아침 → 낮 → 하늘 (진행도 0~1을 CSS로 넘김)
let problemSkyTicking = false;

function updateProblemSky() {
  const rect = problemSection.getBoundingClientRect();
  const distance = Math.max(rect.height - window.innerHeight, 1);
  let progress = -rect.top / distance;
  progress = Math.min(Math.max(progress, 0), 1);

  problemSection.style.setProperty('--problem-progress', progress.toFixed(3));
  problemSkyTicking = false;
}

function requestProblemSky() {
  if (!problemSkyTicking) {
    problemSkyTicking = true;
    requestAnimationFrame(updateProblemSky);
  }
}

window.addEventListener('scroll', requestProblemSky, { passive: true });
window.addEventListener('resize', requestProblemSky);
updateProblemSky();


// 2-4. 덤 카드 기울이기 (마우스가 있는 기기에서만)
const PROBLEM_MAX_TILT = 6; // 최대 기울기(도)

const problemCanTilt =
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (problemCanTilt) {
  problemTiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (event) {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      card.style.setProperty('--problem-tilt-x', ((0.5 - y) * PROBLEM_MAX_TILT * 2) + 'deg');
      card.style.setProperty('--problem-tilt-y', ((x - 0.5) * PROBLEM_MAX_TILT * 2) + 'deg');
      card.style.setProperty('--problem-glare-x', (x * 100) + '%');
      card.style.setProperty('--problem-glare-y', (y * 100) + '%');
      card.classList.add('is-tilting');
    });

    card.addEventListener('mouseleave', function () {
      card.classList.remove('is-tilting');
      card.style.removeProperty('--problem-tilt-x');
      card.style.removeProperty('--problem-tilt-y');
    });
  });
}


// 2-5. 깃털 반응 체험: [도움돼요] 누르면 숫자 +1, 깃털이 떨어짐 (다시 누르면 취소)
const problemHelpArea = problemSection.querySelector('[data-problem-help-area]');
const problemHelpButton = problemSection.querySelector('[data-problem-help]');
const problemHelpCount = problemSection.querySelector('[data-problem-help-count]');
const problemFeatherTemplate = document.querySelector('#problemFeather');
const PROBLEM_FEATHER_COUNT = 6; // 한 번에 떨어지는 깃털 수

function dropProblemFeathers() {
  const startX = problemHelpButton.offsetLeft + problemHelpButton.offsetWidth / 2;
  const startY = problemHelpButton.offsetTop;

  for (let i = 0; i < PROBLEM_FEATHER_COUNT; i++) {
    const feather = problemFeatherTemplate.content.firstElementChild.cloneNode(true);
    const random = function (min, max) { return min + Math.random() * (max - min); };

    feather.style.left = startX + 'px';
    feather.style.top = startY + 'px';
    feather.style.setProperty('--problem-dx', random(-70, 70) + 'px');
    feather.style.setProperty('--problem-fall', random(60, 120) + 'px');
    feather.style.setProperty('--problem-rot', random(-200, 200) + 'deg');
    feather.style.animationDelay = (i * 70) + 'ms';

    feather.addEventListener('animationend', function () {
      feather.remove();
    });
    problemHelpArea.appendChild(feather);
  }
}

problemHelpButton.addEventListener('click', function () {
  const isPressed = problemHelpButton.getAttribute('aria-pressed') === 'true';
  const count = Number(problemHelpCount.textContent);

  problemHelpButton.setAttribute('aria-pressed', String(!isPressed));
  problemHelpCount.textContent = isPressed ? count - 1 : count + 1;

  problemHelpCount.classList.remove('is-bump');
  void problemHelpCount.offsetWidth;
  problemHelpCount.classList.add('is-bump');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isPressed && !reduceMotion) {
    dropProblemFeathers();
  }
});

/* ===== 섹션 4. MVP 등록 | 담당: 노화성 =====
   현재 브라우저의 localStorage에 저장합니다.
   모든 사용자에게 공유하려면 서버/API와 데이터베이스 연동이 필요합니다. */
const mvpForm = document.querySelector('#mvpForm');
const mvpTitleInput = document.querySelector('#mvpTitle');
const mvpUrlInput = document.querySelector('#mvpUrl');
const mvpDescriptionInput = document.querySelector('#mvpDescription');
const mvpCategoryInput = document.querySelector('#mvpCategory');
const mvpFormMessage = document.querySelector('#mvpFormMessage');
const mvpList = document.querySelector('#mvpList');
const mvpCount = document.querySelector('#mvpCount');
const MVP_STORAGE_KEY = 'mvp-nest-submissions';

function getSavedMvps() {
  try {
    const saved = JSON.parse(localStorage.getItem(MVP_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function renderMvps() {
  const mvps = getSavedMvps();
  mvpList.replaceChildren();
  mvpCount.textContent = `${mvps.length}개`;
  if (mvps.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'mvp-empty';
    empty.textContent = '아직 등록된 MVP가 없어요. 첫 번째 둥지 주인이 되어 보세요!';
    mvpList.append(empty);
    return;
  }
  mvps.forEach((mvp) => {
    const card = document.createElement('article');
    card.className = 'mvp-card';
    const top = document.createElement('div');
    top.className = 'mvp-card-top';
    const category = document.createElement('span');
    category.className = 'mvp-category';
    category.textContent = mvp.category || '기타';
    const date = document.createElement('span');
    date.className = 'mvp-date';
    date.textContent = mvp.date || '';
    const title = document.createElement('h4');
    title.textContent = mvp.title;
    const description = document.createElement('p');
    description.textContent = mvp.description;
    const link = document.createElement('a');
    link.className = 'mvp-card-link';
    link.href = mvp.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '랜딩페이지 방문 ↗';
    top.append(category, date);
    card.append(top, title, description, link);
    mvpList.append(card);
  });
}

if (mvpForm) {
  mvpForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const title = mvpTitleInput.value.trim();
    const rawUrl = mvpUrlInput.value.trim();
    const description = mvpDescriptionInput.value.trim();
    const category = mvpCategoryInput.value;
    if (!title || !rawUrl || !description) {
      mvpFormMessage.textContent = '필수 항목을 모두 입력해 주세요.';
      return;
    }
    let parsedUrl;
    try { parsedUrl = new URL(rawUrl); }
    catch (error) {
      mvpFormMessage.textContent = '올바른 랜딩페이지 주소를 입력해 주세요.';
      return;
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      mvpFormMessage.textContent = 'http:// 또는 https:// 주소만 등록할 수 있어요.';
      return;
    }
    const mvps = getSavedMvps();
    mvps.unshift({ title, url: parsedUrl.href, description, category, date: new Date().toLocaleDateString('ko-KR') });
    try { localStorage.setItem(MVP_STORAGE_KEY, JSON.stringify(mvps)); }
    catch (error) {
      mvpFormMessage.textContent = '브라우저 저장 공간을 사용할 수 없어요. 설정을 확인해 주세요.';
      return;
    }
    mvpForm.reset();
    mvpFormMessage.textContent = 'MVP가 둥지에 등록되었어요! 🐣';
    renderMvps();
  });
}
renderMvps();


/* 백종현 파트 - 첫 화면 */



(function () {
  const heroSection = document.querySelector('#hero');
  if (!heroSection) return;

  const stage = heroSection.querySelector('[data-hero-stage]');
  const egg = heroSection.querySelector('[data-hero-egg]');
  const poke = heroSection.querySelector('[data-hero-poke]');
  const card = heroSection.querySelector('[data-hero-card]');
  const avatarEl = heroSection.querySelector('[data-hero-avatar]');
  const nameEl = heroSection.querySelector('[data-hero-name]');
  const textEl = heroSection.querySelector('[data-hero-text]');
  const likesEl = heroSection.querySelector('[data-hero-likes]');
  const totalEl = heroSection.querySelector('[data-hero-total]');
  const pointsEl = heroSection.querySelector('[data-hero-points]');
  const fillEl = heroSection.querySelector('[data-hero-fill]');
  const stageNameEl = heroSection.querySelector('[data-hero-stage-name]');
  const rewardEl = heroSection.querySelector('[data-hero-reward]');
  if (!stage || !egg || !card) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 1. 예시 피드백 (실제 사용자 글이 아니라 화면을 위한 예시 문구)
  //    첫 번째 항목은 HTML에 적힌 내용과 같아야 합니다.
  const heroFeedbacks = [
    {
      avatar: '👩🏻',
      name: '아이디어러버',
      text: '첫 화면에서 물 주는 날짜를 바로 확인할 수 있으면 더 편할 것 같아요!',
      likes: 8,
    },
    {
      avatar: '🧑🏻‍💻',
      name: '새벽코더',
      text: '알림 시간을 직접 고를 수 있으면 자취생한테 딱이에요!',
      likes: 11,
    },
    {
      avatar: '🧑🏽',
      name: '퇴근후창업',
      text: '이름이 한눈에 들어와서 좋아요. 응원해요! 🔥',
      likes: 6,
    },
    {
      avatar: '👧🏼',
      name: '첫눈',
      text: '식물 사진을 찍으면 상태를 알려 주는 기능도 있으면 좋겠어요.',
      likes: 14,
    },
    {
      avatar: '🧔🏻',
      name: '모이콜렉터',
      text: '랜딩페이지 첫 문장이 정말 깔끔해요. 바로 이해됐어요.',
      likes: 9,
    },
    {
      avatar: '🧑🏻‍🎤',
      name: '둥지이웃',
      text: '버튼 색이 잘 보여서 어디를 눌러야 할지 바로 알겠어요.',
      likes: 12,
    },
    {
      avatar: '👩🏽‍🌾',
      name: '초록손',
      text: '식물마다 물 주는 주기를 추천해 주면 정말 유용할 것 같아요!',
      likes: 17,
    },
  ];

  const HERO_POINT = 10;         // 피드백 한 번에 받는 모이
  const HERO_STAGE_AT = [0, 30, 60];   // 알 / 아기새 / 어른새가 되는 모이
  const HERO_STAGE_NAMES = ['🥚 알', '🐣 아기새', '🐦 어른새'];
  const HERO_MAX = HERO_STAGE_AT[HERO_STAGE_AT.length - 1];
  const HERO_AUTO_MS = 3200;     // 저절로 다음 피드백이 오는 간격
  const HERO_HOLD_MS = 5200;     // 날아간 뒤 새 알로 돌아가기까지

  let points = 0;
  let feedbackIndex = 0;
  let total = 12;
  let timer = null;
  let heroVisible = true;


  // 2. 숫자를 부드럽게 올리기 (움직임을 줄이면 바로 바꿈)
  function countTo(el, to) {
    if (!el) return;
    const from = Number(el.textContent) || 0;
    if (reduceMotion.matches || from === to) {
      el.textContent = to;
      return;
    }
    const start = performance.now();
    const duration = 450;
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // class를 떼고 → 화면에 반영 → 다시 붙여서 애니메이션을 처음부터 다시 재생
  function replay(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }


  // 3. 모이(씨앗)·깃털이 알 위쪽에서 튀어 오르는 효과
  function burst(kind, count, power) {
    if (reduceMotion.matches) return;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const originX = stage.offsetWidth / 2;
    const originY = stage.offsetHeight * 0.3;

    for (let i = 0; i < count; i++) {
      const isFeather = kind === 'feather' || (kind === 'mix' && i % 2 === 0);
      const size = (isFeather ? 20 : 15) + Math.random() * 12;
      const svg = document.createElementNS(SVG_NS, 'svg');
      const use = document.createElementNS(SVG_NS, 'use');
      use.setAttribute('href', isFeather ? '#heroFeather' : '#heroSeed');
      svg.setAttribute('viewBox', isFeather ? '0 0 24 24' : '0 0 16 16');
      svg.setAttribute('class', 'hero-burst');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.left = originX + 'px';
      svg.style.top = originY + 'px';
      svg.style.width = size + 'px';
      svg.style.height = size + 'px';

      // 깃털은 흰색·크림색, 모이는 진한 꿀색·꿀색을 섞어서
      if (isFeather) {
        svg.style.color = (i % 4 === 0) ? '#fff4cf' : '#ffffff';
      } else {
        svg.style.color = (i % 3 === 0) ? '#d4952b' : '#e8a93f';
      }
      svg.appendChild(use);
      stage.appendChild(svg);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;  // 위쪽 부채꼴
      const distance = power * (0.55 + Math.random() * 0.75);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const spin = (Math.random() - 0.5) * 540;
      const base = 'translate(-50%, -50%) ';

      // 시작(작게) → 튀어 오른 곳(제 크기) → 아래로 떨어지며 사라짐
      const startFrame = {
        transform: base + 'translate(0px, 0px) rotate(0deg) scale(0.3)',
        opacity: 1,
      };
      const peakFrame = {
        transform: base + 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + (spin * 0.5) + 'deg) scale(1)',
        opacity: 1,
        offset: 0.42,
      };
      const endFrame = {
        transform: base + 'translate(' + (dx * 1.2) + 'px, ' + (dy + 170) + 'px) rotate(' + spin + 'deg) scale(0.9)',
        opacity: 0,
      };

      const animation = svg.animate([startFrame, peakFrame, endFrame], {
        duration: 1200 + Math.random() * 600,
        easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
      });
      animation.onfinish = function () { svg.remove(); };
    }
  }


  // 4. 화면 그리기
  function stageIndex() {
    let index = 0;
    for (let i = 0; i < HERO_STAGE_AT.length; i++) {
      if (points >= HERO_STAGE_AT[i]) index = i;
    }
    return index;
  }

  function showFeedback(index) {
    const feedback = heroFeedbacks[index];
    avatarEl.textContent = feedback.avatar;
    nameEl.textContent = feedback.name;
    textEl.textContent = feedback.text;
    likesEl.textContent = '👍 도움돼요 ' + feedback.likes;
  }

  function renderMeter() {
    countTo(pointsEl, points);
    fillEl.style.width = (points / HERO_MAX * 100) + '%';
    stageNameEl.textContent = HERO_STAGE_NAMES[stageIndex()];
  }


  // 5. 다음 피드백이 도착 (알이 흔들리고 → 모이 +10 → 단계가 오르면 효과)
  function nextFeedback() {
    // 날아간 뒤에 다시 누르면 새 알로 돌아감
    if (points >= HERO_MAX) {
      resetEgg();
      return;
    }

    const beforeStage = stageIndex();
    points += HERO_POINT;
    total += 1;
    feedbackIndex = (feedbackIndex + 1) % heroFeedbacks.length;
    const afterStage = stageIndex();

    showFeedback(feedbackIndex);
    replay(card, 'is-new');
    replay(egg, 'is-shake');
    replay(rewardEl, 'is-pop');
    countTo(totalEl, total);
    renderMeter();
    stage.dataset.stage = String(afterStage);

    if (afterStage > beforeStage) {
      // 아기새가 고개를 내밀 때는 모이, 어른새가 날아갈 때는 깃털이 크게 흩날림
      if (afterStage === 1) burst('seed', 14, 170);
      else burst('mix', 24, 250);
    } else {
      burst('seed', 6, 120);
    }
  }

  function resetEgg() {
    points = 0;
    total = 12;
    feedbackIndex = 0;
    showFeedback(0);
    replay(card, 'is-new');
    countTo(totalEl, total);
    stage.dataset.stage = '0';
    renderMeter();
  }


  // 6. 저절로 진행: 화면에 보이고, 탭이 열려 있고, 동작 줄이기가 아닐 때만
  function canAutoPlay() {
    return heroVisible && !document.hidden && !reduceMotion.matches;
  }

  function schedule(delay) {
    clearTimeout(timer);
    if (!canAutoPlay()) return;
    timer = setTimeout(function () {
      nextFeedback();
      schedule(points >= HERO_MAX ? HERO_HOLD_MS : HERO_AUTO_MS);
    }, delay);
  }

  // 사람이 직접 눌렀을 때: 바로 다음 피드백 + 자동 진행 타이머를 새로 시작
  function pokeEgg() {
    nextFeedback();
    schedule(points >= HERO_MAX ? HERO_HOLD_MS : HERO_AUTO_MS + 1500);
  }

  egg.addEventListener('click', pokeEgg);
  if (poke) poke.addEventListener('click', pokeEgg);

  document.addEventListener('visibilitychange', function () { schedule(1200); });
  reduceMotion.addEventListener('change', function () { schedule(1200); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      schedule(1200);
    }, { threshold: 0.2 }).observe(heroSection);
  }

  renderMeter();
  schedule(2600);   // 처음 연출(해 뜨기·제목 올라오기)이 끝난 뒤 시작


  // 7. 마우스를 따라 알 무대가 기울고 해가 살짝 반대로 움직임 (마우스가 있는 기기에서만)
  const heroCanTilt =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion.matches;

  if (heroCanTilt) {
    let mouseX = 0;
    let mouseY = 0;
    let tiltTicking = false;

    function applyTilt() {
      heroSection.style.setProperty('--hero-mx', mouseX.toFixed(3));
      heroSection.style.setProperty('--hero-my', mouseY.toFixed(3));
      tiltTicking = false;
    }

    heroSection.addEventListener('pointermove', function (event) {
      const rect = heroSection.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;   // -1 ~ 1
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!tiltTicking) {
        tiltTicking = true;
        requestAnimationFrame(applyTilt);
      }
    });

    heroSection.addEventListener('pointerleave', function () {
      mouseX = 0;
      mouseY = 0;
      applyTilt();
    });
  }


  // 8. 스크롤로 내려갈수록 글은 살짝 흐려지고 알은 위로 떠오름 (섹션 2의 "날아오르기"로 이어짐)
  if (!reduceMotion.matches) {
    let scrollTicking = false;

    function updateHeroScroll() {
      const progress = Math.min(Math.max(window.scrollY / heroSection.offsetHeight, 0), 1);
      heroSection.style.setProperty('--hero-scroll', progress.toFixed(3));
      scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateHeroScroll);
      }
    }, { passive: true });
    updateHeroScroll();
  }
})();
