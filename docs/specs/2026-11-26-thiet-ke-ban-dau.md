# Trợ lý bình luận bán hàng: thiết kế bản đầu (giai đoạn 1)

> Ngày viết: 26/11/2026. Trạng thái: **đã duyệt trong cuộc trò chuyện** ("oke - làm đi").
> Tên "Trợ lý bình luận" là tên tạm.

## 1. Ý tưởng và lý do

**Một câu:** khi thấy bài của khách trong nhóm Facebook/Threads, dán bài vào trang web là có ngay sản phẩm khớp nhu cầu (giá, đặc điểm) và một câu bình luận viết sẵn để dán lại.

**Vì sao làm:**
- Chủ dự án làm cộng tác viên bán hàng (bắt đầu với đồ Tết), tìm khách bằng cách bình luận trong các nhóm Facebook, Threads.
- Cần dùng cho **mọi mặt hàng**, không gắn cứng với đồ Tết: hôm nay giỏ quà Tết, mai chung cư mini.
- Hay dùng **iPhone**, không phải lúc nào cũng ngồi máy tính.
- Muốn tối giản, dễ dùng, không phụ thuộc vào Claude.

**Thành công là:** đọc bài khách hỏi "giỏ quà tầm 200k biếu sếp", trong vòng vài giây có câu trả lời đúng sản phẩm, đúng giá, chép một chạm.

## 2. Mục tiêu, không làm, điều cấm

**Giai đoạn 1 (bản này):**
1. Trang web mở được trên iPhone (Safari) và máy tính, thêm ra màn hình chính được.
2. Dữ liệu (chiến dịch, sản phẩm, mẫu bình luận, thông tin liên hệ) nằm trong **một file Google Sheets** của chủ dự án.
3. Dán bài của khách vào thì: tự nhận chiến dịch, đọc mức giá và đặc điểm, xếp sản phẩm khớp nhất lên đầu.
4. Chọn một hoặc nhiều sản phẩm thì có bình luận viết sẵn, sửa được, đổi mẫu được, chép một chạm.
5. Có dữ liệu mẫu sẵn để dùng thử khi chưa nối Google Sheets.

**Để sau (ghi trong `docs/y-tuong-de-sau.md`):** tiện ích Chrome quét bài trên máy tính, lưu lịch sử đã bình luận, nhiều người dùng chung.

**Điều cấm:**
- Tự bấm gửi bình luận hay bình luận hàng loạt. Người dùng luôn tự dán và tự gửi.
- Đọc hay ghi bất cứ gì trên tài khoản Facebook/Threads của người dùng ở giai đoạn này.
- Để dữ liệu của chủ dự án (link Google Sheets, sản phẩm) nằm trong kho code công khai.
- Bắt trả phí.

## 3. Ràng buộc

- iPhone: không có tiện ích trình duyệt, app Facebook là ứng dụng đóng. Cách duy nhất là **sao chép rồi dán**.
- Đăng tạm trên GitHub Pages của tài khoản **talama191** (Tuấn Anh), trong một **kho riêng mới** `tro-ly-ban-hang`. Không đụng kho khác, không đổi cấu hình git chung của máy. Sau này chuyển kho sang tài khoản chủ dự án bằng chức năng Transfer của GitHub.
- GitHub Pages miễn phí cần kho **công khai**. Không sao, vì code của một trang web tĩnh vốn ai mở trang cũng xem được, và kho không chứa dữ liệu nào của chủ dự án.
- Google Sheets đọc qua địa chỉ `gviz` (chỉ cần chia sẻ "Bất kỳ ai có đường liên kết đều xem được"). Địa chỉ này đoán kiểu dữ liệu theo cột: cột lẫn số và chữ sẽ mất ô thuộc kiểu ít hơn, nên mỗi cột chỉ một kiểu. Gõ sai tên trang tính thì nó trả về trang đầu tiên, nên phải kiểm tra tiêu đề cột.
- iPhone: trang web thêm ra màn hình chính **có bộ nhớ riêng**, khác Safari. Vì vậy link Google Sheets phải nằm trong địa chỉ trang (`?sheet=...`) để icon ngoài màn hình chính mang theo nó.

## 4. Các phương án đã cân nhắc

| Phương án | Đánh đổi | Kết quả |
|---|---|---|
| Tiện ích Chrome + trang web riêng | Không chạy trên iPhone | Bỏ |
| Một tiện ích Chrome có bảng bên cạnh | Gọn nhất trên máy tính, nhưng không chạy trên iPhone | Bỏ (dời phần quét sang giai đoạn 2) |
| **A. Trang web + Google Sheets làm kho** | Miễn phí, không đăng nhập, sửa dữ liệu bằng bảng tính quen thuộc. Ai có link trang xem được sản phẩm (vốn là thông tin quảng bá) | **Chọn** |
| B. Trang web có đăng nhập + cơ sở dữ liệu riêng | Kín đáo, nhập liệu đẹp hơn, nhưng cài đặt rắc rối, gói miễn phí tự tạm dừng khi một tuần không dùng | Bỏ |

## 5. Thiết kế chi tiết

### 5.1 File Google Sheets (4 trang tính, tên cố định)

| Trang tính | Cột |
|---|---|
| **Chiến dịch** | Tên chiến dịch · Từ khóa (cách nhau dấu phẩy) · Từ loại trừ (dấu phẩy) |
| **Sản phẩm** | Chiến dịch · Tên · Giá (chỉ số, đơn vị đồng) · Đặc điểm (dấu phẩy) · Mô tả ngắn · Link · Link ảnh · Còn hàng ("Không" thì ẩn) |
| **Mẫu bình luận** | Chiến dịch · Nội dung |
| **Cài đặt** | Tên của bạn · SĐT · Zalo (một dòng giá trị) |

Mẫu bình luận dùng chỗ trống: `{san_pham}` `{ten_sp}` `{gia}` `{mo_ta}` `{link}` `{ten_toi}` `{sdt}` `{zalo}`.
Chọn nhiều sản phẩm: `{san_pham}` nằm giữa câu thì nối gọn "A 199k và B 230k" (để mẫu viết cho một sản phẩm vẫn đọc trôi); nằm cuối dòng thì xuống dòng thành danh sách gạch đầu dòng "• Tên – giá". Các chỗ trống khác lấy theo sản phẩm đầu tiên. *(Sửa sau khi chạy thử: bản đầu luôn dùng gạch đầu dòng, chèn giữa câu bị gãy.)*

Tên chiến dịch ở trang Sản phẩm / Mẫu bình luận so khớp không phân biệt dấu và hoa thường. Dòng ghi chiến dịch lạ, hoặc thiếu trang Cài đặt, thì hiện cảnh báo (không chặn).

Kèm file mẫu `file-mau/tro-ly-ban-hang-mau.xlsx` (2 chiến dịch: Giỏ quà Tết, Chung cư mini). Người dùng tải lên Google Drive, lưu thành Google Sheets, chia sẻ "ai có link đều xem được".

### 5.2 Đọc mức giá

- Hiểu: `200k`, `200 nghìn/ngàn`, `200.000đ`, `1tr5`, `1 triệu 2`, `1,5tr`, `4 củ`, `2 trăm`, `2 trăm rưỡi`, `3 lít`/`3 xị` (= 300k, chỉ khi có từ chỉ giá đi trước), khoảng `200-300k`, `từ 3 đến 4tr`, `3-4tr`.
- Số không có đơn vị (`tầm 200`, `dưới 5`) chỉ coi là giá khi có từ chỉ giá đi trước (tầm, khoảng, dưới, trên, giá, budget, tài chính…). Đơn vị đoán theo giá sản phẩm của chiến dịch: giỏ quà thì `200` là 200k, chung cư thì `5` là 5 triệu.
- Không nhầm `25m2`, `tầng 3`, số điện thoại, ngày tháng thành giá.
- Kiểu: **tầm/khoảng** (mặc định) lấy ±25%; **dưới/tối đa/đổ lại** lấy giá thấp hơn hoặc bằng; **trên/từ…trở lên** lấy giá cao hơn hoặc bằng.

### 5.3 Khớp sản phẩm

- Tự nhận chiến dịch: chiến dịch có nhiều từ khóa xuất hiện trong bài nhất. Không khớp gì thì giữ chiến dịch đang chọn.
- Có từ loại trừ (ví dụ "cho thuê") thì cảnh báo "Bài này có vẻ là người bán/rao", không chặn.
- Điểm mỗi sản phẩm = điểm giá + điểm đặc điểm (đặc điểm xuất hiện trong bài, so khớp không dấu).
- Hiện **tất cả** sản phẩm còn hàng, khớp nhất lên đầu, sản phẩm ngoài tầm giá làm mờ. Không dán gì thì giữ thứ tự trong bảng tính.

### 5.4 Giao diện (ưu tiên điện thoại)

```
┌──────────────────────────────┐
│ Trợ lý bình luận   [Giỏ quà Tết ▾] ⚙ │
│ ┌──────────────────────────┐ │
│ │ Dán bài của khách...     │ │
│ └──────────────────────────┘ │
│ [Dán]  [Xóa]                 │
│ Nhu cầu: ~200k · biếu sếp    │
│ ☑ Giỏ An Khang · 199k  khớp giá │
│ ☐ Hộp Phúc Lộc · 230k        │
│ ─ thanh dưới (khi đã chọn) ─ │
│ [bình luận sửa được]         │
│ [↻ Mẫu khác]  [Chép bình luận] │
└──────────────────────────────┘
```

- Mỗi lần chép, lần sau tự đổi sang mẫu tiếp theo để không lặp y hệt.
- Sản phẩm có ảnh: chạm vào ảnh để mở ảnh lớn, giữ tay để lưu vào máy. Hỗ trợ link Google Drive.
- Cài đặt (⚙): dán link Google Sheets, tải lại dữ liệu, dùng dữ liệu mẫu.
- Lưu bản dữ liệu gần nhất trong máy để mở ra là có ngay, rồi tải bản mới ở nền.

### 5.5 Kỹ thuật

- HTML + CSS + JavaScript thuần, không cần bước build, để sau này ai cũng sửa được.
- Phần xử lý (đọc giá, khớp, điền mẫu, đọc CSV) tách thành module riêng, kiểm thử bằng `node --test`.
- File Excel mẫu sinh từ cùng một nguồn dữ liệu mẫu (`js/du-lieu-mau.js`) bằng script Node.

## 6. Để người làm tự quyết

Màu sắc và chi tiết giao diện, cách chấm điểm cụ thể, cách hiện thông báo lỗi (miễn là tiếng Việt, nói rõ phải làm gì).
