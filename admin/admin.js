/* GIL 店舗管理システム — localStorage ベース / ビルド不要 */

const KEYS = {
  stores: 'gil_stores',
  brands: 'gil_brands',
  staff: 'gil_staff',
  bookings: 'gil_bookings',
  sales: 'gil_sales',
  seeded: 'gil_seeded',
};

/* ---------- 初期データ（株式会社GIL の実構成） ---------- */
const SEED = {
  brands: [
    { id: 'brow', name: '8BROW', type: '眉毛サロン', cls: 'brow',
      policy: '出店継続（グループ主力）。Lim eyelash併設を基本形に中京圏で拡大。' },
    { id: 'lash', name: 'Lim eyelash', type: 'まつげサロン', cls: 'lash',
      policy: '多店舗化の最優先ブランド。標準店モデルを確立し中京圏で展開。' },
    { id: 'boss', name: 'メンズ脱毛BOSS', type: 'メンズ脱毛（FC加盟）', cls: 'boss',
      policy: 'FC加盟。単独出店せず、新規出店時に8BROWへ併設する形でのみ展開。' },
    { id: 'gym', name: 'GOAT TrainingGYM', type: 'トレーニングジム', cls: 'gym',
      policy: '横展開しない。名古屋複合店の差別化要素として維持・最適化。' },
    { id: 'bright', name: 'Beauty Bright', type: '美容（エステ系）', cls: 'bright',
      policy: '八日市複合店の一業態として維持。8BROWと併売。' },
  ],
  stores: [
    { id: 's-nagoya', name: '名古屋店', area: '愛知', beds: 7, brandIds: ['boss', 'brow', 'gym'] },
    { id: 's-yokaichi', name: '八日市店', area: '滋賀・東近江', beds: 5, brandIds: ['bright', 'brow'] },
    { id: 's-kuwana', name: '桑名店', area: '三重', beds: 4, brandIds: ['lash'] },
    { id: 's-toyota', name: '豊田店', area: '愛知', beds: 3, brandIds: ['brow'] },
  ],
  staff: [
    { id: 'st1', name: '佐藤 美咲', storeId: 's-nagoya', brandId: 'brow', role: '店長' },
    { id: 'st2', name: '田中 拓真', storeId: 's-nagoya', brandId: 'boss', role: 'スタイリスト' },
    { id: 'st3', name: '鈴木 涼', storeId: 's-nagoya', brandId: 'gym', role: 'トレーナー' },
    { id: 'st4', name: '高橋 結衣', storeId: 's-yokaichi', brandId: 'brow', role: '店長' },
    { id: 'st5', name: '伊藤 さくら', storeId: 's-yokaichi', brandId: 'bright', role: 'エステティシャン' },
    { id: 'st6', name: '渡辺 narumi', storeId: 's-kuwana', brandId: 'lash', role: '店長' },
    { id: 'st7', name: '山本 桃花', storeId: 's-kuwana', brandId: 'lash', role: 'アイリスト' },
    { id: 'st8', name: '中村 葵', storeId: 's-toyota', brandId: 'brow', role: '店長' },
  ],
  sales: buildSeedSales(),
  bookings: [
    { id: 'bk1', datetime: nextDays(1, 10), store: 's-nagoya', brand: 'brow',
      menu: '眉スタイリング', name: '小林 様', phone: '090-1111-2222', status: 1 },
    { id: 'bk2', datetime: nextDays(1, 14), store: 's-kuwana', brand: 'lash',
      menu: 'ラッシュリフト', name: '加藤 様', phone: '090-3333-4444', status: 0 },
    { id: 'bk3', datetime: nextDays(2, 16), store: 's-nagoya', brand: 'boss',
      menu: 'ヒゲ脱毛', name: '吉田 様', phone: '', status: 1 },
  ],
};

/* 直近3ヶ月の拠点×ブランド売上シード（トントン〜微赤字の前提） */
function buildSeedSales() {
  const rows = [];
  // [storeId, brandId, 基準月商, 客単価]
  const base = [
    ['s-nagoya', 'boss', 1500000, 9000],
    ['s-nagoya', 'brow', 1700000, 5700],
    ['s-nagoya', 'gym', 1200000, 14000],
    ['s-yokaichi', 'bright', 1100000, 8500],
    ['s-yokaichi', 'brow', 1500000, 5500],
    ['s-kuwana', 'lash', 2150000, 6700],
    ['s-toyota', 'brow', 1700000, 5500],
  ];
  const months = lastMonths(3);
  months.forEach((ym, mi) => {
    base.forEach(([storeId, brandId, rev, price]) => {
      const growth = 1 + mi * 0.04; // 再生で緩やかに改善
      const revenue = Math.round((rev * growth) / 10000) * 10000;
      rows.push({
        id: 'sl-' + ym + '-' + storeId + '-' + brandId,
        ym, storeId, brandId,
        revenue,
        customers: Math.round(revenue / price),
      });
    });
  });
  return rows;
}

function lastMonths(n) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(m.getFullYear() + '-' + String(m.getMonth() + 1).padStart(2, '0'));
  }
  return out;
}
function nextDays(days, hour) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00`;
}

/* ---------- DB ---------- */
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

function seedIfNeeded(force) {
  if (!force && localStorage.getItem(KEYS.seeded)) return;
  DB.set(KEYS.brands, SEED.brands);
  DB.set(KEYS.stores, SEED.stores);
  DB.set(KEYS.staff, SEED.staff);
  DB.set(KEYS.sales, SEED.sales);
  // 予約はサイトからの追加分を残すため、強制初期化時のみ上書き
  if (force || DB.get(KEYS.bookings).length === 0) {
    DB.set(KEYS.bookings, SEED.bookings);
  }
  localStorage.setItem(KEYS.seeded, '1');
}

/* ---------- ユーティリティ ---------- */
const yen = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP');
const $ = (sel) => document.querySelector(sel);
const uid = () => Math.random().toString(36).slice(2, 9);
const brandName = (id) => (DB.get(KEYS.brands).find((b) => b.id === id) || {}).name || id;
const brandCls = (id) => (DB.get(KEYS.brands).find((b) => b.id === id) || {}).cls || 'brow';
const storeName = (id) => (DB.get(KEYS.stores).find((s) => s.id === id) || {}).name || id;
const STATUS = ['未対応', '確定', '来店済', 'キャンセル'];

function currentMonth() {
  const months = [...new Set(DB.get(KEYS.sales).map((s) => s.ym))].sort();
  return months[months.length - 1] || lastMonths(1)[0];
}

/* ---------- バー描画 ---------- */
function renderBars(el, items) {
  const max = Math.max(1, ...items.map((i) => i.value));
  el.innerHTML = items.map((i) => `
    <div class="bar-row">
      <div class="bar-label"><span>${i.label}</span><span>${i.display}</span></div>
      <div class="bar-track">
        <div class="bar-fill ${i.cls || ''}" style="width:${(i.value / max) * 100}%"></div>
      </div>
    </div>`).join('');
}

/* ---------- ダッシュボード ---------- */
function renderDashboard() {
  const ym = currentMonth();
  const sales = DB.get(KEYS.sales).filter((s) => s.ym === ym);
  const stores = DB.get(KEYS.stores);
  const brands = DB.get(KEYS.brands);
  const bookings = DB.get(KEYS.bookings);

  const totalRev = sales.reduce((a, s) => a + s.revenue, 0);
  const totalCust = sales.reduce((a, s) => a + s.customers, 0);
  const avg = totalCust ? Math.round(totalRev / totalCust) : 0;

  $('#dash-period').textContent = `対象月: ${ym}（売上データの最新月）`;

  const kpis = [
    { label: '拠点数', value: stores.length + ' 拠点', note: '中京圏（愛知・三重・滋賀）' },
    { label: 'ブランド数', value: brands.length + ' ブランド', note: '全ブランド維持方針' },
    { label: '当月 全社売上', value: yen(totalRev), note: '施術95% / 店販5%' },
    { label: '当月 来店数', value: totalCust.toLocaleString('ja-JP') + ' 名', note: '' },
    { label: '平均客単価', value: yen(avg), note: '' },
    { label: '予約件数', value: bookings.length + ' 件', note: '未対応 ' + bookings.filter((b) => b.status === 0).length + ' 件' },
  ];
  $('#kpiGrid').innerHTML = kpis.map((k) => `
    <div class="kpi">
      <div class="label">${k.label}</div>
      <div class="value">${k.value}</div>
      <div class="note">${k.note}</div>
    </div>`).join('');

  // ブランド別売上
  const byBrand = brands.map((b) => ({
    label: b.name,
    cls: b.cls,
    value: sales.filter((s) => s.brandId === b.id).reduce((a, s) => a + s.revenue, 0),
  })).sort((a, b) => b.value - a.value);
  renderBars($('#brandBars'), byBrand.map((b) => ({ ...b, display: yen(b.value) })));

  // 拠点別売上
  const byStore = stores.map((st) => ({
    label: st.name,
    value: sales.filter((s) => s.storeId === st.id).reduce((a, s) => a + s.revenue, 0),
  })).sort((a, b) => b.value - a.value);
  renderBars($('#storeBars'), byStore.map((s) => ({ ...s, display: yen(s.value) })));

  // 成長方針サマリー（拠点数 / 目標）
  const growth = [
    { label: 'Lim eyelash（多店舗化）', cls: 'lash', cur: 1, goal: 5 },
    { label: '8BROW（出店継続）', cls: 'brow', cur: 3, goal: 6 },
    { label: 'メンズ脱毛BOSS（8BROW併設）', cls: 'boss', cur: 1, goal: 3 },
    { label: 'GOAT（名古屋のみ維持）', cls: 'gym', cur: 1, goal: 1 },
    { label: 'Beauty Bright（八日市で維持）', cls: 'bright', cur: 1, goal: 1 },
  ];
  renderBars($('#growthSummary'), growth.map((g) => ({
    label: g.label, cls: g.cls, value: g.cur,
    display: `現${g.cur}拠点 → 目標${g.goal}拠点`,
  })));
}

/* ---------- 拠点 ---------- */
function renderStores() {
  const ym = currentMonth();
  const sales = DB.get(KEYS.sales).filter((s) => s.ym === ym);
  const staff = DB.get(KEYS.staff);
  $('#storeCards').innerHTML = DB.get(KEYS.stores).map((st) => {
    const rev = sales.filter((s) => s.storeId === st.id).reduce((a, s) => a + s.revenue, 0);
    const cust = sales.filter((s) => s.storeId === st.id).reduce((a, s) => a + s.customers, 0);
    const staffN = staff.filter((s) => s.storeId === st.id).length;
    return `
      <div class="card">
        <h3>${st.name}</h3>
        <div class="meta">${st.area}・複合店（${st.brandIds.length}業態）</div>
        <div class="chips">
          ${st.brandIds.map((b) => `<span class="chip">${brandName(b)}</span>`).join('')}
        </div>
        <div class="stat"><span>当月売上</span><span>${yen(rev)}</span></div>
        <div class="stat"><span>当月来店数</span><span>${cust.toLocaleString('ja-JP')} 名</span></div>
        <div class="stat"><span>ベッド/席数</span><span>${st.beds}</span></div>
        <div class="stat"><span>スタッフ</span><span>${staffN} 名</span></div>
      </div>`;
  }).join('');
}

/* ---------- ブランド ---------- */
function renderBrands() {
  const ym = currentMonth();
  const sales = DB.get(KEYS.sales).filter((s) => s.ym === ym);
  const stores = DB.get(KEYS.stores);
  $('#brandCards').innerHTML = DB.get(KEYS.brands).map((b) => {
    const locs = stores.filter((s) => s.brandIds.includes(b.id));
    const rev = sales.filter((s) => s.brandId === b.id).reduce((a, s) => a + s.revenue, 0);
    return `
      <div class="card">
        <h3>${b.name}</h3>
        <div class="meta">${b.type}</div>
        <div class="chips">
          ${locs.map((s) => `<span class="chip">${s.name}</span>`).join('') || '<span class="chip">出店準備</span>'}
        </div>
        <div class="stat"><span>展開拠点数</span><span>${locs.length} 拠点</span></div>
        <div class="stat"><span>当月売上</span><span>${yen(rev)}</span></div>
        <div class="policy">${b.policy}</div>
      </div>`;
  }).join('');
}

/* ---------- 予約 ---------- */
function renderBookings() {
  const rows = DB.get(KEYS.bookings)
    .slice()
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
  const tb = $('#bookingRows');
  if (!rows.length) {
    tb.innerHTML = '<tr><td class="empty" colspan="7">予約はありません</td></tr>';
    return;
  }
  tb.innerHTML = rows.map((b) => `
    <tr>
      <td>${(b.datetime || '').replace('T', ' ')}</td>
      <td>${storeName(b.store)}</td>
      <td>${brandName(b.brand)}</td>
      <td>${b.menu || ''}</td>
      <td>${b.name || ''}<br><small>${b.phone || ''}</small></td>
      <td><button class="status s${b.status}" data-act="cycle" data-id="${b.id}">${STATUS[b.status]}</button></td>
      <td><button class="del" data-act="del-booking" data-id="${b.id}">削除</button></td>
    </tr>`).join('');
}

/* ---------- スタッフ ---------- */
function renderStaff() {
  const rows = DB.get(KEYS.staff);
  const tb = $('#staffRows');
  if (!rows.length) {
    tb.innerHTML = '<tr><td class="empty" colspan="5">スタッフが登録されていません</td></tr>';
    return;
  }
  tb.innerHTML = rows.map((s) => `
    <tr>
      <td>${s.name}</td>
      <td>${storeName(s.storeId)}</td>
      <td>${brandName(s.brandId)}</td>
      <td>${s.role}</td>
      <td><button class="del" data-act="del-staff" data-id="${s.id}">削除</button></td>
    </tr>`).join('');
}

/* ---------- 売上 ---------- */
function renderSales() {
  const rows = DB.get(KEYS.sales)
    .slice()
    .sort((a, b) => (b.ym + b.storeId).localeCompare(a.ym + a.storeId));
  const tb = $('#salesRows');
  if (!rows.length) {
    tb.innerHTML = '<tr><td class="empty" colspan="7">売上データがありません</td></tr>';
    return;
  }
  tb.innerHTML = rows.map((s) => {
    const avg = s.customers ? Math.round(s.revenue / s.customers) : 0;
    return `
      <tr>
        <td>${s.ym}</td>
        <td>${storeName(s.storeId)}</td>
        <td>${brandName(s.brandId)}</td>
        <td>${yen(s.revenue)}</td>
        <td>${Number(s.customers).toLocaleString('ja-JP')}</td>
        <td>${yen(avg)}</td>
        <td><button class="del" data-act="del-sale" data-id="${s.id}">削除</button></td>
      </tr>`;
  }).join('');
}

/* ---------- セレクト充填 ---------- */
function fillSelects() {
  const stores = DB.get(KEYS.stores);
  const brands = DB.get(KEYS.brands);
  const storeOpts = stores.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
  const brandOpts = brands.map((b) => `<option value="${b.id}">${b.name}</option>`).join('');
  ['#bk-store', '#st-store', '#sl-store'].forEach((id) => { $(id).innerHTML = storeOpts; });
  ['#bk-brand', '#st-brand', '#sl-brand'].forEach((id) => { $(id).innerHTML = brandOpts; });
}

/* ---------- 全体描画 ---------- */
function renderAll() {
  renderDashboard();
  renderStores();
  renderBrands();
  renderBookings();
  renderStaff();
  renderSales();
}

/* ---------- イベント ---------- */
function setupTabs() {
  $('#tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('is-active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('is-active'));
    tab.classList.add('is-active');
    $('#view-' + tab.dataset.view).classList.add('is-active');
  });
}

function setupForms() {
  $('#bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const list = DB.get(KEYS.bookings);
    list.push({
      id: uid(), datetime: f.datetime.value, store: f.store.value,
      brand: f.brand.value, menu: f.menu.value, name: f.name.value,
      phone: f.phone.value, status: 0,
    });
    DB.set(KEYS.bookings, list);
    f.reset();
    renderBookings();
    renderDashboard();
  });

  $('#staffForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const list = DB.get(KEYS.staff);
    list.push({
      id: uid(), name: f.name.value, storeId: f.store.value,
      brandId: f.brand.value, role: f.role.value,
    });
    DB.set(KEYS.staff, list);
    f.reset();
    renderStaff();
    renderStores();
  });

  $('#salesForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const list = DB.get(KEYS.sales);
    list.push({
      id: uid(), ym: f.ym.value, storeId: f.store.value, brandId: f.brand.value,
      revenue: Number(f.revenue.value), customers: Number(f.customers.value),
    });
    DB.set(KEYS.sales, list);
    f.reset();
    renderSales();
    renderAll();
  });
}

function setupTableActions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;

    if (act === 'cycle') {
      const list = DB.get(KEYS.bookings);
      const item = list.find((b) => b.id === id);
      if (item) { item.status = (item.status + 1) % STATUS.length; DB.set(KEYS.bookings, list); }
      renderBookings();
      renderDashboard();
    }
    if (act === 'del-booking') {
      DB.set(KEYS.bookings, DB.get(KEYS.bookings).filter((b) => b.id !== id));
      renderBookings();
      renderDashboard();
    }
    if (act === 'del-staff') {
      DB.set(KEYS.staff, DB.get(KEYS.staff).filter((s) => s.id !== id));
      renderStaff();
      renderStores();
    }
    if (act === 'del-sale') {
      DB.set(KEYS.sales, DB.get(KEYS.sales).filter((s) => s.id !== id));
      renderAll();
    }
  });

  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('全データを初期状態に戻します。よろしいですか?')) return;
    seedIfNeeded(true);
    fillSelects();
    renderAll();
  });
}

/* ---------- 起動 ---------- */
seedIfNeeded(false);
fillSelects();
renderAll();
setupTabs();
setupForms();
setupTableActions();
