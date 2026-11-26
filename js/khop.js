// Khớp bài của khách với chiến dịch và sản phẩm.

import { chuanHoa, coCum, viTriCum } from './chuan-hoa.js';

const DIEM_MOI_DAC_DIEM = 0.6;

function demKhop(vanBanChuan, danhSach) {
  return danhSach.filter((tu) => coCum(vanBanChuan, chuanHoa(tu)));
}

// Tên chiến dịch có nhiều từ khóa xuất hiện trong bài nhất (hòa thì lấy cái đứng trước).
export function doanChienDich(vanBan, chienDich) {
  const s = chuanHoa(vanBan);
  let tot = null;
  let nhieuNhat = 0;
  for (const cd of chienDich) {
    const n = demKhop(s, cd.tuKhoa).length;
    if (n > nhieuNhat) {
      nhieuNhat = n;
      tot = cd.ten;
    }
  }
  return tot;
}

// Các từ loại trừ (nguyên văn trong bảng tính) có trong bài: dấu hiệu bài của người bán/rao.
export function timTuLoaiTru(vanBan, chienDich) {
  if (!chienDich) return [];
  return demKhop(chuanHoa(vanBan), chienDich.tuLoaiTru);
}

// Trung vị giá sản phẩm, dùng để đoán "tầm 200" là 200k hay 200 triệu.
export function giaThamChieu(sanPham) {
  const gia = sanPham.map((p) => p.gia).filter((g) => g != null && Number.isFinite(g)).sort((a, b) => a - b);
  if (!gia.length) return undefined;
  const giua = Math.floor(gia.length / 2);
  return gia.length % 2 ? gia[giua] : (gia[giua - 1] + gia[giua]) / 2;
}

function diemGia(gia, mucGia) {
  if (!mucGia || gia == null) return { diem: 0, trongTamGia: null };
  const { min, max, kieu } = mucGia;
  const mongMuon = kieu === 'duoi' ? max : kieu === 'tren' ? min : (min + max) / 2;
  if (gia >= min && gia <= max) {
    let thang;
    if (kieu === 'duoi') thang = max;
    else if (kieu === 'tren') thang = min;
    else thang = (max - min) / 2;
    const gan = 1 - Math.min(1, Math.abs(gia - mongMuon) / Math.max(thang, 1));
    return { diem: 1 + 0.5 * gan, trongTamGia: true };
  }
  // Ngoài tầm giá: lệch 10% trừ 0.2 (vẫn có thể thắng nhờ đặc điểm), lệch gần gấp đôi trừ gần 2.
  const lech = gia < min ? min - gia : gia - max;
  return { diem: (-2 * lech) / Math.max(mongMuon, 1), trongTamGia: false };
}

// Đặc điểm (đã chuẩn hóa) thật sự có trong bài. Bỏ đặc điểm ngắn chỉ xuất hiện bên trong
// một đặc điểm dài hơn cũng khớp: bài nói "biếu sếp" thì không tính thêm "biếu".
function dacDiemTrongBai(s, sanPham) {
  const khop = new Map();
  for (const sp of sanPham) {
    for (const dd of sp.dacDiem.map(chuanHoa)) {
      if (khop.has(dd)) continue;
      const viTri = viTriCum(s, dd);
      if (viTri.length) khop.set(dd, viTri);
    }
  }
  const doan = [...khop].flatMap(([dd, viTri]) => viTri.map((i) => ({ dd, dau: i, cuoi: i + dd.length })));
  const kq = new Set();
  for (const [dd, viTri] of khop) {
    const nam = (i) => doan.some((d) => d.dd.length > dd.length && d.dau <= i && i + dd.length <= d.cuoi);
    if (viTri.some((i) => !nam(i))) kq.add(dd);
  }
  return kq;
}

// Xếp sản phẩm còn hàng: khớp nhất lên đầu, hòa thì theo thứ tự trong bảng tính.
// Đặc điểm càng ít sản phẩm có (vd tên khu vực) thì càng nặng ký so với đặc điểm ai cũng có (vd "full đồ").
export function xepSanPham(vanBan, sanPham, mucGia) {
  const s = chuanHoa(vanBan);
  const conHang = sanPham.filter((p) => p.conHang !== false);
  const soSpCo = new Map();
  for (const sp of conHang) {
    for (const dd of new Set(sp.dacDiem.map(chuanHoa))) soSpCo.set(dd, (soSpCo.get(dd) ?? 0) + 1);
  }
  const trongSo = (dd) => DIEM_MOI_DAC_DIEM * (1 + Math.log(conHang.length / (soSpCo.get(chuanHoa(dd)) || 1)));
  const trongBai = dacDiemTrongBai(s, conHang);
  return conHang
    .map((sp) => {
      const { diem, trongTamGia } = diemGia(sp.gia, mucGia);
      const dacDiemKhop = sp.dacDiem.filter((dd) => trongBai.has(chuanHoa(dd)));
      const diemDacDiem = dacDiemKhop.reduce((tong, dd) => tong + trongSo(dd), 0);
      return { sp, diem: diem + diemDacDiem, trongTamGia, dacDiemKhop };
    })
    .sort((a, b) => b.diem - a.diem || a.sp.thuTu - b.sp.thuTu);
}

// Các đặc điểm sản phẩm xuất hiện trong bài (nguyên văn, không trùng).
export function nhuCauDocDuoc(vanBan, sanPham) {
  const conHang = sanPham.filter((p) => p.conHang !== false);
  const trongBai = dacDiemTrongBai(chuanHoa(vanBan), conHang);
  const daCo = new Set();
  const kq = [];
  for (const sp of conHang) {
    for (const dd of sp.dacDiem) {
      const k = chuanHoa(dd);
      if (!daCo.has(k) && trongBai.has(k)) {
        daCo.add(k);
        kq.push(dd);
      }
    }
  }
  return kq;
}
