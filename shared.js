/* English Adventure Family — shared wallet, streak, and reward-shop logic.
   Loaded by index.html, first-ocean-explorer.html, second-princess-library.html, reward-shop.html.
   Everything lives in this browser's localStorage — nothing leaves the device. */

const EAF_WALLET_KEY = 'eaf-wallet-v1';
const EAF_MAX_ACTIVE_STICKERS = 3;

const eafRewardCatalog = [
  { id: 'fox-scout', category: 'profile', title: 'Fox Scout', korean: '여우 탐험가', price: 8, emoji: '🦊' },
  { id: 'owl-listener', category: 'profile', title: 'Owl Listener', korean: '부엉이 리스너', price: 12, emoji: '🦉' },
  { id: 'cloud-pilot', category: 'profile', title: 'Cloud Pilot', korean: '구름 파일럿', price: 16, emoji: '☁️' },
  { id: 'rainbow-keeper', category: 'profile', title: 'Rainbow Keeper', korean: '무지개 수호자', price: 20, emoji: '🌈' },
  { id: 'brave-voice', category: 'sticker', title: 'Brave Voice', korean: '용감한 목소리', price: 5, emoji: '🎤' },
  { id: 'book-bloom', category: 'sticker', title: 'Book Bloom', korean: '책꽃', price: 6, emoji: '📚' },
  { id: 'star-spark', category: 'sticker', title: 'Star Spark', korean: '반짝별', price: 7, emoji: '⭐' },
  { id: 'kind-helper', category: 'sticker', title: 'Kind Helper', korean: '친절한 친구', price: 9, emoji: '🤝' },
];

function eafDefaultWallet() {
  return {
    stars: 0,
    streak: 0,
    lastActiveDate: null,
    ownedRewardIds: [],
    equippedAvatarId: null,
    activeStickerIds: [],
  };
}

function eafGetWallet() {
  try {
    const raw = localStorage.getItem(EAF_WALLET_KEY);
    if (!raw) return eafDefaultWallet();
    const parsed = JSON.parse(raw);
    return { ...eafDefaultWallet(), ...parsed };
  } catch {
    return eafDefaultWallet();
  }
}

function eafSaveWallet(wallet) {
  localStorage.setItem(EAF_WALLET_KEY, JSON.stringify(wallet));
}

function eafTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function eafYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Bumps the streak once per calendar day. Call this whenever the learner
// does something meaningful (finishes a 3x repeat, earns a star, etc).
function eafTouchStreak(wallet) {
  const today = eafTodayKey();
  if (wallet.lastActiveDate === today) return wallet;
  const streak = wallet.lastActiveDate === eafYesterdayKey() ? wallet.streak + 1 : 1;
  return { ...wallet, streak, lastActiveDate: today };
}

// Adds stars to the shared wallet and updates the streak. Returns the new wallet.
function eafAddStars(amount) {
  let wallet = eafGetWallet();
  wallet = eafTouchStreak(wallet);
  wallet.stars = Math.max(0, wallet.stars + amount);
  eafSaveWallet(wallet);
  return wallet;
}

// Buys a reward, or toggles equip/remove if already owned.
// Returns { wallet, action } where action is one of:
// 'purchased' | 'equipped' | 'removed' | 'insufficient' | 'limit'
function eafBuyOrToggleReward(itemId) {
  const item = eafRewardCatalog.find((r) => r.id === itemId);
  if (!item) return { wallet: eafGetWallet(), action: 'insufficient' };
  let wallet = eafGetWallet();
  const owned = wallet.ownedRewardIds.includes(item.id);

  if (!owned) {
    if (wallet.stars < item.price) return { wallet, action: 'insufficient' };
    wallet = { ...wallet, stars: wallet.stars - item.price, ownedRewardIds: [...wallet.ownedRewardIds, item.id] };
    if (item.category === 'profile') {
      wallet.equippedAvatarId = item.id;
    } else if (wallet.activeStickerIds.length < EAF_MAX_ACTIVE_STICKERS) {
      wallet.activeStickerIds = [...wallet.activeStickerIds, item.id];
    }
    eafSaveWallet(wallet);
    return { wallet, action: 'purchased' };
  }

  if (item.category === 'profile') {
    wallet = { ...wallet, equippedAvatarId: item.id };
    eafSaveWallet(wallet);
    return { wallet, action: 'equipped' };
  }

  if (wallet.activeStickerIds.includes(item.id)) {
    wallet = { ...wallet, activeStickerIds: wallet.activeStickerIds.filter((id) => id !== item.id) };
    eafSaveWallet(wallet);
    return { wallet, action: 'removed' };
  }

  if (wallet.activeStickerIds.length >= EAF_MAX_ACTIVE_STICKERS) {
    return { wallet, action: 'limit' };
  }
  wallet = { ...wallet, activeStickerIds: [...wallet.activeStickerIds, item.id] };
  eafSaveWallet(wallet);
  return { wallet, action: 'equipped' };
}

function eafEquippedAvatarEmoji(fallbackEmoji) {
  const wallet = eafGetWallet();
  const item = eafRewardCatalog.find((r) => r.id === wallet.equippedAvatarId);
  return item ? item.emoji : fallbackEmoji;
}
