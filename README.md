# Trợ lý bình luận bán hàng

Thấy bài khách hỏi mua trong nhóm Facebook/Threads: **dán bài vào trang**, trang tự đọc khách cần gì (giá, đặc điểm), gợi ý sản phẩm khớp nhất và viết sẵn bình luận. Bạn chạm **Chép**, quay lại Facebook dán và gửi.

- Dùng cho **mọi mặt hàng**: giỏ quà Tết, chung cư mini, mỹ phẩm… Mỗi mặt hàng là một "chiến dịch".
- Chạy trên **iPhone** (Safari) và máy tính. Không cần cài app, không cần đăng nhập, miễn phí.
- Dữ liệu (sản phẩm, giá, mẫu bình luận) nằm trong **file Google Sheets của bạn**. Sửa trong bảng tính là trang web cập nhật theo.
- Trang **không bao giờ tự bình luận**. Bạn luôn là người dán và bấm gửi, nên nick an toàn.

**Địa chỉ trang:** https://talama191.github.io/tro-ly-ban-hang/

---

## Bắt đầu (làm một lần, khoảng 10 phút, nên làm trên máy tính)

### Bước 1: Tạo file Google Sheets từ file mẫu

1. Tải file mẫu: [file-mau/tro-ly-ban-hang-mau.xlsx](file-mau/tro-ly-ban-hang-mau.xlsx) (bấm vào rồi bấm nút tải về).
2. Vào [drive.google.com](https://drive.google.com) → **Mới** → **Tải tệp lên** → chọn file vừa tải.
3. Mở file đó trong Drive → menu **Tệp** → **Lưu dưới dạng Google Trang tính**. Từ giờ chỉ dùng bản Google Trang tính này.
4. Bấm nút **Chia sẻ** (góc trên bên phải) → mục *Quyền truy cập chung* chọn **Bất kỳ ai có đường liên kết**, quyền **Người xem** → bấm **Sao chép đường liên kết**.

> Ai có link file đều xem được danh sách sản phẩm. Đó vốn là thông tin bạn đang quảng bá, nhưng **đừng để thông tin riêng tư** (giá nhập, số tài khoản…) trong file này.

### Bước 2: Nối trang web với file

1. Mở https://talama191.github.io/tro-ly-ban-hang/
2. Bấm **⚙︎** → dán link vừa sao chép → **Lưu và tải dữ liệu**.
3. Thấy dòng "Đang dùng Google Sheets của bạn: … sản phẩm" là xong.

Lúc này địa chỉ trên thanh trình duyệt có thêm đuôi `?sheet=...`. **Đó là link riêng của bạn**: mở link này ở đâu cũng ra đúng dữ liệu của bạn.

### Bước 3: Đưa lên iPhone

1. Gửi **link riêng** ở bước 2 (có đuôi `?sheet=...`) sang điện thoại, ví dụ qua Zalo "Cloud của tôi".
2. Mở link bằng **Safari** (nếu đang trong Zalo/Facebook, bấm nút "…" → *Mở bằng trình duyệt*).
3. Bấm nút **Chia sẻ** (ô vuông có mũi tên lên) → **Thêm vào MH chính** → **Thêm**.

Giờ trên màn hình điện thoại có icon **Trợ lý BL**, mở như một app.

> Cách khác: trên iPhone mở trang → ⚙︎ → dán link Google Sheets (lấy từ app Google Sheets: nút ⋯ → Chia sẻ và xuất → Sao chép đường liên kết) → rồi mới **Thêm vào MH chính**.

---

## Dùng hằng ngày

1. Trong Facebook, thấy bài khách hỏi → giữ tay vào nội dung bài → **Sao chép**.
2. Mở **Trợ lý BL** → bấm **Dán bài**.
3. Trang tự:
   - chọn đúng chiến dịch (giỏ quà hay chung cư…) theo từ khóa;
   - đọc mức giá (`200k`, `1tr5`, `4 củ`, `dưới 300k`, `tầm 3-4tr`…) và đặc điểm (biếu sếp, Cầu Giấy…);
   - xếp sản phẩm khớp nhất lên đầu và **tự chọn sẵn** sản phẩm đó;
   - cảnh báo nếu bài có vẻ là của người bán/rao (theo "Từ loại trừ").
4. Muốn gợi ý thêm sản phẩm thì chạm chọn thêm. Bình luận tự cập nhật, sửa tay được.
5. **↻ Mẫu**: đổi sang câu bình luận khác. **Chép bình luận**: chép vào bộ nhớ tạm.
6. Quay lại Facebook → giữ tay vào ô bình luận → **Dán** → gửi.

Mỗi lần chép, lần sau trang tự dùng mẫu kế tiếp để các bình luận không giống hệt nhau.

Không muốn dán cả bài? Gõ nhanh vào ô, ví dụ `200k biếu sếp` hoặc `cầu giấy 4tr`.

---

## Sửa dữ liệu trong Google Sheets

File có 4 trang tính, **giữ nguyên tên trang và dòng 1 (tên cột)**:

| Trang tính | Ghi gì |
|---|---|
| **Chiến dịch** | Mỗi dòng một mặt hàng. *Từ khóa*: chữ khách hay viết khi hỏi mua, cách nhau dấu phẩy. *Từ loại trừ*: chữ hay có trong bài của người bán/rao. |
| **Sản phẩm** | *Chiến dịch* ghi đúng tên chiến dịch. **Giá chỉ gõ số** (ví dụ `199000`). *Đặc điểm* cách nhau dấu phẩy. *Link ảnh* có thể là link Google Drive (ảnh phải chia sẻ công khai). *Còn hàng* gõ `Không` để tạm ẩn. |
| **Mẫu bình luận** | Mỗi dòng một câu mẫu. Nên có từ 3 mẫu mỗi chiến dịch. |
| **Cài đặt** | Tên, SĐT, Zalo của bạn để điền vào bình luận. |

**Chỗ trống tự điền trong mẫu bình luận:**

| Chỗ trống | Điền thành |
|---|---|
| `{san_pham}` | Tên + giá. Chọn 2 sản phẩm: "Giỏ A 199k và Hộp B 230k". Đặt ở cuối dòng thì thành danh sách gạch đầu dòng. |
| `{ten_sp}` `{gia}` `{mo_ta}` `{link}` | Của sản phẩm đầu tiên được chọn |
| `{ten_toi}` `{sdt}` `{zalo}` | Lấy ở trang Cài đặt |

Dòng nào chỉ chứa chỗ trống mà không có dữ liệu (ví dụ `Zalo: {zalo}` khi chưa điền Zalo) sẽ tự bị bỏ.

Sửa xong bảng tính: mở lại trang (hoặc ⚙︎ → **Tải lại dữ liệu**). Trang cũng tự tải bản mới khi bạn quay lại sau vài phút.

**Mẹo:**
- Viết bình luận tự nhiên, đúng câu hỏi của khách. Nhiều nhóm cấm để link trong bình luận, khi đó đừng dùng `{link}`, mời khách nhắn tin thay vào đó.
- Thêm cả cách viết tắt vào từ khóa và đặc điểm (`ccmn`, `cc mini`, `CG` cho Cầu Giấy). Không cần gõ không dấu, trang tự hiểu.
- Đặc điểm càng ít sản phẩm có (như tên khu vực) thì càng được ưu tiên khi khớp.

---

## Gặp lỗi?

| Thông báo | Cách sửa |
|---|---|
| "Không đọc được file Google Sheets" | Kiểm tra lại bước 1.4: file phải để *Bất kỳ ai có đường liên kết*. Kiểm tra mạng. |
| "Trang tính … thiếu cột …" | Tên trang tính hoặc tên cột ở dòng 1 bị sửa. So lại với file mẫu. |
| Sản phẩm không có giá | Ô *Giá* đang gõ chữ. Chỉ gõ số. |
| SĐT mất số 0 đầu | Trang tự thêm lại. Muốn chắc ăn, gõ có dấu cách: `0912 345 678`. |
| Icon ngoài màn hình chính mở ra dữ liệu mẫu | Icon được thêm trước khi lưu link. Xóa icon, mở **link riêng** (có `?sheet=`) rồi thêm lại. |
| Bấm "Dán bài" không được | Giữ tay vào ô trắng → chọn **Dán**. |

---

## Chuyển trang sang tài khoản GitHub của bạn (khi đã có tài khoản)

Hiện trang nằm tạm trong tài khoản GitHub **talama191** (Tuấn Anh), ở một kho riêng tên `tro-ly-ban-hang`, không dính gì đến các kho khác của anh ấy.

1. Bạn tạo tài khoản ở [github.com](https://github.com) và báo tên tài khoản cho Tuấn Anh.
2. Tuấn Anh mở kho `tro-ly-ban-hang` → **Settings** → cuối trang (*Danger Zone*) → **Transfer ownership** → nhập tên tài khoản của bạn → xác nhận.
3. Bạn vào email bấm chấp nhận. Kho chuyển sang `github.com/<tên-bạn>/tro-ly-ban-hang`.
4. Trong kho: **Settings** → **Pages** → kiểm tra *Branch* là `main`, thư mục `/ (root)` → **Save**.
5. Trang mới sẽ ở `https://<tên-bạn>.github.io/tro-ly-ban-hang/`. Địa chỉ cũ ngừng chạy, nên:
   - mở địa chỉ mới → ⚙︎ → dán lại link Google Sheets (file Google Sheets **giữ nguyên**, không phải làm lại);
   - xóa icon cũ trên iPhone, thêm icon mới theo bước 3.

---

## Dành cho người sửa code

- HTML/CSS/JavaScript thuần, không cần build. Mở bằng bất kỳ máy chủ tĩnh nào, ví dụ `npx http-server`.
- Phần xử lý nằm trong `js/` và có kiểm thử: `npm test` (Node 20+).
- `js/du-lieu-mau.js` là dữ liệu mẫu, cũng là nguồn sinh file Excel mẫu: sửa xong chạy `npm install` rồi `npm run tao-file-mau`.
- Thiết kế: [docs/specs/2026-11-26-thiet-ke-ban-dau.md](docs/specs/2026-11-26-thiet-ke-ban-dau.md). Ý tưởng chưa làm: [docs/y-tuong-de-sau.md](docs/y-tuong-de-sau.md).

| File | Việc |
|---|---|
| `js/gia.js` | Đọc mức giá trong bài (200k, 1tr5, 4 củ, dưới/trên, khoảng) |
| `js/khop.js` | Đoán chiến dịch, từ loại trừ, xếp sản phẩm |
| `js/binh-luan.js` | Điền mẫu bình luận |
| `js/sheet.js`, `js/csv.js` | Đọc Google Sheets qua địa chỉ `gviz` |
| `js/app.js` | Giao diện |
