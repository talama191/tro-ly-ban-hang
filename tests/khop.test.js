import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doanChienDich, timTuLoaiTru, giaThamChieu, xepSanPham, nhuCauDocDuoc } from '../js/khop.js';
import { docGia } from '../js/gia.js';

const QUA = { ten: 'Giỏ quà Tết', tuKhoa: ['giỏ quà', 'quà tết', 'quà biếu', 'hộp quà'], tuLoaiTru: [] };
const CCMN = { ten: 'Chung cư mini', tuKhoa: ['chung cư mini', 'ccmn', 'tìm phòng', 'thuê phòng'], tuLoaiTru: ['cho thuê', 'chính chủ', 'còn phòng'] };

const sp = (ten, gia, dacDiem, thuTu, conHang = true) => ({
  chienDich: 'Giỏ quà Tết', ten, gia, dacDiem, moTa: '', link: '', anh: '', conHang, thuTu,
});
const SP = [
  sp('Giỏ Lộc Xuân', 150000, ['nhân viên'], 0),
  sp('Giỏ An Khang', 199000, ['gia đình'], 1),
  sp('Hộp Phú Quý', 350000, ['biếu sếp', 'sang trọng'], 2),
  sp('Giỏ hết hàng', 200000, [], 3, false),
];

test('doanChienDich', () => {
  assert.equal(doanChienDich('cần giỏ quà tết', [QUA, CCMN]), 'Giỏ quà Tết');
  assert.equal(doanChienDich('em cần tìm phòng ccmn Cầu Giấy', [QUA, CCMN]), 'Chung cư mini');
  assert.equal(doanChienDich('xin chào', [QUA, CCMN]), null);
});

test('timTuLoaiTru giữ nguyên văn và thứ tự cột', () => {
  assert.deepEqual(timTuLoaiTru('chính chủ cho thuê phòng', CCMN), ['cho thuê', 'chính chủ']);
  assert.deepEqual(timTuLoaiTru('cần thuê phòng', CCMN), []);
});

test('giaThamChieu là trung vị, bỏ giá trống', () => {
  assert.equal(giaThamChieu([{ gia: 100 }, { gia: null }, { gia: 300 }, { gia: 200 }]), 200);
  assert.equal(giaThamChieu([{ gia: 100 }, { gia: 300 }]), 200);
  assert.equal(giaThamChieu([]), undefined);
});

test('xepSanPham theo giá', () => {
  const kq = xepSanPham('tầm 200k', SP, docGia('tầm 200k'));
  assert.equal(kq[0].sp.gia, 199000);
  assert.equal(kq[0].trongTamGia, true);
  assert.equal(kq.find((k) => k.sp.gia === 350000).trongTamGia, false);
  assert.ok(!kq.some((k) => k.sp.ten === 'Giỏ hết hàng'));
});

test('xepSanPham theo đặc điểm', () => {
  const kq = xepSanPham('cần quà biếu sếp', SP, null);
  assert.equal(kq[0].sp.ten, 'Hộp Phú Quý');
  assert.deepEqual(kq[0].dacDiemKhop, ['biếu sếp']);
  assert.equal(kq[0].trongTamGia, null);
});

test('dưới 300k ưu tiên sát ngân sách', () => {
  const kq = xepSanPham('dưới 300k', SP, docGia('dưới 300k'));
  assert.equal(kq[0].sp.gia, 199000);
  assert.equal(kq[1].sp.gia, 150000);
});

test('không có gì để khớp thì giữ thứ tự bảng tính', () => {
  const kq = xepSanPham('', SP, null);
  assert.deepEqual(kq.map((k) => k.sp.thuTu), [0, 1, 2]);
});

test('đặc điểm hiếm (khu vực) nặng ký hơn đặc điểm phổ biến', () => {
  const p = (ten, gia, dacDiem, thuTu) => ({ chienDich: 'CCMN', ten, gia, dacDiem, moTa: '', link: '', anh: '', conHang: true, thuTu });
  const phong = [
    p('Trần Thái Tông', 4500000, ['cầu giấy', 'full đồ'], 0),
    p('Xuân Thủy', 3500000, ['cầu giấy', 'gác xép'], 1),
    p('Thái Hà', 6000000, ['đống đa', 'full đồ'], 2),
    p('Nguyễn Trãi', 4000000, ['thanh xuân', 'full đồ'], 3),
    p('Chùa Láng', 3800000, ['đống đa', 'khép kín'], 4),
  ];
  const bai = 'cần phòng Cầu Giấy, full đồ, tầm 4 củ đổ lại';
  const kq = xepSanPham(bai, phong, docGia(bai));
  assert.equal(kq[0].sp.ten, 'Xuân Thủy');
});

test('nhuCauDocDuoc', () => {
  assert.deepEqual(nhuCauDocDuoc('quà Biếu Sếp cho gia đình', SP), ['gia đình', 'biếu sếp']);
});
