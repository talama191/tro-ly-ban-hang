import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layIdSheet, chuyenDuLieu, taiDuLieu, LoiDuLieu } from '../js/sheet.js';
import { DU_LIEU_MAU } from '../js/du-lieu-mau.js';

const BANG = () => ({
  chienDich: [['Tên chiến dịch', 'Từ khoá', 'Từ loại trừ'], ['Giỏ quà Tết', 'giỏ quà, quà tết', 'xả kho']],
  sanPham: [
    ['Chiến dịch', 'Tên', 'Giá', 'Đặc điểm', 'Mô tả ngắn', 'Link', 'Link ảnh', 'Còn hàng'],
    ['Giỏ quà Tết', 'Giỏ A', '199k', 'biếu, sếp', 'mô tả', '', '', ''],
    ['Giỏ quà Tết', 'Giỏ B', '250000', '', '', '', '', 'Hết'],
    ['Giỏ quà Tết', 'Giỏ C', '1.200.000', '', '', '', '', 'có'],
    ['Giỏ quà Tết', '', '1', '', '', '', '', ''],
  ],
  mauBinhLuan: [['Chiến dịch', 'Nội dung'], ['Giỏ quà Tết', 'Bên em có {san_pham}'], ['Giỏ quà Tết', '']],
  caiDat: [['Tên của bạn', 'SĐT', 'Zalo'], ['Lan', '912345678', '0987 654 321']],
});

test('layIdSheet', () => {
  assert.equal(layIdSheet('https://docs.google.com/spreadsheets/d/1AbC_defGhijklmnopqrstuv/edit#gid=0'), '1AbC_defGhijklmnopqrstuv');
  assert.equal(layIdSheet('  1AbC_defGhijklmnopqrstuv  '), '1AbC_defGhijklmnopqrstuv');
  assert.equal(layIdSheet('abc'), null);
  assert.equal(layIdSheet('https://docs.google.com/spreadsheets/d/e/2PACX-1vQxyz/pubhtml'), null);
});

test('chuyenDuLieu: đọc đúng các trang', () => {
  const d = chuyenDuLieu(BANG());
  assert.deepEqual(d.chienDich, [{ ten: 'Giỏ quà Tết', tuKhoa: ['giỏ quà', 'quà tết'], tuLoaiTru: ['xả kho'] }]);
  assert.equal(d.sanPham.length, 3);
  assert.equal(d.sanPham[0].gia, 199000);
  assert.deepEqual(d.sanPham[0].dacDiem, ['biếu', 'sếp']);
  assert.equal(d.sanPham[1].gia, 250000);
  assert.equal(d.sanPham[1].conHang, false);
  assert.equal(d.sanPham[2].gia, 1200000);
  assert.equal(d.sanPham[2].conHang, true);
  assert.deepEqual(d.sanPham.map((p) => p.thuTu), [0, 1, 2]);
  assert.equal(d.mauBinhLuan.length, 1);
  assert.deepEqual(d.caiDat, { tenToi: 'Lan', sdt: '0912345678', zalo: '0987 654 321' });
});

test('chuyenDuLieu: giá số nhỏ hiểu là nghìn, giá trống là null', () => {
  const b = BANG();
  b.sanPham[1][2] = '200'; // dòng 0 là tiêu đề
  b.sanPham[2][2] = '';
  const d = chuyenDuLieu(b);
  assert.equal(d.sanPham[0].gia, 200000);
  assert.equal(d.sanPham[1].gia, null);
});

test('chuyenDuLieu: thiếu cột bắt buộc → LoiDuLieu nêu trang và cột', () => {
  const b = BANG();
  b.sanPham = b.sanPham.map((r) => r.filter((_, i) => i !== 2));
  assert.throws(() => chuyenDuLieu(b), (e) => e instanceof LoiDuLieu && e.message.includes('Sản phẩm') && e.message.includes('Giá'));
});

test('chuyenDuLieu: trang Cài đặt thiếu thì để trống', () => {
  const b = BANG();
  b.caiDat = b.chienDich; // gviz trả về trang đầu khi không có trang "Cài đặt"
  assert.deepEqual(chuyenDuLieu(b).caiDat, { tenToi: '', sdt: '', zalo: '' });
});

test('taiDuLieu: Google trả HTML (chưa chia sẻ) → LoiDuLieu', async () => {
  const fetchGia = async () => ({ ok: true, status: 200, text: async () => '<!DOCTYPE html><html>Đăng nhập</html>' });
  await assert.rejects(taiDuLieu('1AbC_defGhijklmnopqrstuv', fetchGia), LoiDuLieu);
});

test('taiDuLieu: lỗi mạng → LoiDuLieu', async () => {
  const fetchLoi = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(taiDuLieu('1AbC_defGhijklmnopqrstuv', fetchLoi), LoiDuLieu);
});

test('taiDuLieu: đọc đủ 4 trang qua gviz', async () => {
  const csv = (rows) => rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const b = BANG();
  const theoTen = { 'Chiến dịch': b.chienDich, 'Sản phẩm': b.sanPham, 'Mẫu bình luận': b.mauBinhLuan, 'Cài đặt': b.caiDat };
  const daGoi = [];
  const fetchGia = async (url) => {
    daGoi.push(url);
    const ten = new URL(url).searchParams.get('sheet');
    return { ok: true, status: 200, text: async () => csv(theoTen[ten]) };
  };
  const d = await taiDuLieu('1AbC_defGhijklmnopqrstuv', fetchGia);
  assert.equal(d.sanPham.length, 3);
  assert.ok(daGoi[0].startsWith('https://docs.google.com/spreadsheets/d/1AbC_defGhijklmnopqrstuv/gviz/tq?tqx=out:csv'));
});

test('DU_LIEU_MAU hợp lệ', () => {
  const ten = new Set(DU_LIEU_MAU.chienDich.map((c) => c.ten));
  assert.equal(ten.size, 2);
  assert.ok(DU_LIEU_MAU.sanPham.length >= 10);
  for (const p of DU_LIEU_MAU.sanPham) {
    assert.ok(ten.has(p.chienDich), p.ten);
    assert.equal(typeof p.gia, 'number', p.ten);
  }
  for (const m of DU_LIEU_MAU.mauBinhLuan) assert.ok(ten.has(m.chienDich));
  for (const c of ten) assert.ok(DU_LIEU_MAU.mauBinhLuan.filter((m) => m.chienDich === c).length >= 3, c);
});
