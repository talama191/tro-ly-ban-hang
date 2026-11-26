import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chonIdSheet } from '../js/chon-nguon.js';

const khongHoi = () => { throw new Error('không được hỏi'); };

test('lần đầu mở link riêng: nhận luôn', () => {
  assert.equal(chonIdSheet({ tuDiaChi: 'B', daLuu: null, daBiet: [], dungMau: false, hoi: khongHoi }), 'B');
});

test('không có link trên địa chỉ: dùng file đã lưu', () => {
  assert.equal(chonIdSheet({ tuDiaChi: null, daLuu: 'B', daBiet: ['B'], dungMau: false, hoi: khongHoi }), 'B');
});

test('icon màn hình chính còn link cũ của chính mình: giữ file đang dùng, không hỏi', () => {
  assert.equal(chonIdSheet({ tuDiaChi: 'A', daLuu: 'B', daBiet: ['A', 'B'], dungMau: false, hoi: khongHoi }), 'B');
});

test('link lạ khác file đang dùng: phải hỏi', () => {
  assert.equal(chonIdSheet({ tuDiaChi: 'C', daLuu: 'B', daBiet: ['B'], dungMau: false, hoi: () => true }), 'C');
  assert.equal(chonIdSheet({ tuDiaChi: 'C', daLuu: 'B', daBiet: ['B'], dungMau: false, hoi: () => false }), 'B');
});

test('đã chọn dữ liệu mẫu: link cũ không tự nối lại; link lạ thì hỏi', () => {
  assert.equal(chonIdSheet({ tuDiaChi: 'A', daLuu: null, daBiet: ['A'], dungMau: true, hoi: khongHoi }), null);
  assert.equal(chonIdSheet({ tuDiaChi: 'C', daLuu: null, daBiet: ['A'], dungMau: true, hoi: () => true }), 'C');
});
