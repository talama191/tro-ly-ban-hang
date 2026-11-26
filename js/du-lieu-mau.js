// Dữ liệu mẫu để dùng thử khi chưa nối Google Sheets. File Excel mẫu cũng sinh từ đây.
// Tên sản phẩm, giá, địa chỉ đều là ví dụ.

const qua = (ten, gia, dacDiem, moTa) => ({ chienDich: 'Giỏ quà Tết', ten, gia, dacDiem, moTa, link: '', anh: '', conHang: true });
const phong = (ten, gia, dacDiem, moTa) => ({ chienDich: 'Chung cư mini', ten, gia, dacDiem, moTa, link: '', anh: '', conHang: true });

const sanPham = [
  qua('Giỏ Lộc Xuân', 159000, ['nhân viên', 'công ty', 'nhỏ gọn'], 'Trà sen, hạt điều, mứt gừng, thiệp chúc Tết'),
  qua('Giỏ An Khang', 199000, ['gia đình', 'nhân viên', 'không rượu'], 'Trà, bánh quy bơ, mứt dừa, kẹo lạc'),
  qua('Hộp Phúc Lộc', 249000, ['biếu', 'gia đình', 'hộp quà'], 'Hộp sơn mài: trà ô long, hạt macca, chà là'),
  qua('Giỏ Đại Cát', 350000, ['biếu', 'đối tác', 'có rượu'], 'Vang Chile, bánh quy, trà, hạt dinh dưỡng'),
  qua('Hộp Phú Quý', 499000, ['biếu sếp', 'sang trọng', 'có rượu'], 'Vang Pháp, hạt dinh dưỡng, socola, trà'),
  qua('Giỏ Thịnh Vượng', 690000, ['biếu sếp', 'đối tác', 'sang trọng'], 'Vang Ý, hạt macca, nấm linh chi, trà'),
  qua('Hộp Tài Lộc', 890000, ['biếu sếp', 'cao cấp', 'có rượu'], 'Vang Pháp, yến chưng, hạt nhập khẩu'),
  qua('Giỏ Vạn Phúc', 1200000, ['biếu sếp', 'cao cấp', 'có rượu', 'yến'], 'Yến sào, vang Ý, sâm, hạt nhập khẩu'),
  phong('Studio Trần Thái Tông', 4500000, ['cầu giấy', 'full đồ', 'ban công', 'thang máy'], '30m2, full nội thất, ban công thoáng'),
  phong('Phòng gác xép Xuân Thủy', 3500000, ['cầu giấy', 'gác xép', 'sinh viên'], '25m2, gác xép, gần các trường đại học'),
  phong('Căn 1 ngủ 1 khách Thái Hà', 6000000, ['đống đa', '1 ngủ', 'thang máy', 'full đồ'], '40m2, tách bếp, full nội thất'),
  phong('Studio Nguyễn Trãi', 4000000, ['thanh xuân', 'full đồ', 'cửa sổ'], '28m2, cửa sổ lớn, khóa vân tay'),
  phong('Phòng khép kín Chùa Láng', 3800000, ['đống đa', 'khép kín', 'sinh viên', 'không chung chủ'], '22m2, khép kín, giờ giấc tự do'),
];

export const DU_LIEU_MAU = {
  chienDich: [
    {
      ten: 'Giỏ quà Tết',
      tuKhoa: ['giỏ quà', 'quà tết', 'quà biếu', 'hộp quà', 'giỏ tết', 'quà tặng tết', 'quà doanh nghiệp', 'quà nhân viên'],
      tuLoaiTru: ['nhận sỉ', 'tuyển ctv', 'xả kho', 'thanh lý'],
    },
    {
      ten: 'Chung cư mini',
      tuKhoa: ['chung cư mini', 'ccmn', 'tìm phòng', 'thuê phòng', 'cần thuê', 'tìm nhà', 'phòng trọ', 'căn hộ mini', 'studio'],
      tuLoaiTru: ['cho thuê', 'chính chủ', 'còn phòng', 'trống phòng', 'cần pass', 'nhượng phòng'],
    },
  ],
  sanPham: sanPham.map((p, thuTu) => ({ ...p, thuTu })),
  mauBinhLuan: [
    { chienDich: 'Giỏ quà Tết', noiDung: 'Dạ chị tham khảo {san_pham} bên em nhé, giỏ đóng sẵn đẹp, giao tận nơi ạ. Chị ib em hoặc Zalo {zalo} để em gửi ảnh thật nha!' },
    { chienDich: 'Giỏ quà Tết', noiDung: 'Bên em đang có {san_pham} đúng tầm chị cần nè ạ 🎁 Chị nhắn em để xem ảnh và chọn mẫu nhé!' },
    { chienDich: 'Giỏ quà Tết', noiDung: 'Em có mẫu {san_pham}, đóng hộp sẵn, có thiệp chúc Tết ạ. Liên hệ {ten_toi} – {sdt} nha chị.' },
    { chienDich: 'Chung cư mini', noiDung: 'Bên em đang có {san_pham}, phòng mới sạch sẽ, xem phòng ngay được ạ. Bạn ib em gửi video phòng nhé!' },
    { chienDich: 'Chung cư mini', noiDung: 'Bạn tham khảo {san_pham} nha, giờ giấc tự do, xem phòng buổi tối được. Liên hệ {ten_toi} {sdt} ạ.' },
    { chienDich: 'Chung cư mini', noiDung: 'Em có phòng hợp tầm giá bạn cần: {san_pham}. Bạn nhắn em hoặc gọi {sdt} để đi xem nhé!' },
  ],
  caiDat: { tenToi: 'Mai', sdt: '0900 000 000', zalo: '0900 000 000' },
};
