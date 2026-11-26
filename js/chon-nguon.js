// Khi mở trang: dùng file Google Sheets nào?
// - tuDiaChi: mã file trên địa chỉ (?sheet=), daLuu: mã file đang dùng trong máy
// - daBiet: các mã file người dùng từng dùng trên máy này
// - dungMau: người dùng đã chủ động chọn "Dùng dữ liệu mẫu"
// - hoi(): hỏi người dùng có chuyển sang file lạ không (trả về true/false)
// Link lạ có thể là của người khác (chèn SĐT/link lừa đảo vào bình luận) nên phải hỏi;
// link cũ của chính mình (icon màn hình chính iPhone còn giữ) thì không hỏi.

export function chonIdSheet({ tuDiaChi, daLuu, daBiet = [], dungMau = false, hoi }) {
  if (!tuDiaChi || tuDiaChi === daLuu) return daLuu ?? tuDiaChi ?? null;
  if (daBiet.includes(tuDiaChi)) return daLuu ?? (dungMau ? null : tuDiaChi);
  if (!daLuu && !dungMau) return tuDiaChi; // lần đầu mở link riêng của mình
  return hoi() ? tuDiaChi : daLuu ?? null;
}
