/* =========================================================
   MVP 둥지 script.js (2.0, 11/4 병합)
   블록 세 개로 나뉩니다. 담당자는 자기 블록만 고쳐 주세요.
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
   - 섹션 3 코드와 이름이 겹치지 않도록 변수·함수 이름은 problem으로 시작합니다.
   - 섹션은 기존 id(#problem)로 찾고, 그 안의 요소는 data- 속성으로 찾습니다.
     (CSS용 class 이름이 바뀌어도 JS는 깨지지 않게)
   ========================================================= */


// 2-1. 섹션 2 영역과 기능을 붙일 요소를 찾아 둔다
const problemSection = document.querySelector('#problem');
const problemLinkButtons = problemSection.querySelectorAll('[data-problem-link]');
const problemTiltCards = problemSection.querySelectorAll('[data-problem-tilt]'); // 기울기는 덤 카드(둘러보며 배우기)에만


// 2-2. 고민 말풍선 → 해결 카드 연결하기
//      말풍선을 누르면 같은 줄(li)에 .is-linked를 잠깐 붙인다
//      - CSS가 이 class를 보고 화살표를 채우고 해결 카드를 빛나게 한다
//        (마우스를 올렸을 때는 CSS :has()만으로 같은 효과가 나고, 누르기는 휴대폰·키보드용)
//      - 휴대폰처럼 카드가 아래에 있으면 해결 카드가 보이도록 살짝 스크롤한다
const PROBLEM_LINK_TIME = 1800; // 빛나는 시간(ms)

problemLinkButtons.forEach(function (button) {
  const pair = button.closest('[data-problem-pair]');
  const card = pair.querySelector('[data-problem-card]'); // 같은 줄의 해결 카드
  let timer = null;

  button.addEventListener('click', function () {
    // 연달아 눌러도 처음부터 다시 빛나도록: 떼고 → 화면에 반영 → 다시 붙이기
    pair.classList.remove('is-linked');
    void pair.offsetWidth; // 브라우저가 지금 상태를 한 번 그리게 하는 요령
    pair.classList.add('is-linked');

    clearTimeout(timer);
    timer = setTimeout(function () {
      pair.classList.remove('is-linked');
    }, PROBLEM_LINK_TIME);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });
});


// 2-3. 스크롤할수록 아침 → 낮 → 하늘 (날아오르는 연출)
//      섹션 2가 화면을 지나가는 정도를 0~1로 계산해 CSS 변수 --problem-progress로 넘긴다
//      - 0: 섹션 윗부분이 화면 맨 위에 닿기 전까지 (아침)
//      - 1: 섹션 아랫부분이 화면 맨 아래에 닿았을 때 (하늘)
//      - 스크롤마다 바로 계산하지 않고 화면을 그릴 때 한 번만 계산 (requestAnimationFrame)
let problemSkyTicking = false;

function updateProblemSky() {
  const rect = problemSection.getBoundingClientRect();
  // 섹션을 끝까지 보려면 스크롤해야 하는 거리 (섹션이 화면보다 작으면 최소 1px)
  const distance = Math.max(rect.height - window.innerHeight, 1);
  let progress = -rect.top / distance;
  progress = Math.min(Math.max(progress, 0), 1); // 0보다 작으면 0, 1보다 크면 1

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
updateProblemSky(); // 처음 열었을 때 한 번


// 2-4. 마우스를 따라 기울어지는 카드 (입체 효과)
//      마우스 위치를 카드 안에서 0~1 비율로 계산해 기울기와 조명 위치를 CSS 변수로 넘긴다
//      - 마우스가 없는 기기(휴대폰)나 '동작 줄이기' 설정이면 실행하지 않는다
const PROBLEM_MAX_TILT = 6; // 최대 기울기(도). 숫자를 키우면 더 많이 기울어짐

const problemCanTilt =
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (problemCanTilt) {
  problemTiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (event) {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;  // 왼쪽 끝 0 ~ 오른쪽 끝 1
      const y = (event.clientY - rect.top) / rect.height;  // 위쪽 끝 0 ~ 아래쪽 끝 1

      // 가운데(0.5)를 기준으로 마우스 쪽이 내려가듯 기울인다
      card.style.setProperty('--problem-tilt-x', ((0.5 - y) * PROBLEM_MAX_TILT * 2) + 'deg');
      card.style.setProperty('--problem-tilt-y', ((x - 0.5) * PROBLEM_MAX_TILT * 2) + 'deg');
      card.style.setProperty('--problem-glare-x', (x * 100) + '%');
      card.style.setProperty('--problem-glare-y', (y * 100) + '%');
      card.classList.add('is-tilting');
    });

    // 마우스가 나가면 원래대로 (CSS 전환으로 부드럽게 돌아옴)
    card.addEventListener('mouseleave', function () {
      card.classList.remove('is-tilting');
      card.style.removeProperty('--problem-tilt-x');
      card.style.removeProperty('--problem-tilt-y');
    });
  });
}


// 2-5. 깃털 반응 체험: [도움 됐어요] 누르면 숫자 +1, 깃털이 팔랑팔랑 떨어짐
//      - 다시 누르면 취소(숫자 -1). 저장하지 않아서 새로고침하면 처음 숫자로 돌아감
//      - 깃털은 <template id="problemFeather">를 복사해서 버튼 위치에 붙이고, 애니메이션이 끝나면 지운다
//      - '동작 줄이기' 설정이면 깃털 없이 숫자만 바뀜
const problemHelpArea = problemSection.querySelector('[data-problem-help-area]');
const problemHelpButton = problemSection.querySelector('[data-problem-help]');
const problemHelpCount = problemSection.querySelector('[data-problem-help-count]');
const problemFeatherTemplate = document.querySelector('#problemFeather');
const PROBLEM_FEATHER_COUNT = 6; // 한 번에 떨어지는 깃털 수

function dropProblemFeathers() {
  // 버튼 가운데에서 깃털이 시작되도록 위치 계산 (problemHelpArea 기준)
  const startX = problemHelpButton.offsetLeft + problemHelpButton.offsetWidth / 2;
  const startY = problemHelpButton.offsetTop;

  for (let i = 0; i < PROBLEM_FEATHER_COUNT; i++) {
    const feather = problemFeatherTemplate.content.firstElementChild.cloneNode(true);
    const random = function (min, max) { return min + Math.random() * (max - min); };

    feather.style.left = startX + 'px';
    feather.style.top = startY + 'px';
    feather.style.setProperty('--problem-dx', random(-70, 70) + 'px');     // 옆으로 흔들리는 거리
    feather.style.setProperty('--problem-fall', random(60, 120) + 'px');   // 떨어지는 깊이
    feather.style.setProperty('--problem-rot', random(-200, 200) + 'deg'); // 도는 각도
    feather.style.animationDelay = (i * 70) + 'ms';                        // 하나씩 차례로

    // 애니메이션이 끝나면 화면에서 지운다
    feather.addEventListener('animationend', function () {
      feather.remove();
    });
    problemHelpArea.appendChild(feather);
  }
}

problemHelpButton.addEventListener('click', function () {
  const isPressed = problemHelpButton.getAttribute('aria-pressed') === 'true';
  const count = Number(problemHelpCount.textContent);

  // 눌린 상태를 반대로 바꾸고 숫자를 +1 / -1
  problemHelpButton.setAttribute('aria-pressed', String(!isPressed));
  problemHelpCount.textContent = isPressed ? count - 1 : count + 1;

  // 숫자가 바뀔 때 톡 튀는 효과 (떼고 → 다시 붙여야 매번 처음부터 재생됨)
  problemHelpCount.classList.remove('is-bump');
  void problemHelpCount.offsetWidth;
  problemHelpCount.classList.add('is-bump');

  // 새로 눌렀을 때만 깃털 (취소할 때는 안 떨어짐)
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