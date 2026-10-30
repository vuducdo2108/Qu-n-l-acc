// Global State
let allAccounts = [];
let filteredAccounts = [];
let viewMode = 'card'; // 'card' or 'table'
let currentTab = 'accounts';
let uploadedModalImages = [];
let rankChartInstance = null;
let infoChartInstance = null;
let rentalTimerInterval = null;

// Rank badge color mapper
const RANK_STYLES = {
  'Thách Đấu': 'rank-thachdau',
  'Chiến Tướng': 'rank-chientuong',
  'Cao Thủ': 'rank-caothu',
  'Tinh Anh': 'rank-tinhanh',
  'Kim Cương': 'rank-kimcuong',
  'Bạch Kim': 'rank-bachkim',
  'Vàng': 'rank-vang',
  'Bạc': 'rank-bac',
  'Đồng': 'rank-dong'
};

const STATUS_BADGES = {
  'Sẵn sàng bán': 'status-badge-available',
  'Đang cho thuê': 'status-badge-renting',
  'Đã bán': 'status-badge-sold',
  'Tài khoản cá nhân': 'status-badge-personal'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadAccounts();
  loadStats();
  
  // Start rental countdown timer loop
  rentalTimerInterval = setInterval(updateRentalTimers, 1000);
});

// Format VND currency
function formatVND(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Fetch Accounts from Backend
async function loadAccounts() {
  try {
    const res = await fetch('/api/accounts');
    const result = await res.json();
    if (result.success) {
      allAccounts = result.data;
      applyFilters();
      updateHeaderBadges();
      renderRentalsTable();
    }
  } catch (err) {
    console.error('Lỗi tải danh sách tài khoản:', err);
    showToast('error', 'Không thể kết nối đến máy chủ!');
  }
}

// Fetch & Update Stats Dashboard
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const result = await res.json();
    if (result.success) {
      const stats = result.data;
      
      document.getElementById('stat-cost').textContent = formatVND(stats.totalInventoryCost);
      document.getElementById('stat-value').textContent = formatVND(stats.totalInventoryValue);
      document.getElementById('stat-revenue').textContent = formatVND(stats.totalRevenue);
      document.getElementById('stat-profit').textContent = formatVND(stats.totalProfit);

      renderCharts(stats.rankDistribution, stats.infoDistribution);
    }
  } catch (err) {
    console.error('Lỗi tải thống kê:', err);
  }
}

// Update Top Bar Mini Badges
function updateHeaderBadges() {
  const available = allAccounts.filter(a => a.status === 'Sẵn sàng bán').length;
  const renting = allAccounts.filter(a => a.status === 'Đang cho thuê').length;
  const sold = allAccounts.filter(a => a.status === 'Đã bán').length;

  document.getElementById('badge-available').textContent = available;
  document.getElementById('badge-renting').textContent = renting;
  document.getElementById('badge-sold').textContent = sold;

  document.getElementById('count-all').textContent = allAccounts.length;
  document.getElementById('count-rentals').textContent = renting;
  document.getElementById('rental-active-count').textContent = renting;
}

// Tab Switching
function switchTab(tabId) {
  currentTab = tabId;
  const tabs = ['accounts', 'rentals', 'stats', 'bulk', 'backup'];
  
  tabs.forEach(t => {
    const viewEl = document.getElementById(`view-${t}`);
    const tabBtn = document.getElementById(`tab-${t}`);
    
    if (t === tabId) {
      viewEl.classList.remove('hidden');
      tabBtn.className = 'tab-btn px-4 py-2 rounded-lg font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 whitespace-nowrap transition-colors';
    } else {
      viewEl.classList.add('hidden');
      tabBtn.className = 'tab-btn px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 whitespace-nowrap transition-colors';
    }
  });

  if (tabId === 'stats') {
    loadStats();
  } else if (tabId === 'rentals') {
    renderRentalsTable();
  }
}

// Set View Mode (Card vs Table)
function setViewMode(mode) {
  viewMode = mode;
  const btnCard = document.getElementById('btn-view-card');
  const btnTable = document.getElementById('btn-view-table');

  if (mode === 'card') {
    btnCard.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 flex items-center gap-1.5 transition';
    btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition';
  } else {
    btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 flex items-center gap-1.5 transition';
    btnCard.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition';
  }

  renderAccounts();
}

// Search & Filter Handlers
function handleSearch() {
  applyFilters();
}

function applyFilters() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  const rankFilter = document.getElementById('filter-rank').value;
  const statusFilter = document.getElementById('filter-status').value;
  const infoFilter = document.getElementById('filter-info').value;
  const priceFilter = document.getElementById('filter-price').value;
  const sortBy = document.getElementById('filter-sort').value;

  filteredAccounts = allAccounts.filter(acc => {
    // Search
    if (searchQuery) {
      const matchId = (acc.id || '').toLowerCase().includes(searchQuery);
      const matchIngame = (acc.ingameName || '').toLowerCase().includes(searchQuery);
      const matchUser = (acc.username || '').toLowerCase().includes(searchQuery);
      const matchNotes = (acc.notes || '').toLowerCase().includes(searchQuery);
      const matchSkin = (acc.featuredSkins || []).some(s => s.toLowerCase().includes(searchQuery));
      if (!matchId && !matchIngame && !matchUser && !matchNotes && !matchSkin) return false;
    }

    // Rank
    if (rankFilter !== 'all' && acc.rank !== rankFilter) return false;

    // Status
    if (statusFilter !== 'all' && acc.status !== statusFilter) return false;

    // Info
    if (infoFilter !== 'all' && acc.infoStatus !== infoFilter) return false;

    // Price
    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number);
      const price = acc.salePrice || 0;
      if (price < min || price > max) return false;
    }

    return true;
  });

  // Sorting
  if (sortBy === 'price_asc') {
    filteredAccounts.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
  } else if (sortBy === 'price_desc') {
    filteredAccounts.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
  } else if (sortBy === 'skins_desc') {
    filteredAccounts.sort((a, b) => (b.skinCount || 0) - (a.skinCount || 0));
  } else if (sortBy === 'heroes_desc') {
    filteredAccounts.sort((a, b) => (b.heroCount || 0) - (a.heroCount || 0));
  } else {
    // Newest
    filteredAccounts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  // Update active filter tag indicators
  updateFilterResetBar();

  renderAccounts();
}

function updateFilterResetBar() {
  const resetBar = document.getElementById('filter-reset-bar');
  const tagsContainer = document.getElementById('active-filter-tags');
  tagsContainer.innerHTML = '';

  const rank = document.getElementById('filter-rank').value;
  const status = document.getElementById('filter-status').value;
  const info = document.getElementById('filter-info').value;
  const price = document.getElementById('filter-price').value;
  const search = document.getElementById('search-input').value.trim();

  let hasActive = false;

  const addTag = (text) => {
    hasActive = true;
    const tag = document.createElement('span');
    tag.className = 'px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium text-[11px]';
    tag.textContent = text;
    tagsContainer.appendChild(tag);
  };

  if (search) addTag(`Tìm kiếm: "${search}"`);
  if (rank !== 'all') addTag(`Rank: ${rank}`);
  if (status !== 'all') addTag(`Trạng thái: ${status}`);
  if (info !== 'all') addTag(`Thông tin: ${info}`);
  if (price !== 'all') addTag(`Mức giá đã lọc`);

  if (hasActive) {
    resetBar.classList.remove('hidden');
  } else {
    resetBar.classList.add('hidden');
  }
}

function resetAllFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-rank').value = 'all';
  document.getElementById('filter-status').value = 'all';
  document.getElementById('filter-info').value = 'all';
  document.getElementById('filter-price').value = 'all';
  document.getElementById('filter-sort').value = 'newest';
  applyFilters();
}

// Render Accounts View (Card or Table)
function renderAccounts() {
  const container = document.getElementById('accounts-container');
  
  if (filteredAccounts.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center py-16 px-4 rounded-2xl">
        <div class="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500 text-2xl mb-4">
          <i class="fa-solid fa-gamepad"></i>
        </div>
        <h4 class="text-base font-bold text-slate-300">Không tìm thấy tài khoản phù hợp</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Vui lòng thử điều chỉnh lại từ khóa tìm kiếm hoặc các bộ lọc rank, mức giá.</p>
        <button onclick="resetAllFilters()" class="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition">
          <i class="fa-solid fa-rotate-left"></i> Đặt lại bộ lọc
        </button>
      </div>
    `;
    return;
  }

  if (viewMode === 'card') {
    renderCardView(container);
  } else {
    renderTableView(container);
  }
}

// Render Card Grid View
function renderCardView(container) {
  const cardsHtml = filteredAccounts.map(acc => {
    const rankStyle = RANK_STYLES[acc.rank] || 'rank-kimcuong';
    const statusStyle = STATUS_BADGES[acc.status] || 'status-badge-available';
    const profit = (acc.salePrice || 0) - (acc.costPrice || 0);
    const hasImage = acc.images && acc.images.length > 0;
    const coverImage = hasImage ? acc.images[0] : null;

    // Featured skins badges
    const skinsHtml = (acc.featuredSkins || []).slice(0, 4).map(skin => `
      <span class="skin-tag px-2 py-0.5 rounded text-[11px] font-medium truncate max-w-[200px]" title="${escapeHtml(skin)}">
        <i class="fa-solid fa-gem text-[10px] mr-1 opacity-75"></i>${escapeHtml(skin)}
      </span>
    `).join('');

    const moreSkinsCount = (acc.featuredSkins || []).length > 4 ? `+${(acc.featuredSkins || []).length - 4}` : '';

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col relative group">
        
        <!-- Top Image / Banner -->
        <div class="relative h-36 bg-gradient-to-t from-[#0d1322] to-slate-800 overflow-hidden cursor-pointer" onclick="${coverImage ? `openLightbox('${coverImage}')` : `openEditModal('${acc.id}')`}">
          ${coverImage ? `
            <img src="${coverImage}" alt="${escapeHtml(acc.ingameName)}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300">
            <div class="absolute inset-0 bg-gradient-to-t from-[#0e1626] via-black/30 to-transparent"></div>
          ` : `
            <div class="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-radial from-slate-800 to-[#0e1626]">
              <i class="fa-solid fa-gamepad text-3xl mb-1 opacity-40"></i>
              <span class="text-[11px] text-slate-500">Chưa có ảnh bìa</span>
            </div>
          `}

          <!-- Rank Badge Overlay -->
          <div class="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${rankStyle} shadow-lg">
            <i class="fa-solid fa-crown text-[11px]"></i>
            <span>${acc.rank}</span>
            ${acc.stars > 0 ? `<span class="ml-0.5 text-amber-200">★${acc.stars}</span>` : ''}
          </div>

          <!-- Status Badge Overlay -->
          <div class="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyle} backdrop-blur-md shadow-md">
            ${acc.status}
          </div>

          <!-- ID & In-game name overlay at bottom -->
          <div class="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
            <div class="truncate">
              <span class="text-[10px] text-amber-400/90 font-mono font-bold tracking-wider">${acc.id}</span>
              <h3 class="text-sm font-bold text-white truncate drop-shadow">${escapeHtml(acc.ingameName || 'Liên Quân Player')}</h3>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 border border-slate-700/80 text-cyan-300">
              ${acc.infoStatus}
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3.5">
          
          <!-- Key Ingame Stats -->
          <div class="grid grid-cols-4 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <div>
              <span class="block text-[10px] text-slate-400">Tướng</span>
              <span class="text-xs font-bold text-slate-100">${acc.heroCount || 0}</span>
            </div>
            <div>
              <span class="block text-[10px] text-slate-400">Trang phục</span>
              <span class="text-xs font-bold text-amber-400">${acc.skinCount || 0}</span>
            </div>
            <div>
              <span class="block text-[10px] text-slate-400">Tỉ lệ thắng</span>
              <span class="text-xs font-bold text-emerald-400">${acc.winRate ? acc.winRate + '%' : '--'}</span>
            </div>
            <div>
              <span class="block text-[10px] text-slate-400">Ngọc</span>
              <span class="text-xs font-bold text-cyan-400 truncate block px-0.5" title="${escapeHtml(acc.gemPages || '')}">${escapeHtml(acc.gemPages ? (acc.gemPages.includes('Full') ? 'Full 90' : acc.gemPages) : '--')}</span>
            </div>
          </div>

          <!-- Featured Skins Badges -->
          <div>
            <div class="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Trang phục nổi bật:</span>
              ${moreSkinsCount ? `<span class="text-amber-400 font-bold">${moreSkinsCount} skin khác</span>` : ''}
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${skinsHtml || '<span class="text-[11px] text-slate-500 italic">Chưa cập nhật skin nổi bật</span>'}
            </div>
          </div>

          <!-- Quick Copy Account Credentials Box -->
          <div class="p-2.5 rounded-xl bg-black/40 border border-slate-800/80 space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-mono text-[11px] truncate flex-1 mr-2">
                <i class="fa-solid fa-user text-slate-500 mr-1 text-[10px]"></i>
                <span class="text-slate-200 select-all">${escapeHtml(acc.username)}</span>
              </span>
              <button onclick="copyToClipboard('${escapeJs(acc.username)}', 'Đã copy tài khoản!')" class="text-slate-400 hover:text-amber-400 p-1 transition" title="Sao chép tài khoản">
                <i class="fa-regular fa-copy"></i>
              </button>
            </div>

            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-mono text-[11px] truncate flex-1 mr-2 flex items-center">
                <i class="fa-solid fa-lock text-slate-500 mr-1 text-[10px]"></i>
                <span id="pwd-${acc.id}" class="text-slate-200 select-all tracking-wider">••••••••</span>
              </span>
              <div class="flex items-center gap-1">
                <button onclick="togglePasswordVisibility('${acc.id}', '${escapeJs(acc.password)}')" class="text-slate-400 hover:text-amber-400 p-1 transition" title="Ẩn/Hiện mật khẩu">
                  <i id="eye-${acc.id}" class="fa-regular fa-eye"></i>
                </button>
                <button onclick="copyToClipboard('${escapeJs(acc.password)}', 'Đã copy mật khẩu!')" class="text-slate-400 hover:text-amber-400 p-1 transition" title="Sao chép mật khẩu">
                  <i class="fa-regular fa-copy"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Price & Profit Section -->
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span class="block text-[10px] text-slate-400">Giá bán niêm yết:</span>
              <span class="text-base font-bold font-gaming text-amber-400 glow-gold">${formatVND(acc.salePrice)}</span>
            </div>
            <div class="text-right">
              <span class="block text-[10px] text-slate-400">Vốn: ${formatVND(acc.costPrice)}</span>
              <span class="text-xs font-semibold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}">
                Lãi: ${profit >= 0 ? '+' : ''}${formatVND(profit)}
              </span>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div class="grid grid-cols-4 gap-1.5 pt-2">
            
            <!-- Handover bill -->
            <button onclick="openBillModal('${acc.id}')" title="Tạo bill bàn giao khách" class="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1 transition">
              <i class="fa-solid fa-receipt"></i>
              <span class="hidden sm:inline">Bill</span>
            </button>

            <!-- Mark Sold or Change Status -->
            ${acc.status === 'Đang cho thuê' ? `
              <button onclick="returnRentAccount('${acc.id}')" title="Nhận lại nick" class="col-span-2 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition">
                <i class="fa-solid fa-rotate-left"></i> Nhận Lại
              </button>
            ` : acc.status !== 'Đã bán' ? `
              <button onclick="openRentModal('${acc.id}')" title="Cho thuê nick" class="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1 transition">
                <i class="fa-solid fa-stopwatch"></i>
                <span class="hidden sm:inline">Thuê</span>
              </button>
              <button onclick="openSellModal('${acc.id}')" title="Đánh dấu đã bán" class="py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition">
                <i class="fa-solid fa-check"></i>
                <span class="hidden sm:inline">Bán</span>
              </button>
            ` : `
              <div class="col-span-2 py-2 rounded-lg bg-slate-800/50 text-slate-400 text-[11px] font-semibold flex items-center justify-center gap-1">
                <i class="fa-solid fa-circle-check text-blue-400"></i> Đã bán
              </div>
            `}

            <!-- Edit / Delete Menu -->
            <button onclick="openEditModal('${acc.id}')" title="Chỉnh sửa thông tin" class="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center transition">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>

          </div>

        </div>

      </div>
    `;
  }).join('');

  container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';
  container.innerHTML = cardsHtml;
}

// Render Table View
function renderTableView(container) {
  const rowsHtml = filteredAccounts.map(acc => {
    const rankStyle = RANK_STYLES[acc.rank] || 'rank-kimcuong';
    const statusStyle = STATUS_BADGES[acc.status] || 'status-badge-available';
    const profit = (acc.salePrice || 0) - (acc.costPrice || 0);

    return `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <!-- ID & In-game -->
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs text-amber-400 font-bold">${acc.id}</span>
            <div>
              <div class="font-bold text-slate-100 flex items-center gap-1.5">
                ${escapeHtml(acc.ingameName || 'Liên Quân Player')}
              </div>
              <span class="text-[11px] text-slate-400">${escapeHtml(acc.username)}</span>
            </div>
          </div>
        </td>

        <!-- Rank & Stars -->
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${rankStyle} inline-flex items-center gap-1">
            ${acc.rank} ${acc.stars > 0 ? `★${acc.stars}` : ''}
          </span>
        </td>

        <!-- Heroes & Skins -->
        <td class="py-3 px-4">
          <div class="text-xs">
            <span class="text-slate-300 font-semibold">${acc.heroCount || 0}</span> <span class="text-slate-500">tướng</span> / 
            <span class="text-amber-400 font-bold">${acc.skinCount || 0}</span> <span class="text-slate-500">skin</span>
          </div>
          <div class="text-[11px] text-slate-400">${acc.winRate ? acc.winRate + '% WR' : ''}</div>
        </td>

        <!-- Info Status -->
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 border border-slate-700 text-cyan-300">
            ${acc.infoStatus}
          </span>
        </td>

        <!-- Price & Profit -->
        <td class="py-3 px-4">
          <div class="font-bold font-gaming text-amber-400 text-sm">${formatVND(acc.salePrice)}</div>
          <div class="text-[11px] ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}">
            Lãi: ${profit >= 0 ? '+' : ''}${formatVND(profit)}
          </div>
        </td>

        <!-- Status -->
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyle}">
            ${acc.status}
          </span>
        </td>

        <!-- Actions -->
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="copyAccountCredentials('${escapeJs(acc.username)}', '${escapeJs(acc.password)}')" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs" title="Copy TK & MK">
              <i class="fa-solid fa-copy"></i>
            </button>
            <button onclick="openBillModal('${acc.id}')" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs" title="Tạo Bill Bàn Giao">
              <i class="fa-solid fa-receipt"></i>
            </button>
            ${acc.status === 'Sẵn sàng bán' ? `
              <button onclick="openSellModal('${acc.id}')" class="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs" title="Đã Bán">
                <i class="fa-solid fa-check"></i>
              </button>
              <button onclick="openRentModal('${acc.id}')" class="p-2 rounded-lg bg-amber-800 hover:bg-amber-700 text-amber-200 text-xs" title="Cho Thuê">
                <i class="fa-solid fa-stopwatch"></i>
              </button>
            ` : ''}
            <button onclick="openEditModal('${acc.id}')" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs" title="Sửa">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="confirmDelete('${acc.id}')" class="p-2 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-400 text-xs" title="Xóa">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.className = 'glass-panel rounded-2xl overflow-hidden';
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-700">
          <tr>
            <th class="py-3.5 px-4">Tài Khoản & Ingame</th>
            <th class="py-3.5 px-4">Bậc Rank</th>
            <th class="py-3.5 px-4">Tướng & Trang Phục</th>
            <th class="py-3.5 px-4">Bảo Mật</th>
            <th class="py-3.5 px-4">Giá Bán</th>
            <th class="py-3.5 px-4">Trạng Thái</th>
            <th class="py-3.5 px-4 text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Render Rentals Table
function renderRentalsTable() {
  const tableBody = document.getElementById('rentals-table-body');
  const emptyView = document.getElementById('empty-rentals');
  const rentingAccs = allAccounts.filter(a => a.status === 'Đang cho thuê');

  if (rentingAccs.length === 0) {
    tableBody.innerHTML = '';
    emptyView.classList.remove('hidden');
    return;
  }

  emptyView.classList.add('hidden');

  tableBody.innerHTML = rentingAccs.map(acc => {
    const rent = acc.rentalInfo || {};
    const startTimeStr = rent.startTime ? new Date(rent.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '--';

    return `
      <tr class="hover:bg-slate-800/40">
        <td class="py-3 px-4">
          <div class="font-bold text-slate-200">${escapeHtml(acc.ingameName)}</div>
          <div class="text-xs text-slate-400 font-mono">${escapeHtml(acc.username)} (${acc.id})</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-200">${escapeHtml(rent.renterName || 'Khách thuê')}</div>
          <div class="text-xs text-slate-400">${escapeHtml(rent.renterContact || 'Không có')}</div>
        </td>
        <td class="py-3 px-4 font-bold text-amber-400 font-gaming text-sm">
          ${formatVND(rent.rentPrice || 0)}
        </td>
        <td class="py-3 px-4 text-xs text-slate-300">
          Từ: ${startTimeStr}
          ${rent.notes ? `<div class="text-slate-400 italic text-[11px] mt-0.5">${escapeHtml(rent.notes)}</div>` : ''}
        </td>
        <td class="py-3 px-4">
          <span id="rental-timer-${acc.id}" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
            Đang tính...
          </span>
        </td>
        <td class="py-3 px-4 text-center">
          <button onclick="returnRentAccount('${acc.id}')" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow transition">
            <i class="fa-solid fa-rotate-left mr-1"></i> Nhận Lại Nick
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updateRentalTimers();
}

// Countdown timer loop for active rentals
function updateRentalTimers() {
  const rentingAccs = allAccounts.filter(a => a.status === 'Đang cho thuê');
  const now = new Date().getTime();

  rentingAccs.forEach(acc => {
    const el = document.getElementById(`rental-timer-${acc.id}`);
    if (!el || !acc.rentalInfo || !acc.rentalInfo.endTime) return;

    const endTime = new Date(acc.rentalInfo.endTime).getTime();
    const distance = endTime - now;

    if (distance <= 0) {
      el.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 font-mono animate-pulse';
      el.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Đã Hết Giờ!';
    } else {
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      el.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }
  });
}

// Chart.js Rendering for Statistics Tab
function renderCharts(rankDist, infoDist) {
  // 1. Rank Bar Chart
  const rankCanvas = document.getElementById('chart-ranks');
  if (rankCanvas) {
    const ctx = rankCanvas.getContext('2d');
    if (rankChartInstance) rankChartInstance.destroy();

    const rankLabels = Object.keys(rankDist || {});
    const rankCounts = Object.values(rankDist || {});

    rankChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rankLabels,
        datasets: [{
          label: 'Số lượng tài khoản',
          data: rankCounts,
          backgroundColor: [
            '#b45309', '#94a3b8', '#f59e0b', '#cbd5e1', '#38bdf8', '#10b981', '#f43f5e', '#f97316', '#ec4899'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          x: {
            ticks: { color: '#94a3b8', font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Info Status Doughnut Chart
  const infoCanvas = document.getElementById('chart-info');
  if (infoCanvas) {
    const ctx2 = infoCanvas.getContext('2d');
    if (infoChartInstance) infoChartInstance.destroy();

    const infoLabels = Object.keys(infoDist || {});
    const infoCounts = Object.values(infoDist || {});

    infoChartInstance = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: infoLabels,
        datasets: [{
          data: infoCounts,
          backgroundColor: [
            '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'
          ],
          borderWidth: 2,
          borderColor: '#131a2a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  }
}

// Modal Handlers: Add / Edit Account
function openAddModal() {
  document.getElementById('modal-account-title').innerHTML = '<i class="fa-solid fa-plus text-amber-400"></i> Thêm Tài Khoản Mới';
  document.getElementById('acc-form-id').value = '';
  document.getElementById('form-account').reset();
  
  uploadedModalImages = [];
  renderModalImagePreviews();

  document.getElementById('modal-account').classList.remove('hidden');
}

function openEditModal(id) {
  const acc = allAccounts.find(a => a.id === id);
  if (!acc) return;

  document.getElementById('modal-account-title').innerHTML = `<i class="fa-solid fa-pen-to-square text-amber-400"></i> Sửa Tài Khoản: ${acc.id}`;
  document.getElementById('acc-form-id').value = acc.id;

  document.getElementById('acc-loginType').value = acc.loginType || 'Garena';
  document.getElementById('acc-username').value = acc.username || '';
  document.getElementById('acc-password').value = acc.password || '';
  document.getElementById('acc-authCode').value = acc.authCode || '';
  document.getElementById('acc-infoStatus').value = acc.infoStatus || 'Trắng thông tin';

  document.getElementById('acc-ingameName').value = acc.ingameName || '';
  document.getElementById('acc-rank').value = acc.rank || 'Tinh Anh';
  document.getElementById('acc-stars').value = acc.stars || 0;
  document.getElementById('acc-maxRank').value = acc.maxRank || '';
  document.getElementById('acc-heroCount').value = acc.heroCount || 0;
  document.getElementById('acc-skinCount').value = acc.skinCount || 0;
  document.getElementById('acc-winRate').value = acc.winRate || 50.0;
  document.getElementById('acc-gemPages').value = acc.gemPages || '';
  document.getElementById('acc-featuredSkins').value = (acc.featuredSkins || []).join(', ');

  document.getElementById('acc-costPrice').value = acc.costPrice || 0;
  document.getElementById('acc-salePrice').value = acc.salePrice || 0;
  document.getElementById('acc-status').value = acc.status || 'Sẵn sàng bán';
  document.getElementById('acc-notes').value = acc.notes || '';

  uploadedModalImages = Array.isArray(acc.images) ? [...acc.images] : [];
  renderModalImagePreviews();

  document.getElementById('modal-account').classList.remove('hidden');
}

function closeAccountModal() {
  document.getElementById('modal-account').classList.add('hidden');
}

// Add image URL from input field
function addImageUrlFromInput() {
  const input = document.getElementById('acc-imageUrl-input');
  const url = input.value.trim();
  if (url) {
    uploadedModalImages.push(url);
    input.value = '';
    renderModalImagePreviews();
  }
}

// Handle file upload inside modal
async function handleModalImageUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('screenshots', files[i]);
  }

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    if (result.success && result.urls) {
      uploadedModalImages.push(...result.urls);
      renderModalImagePreviews();
      showToast('success', 'Đã tải ảnh lên thành công!');
    } else {
      showToast('error', result.message || 'Lỗi tải ảnh!');
    }
  } catch (err) {
    console.error('Lỗi upload ảnh:', err);
    showToast('error', 'Lỗi tải ảnh lên máy chủ!');
  }
}

// Render image thumbnails inside modal
function renderModalImagePreviews() {
  const container = document.getElementById('modal-images-preview');
  if (uploadedModalImages.length === 0) {
    container.innerHTML = '<span class="text-slate-500 text-[11px] self-center">Chưa có ảnh nào được thêm.</span>';
    return;
  }

  container.innerHTML = uploadedModalImages.map((imgUrl, idx) => `
    <div class="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 group">
      <img src="${imgUrl}" class="w-full h-full object-cover">
      <button type="button" onclick="removeModalImage(${idx})" class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] opacity-90 hover:opacity-100">
        &times;
      </button>
    </div>
  `).join('');
}

function removeModalImage(index) {
  uploadedModalImages.splice(index, 1);
  renderModalImagePreviews();
}

// Form Submit: Create or Update
async function handleAccountFormSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('acc-form-id').value;
  const isEdit = Boolean(id);

  const payload = {
    loginType: document.getElementById('acc-loginType').value,
    username: document.getElementById('acc-username').value.trim(),
    password: document.getElementById('acc-password').value.trim(),
    authCode: document.getElementById('acc-authCode').value.trim(),
    infoStatus: document.getElementById('acc-infoStatus').value,
    ingameName: document.getElementById('acc-ingameName').value.trim(),
    rank: document.getElementById('acc-rank').value,
    stars: Number(document.getElementById('acc-stars').value) || 0,
    maxRank: document.getElementById('acc-maxRank').value.trim(),
    heroCount: Number(document.getElementById('acc-heroCount').value) || 0,
    skinCount: Number(document.getElementById('acc-skinCount').value) || 0,
    winRate: Number(document.getElementById('acc-winRate').value) || 50.0,
    gemPages: document.getElementById('acc-gemPages').value.trim(),
    featuredSkins: document.getElementById('acc-featuredSkins').value.split(',').map(s => s.trim()).filter(Boolean),
    costPrice: Number(document.getElementById('acc-costPrice').value) || 0,
    salePrice: Number(document.getElementById('acc-salePrice').value) || 0,
    status: document.getElementById('acc-status').value,
    images: uploadedModalImages,
    notes: document.getElementById('acc-notes').value.trim()
  };

  try {
    const url = isEdit ? `/api/accounts/${id}` : '/api/accounts';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      showToast('success', result.message || 'Lưu thành công!');
      closeAccountModal();
      loadAccounts();
      loadStats();
    } else {
      showToast('error', result.message || 'Đã có lỗi xảy ra!');
    }
  } catch (err) {
    console.error('Lỗi lưu tài khoản:', err);
    showToast('error', 'Lỗi kết nối máy chủ!');
  }
}

// Delete Account
async function confirmDelete(id) {
  const confirmed = await Swal.fire({
    title: 'Xóa tài khoản này?',
    text: `Bạn có chắc chắn muốn xóa tài khoản ${id}? Dữ liệu sẽ không thể khôi phục!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#334155',
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy',
    background: '#131a2a',
    color: '#e2e8f0'
  });

  if (confirmed.isConfirmed) {
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast('success', result.message);
        loadAccounts();
        loadStats();
      } else {
        showToast('error', result.message);
      }
    } catch (err) {
      showToast('error', 'Lỗi xóa tài khoản!');
    }
  }
}

// Quick Mark As Sold Modal
function openSellModal(id) {
  const acc = allAccounts.find(a => a.id === id);
  if (!acc) return;

  document.getElementById('sell-acc-id').value = acc.id;
  document.getElementById('sell-acc-display').textContent = `${acc.ingameName} (${acc.username})`;
  document.getElementById('sell-acc-listed').textContent = formatVND(acc.salePrice);
  document.getElementById('sell-price').value = acc.salePrice || 0;
  document.getElementById('sell-buyerNote').value = '';

  document.getElementById('modal-sell').classList.remove('hidden');
}

function closeSellModal() {
  document.getElementById('modal-sell').classList.add('hidden');
}

async function confirmSell() {
  const id = document.getElementById('sell-acc-id').value;
  const soldPrice = Number(document.getElementById('sell-price').value) || 0;
  const buyerNote = document.getElementById('sell-buyerNote').value.trim();

  try {
    const res = await fetch(`/api/accounts/${id}/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soldPrice, buyerNote })
    });
    const result = await res.json();
    if (result.success) {
      showToast('success', 'Đã chuyển trạng thái sang ĐÃ BÁN!');
      closeSellModal();
      loadAccounts();
      loadStats();
    } else {
      showToast('error', result.message);
    }
  } catch (err) {
    showToast('error', 'Lỗi cập nhật trạng thái bán!');
  }
}

// Rental Modal
function openRentModal(id) {
  const acc = allAccounts.find(a => a.id === id);
  if (!acc) return;

  document.getElementById('rent-acc-id').value = acc.id;
  document.getElementById('rent-acc-display').textContent = `${acc.ingameName} (${acc.username})`;
  document.getElementById('rent-renterName').value = '';
  document.getElementById('rent-renterContact').value = '';
  document.getElementById('rent-duration').value = '3';
  document.getElementById('rent-price').value = '30000';
  document.getElementById('rent-notes').value = '';

  document.getElementById('modal-rent').classList.remove('hidden');
}

function closeRentModal() {
  document.getElementById('modal-rent').classList.add('hidden');
}

async function confirmRent() {
  const id = document.getElementById('rent-acc-id').value;
  const renterName = document.getElementById('rent-renterName').value.trim();
  const renterContact = document.getElementById('rent-renterContact').value.trim();
  const durationHours = Number(document.getElementById('rent-duration').value) || 2;
  const rentPrice = Number(document.getElementById('rent-price').value) || 0;
  const notes = document.getElementById('rent-notes').value.trim();

  try {
    const res = await fetch(`/api/accounts/${id}/rent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ renterName, renterContact, durationHours, rentPrice, notes })
    });
    const result = await res.json();
    if (result.success) {
      showToast('success', 'Đã kích hoạt cho thuê nick thành công!');
      closeRentModal();
      loadAccounts();
    } else {
      showToast('error', result.message);
    }
  } catch (err) {
    showToast('error', 'Lỗi kích hoạt cho thuê!');
  }
}

async function returnRentAccount(id) {
  try {
    const res = await fetch(`/api/accounts/${id}/return-rent`, { method: 'POST' });
    const result = await res.json();
    if (result.success) {
      showToast('success', 'Đã nhận lại nick, tài khoản chuyển về SẴN SÀNG BÁN!');
      loadAccounts();
    } else {
      showToast('error', result.message);
    }
  } catch (err) {
    showToast('error', 'Lỗi nhận lại tài khoản!');
  }
}

// Handover Bill Modal
function openBillModal(id) {
  const acc = allAccounts.find(a => a.id === id);
  if (!acc) return;

  const nowStr = new Date().toLocaleString('vi-VN');
  const skinsStr = (acc.featuredSkins && acc.featuredSkins.length > 0) 
    ? acc.featuredSkins.join(', ') 
    : 'Đang cập nhật';

  const billTemplate = `================================================
          THÔNG TIN BÀN GIAO TÀI KHOẢN LIÊN QUÂN
================================================
Mã Tài Khoản  : ${acc.id}
Tên In-game   : ${acc.ingameName || 'Chưa đặt'}
Bậc Rank      : ${acc.rank} ${acc.stars > 0 ? `(${acc.stars} sao)` : ''}
Số Lượng Tướng: ${acc.heroCount || 0} tướng
Trang Phục    : ${acc.skinCount || 0} trang phục
Tình Trạng TT : ${acc.infoStatus}
Skin Nổi Bật  : ${skinsStr}

------------------------------------------------
THÔNG TIN ĐĂNG NHẬP:
- Loại đăng nhập : ${acc.loginType || 'Garena'}
- Tài khoản       : ${acc.username}
- Mật khẩu        : ${acc.password}
${acc.authCode ? `- Mã 2FA/Email   : ${acc.authCode}\n` : ''}
------------------------------------------------
LƯU Ý DÀNH CHO KHÁCH HÀNG:
1. Đăng nhập kiểm tra đúng thông tin tướng, rank, skin đã chốt.
2. Với acc Trắng TT: Vui lòng liên kết ngay SĐT & Email cá nhân và đổi mật khẩu mới để bảo mật tuyệt đối.
3. Không chia sẻ thông tin tài khoản cho bên thứ ba.

Cảm ơn bạn đã tin tưởng ủng hộ shop! Chúc bạn leo rank vui vẻ!
Thời gian bàn giao: ${nowStr}
================================================`;

  document.getElementById('bill-text-content').value = billTemplate;
  document.getElementById('modal-bill').classList.remove('hidden');
}

function closeBillModal() {
  document.getElementById('modal-bill').classList.add('hidden');
}

function copyBillText() {
  const text = document.getElementById('bill-text-content').value;
  copyToClipboard(text, 'Đã sao chép toàn bộ bill bàn giao!');
}

// Bulk Import
async function submitBulkImport() {
  const text = document.getElementById('bulk-text').value.trim();
  const defaultInfoStatus = document.getElementById('bulk-info-status').value;
  const defaultStatus = document.getElementById('bulk-acc-status').value;

  if (!text) {
    showToast('warning', 'Vui lòng dán danh sách tài khoản!');
    return;
  }

  try {
    const res = await fetch('/api/accounts/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, defaultInfoStatus, defaultStatus })
    });
    const result = await res.json();
    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Nhập thành công!',
        text: result.message,
        background: '#131a2a',
        color: '#e2e8f0',
        confirmButtonColor: '#f59e0b'
      });
      document.getElementById('bulk-text').value = '';
      switchTab('accounts');
      loadAccounts();
      loadStats();
    } else {
      showToast('error', result.message);
    }
  } catch (err) {
    showToast('error', 'Lỗi nhập hàng loạt!');
  }
}

// Export / Backup Handlers
function downloadBackup() {
  window.location.href = '/api/backup';
}

function handleFileRestore(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const confirmed = await Swal.fire({
        title: 'Xác nhận khôi phục?',
        text: `Tệp tin chứa ${data.length} tài khoản. Toàn bộ kho tài khoản hiện tại sẽ được cập nhật lại!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Đồng ý khôi phục',
        cancelButtonText: 'Hủy',
        background: '#131a2a',
        color: '#e2e8f0'
      });

      if (confirmed.isConfirmed) {
        const res = await fetch('/api/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data })
        });
        const result = await res.json();
        if (result.success) {
          showToast('success', result.message);
          loadAccounts();
          loadStats();
        } else {
          showToast('error', result.message);
        }
      }
    } catch (err) {
      showToast('error', 'File JSON không hợp lệ!');
    }
  };
  reader.readAsText(file);
}

// Export to CSV
function exportToCSV() {
  if (filteredAccounts.length === 0) {
    showToast('warning', 'Không có tài khoản nào để xuất!');
    return;
  }

  const headers = ['Mã Acc', 'Tên Ingame', 'Tài Khoản', 'Mật Khẩu', 'Rank', 'Sao', 'Tướng', 'Skin', 'Thông Tin', 'Giá Vốn', 'Giá Bán', 'Trạng Thái', 'Skin Nổi Bật'];
  
  const csvRows = [];
  csvRows.push(headers.join(','));

  filteredAccounts.forEach(acc => {
    const row = [
      `"${acc.id || ''}"`,
      `"${(acc.ingameName || '').replace(/"/g, '""')}"`,
      `"${(acc.username || '').replace(/"/g, '""')}"`,
      `"${(acc.password || '').replace(/"/g, '""')}"`,
      `"${acc.rank || ''}"`,
      acc.stars || 0,
      acc.heroCount || 0,
      acc.skinCount || 0,
      `"${acc.infoStatus || ''}"`,
      acc.costPrice || 0,
      acc.salePrice || 0,
      `"${acc.status || ''}"`,
      `"${(acc.featuredSkins || []).join('; ').replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });

  const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lienquan_accounts_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Lightbox Handlers
function openLightbox(url) {
  document.getElementById('lightbox-img').src = url;
  document.getElementById('modal-lightbox').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('modal-lightbox').classList.add('hidden');
}

// Password Eye Toggle
function togglePasswordVisibility(id, actualPassword) {
  const pwdEl = document.getElementById(`pwd-${id}`);
  const eyeEl = document.getElementById(`eye-${id}`);

  if (pwdEl.textContent === '••••••••') {
    pwdEl.textContent = actualPassword;
    eyeEl.className = 'fa-regular fa-eye-slash text-amber-400';
  } else {
    pwdEl.textContent = '••••••••';
    eyeEl.className = 'fa-regular fa-eye';
  }
}

// Copy Utilities
function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('success', successMsg || 'Đã sao chép vào bộ nhớ tạm!');
  }).catch(() => {
    showToast('error', 'Không thể sao chép tự động!');
  });
}

function copyAccountCredentials(user, pass) {
  const str = `TK: ${user} | MK: ${pass}`;
  copyToClipboard(str, 'Đã sao chép TK & MK!');
}

// Toast Notification Helper
function showToast(icon, title) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: '#131a2a',
    color: '#e2e8f0',
    iconColor: icon === 'success' ? '#10b981' : icon === 'warning' ? '#f59e0b' : '#ef4444'
  });

  Toast.fire({
    icon,
    title
  });
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

