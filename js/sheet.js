// Đọc dữ liệu từ file Google Sheets (chia sẻ "Bất kỳ ai có đường liên kết đều xem được").

import { chuanHoa, tachDanhSach } from './chuan-hoa.js';
import { docCsv } from './csv.js';
import { docGia } from './gia.js';

export const TRANG = {
  chienDich: 'Chiến dịch',
  sanPham: 'Sản phẩm',
  mauBinhLuan: 'Mẫu bình luận',
  caiDat: 'Cài đặt',
};

export const COT = {
  chienDich: { ten: 'Tên chiến dịch', tuKhoa: 'Từ khóa', tuLoaiTru: 'Từ loại trừ' },
  sanPham: {
    chienDich: 'Chiến dịch', ten: 'Tên', gia: 'Giá', dacDiem: 'Đặc điểm',
    moTa: 'Mô tả ngắn', link: 'Link', anh: 'Link ảnh', conHang: 'Còn hàng',
  },
  mauBinhLuan: { chienDich: 'Chiến dịch', noiDung: 'Nội dung' },
  caiDat: { tenToi: 'Tên của bạn', sdt: 'SĐT', zalo: 'Zalo' },
};

const BAT_BUOC = {
  chienDich: ['ten', 'tuKhoa'],
  sanPham: ['chienDich', 'ten', 'gia'],
  mauBinhLuan: ['chienDich', 'noiDung'],
  caiDat: [],
};

export class LoiDuLieu extends Error {
  constructor(message) {
    super(message);
    this.name = 'LoiDuLieu';
  }
}

const LOI_KHONG_DOC_DUOC =
  'Không đọc được file Google Sheets. Kiểm tra: (1) trong file đã bấm Chia sẻ → "Bất kỳ ai có đường liên kết" → Người xem; (2) link dán đúng; (3) máy đang có mạng.';

// Nhận link chia sẻ hoặc mã file, trả về mã file (hoặc null nếu không phải).
export function layIdSheet(linkHoacId) {
  const s = String(linkHoacId ?? '').trim();
  const m = /\/spreadsheets\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]{20,})/.exec(s);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{20,}$/.test(s) ? s : null;
}

// Dòng tiêu đề → { khóa nội bộ: chỉ số cột }
function viTriCot(tieuDe, cot) {
  const theoTen = new Map(tieuDe.map((t, i) => [chuanHoa(t), i]));
  const viTri = {};
  for (const [khoa, ten] of Object.entries(cot)) {
    if (theoTen.has(chuanHoa(ten))) viTri[khoa] = theoTen.get(chuanHoa(ten));
  }
  return viTri;
}

function docTrang(khoa, bang) {
  const cot = COT[khoa];
  const [tieuDe = [], ...dong] = bang ?? [];
  const viTri = viTriCot(tieuDe, cot);
  const thieu = BAT_BUOC[khoa].filter((k) => !(k in viTri)).map((k) => cot[k]);
  if (thieu.length) {
    throw new LoiDuLieu(
      `Trang tính "${TRANG[khoa]}" thiếu cột: ${thieu.join(', ')}. ` +
        `Kiểm tra tên trang tính đúng là "${TRANG[khoa]}" và dòng 1 có đủ tên cột.`,
    );
  }
  const ketQua = dong.map((r) => {
    const o = {};
    for (const k of Object.keys(cot)) o[k] = k in viTri ? String(r[viTri[k]] ?? '').trim() : '';
    return o;
  });
  ketQua.coCot = Object.keys(viTri).length > 0;
  return ketQua;
}

// Giá trong bảng tính: 199000, "199.000", "199.000,00 ₫", "₫199,000", "199k", "4tr5";
// số nhỏ hơn 1000 hiểu là nghìn.
function docGiaO(o) {
  if (!o.trim()) return null;
  const t = o.replace(/₫|vnđ|vnd|đ|\s/gi, '').replace(/[.,]0{1,2}$/, '');
  let so = null;
  if (/^\d+$/.test(t)) so = Number(t);
  else if (/^\d{1,3}(?:[.,]\d{3})+$/.test(t)) so = Number(t.replace(/[.,]/g, ''));
  if (so != null) return so < 1000 ? so * 1000 : so;
  const m = docGia(o.replace(/₫/g, 'đ'));
  if (!m) return null;
  if (m.kieu === 'tam') return Math.round((m.min + m.max) / 2);
  return m.kieu === 'duoi' ? m.max : m.min;
}

// Google Sheets hay biến "0912345678" thành số 912345678 (máy bàn "02412345678" thành 2412345678).
function sdtDayDu(s) {
  return /^\d{9}$/.test(s) || /^2\d{9}$/.test(s) ? `0${s}` : s;
}

const HET_HANG = new Set(['khong', 'het', 'het hang', '0', 'false', 'no']);

export function chuyenDuLieu(bang) {
  const canhBao = [];
  const chienDich = docTrang('chienDich', bang.chienDich)
    .filter((r) => r.ten)
    .map((r) => ({ ten: r.ten, tuKhoa: tachDanhSach(r.tuKhoa), tuLoaiTru: tachDanhSach(r.tuLoaiTru) }));

  // Tên chiến dịch ở các trang khác chỉ cần giống khi bỏ dấu/hoa thường ("giỏ quà tết" = "Giỏ quà Tết").
  const theoTen = new Map(chienDich.map((c) => [chuanHoa(c.ten), c.ten]));
  const tenLa = new Map();
  const tenChuan = (ten, trang) => {
    const t = theoTen.get(chuanHoa(ten));
    if (t) return t;
    const khoa = `${trang}|${ten}`;
    tenLa.set(khoa, (tenLa.get(khoa) ?? 0) + 1);
    return ten;
  };

  const sanPham = docTrang('sanPham', bang.sanPham)
    .filter((r) => r.ten)
    .map((r, thuTu) => ({
      chienDich: tenChuan(r.chienDich, TRANG.sanPham),
      ten: r.ten,
      gia: docGiaO(r.gia),
      dacDiem: tachDanhSach(r.dacDiem),
      moTa: r.moTa,
      link: r.link,
      anh: r.anh,
      conHang: !HET_HANG.has(chuanHoa(r.conHang)),
      thuTu,
    }));

  const mauBinhLuan = docTrang('mauBinhLuan', bang.mauBinhLuan)
    .filter((r) => r.noiDung)
    .map((r) => ({ chienDich: tenChuan(r.chienDich, TRANG.mauBinhLuan), noiDung: r.noiDung }));

  for (const [khoa, n] of tenLa) {
    const [trang, ten] = khoa.split('|');
    canhBao.push(
      `Trang "${trang}" có ${n} dòng ghi chiến dịch "${ten || '(để trống)'}" nhưng trang "${TRANG.chienDich}" không có tên này, nên các dòng đó không hiện.`,
    );
  }

  const trangCaiDat = docTrang('caiDat', bang.caiDat);
  if (!trangCaiDat.coCot) {
    canhBao.push(
      `Không thấy trang tính "${TRANG.caiDat}" (hoặc dòng 1 sai tên cột), nên bình luận sẽ thiếu tên, SĐT, Zalo của bạn.`,
    );
  }
  const dongCaiDat = trangCaiDat[0] ?? { tenToi: '', sdt: '', zalo: '' };
  const caiDat = { tenToi: dongCaiDat.tenToi, sdt: sdtDayDu(dongCaiDat.sdt), zalo: sdtDayDu(dongCaiDat.zalo) };

  return { chienDich, sanPham, mauBinhLuan, caiDat, canhBao };
}

export function diaChiTrang(id, tenTrang) {
  return (
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1` +
    `&sheet=${encodeURIComponent(tenTrang)}&t=${Date.now()}`
  );
}

async function taiTrang(id, tenTrang, fetchFn) {
  let res;
  try {
    res = await fetchFn(diaChiTrang(id, tenTrang));
  } catch {
    throw new LoiDuLieu(LOI_KHONG_DOC_DUOC);
  }
  if (!res.ok) throw new LoiDuLieu(LOI_KHONG_DOC_DUOC);
  const text = await res.text();
  if (/^\s*</.test(text)) throw new LoiDuLieu(LOI_KHONG_DOC_DUOC); // trang đăng nhập HTML
  return docCsv(text);
}

export async function taiDuLieu(id, fetchFn = (...a) => fetch(...a)) {
  const khoa = Object.keys(TRANG);
  const bang = await Promise.all(khoa.map((k) => taiTrang(id, TRANG[k], fetchFn)));
  return chuyenDuLieu(Object.fromEntries(khoa.map((k, i) => [k, bang[i]])));
}
