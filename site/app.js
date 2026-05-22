/* GIL 予約サイト — 予約は localStorage(gil_bookings) に保存し、店舗管理システムと連携 */

const STORES = [
  { id: 's-nagoya', name: '名古屋店（愛知）', brandIds: ['boss', 'brow', 'gym'] },
  { id: 's-yokaichi', name: '八日市店（滋賀・東近江）', brandIds: ['bright', 'brow'] },
  { id: 's-kuwana', name: '桑名店（三重）', brandIds: ['lash'] },
  { id: 's-toyota', name: '豊田店（愛知）', brandIds: ['brow'] },
];

const BRANDS = {
  brow: {
    name: '8BROW（眉毛サロン）',
    menus: ['眉スタイリング ¥5,500', '眉スタイリング＋メイク ¥7,700',
            'パーフェクトブロウ 初回 ¥6,600', '眉毛パーマ ¥8,800'],
  },
  lash: {
    name: 'Lim eyelash（まつげサロン）',
    menus: ['ラッシュリフト ¥6,600', 'まつげエクステ 120本 ¥7,700',
            'パリジェンヌラッシュリフト ¥7,150'],
  },
  boss: {
    name: 'メンズ脱毛BOSS',
    menus: ['ヒゲ脱毛', 'ボディ脱毛', '全身脱毛 体験'],
  },
  gym: {
    name: 'GOAT TrainingGYM',
    menus: ['パーソナルトレーニング 体験', '入会カウンセリング'],
  },
  bright: {
    name: 'Beauty Bright（美容サロン）',
    menus: ['フェイシャルエステ', '美肌ケア 体験'],
  },
};

const storeSel = document.getElementById('storeSelect');
const brandSel = document.getElementById('brandSelect');
const menuSel = document.getElementById('menuSelect');
const form = document.getElementById('bookingForm');
const done = document.getElementById('bookingDone');

/* 店舗オプション */
STORES.forEach((s) => {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.name;
  storeSel.appendChild(o);
});

function resetSelect(sel, placeholder) {
  sel.innerHTML = '<option value="">' + placeholder + '</option>';
}

/* 店舗 → ブランド */
storeSel.addEventListener('change', () => {
  resetSelect(brandSel, '選択してください');
  resetSelect(menuSel, '先にブランドを選択してください');
  const store = STORES.find((s) => s.id === storeSel.value);
  if (!store) return;
  store.brandIds.forEach((bid) => {
    const o = document.createElement('option');
    o.value = bid;
    o.textContent = BRANDS[bid].name;
    brandSel.appendChild(o);
  });
});

/* ブランド → メニュー */
brandSel.addEventListener('change', () => {
  resetSelect(menuSel, '選択してください');
  const brand = BRANDS[brandSel.value];
  if (!brand) return;
  brand.menus.forEach((m) => {
    const o = document.createElement('option');
    o.value = m;
    o.textContent = m;
    menuSel.appendChild(o);
  });
});

/* 送信 */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const booking = {
    id: Math.random().toString(36).slice(2, 9),
    datetime: fd.get('datetime'),
    store: fd.get('store'),
    brand: fd.get('brand'),
    menu: fd.get('menu'),
    name: fd.get('name'),
    phone: fd.get('phone'),
    email: fd.get('email') || '',
    note: fd.get('note') || '',
    status: 0,
    source: 'web',
  };

  let list = [];
  try { list = JSON.parse(localStorage.getItem('gil_bookings')) || []; } catch { list = []; }
  list.push(booking);
  localStorage.setItem('gil_bookings', JSON.stringify(list));

  const store = STORES.find((s) => s.id === booking.store);
  document.getElementById('doneSummary').textContent =
    `${store ? store.name : ''}／${BRANDS[booking.brand].name}／${booking.menu}` +
    `／${(booking.datetime || '').replace('T', ' ')}`;
  form.hidden = true;
  done.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('againBtn').addEventListener('click', () => {
  form.reset();
  resetSelect(brandSel, '先に店舗を選択してください');
  resetSelect(menuSel, '先にブランドを選択してください');
  form.hidden = false;
  done.hidden = true;
});
