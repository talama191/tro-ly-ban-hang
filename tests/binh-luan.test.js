import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dienMau } from '../js/binh-luan.js';

const AN_KHANG = { ten: 'Giỏ An Khang', gia: 199000, moTa: 'trà, bánh, mứt', link: 'https://shop.vn/an-khang' };
const PHUC_LOC = { ten: 'Hộp Phúc Lộc', gia: 230000, moTa: '', link: '' };
const CAI_DAT = { tenToi: 'Lan', sdt: '0912345678', zalo: '' };

test('một sản phẩm', () => {
  assert.equal(
    dienMau('Bên em có {san_pham} nhé, zalo {sdt}', [AN_KHANG], CAI_DAT),
    'Bên em có Giỏ An Khang 199k nhé, zalo 0912345678',
  );
  assert.equal(dienMau('{ten_sp} giá {gia}: {mo_ta}', [AN_KHANG], CAI_DAT), 'Giỏ An Khang giá 199k: trà, bánh, mứt');
});

test('nhiều sản phẩm thành danh sách', () => {
  const kq = dienMau('Chị tham khảo:{san_pham}\nInbox {ten_toi} nhé', [AN_KHANG, PHUC_LOC], CAI_DAT);
  assert.equal(kq, 'Chị tham khảo:\n• Giỏ An Khang – 199k\n• Hộp Phúc Lộc – 230k\nInbox Lan nhé');
});

test('nhiều sản phẩm giữa câu thì nối gọn bằng "và"', () => {
  assert.equal(
    dienMau('Dạ chị tham khảo {san_pham} bên em nhé', [AN_KHANG, PHUC_LOC], CAI_DAT),
    'Dạ chị tham khảo Giỏ An Khang 199k và Hộp Phúc Lộc 230k bên em nhé',
  );
  assert.equal(
    dienMau('Có {san_pham} ạ', [AN_KHANG, PHUC_LOC, { ten: 'Giỏ C', gia: 300000 }], CAI_DAT),
    'Có Giỏ An Khang 199k, Hộp Phúc Lộc 230k và Giỏ C 300k ạ',
  );
});

test('giá trị trống: bỏ chỗ trống, bỏ dòng chỉ còn nhãn', () => {
  assert.equal(dienMau('Có {ten_sp} ạ\nXem: {link}\nZalo: {zalo}', [PHUC_LOC], CAI_DAT), 'Có Hộp Phúc Lộc ạ');
  assert.equal(dienMau('Có {ten_sp} {link} ạ', [PHUC_LOC], CAI_DAT), 'Có Hộp Phúc Lộc ạ');
});

test('chỗ trống lạ giữ nguyên, sản phẩm không giá', () => {
  assert.equal(dienMau('{khac} {san_pham}', [{ ten: 'Phòng A', gia: null }], CAI_DAT), '{khac} Phòng A');
});
