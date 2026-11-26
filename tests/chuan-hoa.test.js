import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chuanHoa, tachDanhSach, coCum } from '../js/chuan-hoa.js';

test('chuanHoa: chữ thường, bỏ dấu, đ→d, gộp khoảng trắng', () => {
  assert.equal(chuanHoa('Giỏ Quà  TẾT Đẹp'), 'gio qua tet dep');
  assert.equal(chuanHoa('  Đống   Đa\n'), 'dong da');
  assert.equal(chuanHoa(null), '');
});

test('tachDanhSach: tách theo dấu phẩy, chấm phẩy, xuống dòng', () => {
  assert.deepEqual(tachDanhSach('a, b;c\n ,'), ['a', 'b', 'c']);
  assert.deepEqual(tachDanhSach(''), []);
  assert.deepEqual(tachDanhSach(undefined), []);
});

test('coCum: khớp trọn từ', () => {
  assert.equal(coCum('gan cau giay', 'cau giay'), true);
  assert.equal(coCum('tet', 'te'), false);
  assert.equal(coCum('qua bieu sep.', 'bieu sep'), true);
  assert.equal(coCum('abc', ''), false);
});
