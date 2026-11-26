// Khớp bài của khách với chiến dịch và sản phẩm.

import { chuanHoa, coCum } from './chuan-hoa.js';

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
  const lech = gia < min ? min - gia : gia - max;
  return { diem: -lech / Math.max(mongMuon, 1), trongTamGia: false };
}

// Xếp sản phẩm còn hàng: khớp nhất lên đầu, hòa thì theo thứ tự trong bảng tính.
export function xepSanPham(vanBan, sanPham, mucGia) {
  const s = chuanHoa(vanBan);
  return sanPham
    .filter((p) => p.conHang !== false)
    .map((sp) => {
      const { diem, trongTamGia } = diemGia(sp.gia, mucGia);
      const dacDiemKhop = demKhop(s, sp.dacDiem);
      return { sp, diem: diem + dacDiemKhop.length * DIEM_MOI_DAC_DIEM, trongTamGia, dacDiemKhop };
    })
    .sort((a, b) => b.diem - a.diem || a.sp.thuTu - b.sp.thuTu);
}

// Các đặc điểm sản phẩm xuất hiện trong bài (nguyên văn, không trùng).
export function nhuCauDocDuoc(vanBan, sanPham) {
  const s = chuanHoa(vanBan);
  const daCo = new Set();
  const kq = [];
  for (const sp of sanPham) {
    if (sp.conHang === false) continue;
    for (const dd of sp.dacDiem) {
      const k = chuanHoa(dd);
      if (!daCo.has(k) && coCum(s, k)) {
        daCo.add(k);
        kq.push(dd);
      }
    }
  }
  return kq;
}
