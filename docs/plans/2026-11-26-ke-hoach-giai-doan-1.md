# Trợ lý bình luận (giai đoạn 1): kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang web tĩnh: dán bài khách → đọc giá + đặc điểm → xếp sản phẩm khớp → chép bình luận điền sẵn; dữ liệu từ Google Sheets.

**Architecture:** HTML/CSS/JS thuần (ES module, không build). Phần xử lý là các module thuần, kiểm thử bằng `node --test`; `js/app.js` chỉ nối giao diện. Dữ liệu đọc từ `https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv&headers=1&sheet={tên}`.

**Tech Stack:** JavaScript thuần, Node 26 (`node --test`), `exceljs` (chỉ để sinh file Excel mẫu), GitHub Pages.

**Spec:** `docs/specs/2026-11-26-thiet-ke-ban-dau.md`

## Global Constraints

- Toàn bộ chữ trên giao diện và thông báo lỗi bằng tiếng Việt có dấu.
- Không chứa link Google Sheets hay dữ liệu thật của chủ dự án trong kho code.
- Không tự gửi bình luận; chỉ chép vào bộ nhớ tạm.
- Tên trang tính cố định: `Chiến dịch`, `Sản phẩm`, `Mẫu bình luận`, `Cài đặt`.
- Chạy trên Safari iPhone (iOS 16+) và Chrome máy tính; bố cục ưu tiên màn hình 375px.
- Không đổi cấu hình git chung (`--global`) của máy.

## Review Focus

1. Số không phải giá (`25m2`, `tầng 3`, `0912345678`, `10 giỏ`, `20/1`) → không được hiểu là giá. Test ở Task 2.
2. Link Sheets sai, chưa chia sẻ, hay sai tên trang tính (gviz trả về trang đầu) → báo lỗi tiếng Việt nói rõ cách sửa, không trắng trang. Test ở Task 5.
3. SĐT bị Google Sheets đổi thành số và mất số 0 đầu (`912345678`) → tự thêm lại `0`. Test ở Task 5.
4. Giá trong bảng tính gõ dạng chữ (`199k`, `199.000`) → vẫn hiểu đúng. Test ở Task 5.
5. Mở từ icon màn hình chính iPhone (bộ nhớ riêng) → vẫn có link Sheets nhờ `?sheet=` trên địa chỉ. Kiểm tra tay ở Task 6.

## Kiểu dữ liệu chung

```js
// DuLieu
{
  chienDich:   [{ ten: string, tuKhoa: string[], tuLoaiTru: string[] }],
  sanPham:     [{ chienDich: string, ten: string, gia: number|null, dacDiem: string[],
                  moTa: string, link: string, anh: string, conHang: boolean, thuTu: number }],
  mauBinhLuan: [{ chienDich: string, noiDung: string }],
  caiDat:      { tenToi: string, sdt: string, zalo: string }
}
// MucGia
{ min: number, max: number, kieu: 'tam'|'duoi'|'tren'|'khoang', nhan: string }
```

---

### Task 1: Khung dự án + chuẩn hóa chữ

**Files:** Create `package.json` (`"type":"module"`, script `test: node --test tests/`), `.gitignore`, `js/chuan-hoa.js`, `tests/chuan-hoa.test.js`.

**Interfaces — Produces:**
- `chuanHoa(s: string) -> string`: chữ thường, bỏ dấu, `đ→d`, gộp khoảng trắng.
- `tachDanhSach(s: string) -> string[]`: tách theo `,` `;` xuống dòng, bỏ rỗng, trim.
- `coCum(vanBanChuanHoa: string, cum: string) -> boolean`: cụm (đã chuẩn hóa) xuất hiện trọn từ, không dính chữ cái/số hai bên.

- [ ] Test: `chuanHoa('Giỏ Quà  TẾT Đẹp') === 'gio qua tet dep'`; `tachDanhSach('a, b;c\n ,') ` → `['a','b','c']`; `coCum('gan cau giay', 'cau giay') === true`; `coCum('tet', 'te') === false`.
- [ ] Chạy `npm test` → FAIL. Viết code. Chạy lại → PASS.
- [ ] `git init`, commit.

### Task 2: Đọc mức giá

**Files:** Create `js/gia.js`, `tests/gia.test.js`.

**Interfaces — Produces:**
- `docGia(text: string, tuyChon?: { giaThamChieu?: number }) -> MucGia|null`
- `dinhDangGia(n: number) -> string`

Quy tắc: xem spec 5.2. "Tầm" ±25%. Số trần (không đơn vị) chỉ nhận khi có từ chỉ giá trước nó; đơn vị đoán bằng cách chọn hệ số (1.000 hay 1.000.000) cho kết quả gần `giaThamChieu` nhất (theo tỉ lệ), mặc định 1.000. `lít`/`xị` = 100.000, chỉ khi có từ chỉ giá. Số bắt đầu bằng 0 dài ≥ 9 chữ số, số dính `m2`/`m`, số sau "tầng/phòng/ngày" không phải giá.

- [ ] Test (mỗi dòng là một assert về `min`/`max`/`kieu`):
  - `'giỏ quà tầm 200k'` → 150000/250000/'tam'; `nhan === '~200k'`
  - `'dưới 300k'` và `'300k đổ lại'` → 0/300000/'duoi'; `nhan === 'dưới 300k'`
  - `'trên 1tr'` → 1000000/Infinity/'tren'; `nhan === 'trên 1tr'`
  - giữa khoảng (`(min+max)/2` với 'tam'): `'1tr5'` → 1500000; `'1 triệu 2'` → 1200000; `'1,5 triệu'` → 1500000; `'4 củ'` → 4000000; `'2 trăm rưỡi'` → 250000; `'tầm 3 lít'` → 300000; `'200.000đ'` → 200000; `'cần 10 giỏ quà tầm 300k'` → 300000
  - `'200-300k'` → 200000/300000/'khoang'; `nhan === '200k–300k'`; `'từ 3 đến 4tr'` và `'3-4tr'` → 3000000/4000000
  - `docGia('tầm 200', {giaThamChieu: 300000})` giữa = 200000; `docGia('tầm 5', {giaThamChieu: 4500000})` giữa = 5000000
  - `null`: `'rượu 1 lít'`, `'phòng 25m2 tầng 3'`, `'sđt 0912345678'`, `'cần 10 giỏ'`, `'ship trước 20/1'`, `''`
  - `dinhDangGia`: 199000→'199k', 1500000→'1tr5', 2000000→'2tr', 1250000→'1tr250', 199500→'199.500đ'
- [ ] FAIL → code → PASS → commit.

### Task 3: Khớp chiến dịch và sản phẩm

**Files:** Create `js/khop.js`, `tests/khop.test.js`.

**Interfaces — Consumes:** `chuanHoa`, `coCum` (Task 1); `MucGia` (Task 2).
**Produces:**
- `doanChienDich(text, chienDich[]) -> string|null`: tên chiến dịch có nhiều từ khóa khớp nhất; hòa thì cái đứng trước; 0 khớp → `null`.
- `timTuLoaiTru(text, chienDich) -> string[]`: các từ loại trừ (nguyên văn) có trong bài.
- `giaThamChieu(sanPham[]) -> number|undefined`: trung vị giá (bỏ null).
- `xepSanPham(text, sanPham[], mucGia: MucGia|null) -> KetQua[]`, `KetQua = { sp, diem: number, trongTamGia: boolean|null, dacDiemKhop: string[] }`. Bỏ `conHang === false`. Không có giá và không đặc điểm khớp → giữ `thuTu`. Sắp theo `diem` giảm, hòa theo `thuTu`.
- `nhuCauDocDuoc(text, sanPham[]) -> string[]`: các đặc điểm (nguyên văn, không trùng) của mọi sản phẩm có trong bài.

Chấm điểm: trong tầm giá 1 + (0..0.5 càng gần điểm mong muốn càng cao: 'tam'/'khoang' = giữa, 'duoi' = max, 'tren' = min); ngoài tầm −(khoảng lệch / max(giá mong muốn,1)). Mỗi đặc điểm khớp +0.6.

- [ ] Test với dữ liệu nhỏ dựng trong test (3 giỏ quà 150k/199k/350k, đặc điểm 'biếu sếp' ở giỏ 350k):
  - `doanChienDich('cần giỏ quà tết', [quà, chung cư])` → 'Giỏ quà Tết'; `doanChienDich('xin chào', ...)` → null
  - `timTuLoaiTru('chính chủ cho thuê phòng', ccmn)` → `['cho thuê','chính chủ']` (theo thứ tự trong cột)
  - `xepSanPham('tầm 200k', sp, docGia('tầm 200k'))[0].sp.gia === 199000`, `trongTamGia === true`; giỏ 350k có `trongTamGia === false`
  - `xepSanPham('quà biếu sếp', sp, null)[0].sp.ten` là giỏ 350k, `dacDiemKhop` = `['biếu sếp']`
  - sản phẩm `conHang:false` không có trong kết quả; `xepSanPham('', sp, null)` giữ đúng thứ tự `thuTu`
- [ ] FAIL → code → PASS → commit.

### Task 4: Điền mẫu bình luận

**Files:** Create `js/binh-luan.js`, `tests/binh-luan.test.js`.

**Interfaces — Consumes:** `dinhDangGia` (Task 2). **Produces:** `dienMau(noiDung: string, chon: SanPham[], caiDat) -> string`.

Chỗ trống: `{san_pham}` (1 sp: "Tên giá"; nhiều sp: xuống dòng + mỗi dòng "• Tên – giá"), `{ten_sp} {gia} {mo_ta} {link}` (sp đầu), `{ten_toi} {sdt} {zalo}`. Giá trị trống → bỏ chỗ trống; dòng chỉ còn khoảng trắng/dấu câu → bỏ dòng; gộp khoảng trắng thừa. Chỗ trống lạ giữ nguyên.

- [ ] Test: một sp → `'Bên em có Giỏ An Khang 199k nhé, zalo 0912345678'`; hai sp → chứa `'\n• Giỏ An Khang – 199k\n• Hộp Phúc Lộc – 230k'`; `link` trống thì dòng `'Xem: {link}'` biến mất; `{khac}` giữ nguyên.
- [ ] FAIL → code → PASS → commit.

### Task 5: Đọc Google Sheets + dữ liệu mẫu

**Files:** Create `js/csv.js`, `js/sheet.js`, `js/du-lieu-mau.js`, `tests/csv.test.js`, `tests/sheet.test.js`.

**Interfaces — Consumes:** `tachDanhSach`, `chuanHoa` (Task 1); `docGia` (Task 2, để hiểu giá dạng chữ).
**Produces:**
- `docCsv(text) -> string[][]` (RFC 4180: ngoặc kép, `""`, xuống dòng trong ô, `\r\n`).
- `layIdSheet(linkHoacId: string) -> string|null` (nhận link `/spreadsheets/d/{id}/...` hoặc id trần ≥ 20 ký tự `[A-Za-z0-9_-]`).
- `chuyenDuLieu(bang: { [tenTrang]: string[][] }) -> DuLieu`, ném `LoiDuLieu` (lớp lỗi, `message` tiếng Việt) khi thiếu cột bắt buộc của trang nào: báo tên trang + cột thiếu.
- `taiDuLieu(id: string, fetchFn = fetch) -> Promise<DuLieu>`: tải 4 trang song song; HTTP lỗi/không phải CSV (Google trả trang đăng nhập HTML) → `LoiDuLieu('Không đọc được file. Kiểm tra đã chia sẻ "Bất kỳ ai có đường liên kết"…')`.
- `TRANG = { chienDich: 'Chiến dịch', sanPham: 'Sản phẩm', mauBinhLuan: 'Mẫu bình luận', caiDat: 'Cài đặt' }`, `COT` = tên cột như spec 5.1.
- `DU_LIEU_MAU: DuLieu` (2 chiến dịch: Giỏ quà Tết 8 sp 150k–1tr2, 3 mẫu; Chung cư mini 5 phòng 3tr5–6tr ở Cầu Giấy/Đống Đa/Thanh Xuân, 3 mẫu; cài đặt tên "Bạn", sđt "0900 000 000").

So cột không phân biệt hoa thường/dấu (dùng `chuanHoa`). Giá: số → giữ; chữ → `docGia(chữ)` lấy giữa; rỗng → null. SĐT/Zalo toàn số dài 9 → thêm `0`. `Còn hàng` rỗng = true, chuẩn hóa là "khong"/"het" = false. Dòng không có Tên bị bỏ.

- [ ] Test: `docCsv('"a","b ""x"""\r\n"1","dòng\nhai"')` → `[['a','b "x"'],['1','dòng\nhai']]`; `layIdSheet('https://docs.google.com/spreadsheets/d/1AbC_defGhijklmnopqrstuv/edit#gid=0') === '1AbC_defGhijklmnopqrstuv'`, `layIdSheet('abc') === null`; `chuyenDuLieu` với giá `'199k'` → 199000, sđt `'912345678'` → `'0912345678'`, `Còn hàng` `'Hết'` → false; thiếu cột `Giá` ở trang `Sản phẩm` → ném `LoiDuLieu` có chữ `Sản phẩm` và `Giá`; `taiDuLieu` với `fetchFn` giả trả HTML → ném `LoiDuLieu`; `DU_LIEU_MAU` qua được kiểm tra hình dạng (mỗi sản phẩm có chiến dịch tồn tại).
- [ ] FAIL → code → PASS → commit.

### Task 6: Giao diện

**Files:** Create `index.html`, `css/style.css`, `js/app.js`, `manifest.webmanifest`, `icon-180.png`.

**Interfaces — Consumes:** mọi hàm ở Task 1–5.

Hành vi (spec 5.4): lấy `?sheet=` từ địa chỉ trước, rồi `localStorage`; lưu link thì ghi lại `?sheet=` vào địa chỉ (`history.replaceState`). Mở ra hiện bản lưu trong máy ngay, tải bản mới ở nền. Gõ/dán → tính lại (trễ 150ms). Đổi mẫu xoay vòng theo chiến dịch, con trỏ lưu `localStorage`, tự sang mẫu kế sau mỗi lần chép. Chép: `navigator.clipboard.writeText`, dự phòng `execCommand('copy')`. Ảnh link Drive `/file/d/{id}` → `https://drive.google.com/thumbnail?id={id}&sz=w1000`. Nút "Dán" dùng `navigator.clipboard.readText` (lỗi thì nhắc giữ tay vào ô để dán).

- [ ] Chạy `npx serve`/server tĩnh, mở ở cỡ 375×812: dán `'cần giỏ quà tầm 200k biếu sếp'` → chiến dịch tự sang Giỏ quà Tết, chip "~200k", sản phẩm 199k lên đầu; chọn 2 sp → bình luận có danh sách; Chép → thông báo; "Mẫu khác" đổi nội dung; dán `'chính chủ cho thuê ccmn 25m2'` → cảnh báo người rao; link Sheets sai → thông báo lỗi tiếng Việt; tải thật bảng tính công khai mẫu của Google qua gviz để xác nhận không bị chặn CORS.
- [ ] Commit.

### Task 7: File Excel mẫu + hướng dẫn

**Files:** Create `scripts/tao-file-mau.mjs` (đọc `DU_LIEU_MAU`, ghi `file-mau/tro-ly-ban-hang-mau.xlsx` đủ 4 trang, cột đúng `COT`, cột SĐT/Zalo định dạng chữ), `README.md` (hướng dẫn từng bước cho người không rành kỹ thuật: dựng Google Sheets, chia sẻ, dán link, thêm ra màn hình chính iPhone, viết mẫu bình luận, chuyển kho sang tài khoản riêng), `docs/y-tuong-de-sau.md`. Modify `../README.md` (bảng dự án).

- [ ] `npm run tao-file-mau` → có file; đọc lại bằng exceljs thấy 4 trang, tiêu đề đúng; `chuyenDuLieu` đọc được dữ liệu xuất ra từ file (kiểm bằng test `tests/file-mau.test.js`).
- [ ] Commit.

### Task 8: Đăng GitHub Pages

- [ ] `gh repo create talama191/tro-ly-ban-hang --public`; remote HTTPS; credential helper `gh` đặt **trong kho** (`git config --local`), không đụng `--global`.
- [ ] Push `main`; bật Pages (`gh api -X POST repos/talama191/tro-ly-ban-hang/pages -f source[branch]=main -f source[path]=/`).
- [ ] Mở `https://talama191.github.io/tro-ly-ban-hang/` ở cỡ điện thoại, chạy lại kịch bản Task 6 với dữ liệu mẫu.
