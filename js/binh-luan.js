// Điền mẫu bình luận bằng sản phẩm đã chọn và thông tin liên hệ.
// Chỗ trống: {san_pham} {ten_sp} {gia} {mo_ta} {link} {ten_toi} {sdt} {zalo}

import { dinhDangGia } from './gia.js';

export const CHO_TRONG = ['san_pham', 'ten_sp', 'gia', 'mo_ta', 'link', 'ten_toi', 'sdt', 'zalo'];

function tenVaGia(sp, noi) {
  const gia = dinhDangGia(sp.gia);
  return gia ? `${sp.ten}${noi}${gia}` : sp.ten;
}

function giaTriChoTrong(chon, caiDat) {
  const dau = chon[0] ?? {};
  const sanPham =
    chon.length > 1
      ? chon.map((sp) => `• ${tenVaGia(sp, ' – ')}`).join('\n')
      : chon.length === 1
        ? tenVaGia(dau, ' ')
        : '';
  return {
    san_pham: sanPham,
    ten_sp: dau.ten ?? '',
    gia: dinhDangGia(dau.gia),
    mo_ta: dau.moTa ?? '',
    link: dau.link ?? '',
    ten_toi: caiDat?.tenToi ?? '',
    sdt: caiDat?.sdt ?? '',
    zalo: caiDat?.zalo ?? '',
  };
}

export function dienMau(noiDung, chon, caiDat) {
  const gt = giaTriChoTrong(chon, caiDat);
  const nhieu = chon.length > 1;
  const ketQua = [];
  for (const dong of String(noiDung ?? '').split(/\r?\n/)) {
    const choTrong = [...dong.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k in gt);
    // Dòng có chỗ trống mà chỗ nào cũng trống (vd "Zalo: {zalo}" khi chưa có zalo) → bỏ cả dòng.
    if (choTrong.length && choTrong.every((k) => !String(gt[k]).trim())) continue;
    const moi = dong.replace(/\{(\w+)\}/g, (nguyen, k, viTri) => {
      if (!(k in gt)) return nguyen;
      // Danh sách nhiều sản phẩm luôn bắt đầu ở dòng mới.
      if (k === 'san_pham' && nhieu && dong.slice(0, viTri).trim()) return `\n${gt[k]}`;
      return gt[k];
    });
    ketQua.push(...moi.split('\n').map((d) => d.replace(/ {2,}/g, ' ').trim()));
  }
  return ketQua.join('\n').trim();
}
