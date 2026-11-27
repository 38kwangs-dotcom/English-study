/* 은진님 오피스 — 똑똑이 비서실 오피스맵
   localStorage + Supabase(fb_sync / office_map_eunjin) 자동 동기화 + JSON 백업·복원 */
(function () {
  'use strict';

  /* ================= 설정 ================= */
  var KEY = 'eunjin_office_map_v1';
  var CLOUD_URL = 'https://zzkjwucarircmqmuhpka.supabase.co';
  var CLOUD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2p3dWNhcmlyY21xbXVocGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NTM1NjQsImV4cCI6MjExMDQyOTU2NH0.QH2-UdpeYZiRi7zUIQ9kvwB5focUA49ZE7B-Qj1KaQQ';
  var SYNC_TABLE = 'fb_sync';
  var MY_ROW = 'office_map_eunjin';

  /* ================= 기본 데이터 ================= */
  var DEFAULTS = {
    v: 1, kind: 'office_map', owner: 'eunjin', rev: 0, updatedAt: 0, touched: false,
    parts: [
      {
        id: 'study', emoji: '🎓', title: '2028 두 딸 유학', room: '유학 데스크', accent: '#5B86B8',
        summary: '몰타 1순위 산 안톤 회신 대기(11/30 복귀 후) · 호주·뉴질랜드 1월 학기 대 몰타·키프로스 9월 학기 비교 중',
        tasks: [
          { id: 'st1', text: '산 안톤 본답변 확인 (11/30 복귀 후)', done: false },
          { id: 'st2', text: '산 안드레아 LSE 후속 회신 확인', done: false },
          { id: 'st3', text: '세인트 캐서린스 문의 재접수 방법 결정 (폼·전화)', done: false },
          { id: 'st4', text: '이민국 자녀 보호 케어·Form O 답변 확인', done: false },
          { id: 'st5', text: '2028년 9월 출국안 학비 2년치 비교표 갱신', done: false },
          { id: 'st6', text: '교육지원청에 미인정 유학 복귀 절차 확인', done: false },
          { id: 'st7', text: '몰타 이민국 어학연수 불가 회신 반영', done: true },
          { id: 'st8', text: '남편 공유용 3개국 비교표 전달', done: true }
        ],
        memo: '2028년 1월 출국·2029년 12월 복귀라면 2년치 학비로 맞는 곳은 호주·뉴질랜드뿐.\n몰타·키프로스는 9월 학기라 중도 입·퇴교 정산이 확인되지 않아 3년치 위험.\n조건: 연 1억~1.2억 · 두 딸 한 캠퍼스 · 영하 없음 · 금연 숙소.',
        links: []
      },
      {
        id: 'travel', emoji: '✈️', title: '여행 & @gotravel_log', room: '여행 스튜디오', accent: '#C08A5B',
        summary: '12월 오사카·USJ 3인 여행 확정 대기 · @gotravel_log 첫 릴스 업로드 · A트랙 1단계 주 1~2회',
        tasks: [
          { id: 'tr1', text: '12월 오사카 3인 일정 확정 (12/19~22 안)', done: false },
          { id: 'tr2', text: 'USJ 티켓·유니버설 포트 예약 화면 재확인', done: false },
          { id: 'tr3', text: '@gotravel_log 첫 릴스 업로드 (말레이시아 1초컷)', done: false },
          { id: 'tr4', text: '3박4일·4박5일 여행 사진 정리해 다음 콘텐츠 만들기', done: false },
          { id: 'tr5', text: '12월~3월 주 1~2회 업로드 루틴 (15편 목표)', done: false },
          { id: 'tr6', text: '유후인 료칸·소라니와 온천 릴스 소재 정리', done: true }
        ],
        memo: 'A트랙 3단계\n1) 2026.12~2027.03 씨앗 심기 — 주 1~2회 업로드, 15편\n2) 2027.04~12 검색 유입 — 학교·비자·주거 비교기, 노션/PDF 초안\n3) 2028.01 전역 후 제휴·유료 상품 (마이리얼트립·아고다·클룩)\n사진·영상·메모만 주면 편집·캡션·블로그 초안은 내가 준비.',
        links: [{ label: '@gotravel_log 인스타', url: 'https://www.instagram.com/gotravel_log/' }]
      },
      {
        id: 'english', emoji: '🗣️', title: '영어 & IELTS 7.0', room: '영어 랩', accent: '#5E9C8A',
        summary: '2027-08 IELTS 7.0 목표 · 평일 밤 11시 회화 전화 · 매일 09시 기초문법 카드',
        tasks: [
          { id: 'en1', text: '오늘 밤 11시 영어 회화 전화 받기', done: false },
          { id: 'en2', text: '내일 09:00 기초문법 Day 11 카드 확인', done: false },
          { id: 'en3', text: '회화 빈출 721단어 하루 20개', done: false },
          { id: 'en4', text: '엄마 IELTS 단어 마을 하루 16단어', done: false },
          { id: 'en5', text: '원서 따라 읽기 10분 (이솝·벨벳 토끼)', done: false },
          { id: 'en6', text: '2027-08 IELTS 접수 일정 확인', done: false },
          { id: 'en7', text: '기초문법 Day 10 카드 완료', done: true }
        ],
        memo: 'OPIc IL에서 IELTS 7.0까지. 평일 1시간 30분·주말 30분.\n전화는 매일 밤 11시, 문법 카드는 매일 09시.\n발음은 iOS 무음 모드에서도 나오는 구글 TTS 우선.',
        links: [
          { label: '엄마 IELTS 단어 마을', url: 'https://38kwangs-dotcom.github.io/English-study/family-board/ielts/' },
          { label: '회화 빈출 721단어', url: 'https://38kwangs-dotcom.github.io/English-study/spoken-721/' },
          { label: '원서 따라 읽기', url: 'https://38kwangs-dotcom.github.io/English-study/reading/' }
        ]
      },
      {
        id: 'family', emoji: '🏡', title: '패밀리 & 일상', room: '패밀리 라운지', accent: '#C07A7A',
        summary: '패밀리 보드·아이들 학습 앱 운영 · 인스타 정보 저장소 32건 · 생활·건강 챙기기',
        tasks: [
          { id: 'fa1', text: '아이들 태블릿 앱 최신 버전 확인', done: false },
          { id: 'fa2', text: '패밀리 보드 이번 주 루틴 정리', done: false },
          { id: 'fa3', text: '인스타 정보 저장소에 받은 링크 정리', done: false },
          { id: 'fa4', text: '피부과 상담 후보 비교 (의정부·공릉·구리·별내)', done: false },
          { id: 'fa5', text: '고양이 3마리 사료·모래 점검', done: false },
          { id: 'fa6', text: '인스타 저장소 32건 분류 완료', done: true }
        ],
        memo: '가족: 큰딸 2017.07, 작은딸 2021.11, 고양이 3마리.\n가족 결정은 카톡으로 상의 — 표는 캡처용 이미지로 보낸다.\n인스타 링크는 👍만 남기고 조용히 정리.',
        links: [
          { label: '우리집 패밀리 보드', url: 'https://38kwangs-dotcom.github.io/English-study/family-board/' },
          { label: '초등 필수 영단어 마을', url: 'https://38kwangs-dotcom.github.io/English-study/family-board/vocab/' },
          { label: '인스타 정보 저장소', url: 'https://38kwangs-dotcom.github.io/English-study/insta-vault/' }
        ]
      }
    ]
  };

  /* ================= 상태 ================= */
  var D = load();
  var cloud = { state: 'wait', last: 0, msg: '' };
  var sb = null, pushTimer = null, applyingRemote = false, booted = false;
  var SHEET_PART = null, CURRENT_TAB = 'office', MEMO_PART = (D.parts[0] || {}).id || null;
  var doneFoldOpen = false;

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function normalize(raw) {
    var d = raw && typeof raw === 'object' ? clone(raw) : clone(DEFAULTS);
    if (!Array.isArray(d.parts) || !d.parts.length) d.parts = clone(DEFAULTS.parts);
    d.v = 1; d.kind = 'office_map'; d.owner = 'eunjin';
    d.rev = Number(d.rev) || 0;
    d.updatedAt = Number(d.updatedAt) || 0;
    d.touched = !!d.touched;
    d.parts = d.parts.map(function (p, i) {
      var q = {
        id: p.id || ('p' + i + uid()),
        emoji: p.emoji || '📌',
        title: p.title || '새 파트',
        room: p.room || '새 파트',
        accent: p.accent || '#8C95A3',
        summary: typeof p.summary === 'string' ? p.summary : '',
        memo: typeof p.memo === 'string' ? p.memo : '',
        links: Array.isArray(p.links) ? p.links.filter(function (l) { return l && l.url; }).map(function (l) {
          return { label: l.label || l.url, url: l.url };
        }) : [],
        tasks: Array.isArray(p.tasks) ? p.tasks.map(function (t) {
          return { id: t.id || uid(), text: String(t.text || ''), done: !!t.done };
        }).filter(function (t) { return t.text; }) : []
      };
      return q;
    });
    return d;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { }
    return normalize(clone(DEFAULTS));
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { }
  }

  function save(opts) {
    opts = opts || {};
    if (!opts.remote) {
      D.touched = true;
      D.updatedAt = Date.now();
      D.rev = D.updatedAt;
      persist();
      schedulePush();
    }
    if (!opts.quiet) renderSync();
  }

  /* ================= 공통 UI ================= */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.hidden = true; }, 240);
    }, 2100);
  }

  function partById(id) {
    for (var i = 0; i < D.parts.length; i++) if (D.parts[i].id === id) return D.parts[i];
    return null;
  }
  function pendingOf(p) { return p.tasks.filter(function (t) { return !t.done; }).length; }
  function doneOf(p) { return p.tasks.filter(function (t) { return t.done; }).length; }
  function rateOf(p) { return p.tasks.length ? Math.round(doneOf(p) / p.tasks.length * 100) : 0; }
  function totalPending() { return D.parts.reduce(function (n, p) { return n + pendingOf(p); }, 0); }
  function totalDone() { return D.parts.reduce(function (n, p) { return n + doneOf(p); }, 0); }
  function isRoom(p) { return ['study', 'travel', 'english', 'family'].indexOf(p.id) >= 0; }

  /* ================= 아이소메트릭 오피스맵 ================= */
  var W = 320, Dp = 250, WALL = 98;
  var CX = 0.866, CY = 0.5;
  var VBX = -230, VBY = -108, VBW = 524, VBH = 404;

  function P(x, y, z) { return [(x - y) * CX, (x + y) * CY - (z || 0)]; }
  function f(n) { return Math.round(n * 100) / 100; }
  function pt(x, y, z) { var p = P(x, y, z); return f(p[0]) + ',' + f(p[1]); }
  function polygon(points, fill, extra) {
    return '<polygon points="' + points + '" fill="' + fill + '"' + (extra ? ' ' + extra : '') + '/>';
  }
  function box(x, y, w, d, h, c, z0, extra) {
    z0 = z0 || 0;
    var z1 = z0 + h;
    return polygon([pt(x, y + d, z1), pt(x + w, y + d, z1), pt(x + w, y + d, z0), pt(x, y + d, z0)].join(' '), c.l) +
      polygon([pt(x + w, y, z1), pt(x + w, y + d, z1), pt(x + w, y + d, z0), pt(x + w, y, z0)].join(' '), c.r) +
      polygon([pt(x, y, z1), pt(x + w, y, z1), pt(x + w, y + d, z1), pt(x, y + d, z1)].join(' '), c.t, extra || '');
  }
  function shadow(x, y, w, d, op) {
    var c = P(x + w / 2, y + d / 2, 0.3);
    return '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" rx="' + f((w + d) * 0.44) + '" ry="' + f((w + d) * 0.17) + '" fill="#2C261D" opacity="' + (op || 0.09) + '"/>';
  }
  function rug(x, y, w, d, fill, stroke) {
    return polygon([pt(x, y, 0.7), pt(x + w, y, 0.7), pt(x + w, y + d, 0.7), pt(x, y + d, 0.7)].join(' '), fill,
      'stroke="' + (stroke || '#E6DFD1') + '" stroke-width="1"');
  }
  var C = {
    white: { t: '#FFFFFF', l: '#DCD5C6', r: '#F1ECE1' },
    oak: { t: '#E9D8BC', l: '#C9AF87', r: '#DAC4A2' },
    dark: { t: '#5A646F', l: '#333B45', r: '#414A55' },
    navy: { t: '#4A5D75', l: '#293849', r: '#35455A' },
    sage: { t: '#CFE0CB', l: '#A4BE9F', r: '#B7CFB2' },
    blush: { t: '#F2D6CF', l: '#D3AEA4', r: '#E2BFB6' },
    clay: { t: '#E4C5AE', l: '#BE9C7C', r: '#D0AE91' },
    grey: { t: '#E6E2D8', l: '#C0B9AC', r: '#D3CDC0' }
  };

  function plant(x, y, s) {
    s = s || 1;
    var g = '';
    g += shadow(x - 10 * s, y - 10 * s, 20 * s, 20 * s, 0.09);
    g += box(x - 9 * s, y - 9 * s, 18 * s, 18 * s, 18 * s, C.clay);
    var c = P(x, y, 18 * s);
    g += '<line x1="' + f(c[0]) + '" y1="' + f(c[1]) + '" x2="' + f(c[0]) + '" y2="' + f(c[1] - 26 * s) + '" stroke="#8FA989" stroke-width="' + f(2 * s) + '"/>';
    g += leaf(c[0] - 9 * s, c[1] - 20 * s, 10 * s, 6 * s, -28, '#A9C4A2');
    g += leaf(c[0] + 9 * s, c[1] - 24 * s, 10 * s, 6 * s, 26, '#96B48F');
    g += leaf(c[0] - 4 * s, c[1] - 32 * s, 9 * s, 6 * s, -14, '#B7CEAE');
    g += leaf(c[0] + 5 * s, c[1] - 34 * s, 9 * s, 5.5 * s, 20, '#A9C4A2');
    g += leaf(c[0], c[1] - 40 * s, 6 * s, 4.5 * s, 0, '#C2D6B8');
    return g;
  }

  function critter(x, y) {
    var c = P(x, y, 0);
    var g = '<g transform="translate(' + f(c[0]) + ',' + f(c[1]) + ')">';
    g += '<ellipse cx="0" cy="2" rx="30" ry="9" fill="#2C261D" opacity=".14"/>';
    g += '<ellipse cx="-11" cy="-4" rx="9" ry="5" fill="#3B69C4"/>';
    g += '<ellipse cx="11" cy="-4" rx="9" ry="5" fill="#3B69C4"/>';
    g += '<path d="M-25,-16 C-27,-54 -15,-76 0,-76 C15,-76 27,-54 25,-16 C24,-5 13,0 0,0 C-13,0 -24,-5 -25,-16 Z" fill="url(#bod)"/>';
    g += '<ellipse cx="0" cy="-25" rx="16" ry="14" fill="#FFFFFF" opacity=".26"/>';
    g += '<ellipse cx="-9" cy="-46" rx="3.6" ry="4.6" fill="#1B2436"/>';
    g += '<ellipse cx="9" cy="-46" rx="3.6" ry="4.6" fill="#1B2436"/>';
    g += '<circle cx="-10.2" cy="-47.8" r="1.3" fill="#fff"/><circle cx="7.8" cy="-47.8" r="1.3" fill="#fff"/>';
    g += '<ellipse cx="-16.5" cy="-36" rx="4.4" ry="2.6" fill="#FFB3B3" opacity=".55"/>';
    g += '<ellipse cx="16.5" cy="-36" rx="4.4" ry="2.6" fill="#FFB3B3" opacity=".55"/>';
    g += '<path d="M-5,-35 Q0,-30.5 5,-35" stroke="#1B2436" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    g += '<path d="M-24,-56 Q0,-79 24,-56" stroke="#2B3A4E" stroke-width="4" fill="none" stroke-linecap="round"/>';
    g += '<circle cx="-24" cy="-54" r="5.2" fill="#2B3A4E"/><circle cx="24" cy="-54" r="5.2" fill="#2B3A4E"/>';
    g += '<path d="M-24,-50 Q-25,-33 -10,-31" stroke="#2B3A4E" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    g += '<circle cx="-9.4" cy="-31" r="2.7" fill="#2B3A4E"/>';
    g += '<ellipse cx="-8" cy="-64" rx="6.5" ry="4" fill="#fff" opacity=".28"/>';
    return g + '</g>';
  }

  function cat(x, y) {
    var c = P(x, y, 0);
    return '<g transform="translate(' + f(c[0]) + ',' + f(c[1]) + ')">' +
      '<ellipse cx="0" cy="0" rx="15" ry="5" fill="#2C261D" opacity=".12"/>' +
      '<ellipse cx="0" cy="-6" rx="12" ry="6.5" fill="#D9B78F"/>' +
      '<circle cx="10.5" cy="-10" r="5.6" fill="#E4C6A1"/>' +
      '<path d="M7,-14 L8.4,-18.4 L11.6,-15 Z" fill="#D9B78F"/>' +
      '<path d="M11.6,-15 L14.6,-18.6 L14.8,-14 Z" fill="#D9B78F"/>' +
      '<path d="M-11,-5 q-7,-1.5 -5.5,-7" stroke="#D9B78F" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '</g>';
  }

  function deskUnit(x, y, w, d, col) {
    var g = shadow(x, y, w, d, 0.07);
    g += box(x + 3, y + 3, 4, 4, 24, col, 0);
    g += box(x + w - 7, y + 3, 4, 4, 24, col, 0);
    g += box(x + 3, y + d - 7, 4, 4, 24, col, 0);
    g += box(x + w - 7, y + d - 7, 4, 4, 24, col, 0);
    g += box(x, y, w, d, 5, col, 24);
    return g;
  }

  function roundTable(x, y, r, z, col) {
    var top = P(x, y, z);
    var base = P(x, y, 0);
    var g = shadow(x - r, y - r, r * 2, r * 2, 0.07);
    g += box(x - 3, y - 3, 6, 6, z - 4, col, 0);
    g += '<ellipse cx="' + f(base[0]) + '" cy="' + f(base[1]) + '" rx="' + f(r * 0.62) + '" ry="' + f(r * 0.34) + '" fill="' + col.l + '"/>';
    g += '<ellipse cx="' + f(top[0]) + '" cy="' + f(top[1]) + '" rx="' + f(r * 1.24) + '" ry="' + f(r * 0.70) + '" fill="' + col.t + '" stroke="#E3DCCD" stroke-width="1"/>';
    return g;
  }

  function wallRect(x1, x2, z1, z2, wall, fill, stroke) {
    // on plane y=0
    return polygon([pt(x1, 0, z2), pt(x2, 0, z2), pt(x2, 0, z1), pt(x1, 0, z1)].join(' '), fill,
      'stroke="' + stroke + '" stroke-width="1.2"');
  }
  function wallRectL(y1, y2, z1, z2, fill, stroke) {
    // on plane x=0
    return polygon([pt(0, y1, z2), pt(0, y2, z2), pt(0, y2, z1), pt(0, y1, z1)].join(' '), fill,
      'stroke="' + stroke + '" stroke-width="1.2"');
  }

  function leaf(cx, cy, rx, ry, rot, fill) {
    return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + fill +
      '" transform="rotate(' + rot + ' ' + f(cx) + ' ' + f(cy) + ')"/>';
  }

  function buildMap() {
    var s = '';
    s += '<svg viewBox="' + VBX + ' ' + VBY + ' ' + VBW + ' ' + VBH + '" xmlns="http://www.w3.org/2000/svg" aria-label="비서실 오피스맵">';
    s += '<defs>' +
      '<linearGradient id="bod" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#82AAF7"/><stop offset="62%" stop-color="#5B8DEF"/><stop offset="100%" stop-color="#4677D8"/>' +
      '</linearGradient>' +
      '<linearGradient id="floorG" x1="0.2" y1="0" x2="0.8" y2="1">' +
        '<stop offset="0%" stop-color="#FDF6E9"/><stop offset="100%" stop-color="#F3E4CB"/>' +
      '</linearGradient>' +
      '<linearGradient id="winG" x1="0" y1="0" x2="0.3" y2="1">' +
        '<stop offset="0%" stop-color="#F4FAFD"/><stop offset="100%" stop-color="#DCEAF3"/>' +
      '</linearGradient>' +
      '<linearGradient id="wallR" x1="0" y1="0" x2="0.5" y2="1">' +
        '<stop offset="0%" stop-color="#FEFCF8"/><stop offset="100%" stop-color="#F8F3E9"/>' +
      '</linearGradient>' +
      '<linearGradient id="wallL" x1="0" y1="0" x2="1" y2="0.4">' +
        '<stop offset="0%" stop-color="#FAF6EE"/><stop offset="100%" stop-color="#F4EDE0"/>' +
      '</linearGradient>' +
      '<filter id="soft" x="-30%" y="-30%" width="170%" height="170%"><feGaussianBlur stdDeviation="4"/></filter>' +
      '</defs>';

    /* --- 바닥 슬래브 그림자 --- */
    s += '<g filter="url(#soft)" opacity=".20">' +
      polygon([pt(6, Dp + 4, -22), pt(W + 4, Dp + 4, -22), pt(W + 4, 6, -22), pt(6, 6, -22)].join(' '), '#8C7A5E') + '</g>';

    /* --- 슬래브 옆면 --- */
    s += polygon([pt(0, Dp, 0), pt(W, Dp, 0), pt(W, Dp, -12), pt(0, Dp, -12)].join(' '), '#E3D6C0');
    s += polygon([pt(W, 0, 0), pt(W, Dp, 0), pt(W, Dp, -12), pt(W, 0, -12)].join(' '), '#EDE2CE');

    /* --- 벽 --- */
    s += polygon([pt(0, 0, 0), pt(0, Dp, 0), pt(0, Dp, WALL), pt(0, 0, WALL)].join(' '), 'url(#wallL)');
    s += polygon([pt(0, 0, 0), pt(W, 0, 0), pt(W, 0, WALL), pt(0, 0, WALL)].join(' '), 'url(#wallR)');
    /* 벽 상단 두께 */
    s += polygon([pt(0, Dp, WALL), pt(0, 0, WALL), pt(W, 0, WALL)].join(' ') + ' ' , 'none', 'stroke="#E4DAC6" stroke-width="3" stroke-linejoin="round"');
    s += '<polyline points="' + pt(0, Dp, WALL) + ' ' + pt(0, 0, WALL) + ' ' + pt(W, 0, WALL) + '" fill="none" stroke="#F7F2E7" stroke-width="1.2"/>';
    /* 걸레받이 */
    s += polygon([pt(0, 0, 0), pt(0, Dp, 0), pt(0, Dp, 8), pt(0, 0, 8)].join(' '), '#E8DDC7');
    s += polygon([pt(0, 0, 0), pt(W, 0, 0), pt(W, 0, 8), pt(0, 0, 8)].join(' '), '#F1E8D8');

    /* --- 마루 --- */
    s += polygon([pt(0, 0, 0), pt(W, 0, 0), pt(W, Dp, 0), pt(0, Dp, 0)].join(' '), 'url(#floorG)');
    var i;
    for (i = 16; i < Dp; i += 16) {
      s += '<line x1="' + f(P(0, i, 0)[0]) + '" y1="' + f(P(0, i, 0)[1]) + '" x2="' + f(P(W, i, 0)[0]) + '" y2="' + f(P(W, i, 0)[1]) + '" stroke="#E8D9BD" stroke-width="1"/>';
    }
    s += '<polygon points="' + [pt(0, 0, 0), pt(W, 0, 0), pt(W, Dp, 0), pt(0, Dp, 0)].join(' ') + '" fill="none" stroke="#E4D5B9" stroke-width="1.4"/>';
    /* 창문에서 들어오는 빛 */
    s += '<g opacity=".55"><ellipse cx="' + f(P(70, 26, 0)[0]) + '" cy="' + f(P(70, 26, 0)[1]) + '" rx="86" ry="34" fill="#FFFDF6"/></g>';
    s += '<g opacity=".35"><ellipse cx="' + f(P(0, 176, 0)[0]) + '" cy="' + f(P(0, 176, 0)[1]) + '" rx="34" ry="60" fill="#FFFDF6" transform="rotate(-30 ' + f(P(0, 176, 0)[0]) + ' ' + f(P(0, 176, 0)[1]) + ')"/></g>';

    /* --- 창문 (오른쪽 벽 y=0) --- */
    s += wallRect(26, 134, 26, 84, 'R', 'url(#winG)', '#FFFFFF');
    s += wallRect(26, 134, 26, 84, 'R', 'none', '#D5E2EB');
    s += '<line x1="' + f(P(80, 0, 84)[0]) + '" y1="' + f(P(80, 0, 84)[1]) + '" x2="' + f(P(80, 0, 26)[0]) + '" y2="' + f(P(80, 0, 26)[1]) + '" stroke="#FFFFFF" stroke-width="2.6"/>';
    s += '<line x1="' + f(P(26, 0, 55)[0]) + '" y1="' + f(P(26, 0, 55)[1]) + '" x2="' + f(P(134, 0, 55)[0]) + '" y2="' + f(P(134, 0, 55)[1]) + '" stroke="#FFFFFF" stroke-width="2.6"/>';
    /* --- 창문 (왼쪽 벽 x=0) --- */
    s += wallRectL(140, 216, 26, 84, 'url(#winG)', '#FFFFFF');
    s += wallRectL(140, 216, 26, 84, 'none', '#D5E2EB');
    s += '<line x1="' + f(P(0, 178, 84)[0]) + '" y1="' + f(P(0, 178, 84)[1]) + '" x2="' + f(P(0, 178, 26)[0]) + '" y2="' + f(P(0, 178, 26)[1]) + '" stroke="#FFFFFF" stroke-width="2.6"/>';
    s += '<line x1="' + f(P(0, 140, 55)[0]) + '" y1="' + f(P(0, 140, 55)[1]) + '" x2="' + f(P(0, 216, 55)[0]) + '" y2="' + f(P(0, 216, 55)[1]) + '" stroke="#FFFFFF" stroke-width="2.6"/>';

    /* --- 벽 액자·시계 --- */
    s += wallRect(160, 204, 46, 76, 'R', '#FFFFFF', '#E7DECB');
    s += wallRect(165, 199, 51, 71, 'R', '#F5EFE3', '#EFE7D6');
    s += '<line x1="' + f(P(170, 0, 60)[0]) + '" y1="' + f(P(170, 0, 60)[1]) + '" x2="' + f(P(192, 0, 66)[0]) + '" y2="' + f(P(192, 0, 66)[1]) + '" stroke="#CDB79A" stroke-width="1.8"/>';
    s += wallRect(216, 262, 50, 80, 'R', '#FFFFFF', '#E7DECB');
    s += wallRect(220, 258, 54, 76, 'R', '#F3F6F1', '#E9EDE5');
    s += '<path d="M' + f(P(224, 0, 66)[0]) + ',' + f(P(224, 0, 66)[1]) + ' q' + f((P(254, 0, 66)[0] - P(224, 0, 66)[0]) / 2) + ',' + f((P(254, 0, 66)[1] - P(224, 0, 66)[1]) / 2 - 8) + ' ' + f(P(254, 0, 66)[0] - P(224, 0, 66)[0]) + ',2" fill="none" stroke="#B6C9BA" stroke-width="2"/>';
    var clk = P(290, 0, 64);
    s += '<circle cx="' + f(clk[0]) + '" cy="' + f(clk[1]) + '" r="11" fill="#FFFFFF" stroke="#E7DECB" stroke-width="1.8"/>';
    s += '<line x1="' + f(clk[0]) + '" y1="' + f(clk[1]) + '" x2="' + f(clk[0]) + '" y2="' + f(clk[1] - 6) + '" stroke="#8E8574" stroke-width="1.6" stroke-linecap="round"/>';
    s += '<line x1="' + f(clk[0]) + '" y1="' + f(clk[1]) + '" x2="' + f(clk[0] + 4.5) + '" y2="' + f(clk[1] + 1.5) + '" stroke="#8E8574" stroke-width="1.4" stroke-linecap="round"/>';
    /* 왼쪽 벽 선반 + 책 */
    s += wallRectL(22, 100, 66, 70, '#F0E6D3', '#E3D8C1');
    s += wallRectL(28, 42, 70, 84, '#DCEADB', '#D3E1D2');
    s += wallRectL(44, 58, 70, 80, '#F4DDD6', '#EBD0C8');
    s += wallRectL(60, 74, 70, 82, '#E9D9BE', '#DFCFB2');
    s += wallRectL(78, 94, 70, 79, '#E7E3D9', '#DDD8CC');
    s += wallRectL(22, 100, 40, 44, '#FFFFFF', '#EAE1CE');
    s += wallRectL(26, 96, 43, 47, '#FBF6EC', '#F1E9D9');

    /* --- 구역 러그 --- */
    s += rug(14, 12, 124, 104, '#E2EDF7', '#D2E0EE');
    s += rug(182, 12, 124, 104, '#FBF0DD', '#EEDFC4');
    s += rug(14, 138, 124, 100, '#E4EFE6', '#D2E6D7');
    s += rug(182, 138, 124, 100, '#F9E8E3', '#EED4CD');

    /* ===== 유학 데스크 (뒤-왼쪽) ===== */
    s += '<g class="zone-g" data-part="study" role="button" tabindex="0" aria-label="유학 데스크 열기">';
    s += '<rect x="0" y="0" width="0" height="0"/>';
    /* 책장 */
    s += shadow(2, 30, 22, 68, 0.10);
    s += box(2, 30, 20, 68, 72, C.white, 0);
    s += box(2, 30, 20, 3, 2, C.grey, 24);
    s += box(2, 30, 20, 3, 2, C.grey, 48);
    s += box(5, 40, 15, 8, 13, C.sage, 26);
    s += box(5, 54, 15, 8, 10, C.blush, 26);
    s += box(5, 66, 15, 8, 14, C.clay, 26);
    s += box(5, 40, 15, 8, 11, C.oak, 50);
    s += box(5, 54, 15, 8, 13, C.navy, 50);
    /* 책상 */
    s += deskUnit(34, 24, 100, 48, C.oak);
    /* 노트북 */
    s += shadow(60, 30, 30, 24, 0.10);
    s += box(64, 34, 30, 22, 2, C.dark, 29);
    s += polygon([pt(64, 34, 31), pt(94, 34, 31), pt(94, 34, 47), pt(64, 34, 47)].join(' '), '#4B5663');
    s += polygon([pt(67, 34, 33), pt(91, 34, 33), pt(91, 34, 45), pt(67, 34, 45)].join(' '), '#8FA6BC');
    /* 스탠드 조명 */
    s += box(116, 26, 4, 4, 16, C.dark, 29);
    var dl = P(118, 28, 50);
    s += '<path d="M' + f(dl[0] - 8) + ',' + f(dl[1]) + ' L' + f(dl[0] + 8) + ',' + f(dl[1]) + ' L' + f(dl[0] + 5) + ',' + f(dl[1] - 10) + ' L' + f(dl[0] - 5) + ',' + f(dl[1] - 10) + ' Z" fill="#FFF1D6" stroke="#E8D8B6" stroke-width="1"/>';
    /* 책 몇 권 */
    s += box(36, 52, 18, 10, 4, C.navy, 29);
    s += box(37, 53, 18, 10, 4, C.blush, 33);
    /* 서류·컵 */
    s += box(100, 28, 18, 22, 3, C.white, 29);
    s += box(104, 32, 18, 22, 3, C.white, 31);
    s += '<ellipse cx="' + f(P(58, 62, 30)[0]) + '" cy="' + f(P(58, 62, 30)[1]) + '" rx="5.4" ry="3" fill="#FFFFFF" stroke="#DCD3C2"/>';
    /* 의자 */
    s += shadow(72, 78, 30, 30, 0.10);
    s += box(76, 80, 26, 24, 3, C.oak, 15);
    s += box(76, 80, 26, 6, 22, C.oak, 18);
    s += box(86, 92, 6, 6, 13, C.oak, 2);
    /* 화분 */
    s += plant(122, 96, 0.9);
    s += polygon([pt(14, 12, 0.9), pt(138, 12, 0.9), pt(138, 116, 0.9), pt(14, 116, 0.9)].join(' '), 'transparent', 'class="zone-hit"');
    s += '<polygon class="zone-ring" points="' + [pt(14, 12, 0.85), pt(138, 12, 0.85), pt(138, 116, 0.85), pt(14, 116, 0.85)].join(' ') + '" fill="none" stroke="#8FB2D9" stroke-width="2"/>';
    s += '</g>';

    /* ===== 여행 스튜디오 (뒤-오른쪽) ===== */
    s += '<g class="zone-g" data-part="travel" role="button" tabindex="0" aria-label="여행 스튜디오 열기">';
    s += deskUnit(200, 24, 100, 48, C.white);
    /* 카메라 삼각대 */
    s += shadow(214, 32, 12, 16, 0.12);
    s += box(210, 34, 3, 3, 34, C.dark, 29);
    s += box(206, 46, 3, 3, 22, C.dark, 22);
    s += box(218, 46, 3, 3, 22, C.dark, 22);
    s += box(205, 30, 16, 13, 10, C.dark, 63);
    s += '<circle cx="' + f(P(213, 36, 73)[0]) + '" cy="' + f(P(213, 36, 73)[1]) + '" r="3.6" fill="#93A7BC"/>';
    /* 링라이트 */
    s += box(272, 30, 3, 3, 40, C.dark, 29);
    var lr = P(273.5, 31.5, 84);
    s += '<circle cx="' + f(lr[0]) + '" cy="' + f(lr[1]) + '" r="13" fill="#FFF7E8" stroke="#EBDFC7" stroke-width="2.2"/>';
    s += '<circle cx="' + f(lr[0]) + '" cy="' + f(lr[1]) + '" r="8" fill="#FFFDF8"/>';
    /* 지구본 */
    s += box(286, 30, 8, 8, 6, C.white, 29);
    var gl = P(290, 34, 44);
    s += '<circle cx="' + f(gl[0]) + '" cy="' + f(gl[1]) + '" r="7.5" fill="#BFD6E8" stroke="#A9C4DB" stroke-width="1"/>';
    s += '<path d="M' + f(gl[0] - 4) + ',' + f(gl[1] - 1) + ' q4,3 8,0" stroke="#8FADC6" stroke-width="1.2" fill="none"/>';
    /* 노트북 + 가방 */
    s += box(244, 30, 22, 16, 2, C.white, 29);
    s += polygon([pt(244, 28, 31), pt(266, 28, 31), pt(266, 28, 40), pt(244, 28, 40)].join(' '), '#5A646F');
    s += shadow(284, 52, 16, 24, 0.09);
    s += box(284, 52, 16, 24, 16, C.clay, 0);
    /* 의자 */
    s += shadow(230, 80, 30, 30, 0.09);
    s += box(234, 82, 26, 24, 3, C.oak, 15);
    s += box(234, 82, 26, 6, 22, C.oak, 18);
    s += box(244, 94, 6, 6, 13, C.oak, 2);
    /* 화분 */
    s += plant(190, 98, 1.0);
    s += polygon([pt(182, 12, 0.9), pt(306, 12, 0.9), pt(306, 116, 0.9), pt(182, 116, 0.9)].join(' '), 'transparent', 'class="zone-hit"');
    s += '<polygon class="zone-ring" points="' + [pt(182, 12, 0.85), pt(306, 12, 0.85), pt(306, 116, 0.85), pt(182, 116, 0.85)].join(' ') + '" fill="none" stroke="#E3C69E" stroke-width="2"/>';
    s += '</g>';

    /* ===== 영어 랩 (앞-왼쪽) ===== */
    s += '<g class="zone-g" data-part="english" role="button" tabindex="0" aria-label="영어 랩 열기">';
    /* 낮은 서랍장 */
    s += shadow(18, 148, 30, 34, 0.09);
    s += box(18, 148, 28, 32, 22, C.white, 0);
    s += box(18, 148, 28, 2, 2, C.grey, 14);
    s += '<ellipse cx="' + f(P(32, 158, 22)[0]) + '" cy="' + f(P(32, 158, 22)[1]) + '" rx="6" ry="2.6" fill="#EDE7DA"/>';
    s += box(20, 160, 12, 8, 5, C.blush, 22);
    s += box(20, 168, 12, 8, 4, C.sage, 22);
    /* 화이트보드 (이젤) */
    s += box(22, 118, 30, 3, 26, C.white, 0);
    s += polygon([pt(22, 118, 26), pt(52, 118, 26), pt(52, 118, 60), pt(22, 118, 60)].join(' '), '#FFFFFF');
    s += polygon([pt(22, 118, 26), pt(52, 118, 26), pt(52, 118, 60), pt(22, 118, 60)].join(' '), 'none', 'stroke="#E3DAC8" stroke-width="1.6"');
    s += '<line x1="' + f(P(27, 118, 50)[0]) + '" y1="' + f(P(27, 118, 50)[1]) + '" x2="' + f(P(45, 118, 50)[0]) + '" y2="' + f(P(45, 118, 50)[1]) + '" stroke="#CBD9C6" stroke-width="1.6"/>';
    s += '<line x1="' + f(P(27, 118, 42)[0]) + '" y1="' + f(P(27, 118, 42)[1]) + '" x2="' + f(P(40, 118, 42)[0]) + '" y2="' + f(P(40, 118, 42)[1]) + '" stroke="#E7D6CB" stroke-width="1.6"/>';
    /* 원형 테이블 */
    s += roundTable(70, 180, 26, 27, C.white);
    /* 마이크 */
    s += box(60, 172, 3, 3, 18, C.dark, 27);
    s += '<circle cx="' + f(P(61.5, 173.5, 48)[0]) + '" cy="' + f(P(61.5, 173.5, 48)[1]) + '" r="4.6" fill="#4C5763"/>';
    /* 노트북 */
    s += box(78, 172, 20, 14, 2, C.white, 27);
    s += polygon([pt(78, 170, 29), pt(98, 170, 29), pt(98, 170, 39), pt(78, 170, 39)].join(' '), '#5A646F');
    /* 헤드폰 */
    s += '<ellipse cx="' + f(P(66, 190, 29)[0]) + '" cy="' + f(P(66, 190, 29)[1]) + '" rx="6" ry="3.4" fill="#C9D2DC" stroke="#B4BECB"/>';
    /* 스피커 */
    s += box(50, 196, 12, 12, 15, C.grey, 0);
    /* 의자 */
    s += shadow(74, 140, 30, 30, 0.08);
    s += box(78, 142, 26, 24, 3, C.sage, 15);
    s += box(78, 142, 26, 6, 22, C.sage, 18);
    s += box(88, 154, 6, 6, 13, C.sage, 2);
    s += plant(128, 214, 0.85);
    s += polygon([pt(14, 138, 0.9), pt(138, 138, 0.9), pt(138, 238, 0.9), pt(14, 238, 0.9)].join(' '), 'transparent', 'class="zone-hit"');
    s += '<polygon class="zone-ring" points="' + [pt(14, 138, 0.85), pt(138, 138, 0.85), pt(138, 238, 0.85), pt(14, 238, 0.85)].join(' ') + '" fill="none" stroke="#9CC4B2" stroke-width="2"/>';
    s += '</g>';

    /* ===== 패밀리 라운지 (앞-오른쪽) ===== */
    s += '<g class="zone-g" data-part="family" role="button" tabindex="0" aria-label="패밀리 라운지 열기">';
    s += shadow(198, 148, 104, 46, 0.10);
    s += box(200, 148, 100, 12, 32, C.white, 0);
    s += box(200, 160, 100, 32, 16, C.white, 0);
    s += box(196, 146, 10, 48, 24, C.white, 0);
    s += box(294, 146, 10, 48, 24, C.white, 0);
    s += box(206, 160, 40, 28, 4, C.blush, 16);
    s += box(252, 160, 40, 28, 4, C.sage, 16);
    s += box(212, 145, 32, 8, 20, C.blush, 8);
    s += box(252, 145, 32, 8, 20, C.sage, 8);
    /* 쿠션 */
    s += box(214, 158, 16, 14, 7, C.white, 20);
    /* 커피 테이블 */
    s += roundTable(250, 206, 26, 15, C.oak);
    s += box(242, 200, 12, 9, 3, C.white, 15);
    s += '<ellipse cx="' + f(P(246, 204, 18)[0]) + '" cy="' + f(P(246, 204, 18)[1]) + '" rx="4.4" ry="2.4" fill="#EFE5D6"/>';
    s += box(228, 190, 8, 6, 9, C.white, 15);
    s += box(230, 191, 6, 5, 7, C.sage, 24);
    /* 고양이 */
    s += cat(222, 222);
    /* 플로어 램프 */
    s += box(296, 194, 4, 4, 50, C.dark, 0);
    var lp = P(298, 196, 56);
    s += '<path d="M' + f(lp[0] - 15) + ',' + f(lp[1]) + ' L' + f(lp[0] + 15) + ',' + f(lp[1]) + ' L' + f(lp[0] + 9) + ',' + f(lp[1] - 16) + ' L' + f(lp[0] - 9) + ',' + f(lp[1] - 16) + ' Z" fill="#FFF3DA" stroke="#E7D9BC" stroke-width="1.4"/>';
    s += plant(192, 228, 0.95);
    s += polygon([pt(182, 138, 0.9), pt(306, 138, 0.9), pt(306, 238, 0.9), pt(182, 238, 0.9)].join(' '), 'transparent', 'class="zone-hit"');
    s += '<polygon class="zone-ring" points="' + [pt(182, 138, 0.85), pt(306, 138, 0.85), pt(306, 238, 0.85), pt(182, 238, 0.85)].join(' ') + '" fill="none" stroke="#E3B3AC" stroke-width="2"/>';
    s += '</g>';

    /* ===== 중앙 러그 + 똑똑이 ===== */
    s += rug(130, 112, 62, 62, '#F2EEE4', '#E6DFD0');
    s += '<ellipse cx="' + f(P(161, 143, 0)[0]) + '" cy="' + f(P(161, 143, 0)[1]) + '" rx="26" ry="26" fill="none" stroke="#EAE3D4" stroke-width="1" stroke-dasharray="3 4"/>';
    s += critter(161, 132);
    s += '</svg>';

    /* 라벨 — 각 방의 바깥 모서리에 작게 */
    var labels = [
      { id: 'study', e: '🎓', name: '유학 데스크', ax: 40, ay: 8 },
      { id: 'travel', e: '✈️', name: '여행 스튜디오', ax: 296, ay: 30 },
      { id: 'english', e: '🗣️', name: '영어 랩', ax: 34, ay: 208 },
      { id: 'family', e: '🏡', name: '패밀리 라운지', ax: 288, ay: 226 }
    ];
    labels.forEach(function (l) {
      var p = partById(l.id); if (!p) return;
      var xy = P(l.ax, l.ay, 0);
      var left = (xy[0] - VBX) / VBW * 100, top = (xy[1] - VBY) / VBH * 100;
      var pend = pendingOf(p);
      s += '<button class="zlabel" data-part="' + l.id + '" style="left:' + f(left) + '%;top:' + f(top) + '%">' +
        '<i class="zdot" style="background:' + esc(p.accent || '#8C95A3') + '"></i>' + esc(l.name) +
        (pend ? '<span class="zc">' + pend + '</span>' : '<span class="zc done">✓</span>') +
        '</button>';
    });
    var bp = P(161, 132, 0);
    s += '<div class="nametag" style="left:' + f((bp[0] - VBX) / VBW * 100 + 0.5) + '%;top:' + f((bp[1] + 10 - VBY) / VBH * 100) + '%">똑똑이</div>';
    return s;
  }

  /* ================= 렌더 ================= */
  function renderHeader() {
    $('#brandSub').textContent = '똑똑이 비서실 · ' + D.parts.length + '개 파트 가동 중';
    $('#chipParts').textContent = D.parts.length;
    $('#chipTasks').textContent = totalPending();
    var head = totalPending()
      ? '은진 님, 오늘 챙길 일이 ' + totalPending() + '개 있어요'
      : '은진 님, 오늘 할 일은 모두 끝났어요';
    $('#workHead').textContent = head;
    $('#workSub').textContent = totalPending()
      ? '방을 눌러 파트별 현황·할 일·메모를 바로 볼 수 있어요.'
      : '방을 눌러 파트별 메모와 지난 기록을 확인해 보세요.';
    $('#liveBadge').innerHTML = '<i></i>' + (totalPending() ? 'LIVE' : 'DONE');
  }

  function partRow(p) {
    var pend = pendingOf(p), rate = rateOf(p);
    return '<button class="part-row" data-part="' + p.id + '">' +
      '<span class="part-emoji">' + esc(p.emoji) + '</span>' +
      '<span class="part-main">' +
        '<span class="part-title">' + esc(p.title) + '</span>' +
        '<span class="part-sub">' + esc(p.summary || p.room) + '</span>' +
      '</span>' +
      '<span class="part-side">' +
        '<span class="part-cnt' + (pend ? '' : ' zero') + '">' + (pend ? '남은 ' + pend : '완료') + '</span>' +
        '<span class="bar"><i style="width:' + rate + '%"></i></span>' +
      '</span>' +
    '</button>';
  }

  function renderOffice() {
    $('#map').innerHTML = buildMap();
    $('#partList').innerHTML = D.parts.map(partRow).join('');
  }

  function renderStatus() {
    var done = totalDone(), left = totalPending(), total = done + left;
    $('#stDone').textContent = done;
    $('#stLeft').textContent = left;
    $('#stRate').textContent = (total ? Math.round(done / total * 100) : 0) + '%';
    $('#stBar').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    $('#statusList').innerHTML = D.parts.map(function (p) {
      var rate = rateOf(p), pend = pendingOf(p);
      return '<button class="part-row" data-part="' + p.id + '">' +
        '<span class="part-emoji">' + esc(p.emoji) + '</span>' +
        '<span class="part-main">' +
          '<span class="part-title">' + esc(p.title) + '</span>' +
          '<span class="part-sub">' + esc(p.room) + ' · 완료 ' + doneOf(p) + '/' + p.tasks.length + ' · ' + rate + '%</span>' +
        '</span>' +
        '<span class="part-side">' +
          '<span class="part-cnt' + (pend ? '' : ' zero') + '">' + (pend ? '남은 ' + pend : '완료') + '</span>' +
          '<span class="bar"><i style="width:' + rate + '%"></i></span>' +
        '</span>' +
      '</button>';
    }).join('');
  }

  function taskItem(p, t, showTag) {
    return '<div class="task-item' + (t.done ? ' done' : '') + '" data-part="' + p.id + '" data-task="' + t.id + '">' +
      '<button class="chk" data-act="toggle" aria-label="완료 체크">✓</button>' +
      '<div class="tx">' + esc(t.text) + (showTag ? '<span class="task-tag">' + esc(p.emoji) + ' ' + esc(p.title) + '</span>' : '') + '</div>' +
      '<button class="del" data-act="del" aria-label="삭제">✕</button>' +
    '</div>';
  }

  function renderTasks() {
    var open = [], done = [];
    D.parts.forEach(function (p) {
      p.tasks.forEach(function (t) { (t.done ? done : open).push([p, t]); });
    });
    $('#taskCount').textContent = open.length;
    $('#doneCount').textContent = done.length;
    $('#tasksOpen').innerHTML = open.length ? D.parts.filter(function (p) { return pendingOf(p); }).map(function (p) {
      return '<div class="tgroup">' +
        '<div class="tgroup-head"><span class="te">' + esc(p.emoji) + '</span>' + esc(p.title) +
        '<span class="tm">' + pendingOf(p) + '개</span></div>' +
        p.tasks.filter(function (t) { return !t.done; }).map(function (t) { return taskItem(p, t, false); }).join('') +
      '</div>';
    }).join('') : '<article class="card"><p class="muted">남은 할 일이 없어요. 파트에서 새 할 일을 추가할 수 있어요.</p></article>';
    $('#tasksDone').innerHTML = done.length ? D.parts.filter(function (p) { return doneOf(p); }).map(function (p) {
      return '<div class="tgroup">' +
        '<div class="tgroup-head"><span class="te">' + esc(p.emoji) + '</span>' + esc(p.title) +
        '<span class="tm">' + doneOf(p) + '개 완료</span></div>' +
        p.tasks.filter(function (t) { return t.done; }).map(function (t) { return taskItem(p, t, false); }).join('') +
      '</div>';
    }).join('') : '';
    $('#tasksDone').hidden = !doneFoldOpen;
    $('#doneFold').classList.toggle('open', doneFoldOpen);
  }

  function renderMemoTabs() {
    if (!partById(MEMO_PART)) MEMO_PART = (D.parts[0] || {}).id || null;
    $('#memoTabs').innerHTML = D.parts.map(function (p) {
      return '<button class="memo-tab' + (p.id === MEMO_PART ? ' on' : '') + '" data-memo="' + p.id + '">' + esc(p.emoji) + ' ' + esc(p.title) + '</button>';
    }).join('');
    renderMemoBox();
  }

  function renderMemoBox() {
    var p = partById(MEMO_PART);
    var box = $('#memoBox');
    if (!p) { $('#memoTitle').textContent = '메모'; return; }
    $('#memoTitle').textContent = p.emoji + ' ' + p.title + ' 메모';
    if (document.activeElement !== box) box.value = p.memo || '';
    $('#memoState').textContent = '자동 저장 · ' + p.tasks.length + '개 할 일 중 ' + pendingOf(p) + '개 남음';
  }

  function renderSync() {
    var el = $('#syncState'), txt = $('#syncTxt');
    el.classList.remove('on', 'wait', 'off');
    if (cloud.state === 'on') {
      el.classList.add('on');
      txt.textContent = '자동 저장 ' + (cloud.last ? timeAgo(cloud.last) : '켜짐');
    } else if (cloud.state === 'wait') {
      el.classList.add('wait');
      txt.textContent = '연결 중…';
    } else {
      el.classList.add('off');
      txt.textContent = '오프라인 · 기기 저장';
    }
  }
  function timeAgo(ts) {
    var d = Math.round((Date.now() - ts) / 1000);
    if (d < 20) return '방금';
    if (d < 60) return d + '초 전';
    if (d < 3600) return Math.round(d / 60) + '분 전';
    var dt = new Date(ts);
    return ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
  }

  function renderFoot() {
    var dt = new Date(D.updatedAt || Date.now());
    $('#footStamp').textContent = '마지막 저장 ' + (dt.getMonth() + 1) + '월 ' + dt.getDate() + '일 ' +
      ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
  }

  function refresh(opts) {
    opts = opts || {};
    renderHeader(); renderOffice(); renderStatus(); renderTasks(); renderMemoTabs();
    renderSync(); renderFoot();
    if (SHEET_PART && !opts.noSheet) renderSheet();
  }

  /* ================= 파트 패널 ================= */
  function openPart(id) {
    SHEET_PART = id;
    var wrap = $('#sheetWrap');
    renderSheet();
    wrap.hidden = false;
    requestAnimationFrame(function () { wrap.classList.add('show'); });
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    var wrap = $('#sheetWrap');
    wrap.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(function () { if (!wrap.classList.contains('show')) { wrap.hidden = true; SHEET_PART = null; } }, 300);
  }

  function renderSheet() {
    var p = partById(SHEET_PART);
    var body = $('#sheetBody');
    if (!p) { closeSheet(); return; }
    var rate = rateOf(p), pend = pendingOf(p), scroll = body.scrollTop;
    var html = '';
    html += '<div class="sheet-head">' +
      '<span class="sheet-emoji">' + esc(p.emoji) + '</span>' +
      '<div><h2 id="sheetTitle">' + esc(p.title) + '</h2>' +
      '<p class="sheet-room">' + esc(p.room) + ' · ' + (pend ? '할 일 ' + pend + '개 남음' : '할 일 모두 완료') + '</p></div>' +
      '<button class="sheet-x" data-act="close" aria-label="닫기">✕</button>' +
    '</div>';

    html += '<section class="block">' +
      '<h3>핵심 진행 현황<span class="cnt">' + rate + '%</span></h3>' +
      '<div class="prog-row"><span class="bar"><i style="width:' + rate + '%"></i></span><b>' + doneOf(p) + '/' + p.tasks.length + '</b></div>' +
      '<textarea class="sum-edit" data-act="summary" placeholder="이 파트의 핵심 현황을 한 줄로">' + esc(p.summary) + '</textarea>' +
    '</section>';

    html += '<section class="block">' +
      '<h3>할 일<span class="cnt">' + doneOf(p) + '/' + p.tasks.length + '</span></h3>' +
      '<form class="add-task" data-act="addform"><input type="text" class="new-task" placeholder="할 일 추가 (예: 산 안톤 답변 확인)" maxlength="80" /><button type="submit" aria-label="추가">＋</button></form>' +
      '<ul class="tlist">' + (p.tasks.length ? p.tasks.map(function (t) {
        return '<li class="' + (t.done ? 'done' : '') + '" data-task="' + t.id + '">' +
          '<button class="chk" data-act="toggle">✓</button>' +
          '<span class="tx">' + esc(t.text) + '</span>' +
          '<button class="del" data-act="del">✕</button>' +
        '</li>';
      }).join('') : '<li><span class="tx" style="color:#A79E8E">아직 할 일이 없어요.</span></li>') +
      '</ul></section>';

    html += '<section class="block">' +
      '<h3>메모</h3>' +
      '<textarea data-act="memo" rows="5" placeholder="이 파트에서 기억할 것, 다음에 할 일…">' + esc(p.memo) + '</textarea>' +
      '<p class="saved" data-memo-state>자동 저장</p>' +
    '</section>';

    html += '<section class="block"><h3>바로가기</h3>';
    if (p.links && p.links.length) {
      html += '<div class="links">' + p.links.map(function (l) {
        return '<a class="link" href="' + esc(l.url) + '" target="_blank" rel="noopener">🔗 ' + esc(l.label) + '<span class="go">열기 ›</span></a>';
      }).join('') + '</div>';
    } else {
      html += '<p class="nolink">이 파트에 연결된 앱은 아직 없어요. 필요하면 똑똑이에게 만들어 달라고 해 주세요.</p>';
    }
    html += '</section>';

    html += '<section class="block danger-block"><button class="danger-btn" data-act="delpart">이 파트 삭제</button></section>';

    body.innerHTML = html;
    body.scrollTop = scroll;
    var ta = body.querySelector('[data-act="summary"]');
    ta.style.height = 'auto';
    ta.style.height = Math.min(180, Math.max(64, ta.scrollHeight)) + 'px';
  }

  function sheetMemoState(txt) {
    var el = $('#sheetBody [data-memo-state]');
    if (el) el.textContent = txt;
  }

  /* ================= 이벤트 ================= */
  function bind() {
    /* 탭 */
    $('#tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]'); if (!b) return;
      CURRENT_TAB = b.dataset.tab;
      $$('#tabs button').forEach(function (x) {
        var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      ['office', 'status', 'tasks', 'memo'].forEach(function (t) {
        var v = $('#view-' + t); if (v) v.hidden = (t !== CURRENT_TAB);
      });
      if (CURRENT_TAB === 'status') renderStatus();
      if (CURRENT_TAB === 'tasks') renderTasks();
      if (CURRENT_TAB === 'memo') renderMemoTabs();
      window.scrollTo(0, 0);
    });

    /* 오피스 - 맵/목록에서 파트 열기 */
    $('#map').addEventListener('click', function (e) {
      var el = e.target.closest('[data-part]'); if (!el) return;
      openPart(el.dataset.part);
    });
    $('#map').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target.closest('[data-part]'); if (!el) return;
      e.preventDefault(); openPart(el.dataset.part);
    });
    $('#partList').addEventListener('click', function (e) {
      var el = e.target.closest('[data-part]'); if (el) openPart(el.dataset.part);
    });
    $('#statusList').addEventListener('click', function (e) {
      var el = e.target.closest('[data-part]'); if (el) openPart(el.dataset.part);
    });

    /* 할 일 화면 토글/삭제 */
    function taskHit(e) {
      var item = e.target.closest('.task-item'); if (!item) return;
      var p = partById(item.dataset.part), t = null;
      if (!p) return;
      p.tasks.forEach(function (x) { if (x.id === item.dataset.task) t = x; });
      if (!t) return;
      var act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'toggle') {
        t.done = !t.done;
        save();
        item.classList.toggle('done', t.done);
        refresh({ noSheet: true });
      } else if (act.dataset.act === 'del') {
        p.tasks = p.tasks.filter(function (x) { return x.id !== t.id; });
        save(); refresh({ noSheet: true }); toast('할 일을 지웠어요');
      }
    }
    $('#tasksOpen').addEventListener('click', taskHit);
    $('#tasksDone').addEventListener('click', taskHit);
    $('#doneFold').addEventListener('click', function () {
      doneFoldOpen = !doneFoldOpen; renderTasks();
    });

    /* 메모 탭 */
    $('#memoTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-memo]'); if (!b) return;
      MEMO_PART = b.dataset.memo; renderMemoTabs();
    });
    var memoTimer = null;
    $('#memoBox').addEventListener('input', function (e) {
      var p = partById(MEMO_PART); if (!p) return;
      p.memo = e.target.value;
      save();
      $('#memoState').textContent = '저장 중…';
      clearTimeout(memoTimer);
      memoTimer = setTimeout(function () {
        $('#memoState').textContent = '저장됨 · ' + timeAgo(Date.now());
      }, 600);
    });

    /* 파트 추가 */
    $('#addPartForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = $('#newPartName');
      var name = inp.value.trim();
      if (!name) { inp.focus(); return; }
      var emoji = '📌';
      var m = name.match(/^(\p{Extended_Pictographic}+)\s*(.+)$/u);
      if (m) { emoji = m[1]; name = m[2]; }
      D.parts.push({ id: 'p' + uid(), emoji: emoji, title: name, room: '새 파트', accent: '#8C95A3', summary: '', tasks: [], memo: '', links: [] });
      inp.value = '';
      save(); refresh(); toast('파트를 추가했어요');
    });

    /* 패널 내부 */
    var sheetBody = $('#sheetBody');
    var sheetMemoTimer = null;

    sheetBody.addEventListener('click', function (e) {
      var act = e.target.closest('[data-act]'); if (!act) return;
      var p = partById(SHEET_PART); if (!p) return;
      var a = act.dataset.act;
      if (a === 'close') { closeSheet(); return; }
      if (a === 'toggle' || a === 'del') {
        var li = act.closest('li[data-task]'); if (!li) return;
        var tid = li.dataset.task;
        if (a === 'toggle') {
          p.tasks.forEach(function (t) { if (t.id === tid) t.done = !t.done; });
        } else {
          p.tasks = p.tasks.filter(function (t) { return t.id !== tid; });
        }
        save(); refresh();
        return;
      }
      if (a === 'delpart') {
        if (D.parts.length <= 1) { toast('파트는 하나 이상 있어야 해요'); return; }
        if (!window.confirm('"' + p.title + '" 파트와 그 안의 할 일·메모를 지울까요?\n되돌릴 수 없어요.')) return;
        D.parts = D.parts.filter(function (x) { return x.id !== p.id; });
        if (MEMO_PART === p.id) MEMO_PART = D.parts[0].id;
        closeSheet(); save(); refresh(); toast('파트를 지웠어요');
      }
    });

    sheetBody.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-act="addform"]'); if (!form) return;
      e.preventDefault();
      var p = partById(SHEET_PART); if (!p) return;
      var inp = form.querySelector('.new-task');
      var text = (inp.value || '').trim();
      if (!text) { inp.focus(); return; }
      p.tasks.push({ id: uid(), text: text, done: false });
      save(); refresh();
      var again = $('#sheetBody .new-task');
      if (again) again.focus();
    });

    sheetBody.addEventListener('input', function (e) {
      var p = partById(SHEET_PART); if (!p) return;
      var act = e.target.getAttribute('data-act');
      if (act === 'memo') {
        p.memo = e.target.value;
        save();
        sheetMemoState('저장 중…');
        clearTimeout(sheetMemoTimer);
        sheetMemoTimer = setTimeout(function () { sheetMemoState('저장됨 · ' + timeAgo(Date.now())); }, 600);
      } else if (act === 'summary') {
        p.summary = e.target.value;
        save();
        sheetMemoState('저장 중…');
        clearTimeout(sheetMemoTimer);
        sheetMemoTimer = setTimeout(function () { sheetMemoState('저장됨 · ' + timeAgo(Date.now())); }, 600);
      }
    });

    $('#scrim').addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && SHEET_PART) closeSheet();
    });

    /* 백업 / 복원 / 초기화 */
    $('#btnBackup').addEventListener('click', doBackup);
    $('#btnRestore').addEventListener('click', function () { $('#fileInput').click(); });
    $('#fileInput').addEventListener('change', doRestore);
    $('#btnReset').addEventListener('click', doReset);
  }

  /* ================= 백업 · 복원 ================= */
  function stamp() {
    var d = new Date(), p = function (n) { return ('0' + n).slice(-2); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }
  function doBackup() {
    var payload = {
      app: 'eunjin-office-map', kind: 'office_map', owner: 'eunjin', version: 1,
      exportedAt: new Date().toISOString(), doc: D
    };
    var text = JSON.stringify(payload, null, 2);
    var name = '은진-오피스맵-백업-' + stamp() + '.json';
    try {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
      toast('백업 파일을 저장했어요');
    } catch (e) {
      var w = window.open('', '_blank');
      if (w) { w.document.write('<pre style="white-space:pre-wrap;font:12px/1.5 monospace">' + esc(text) + '</pre>'); }
      toast('백업 파일을 열었어요 · 길게 눌러 저장해 주세요');
    }
  }
  function doRestore(e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var raw = JSON.parse(String(reader.result));
        var doc = raw && raw.doc ? raw.doc : raw;
        if (!doc || !Array.isArray(doc.parts)) throw new Error('형식이 달라요');
        if (!window.confirm('백업 파일로 지금 기록을 바꿀까요?\n' + doc.parts.length + '개 파트 · ' + new Date().toLocaleString('ko-KR') + ' 백업')) return;
        applyingRemote = true;
        D = normalize(doc);
        D.touched = true;
        D.rev = Date.now();
        D.updatedAt = D.rev;
        MEMO_PART = (D.parts[0] || {}).id;
        persist();
        applyingRemote = false;
        refresh();
        cloudPush(true);
        toast('백업을 불러왔어요 (' + doc.parts.length + '개 파트)');
      } catch (err) {
        toast('복원 실패 · 오피스맵 백업 파일이 맞는지 확인해 주세요');
      }
    };
    reader.readAsText(file);
  }
  function doReset() {
    if (!window.confirm('할 일·메모를 처음 상태로 되돌릴까요?\n지금 기록은 사라져요. (먼저 백업을 눌러 두면 안전해요)')) return;
    applyingRemote = true;
    D = normalize(clone(DEFAULTS));
    D.rev = Date.now(); D.updatedAt = D.rev; D.touched = true;
    MEMO_PART = (D.parts[0] || {}).id;
    persist();
    applyingRemote = false;
    refresh(); cloudPush(true);
    toast('처음 상태로 되돌렸어요');
  }

  /* ================= 클라우드 동기화 ================= */
  function cloudReady() { return cloud.state === 'on' && !!sb; }
  function schedulePush() {
    if (applyingRemote || !cloudReady()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { cloudPush(false); }, 1100);
  }
  function adopt(doc) {
    applyingRemote = true;
    D = normalize(doc);
    D.touched = true;
    persist();
    applyingRemote = false;
    refresh();
  }
  function cloudPush(force) {
    if (!sb) return Promise.resolve();
    if (!D.touched && !force) return Promise.resolve();
    var doc = clone(D);
    doc.rev = Date.now();
    D.rev = doc.rev; D.updatedAt = doc.rev;
    persist();
    return sb.from(SYNC_TABLE).upsert({ id: MY_ROW, doc: doc, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .then(function (res) {
        if (res && res.error) throw res.error;
        cloud.last = Date.now(); cloud.msg = '';
        renderSync(); renderFoot();
      }, function (err) {
        cloud.msg = '저장 실패';
        renderSync();
        console.warn('[office] 저장 실패', err);
      });
  }
  function cloudPull() {
    if (!sb) return Promise.resolve();
    return sb.from(SYNC_TABLE).select('id,doc,updated_at').eq('id', MY_ROW).then(function (res) {
      if (res.error) throw res.error;
      var row = (res.data || [])[0];
      if (!row || !row.doc || !Array.isArray(row.doc.parts)) {
        /* 서버가 비어 있으면 이 기기 기록을 올린다 */
        cloudPush(true);
        return;
      }
      var srv = row.doc;
      var srvRev = Number(srv.rev) || Date.parse(row.updated_at) || 0;
      var mine = Number(D.rev) || 0;
      if (!D.touched) { adopt(srv); return; }
      if (srvRev > mine) { adopt(srv); return; }
      if (mine > srvRev) { cloudPush(false); }
    });
  }
  function cloudInit() {
    if (typeof supabase === 'undefined' || !supabase || typeof supabase.createClient !== 'function') {
      cloud.state = 'off'; renderSync(); return;
    }
    cloud.state = 'wait'; renderSync();
    try {
      sb = supabase.createClient(CLOUD_URL, CLOUD_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
    } catch (e) { cloud.state = 'off'; renderSync(); return; }
    cloudPull().then(function () {
      cloud.state = 'on'; cloud.last = Date.now(); cloud.booted = true;
      renderSync();
    }).catch(function (e) {
      cloud.state = 'off'; renderSync();
      console.warn('[office] 연결 실패', e);
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (cloudReady()) cloudPush(false);
      return;
    }
    if (!cloudReady()) { cloudInit(); return; }
    cloudPull().catch(function () { });
  });
  window.addEventListener('online', function () { if (!cloudReady()) cloudInit(); });
  window.addEventListener('offline', function () {
    cloud.state = 'off'; renderSync();
  });

  /* ================= 시작 ================= */
  bind();
  refresh();
  renderSync();
  setTimeout(cloudInit, 80);

  /* 테스트용 노출 */
  window.__office = {
    data: function () { return clone(D); },
    save: save,
    refresh: refresh
  };
})();
