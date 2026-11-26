import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docGia, dinhDangGia } from '../js/gia.js';

const giua = (m) => (m.min + m.max) / 2;

test('tầm 200k → ±25%', () => {
  const m = docGia('giỏ quà tầm 200k');
  assert.equal(m.min, 150000);
  assert.equal(m.max, 250000);
  assert.equal(m.kieu, 'tam');
  assert.equal(m.nhan, '~200k');
});

test('dưới / đổ lại → giới hạn trên', () => {
  for (const s of ['dưới 300k', '300k đổ lại', 'không quá 300k', 'tối đa 300 nghìn', '300k trở xuống']) {
    const m = docGia(s);
    assert.ok(m, s);
    assert.equal(m.min, 0, s);
    assert.equal(m.max, 300000, s);
    assert.equal(m.kieu, 'duoi', s);
    assert.equal(m.nhan, 'dưới 300k', s);
  }
});

test('trên / trở lên → giới hạn dưới', () => {
  for (const s of ['trên 1tr', '1 triệu trở lên']) {
    const m = docGia(s);
    assert.equal(m.min, 1000000, s);
    assert.equal(m.max, Infinity, s);
    assert.equal(m.kieu, 'tren', s);
    assert.equal(m.nhan, 'trên 1tr', s);
  }
});

test('các cách viết giá', () => {
  const ca = {
    '1tr5': 1500000,
    'tầm 1tr2 thôi': 1200000,
    '1 triệu 2': 1200000,
    '1 triệu 500 nghìn': 1500000,
    '1,5 triệu': 1500000,
    '1.5tr': 1500000,
    '4 củ': 4000000,
    'phòng tầm 4 củ rưỡi': 4500000,
    '2 trăm rưỡi': 250000,
    '2 trăm': 200000,
    'tầm 3 lít': 300000,
    'giá 5 xị': 500000,
    '200.000đ': 200000,
    '200,000 vnđ': 200000,
    'Giỏ 200K nhé': 200000,
    '200 ngàn': 200000,
    'cần 10 giỏ quà tầm 300k': 300000,
    'budget 500k': 500000,
    'tầm 200000': 200000,
  };
  for (const [s, gt] of Object.entries(ca)) {
    const m = docGia(s);
    assert.ok(m, `không đọc được: ${s}`);
    assert.equal(giua(m), gt, s);
  }
});

test('khoảng giá', () => {
  for (const s of ['200-300k', '200k - 300k', 'từ 200 đến 300k', '200 tới 300 nghìn']) {
    const m = docGia(s);
    assert.ok(m, s);
    assert.equal(m.min, 200000, s);
    assert.equal(m.max, 300000, s);
    assert.equal(m.kieu, 'khoang', s);
    assert.equal(m.nhan, '200k–300k', s);
  }
  for (const s of ['từ 3 đến 4tr', '3-4tr', '3tr-4tr']) {
    const m = docGia(s);
    assert.equal(m.min, 3000000, s);
    assert.equal(m.max, 4000000, s);
  }
});

test('số trần đoán đơn vị theo giá tham chiếu', () => {
  assert.equal(giua(docGia('tầm 200', { giaThamChieu: 300000 })), 200000);
  assert.equal(giua(docGia('tầm 5', { giaThamChieu: 4500000 })), 5000000);
  assert.equal(docGia('dưới 4.5', { giaThamChieu: 4500000 }).max, 4500000);
  assert.equal(giua(docGia('tầm 200')), 200000); // mặc định nghìn
  const m = docGia('tầm 2-3 trăm');
  assert.equal(m.min, 200000);
  assert.equal(m.max, 300000);
});

test('không nhầm số khác thành giá', () => {
  for (const s of [
    'rượu 1 lít',
    'phòng 25m2 tầng 3',
    'sđt 0912345678',
    'cần 10 giỏ',
    'ship trước 20/1',
    'phòng 2 ngủ gần ĐH Bách Khoa',
    'năm 2026',
    '',
  ]) {
    assert.equal(docGia(s), null, s);
  }
});

test('dinhDangGia', () => {
  assert.equal(dinhDangGia(199000), '199k');
  assert.equal(dinhDangGia(1500000), '1tr5');
  assert.equal(dinhDangGia(2000000), '2tr');
  assert.equal(dinhDangGia(1250000), '1tr250');
  assert.equal(dinhDangGia(199500), '199.500đ');
  assert.equal(dinhDangGia(null), '');
});
