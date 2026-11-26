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
  const m = /\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})/.exec(s);
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
  return dong.map((r) => {
    const o = {};
    for (const k of Object.keys(cot)) o[k] = k in viTri ? String(r[viTri[k]] ?? '').trim() : '';
    return o;
  });
}

// Giá trong bảng tính: 199000, "199.000", "199k", "4tr5"; số nhỏ hơn 1000 hiểu là nghìn.
function docGiaO(o) {
  const t = o.replace(/₫/g, 'đ').replace(/\s+/g, '').trim();
  if (!t) return null;
  let so = null;
  if (/^\d+$/.test(t)) so = Number(t);
  else if (/^\d{1,3}(?:[.,]\d{3})+$/.test(t)) so = Number(t.replace(/[.,]/g, ''));
  else if (/^\d+\.0+$/.test(t)) so = Number(t);
  if (so != null) return so < 1000 ? so * 1000 : so;
  const m = docGia(t);
  if (!m) return null;
  if (m.kieu === 'tam') return Math.round((m.min + m.max) / 2);
  return m.kieu === 'duoi' ? m.max : m.min;
}

// Google Sheets hay biến "0912345678" thành số 912345678.
function sdtDayDu(s) {
  return /^\d{9}$/.test(s) ? `0${s}` : s;
}

const HET_HANG = new Set(['khong', 'het', 'het hang', '0', 'false', 'no']);

export function chuyenDuLieu(bang) {
  const chienDich = docTrang('chienDich', bang.chienDich)
    .filter((r) => r.ten)
    .map((r) => ({ ten: r.ten, tuKhoa: tachDanhSach(r.tuKhoa), tuLoaiTru: tachDanhSach(r.tuLoaiTru) }));

  const sanPham = docTrang('sanPham', bang.sanPham)
    .filter((r) => r.ten)
    .map((r, thuTu) => ({
      chienDich: r.chienDich,
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
    .map((r) => ({ chienDich: r.chienDich, noiDung: r.noiDung }));

  const dongCaiDat = docTrang('caiDat', bang.caiDat)[0] ?? { tenToi: '', sdt: '', zalo: '' };
  const caiDat = { tenToi: dongCaiDat.tenToi, sdt: sdtDayDu(dongCaiDat.sdt), zalo: sdtDayDu(dongCaiDat.zalo) };

  return { chienDich, sanPham, mauBinhLuan, caiDat };
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
