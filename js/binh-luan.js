// Điền mẫu bình luận bằng sản phẩm đã chọn và thông tin liên hệ.
// Chỗ trống: {san_pham} {ten_sp} {gia} {mo_ta} {link} {ten_toi} {sdt} {zalo}

import { dinhDangGia } from './gia.js';

export const CHO_TRONG = ['san_pham', 'ten_sp', 'gia', 'mo_ta', 'link', 'ten_toi', 'sdt', 'zalo'];

function tenVaGia(sp, noi) {
  const gia = dinhDangGia(sp.gia);
  return gia ? `${sp.ten}${noi}${gia}` : sp.ten;
}

// "A 199k, B 230k và C 300k" — dùng khi {san_pham} nằm giữa câu
function noiGon(chon) {
  const ds = chon.map((sp) => tenVaGia(sp, ' '));
  return ds.length > 1 ? `${ds.slice(0, -1).join(', ')} và ${ds.at(-1)}` : ds[0] ?? '';
}

// "• A – 199k" mỗi dòng — dùng khi {san_pham} đứng cuối dòng
function danhSach(chon) {
  return chon.map((sp) => `• ${tenVaGia(sp, ' – ')}`).join('\n');
}

function giaTriChoTrong(chon, caiDat) {
  const dau = chon[0] ?? {};
  return {
    san_pham: noiGon(chon),
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
  const ds = danhSach(chon);
  const ketQua = [];
  for (const dong of String(noiDung ?? '').split(/\r?\n/)) {
    const choTrong = [...dong.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k in gt);
    // Dòng có chỗ trống mà chỗ nào cũng trống (vd "Zalo: {zalo}" khi chưa có zalo) → bỏ cả dòng.
    if (choTrong.length && choTrong.every((k) => !String(gt[k]).trim())) continue;
    const moi = dong.replace(/\{(\w+)\}/g, (nguyen, k, viTri) => {
      if (!(k in gt)) return nguyen;
      // Nhiều sản phẩm mà {san_pham} đứng cuối dòng → xuống dòng thành danh sách.
      if (k === 'san_pham' && nhieu && !dong.slice(viTri + nguyen.length).trim()) {
        return dong.slice(0, viTri).trim() ? `\n${ds}` : ds;
      }
      return gt[k];
    });
    ketQua.push(...moi.split('\n').map((d) => d.replace(/ {2,}/g, ' ').trim()));
  }
  return ketQua.join('\n').trim();
}
