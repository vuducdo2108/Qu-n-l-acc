const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3050;

// Setup directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer config for screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `acc_${Date.now()}_${Math.round(Math.random() * 1E6)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper functions for Data
function getAccounts() {
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    const initialData = getSampleAccounts();
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc dữ liệu accounts.json:', err);
    return [];
  }
}

function saveAccounts(accounts) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
}

function getSampleAccounts() {
  const now = new Date();
  const rentalEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours later

  return [
    {
      id: "LQ-" + (1001),
      ingameName: "SátThủBóngĐêm",
      loginType: "Garena",
      username: "satthu_lq2024",
      password: "Password123@!",
      authCode: "A1B2-C3D4-E5F6",
      infoStatus: "Trắng thông tin",
      rank: "Chiến Tướng",
      stars: 42,
      maxRank: "Chiến Tướng 65*",
      heroCount: 118,
      skinCount: 295,
      winRate: 59.8,
      reputation: 100,
      gemPages: "Full 30 bảng 90",
      featuredSkins: [
        "Nakroth Thứ Nguyên Vệ Thần",
        "Raz Muay Thái",
        "Tulen Chí Tôn Kiếm Tiên",
        "Lauriel Thứ Nguyên Vệ Thần",
        "Florentino Tinh Hệ SSS"
      ],
      status: "Sẵn sàng bán",
      costPrice: 450000,
      salePrice: 850000,
      soldPrice: null,
      soldAt: null,
      buyerNote: "",
      rentalInfo: null,
      images: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
      ],
      notes: "Acc vip tâm huyết, đầy đủ ngọc chuẩn các hệ Pháp Sư, Đấu Sĩ, Sát Thủ. Full thông tin trắng 100%.",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: "LQ-" + (1002),
      ingameName: "Zata_GánhTeam",
      loginType: "Garena",
      username: "zata_flyer99",
      password: "ZataMaster2024!",
      authCode: "",
      infoStatus: "Đổi được SĐT",
      rank: "Cao Thủ",
      stars: 18,
      maxRank: "Chiến Tướng",
      heroCount: 96,
      skinCount: 148,
      winRate: 55.4,
      reputation: 100,
      gemPages: "20 bảng 90",
      featuredSkins: [
        "Zata Thần Sứ Cổ Đại",
        "Ngộ Không Nhóc Tì Bá Đạo",
        "Airi Bích Hải Thánh Nữ SSS",
        "Hayate Tử Thần Vũ Trụ"
      ],
      status: "Đang cho thuê",
      costPrice: 300000,
      salePrice: 550000,
      soldPrice: null,
      soldAt: null,
      buyerNote: "",
      rentalInfo: {
        renterName: "Nguyễn Văn Tuấn",
        renterContact: "0987654321 (Zalo)",
        rentPrice: 30000,
        startTime: now.toISOString(),
        endTime: rentalEnd.toISOString(),
        notes: "Thuê leo rank 6 tiếng, cọc CCCD"
      },
      images: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
      ],
      notes: "Nick chuyên bay lắc, winrate Zata 68% gần 500 trận.",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: "LQ-" + (1003),
      ingameName: "BéNaĐiRừng",
      loginType: "Facebook",
      username: "bena.dirung.fb",
      password: "FbSecret789#",
      authCode: "889922",
      infoStatus: "Trắng thông tin",
      rank: "Kim Cương",
      stars: 3,
      maxRank: "Tinh Anh I",
      heroCount: 65,
      skinCount: 72,
      winRate: 52.0,
      reputation: 98,
      gemPages: "10 bảng 90",
      featuredSkins: [
        "Murad Siêu Việt",
        "Valhein Hoàng Tử Băng",
        "Krixi Cô Tiên Thỏ"
      ],
      status: "Đã bán",
      costPrice: 120000,
      salePrice: 190000,
      soldPrice: 190000,
      soldAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      buyerNote: "Bán cho bạn Hoàng qua ATM Momo",
      rentalInfo: null,
      images: [],
      notes: "Acc phụ khởi động, vừa bay nhanh gọn.",
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: "LQ-" + (1004),
      ingameName: "GrakkKéoLàTrúng",
      loginType: "Garena",
      username: "grakk_top1",
      password: "HookLord@2024",
      authCode: "",
      infoStatus: "Trắng thông tin",
      rank: "Tinh Anh",
      stars: 1,
      maxRank: "Cao Thủ",
      heroCount: 88,
      skinCount: 120,
      winRate: 53.2,
      reputation: 100,
      gemPages: "15 bảng 90",
      featuredSkins: [
        "Grakk Chàng Khờ Thủy Quái",
        "Yorn Thế Tử Nguyệt Tộc",
        "Ryoma Thanh Long Bang Chủ"
      ],
      status: "Sẵn sàng bán",
      costPrice: 180000,
      salePrice: 320000,
      soldPrice: null,
      soldAt: null,
      buyerNote: "",
      rentalInfo: null,
      images: [],
      notes: "Nick SP/Đấu sĩ rất khỏe, skin Grakk cực xịn.",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: "LQ-" + (1005),
      ingameName: "DemonSlayer_VIP",
      loginType: "Garena",
      username: "allstar_anime_lq",
      password: "DemonSlayerSSS99#",
      authCode: "F4G5-H6J7-K8L9",
      infoStatus: "Trắng thông tin",
      rank: "Thách Đấu",
      stars: 88,
      maxRank: "Thách Đấu Top 30",
      heroCount: 121,
      skinCount: 435,
      winRate: 64.2,
      reputation: 100,
      gemPages: "Full 30 bảng 90",
      featuredSkins: [
        "Yan Tanjiro Kamado (Kimetsu no Yaiba)",
        "Keera Nezuko Kamado (Kimetsu no Yaiba)",
        "Allain Kirito Hắc Kiếm Sĩ (SAO)",
        "Butterfly Asuna Tia Chớp (SAO)",
        "Raz Muay Thái",
        "Nakroth Bạch Diện Chiến Thần",
        "Tel'Annas Thứ Nguyên Vệ Thần"
      ],
      status: "Tài khoản cá nhân",
      costPrice: 2500000,
      salePrice: 4200000,
      soldPrice: null,
      soldAt: null,
      buyerNote: "",
      rentalInfo: null,
      images: [
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80"
      ],
      notes: "Bộ sưu tập Anime Collab độc quyền siêu hiếm, giá trị sưu tầm cực cao.",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    }
  ];
}

// API Routes

// 1. Get Accounts (supports search, rank, status, min/max price, sorting)
app.get('/api/accounts', (req, res) => {
  try {
    let accounts = getAccounts();
    const { search, rank, status, infoStatus, minPrice, maxPrice, sortBy } = req.query;

    if (search) {
      const q = search.toLowerCase().trim();
      accounts = accounts.filter(acc => 
        (acc.id && acc.id.toLowerCase().includes(q)) ||
        (acc.ingameName && acc.ingameName.toLowerCase().includes(q)) ||
        (acc.username && acc.username.toLowerCase().includes(q)) ||
        (acc.featuredSkins && acc.featuredSkins.some(s => s.toLowerCase().includes(q))) ||
        (acc.notes && acc.notes.toLowerCase().includes(q))
      );
    }

    if (rank && rank !== 'all') {
      accounts = accounts.filter(acc => acc.rank === rank);
    }

    if (status && status !== 'all') {
      accounts = accounts.filter(acc => acc.status === status);
    }

    if (infoStatus && infoStatus !== 'all') {
      accounts = accounts.filter(acc => acc.infoStatus === infoStatus);
    }

    if (minPrice) {
      accounts = accounts.filter(acc => (acc.salePrice || 0) >= Number(minPrice));
    }

    if (maxPrice) {
      accounts = accounts.filter(acc => (acc.salePrice || 0) <= Number(maxPrice));
    }

    // Sorting
    if (sortBy === 'price_asc') {
      accounts.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
    } else if (sortBy === 'price_desc') {
      accounts.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
    } else if (sortBy === 'heroes_desc') {
      accounts.sort((a, b) => (b.heroCount || 0) - (a.heroCount || 0));
    } else if (sortBy === 'skins_desc') {
      accounts.sort((a, b) => (b.skinCount || 0) - (a.skinCount || 0));
    } else {
      // Default: newest first
      accounts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get single account
app.get('/api/accounts/:id', (req, res) => {
  const accounts = getAccounts();
  const acc = accounts.find(a => a.id === req.params.id);
  if (!acc) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });
  res.json({ success: true, data: acc });
});

// 3. Create Account
app.post('/api/accounts', (req, res) => {
  try {
    const accounts = getAccounts();
    const body = req.body;

    if (!body.username || !body.password) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu là bắt buộc!' });
    }

    const nextId = "LQ-" + Math.floor(1000 + Math.random() * 9000);

    const newAcc = {
      id: body.id && body.id.trim() ? body.id.trim() : nextId,
      ingameName: body.ingameName || "Chưa đặt tên",
      loginType: body.loginType || "Garena",
      username: body.username.trim(),
      password: body.password.trim(),
      authCode: body.authCode || "",
      infoStatus: body.infoStatus || "Trắng thông tin",
      rank: body.rank || "Tinh Anh",
      stars: Number(body.stars) || 0,
      maxRank: body.maxRank || body.rank || "Tinh Anh",
      heroCount: Number(body.heroCount) || 0,
      skinCount: Number(body.skinCount) || 0,
      winRate: Number(body.winRate) || 50.0,
      reputation: Number(body.reputation) || 100,
      gemPages: body.gemPages || "Bình thường",
      featuredSkins: Array.isArray(body.featuredSkins) 
        ? body.featuredSkins 
        : (body.featuredSkins ? body.featuredSkins.split(',').map(s => s.trim()).filter(Boolean) : []),
      status: body.status || "Sẵn sàng bán",
      costPrice: Number(body.costPrice) || 0,
      salePrice: Number(body.salePrice) || 0,
      soldPrice: body.soldPrice ? Number(body.soldPrice) : null,
      soldAt: body.soldAt || null,
      buyerNote: body.buyerNote || "",
      rentalInfo: body.rentalInfo || null,
      images: Array.isArray(body.images) ? body.images : (body.imageUrl ? [body.imageUrl] : []),
      notes: body.notes || "",
      createdAt: new Date().toISOString()
    };

    accounts.unshift(newAcc);
    saveAccounts(accounts);

    res.status(201).json({ success: true, data: newAcc, message: 'Thêm tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Update Account
app.put('/api/accounts/:id', (req, res) => {
  try {
    const accounts = getAccounts();
    const index = accounts.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản để cập nhật!' });
    }

    const current = accounts[index];
    const body = req.body;

    const updated = {
      ...current,
      ...body,
      id: current.id, // keep immutable id
      stars: body.stars !== undefined ? Number(body.stars) : current.stars,
      heroCount: body.heroCount !== undefined ? Number(body.heroCount) : current.heroCount,
      skinCount: body.skinCount !== undefined ? Number(body.skinCount) : current.skinCount,
      winRate: body.winRate !== undefined ? Number(body.winRate) : current.winRate,
      reputation: body.reputation !== undefined ? Number(body.reputation) : current.reputation,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : current.costPrice,
      salePrice: body.salePrice !== undefined ? Number(body.salePrice) : current.salePrice,
      soldPrice: body.soldPrice !== undefined ? (body.soldPrice ? Number(body.soldPrice) : null) : current.soldPrice,
      featuredSkins: Array.isArray(body.featuredSkins) 
        ? body.featuredSkins 
        : (typeof body.featuredSkins === 'string' ? body.featuredSkins.split(',').map(s => s.trim()).filter(Boolean) : current.featuredSkins),
      updatedAt: new Date().toISOString()
    };

    accounts[index] = updated;
    saveAccounts(accounts);

    res.json({ success: true, data: updated, message: 'Cập nhật tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Delete Account
app.delete('/api/accounts/:id', (req, res) => {
  try {
    let accounts = getAccounts();
    const prevLen = accounts.length;
    accounts = accounts.filter(a => a.id !== req.params.id);
    if (accounts.length === prevLen) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản để xóa!' });
    }
    saveAccounts(accounts);
    res.json({ success: true, message: 'Đã xóa tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Bulk Quick Import (Paste plain text: tk|mk|rank|gia|ingame|skins)
app.post('/api/accounts/bulk', (req, res) => {
  try {
    const { text, defaultStatus, defaultInfoStatus } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung dán không được để trống!' });
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const accounts = getAccounts();
    const createdAccs = [];

    for (const line of lines) {
      // Split by '|' or tab or ';'
      const parts = line.split(/[|;\t]/).map(p => p.trim());
      if (parts.length >= 2) {
        const username = parts[0];
        const password = parts[1];
        const rank = parts[2] || "Tinh Anh";
        const salePrice = parts[3] ? Number(parts[3].replace(/[^0-9]/g, '')) : 100000;
        const ingameName = parts[4] || ("Player_" + Math.floor(1000 + Math.random() * 9000));
        const skinStr = parts[5] || "";

        const newAcc = {
          id: "LQ-" + Math.floor(1000 + Math.random() * 9000),
          ingameName,
          loginType: "Garena",
          username,
          password,
          authCode: "",
          infoStatus: defaultInfoStatus || "Trắng thông tin",
          rank: rank,
          stars: 0,
          maxRank: rank,
          heroCount: 60,
          skinCount: 80,
          winRate: 50.0,
          reputation: 100,
          gemPages: "Chuẩn 90",
          featuredSkins: skinStr ? skinStr.split(',').map(s => s.trim()).filter(Boolean) : [],
          status: defaultStatus || "Sẵn sàng bán",
          costPrice: 0,
          salePrice: salePrice || 100000,
          soldPrice: null,
          soldAt: null,
          buyerNote: "",
          rentalInfo: null,
          images: [],
          notes: "Nhập nhanh từ danh sách text",
          createdAt: new Date().toISOString()
        };

        createdAccs.push(newAcc);
        accounts.unshift(newAcc);
      }
    }

    saveAccounts(accounts);
    res.json({
      success: true,
      message: `Đã nhập thành công ${createdAccs.length} tài khoản!`,
      count: createdAccs.length,
      data: createdAccs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Mark as Sold Quick Action
app.post('/api/accounts/:id/sell', (req, res) => {
  try {
    const accounts = getAccounts();
    const index = accounts.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });

    const { soldPrice, buyerNote } = req.body;
    accounts[index].status = "Đã bán";
    accounts[index].soldPrice = soldPrice !== undefined ? Number(soldPrice) : accounts[index].salePrice;
    accounts[index].soldAt = new Date().toISOString();
    accounts[index].buyerNote = buyerNote || accounts[index].buyerNote || "";

    saveAccounts(accounts);
    res.json({ success: true, message: 'Đã đánh dấu bán tài khoản thành công!', data: accounts[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Start Rental
app.post('/api/accounts/:id/rent', (req, res) => {
  try {
    const accounts = getAccounts();
    const index = accounts.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });

    const { renterName, renterContact, rentPrice, durationHours, notes } = req.body;
    const now = new Date();
    const hours = Number(durationHours) || 2;
    const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    accounts[index].status = "Đang cho thuê";
    accounts[index].rentalInfo = {
      renterName: renterName || "Khách thuê",
      renterContact: renterContact || "",
      rentPrice: Number(rentPrice) || 0,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      notes: notes || ""
    };

    saveAccounts(accounts);
    res.json({ success: true, message: 'Đã cho thuê tài khoản thành công!', data: accounts[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Return Rented Account
app.post('/api/accounts/:id/return-rent', (req, res) => {
  try {
    const accounts = getAccounts();
    const index = accounts.findIndex(a => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });

    accounts[index].status = "Sẵn sàng bán";
    accounts[index].rentalInfo = null;

    saveAccounts(accounts);
    res.json({ success: true, message: 'Đã nhận lại tài khoản thành công!', data: accounts[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. Upload Images
app.post('/api/upload', upload.array('screenshots', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Chưa chọn file ảnh!' });
    }
    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ success: true, urls, message: 'Tải ảnh lên thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Statistics Dashboard
app.get('/api/stats', (req, res) => {
  try {
    const accounts = getAccounts();

    const totalAccounts = accounts.length;
    const availableCount = accounts.filter(a => a.status === 'Sẵn sàng bán').length;
    const rentingCount = accounts.filter(a => a.status === 'Đang cho thuê').length;
    const soldCount = accounts.filter(a => a.status === 'Đã bán').length;
    const personalCount = accounts.filter(a => a.status === 'Tài khoản cá nhân').length;

    // Financials
    const totalInventoryCost = accounts
      .filter(a => a.status === 'Sẵn sàng bán' || a.status === 'Đang cho thuê')
      .reduce((sum, a) => sum + (Number(a.costPrice) || 0), 0);

    const totalInventoryValue = accounts
      .filter(a => a.status === 'Sẵn sàng bán' || a.status === 'Đang cho thuê')
      .reduce((sum, a) => sum + (Number(a.salePrice) || 0), 0);

    const totalRevenue = accounts
      .filter(a => a.status === 'Đã bán')
      .reduce((sum, a) => sum + (Number(a.soldPrice) || Number(a.salePrice) || 0), 0);

    const totalSoldCost = accounts
      .filter(a => a.status === 'Đã bán')
      .reduce((sum, a) => sum + (Number(a.costPrice) || 0), 0);

    const totalProfit = totalRevenue - totalSoldCost;

    // Rank Distribution
    const rankOrder = [
      "Đồng", "Bạc", "Vàng", "Bạch Kim", "Kim Cương", "Tinh Anh", "Cao Thủ", "Chiến Tướng", "Thách Đấu"
    ];
    const rankDistribution = {};
    rankOrder.forEach(r => rankDistribution[r] = 0);

    accounts.forEach(a => {
      const r = a.rank || 'Kim Cương';
      if (rankDistribution[r] !== undefined) {
        rankDistribution[r]++;
      } else {
        rankDistribution[r] = (rankDistribution[r] || 0) + 1;
      }
    });

    // Info Status distribution
    const infoDistribution = {};
    accounts.forEach(a => {
      const s = a.infoStatus || 'Khác';
      infoDistribution[s] = (infoDistribution[s] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalAccounts,
        availableCount,
        rentingCount,
        soldCount,
        personalCount,
        totalInventoryCost,
        totalInventoryValue,
        totalRevenue,
        totalProfit,
        rankDistribution,
        infoDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 12. Backup & Restore Data
app.get('/api/backup', (req, res) => {
  const accounts = getAccounts();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=lienquan_acc_backup_${Date.now()}.json`);
  res.send(JSON.stringify(accounts, null, 2));
});

app.post('/api/restore', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu khôi phục không hợp lệ!' });
    }
    saveAccounts(data);
    res.json({ success: true, message: `Khôi phục thành công ${data.length} tài khoản!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server Liên Quân Mobile Acc Manager đang chạy tại: http://localhost:${PORT}`);
});
