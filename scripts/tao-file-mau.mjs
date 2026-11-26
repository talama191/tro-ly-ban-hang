// Sinh file Excel mẫu từ dữ liệu mẫu: npm run tao-file-mau
// Người dùng tải file này lên Google Drive rồi lưu thành Google Sheets.

import ExcelJS from 'exceljs';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DU_LIEU_MAU } from '../js/du-lieu-mau.js';
import { TRANG, COT } from '../js/sheet.js';

const DUONG_DAN = fileURLToPath(new URL('../file-mau/tro-ly-ban-hang-mau.xlsx', import.meta.url));

const MAU_DO = 'FFC8102E';

function trangTinh(wb, khoa, dong, doRong) {
  const ws = wb.addWorksheet(TRANG[khoa], { views: [{ state: 'frozen', ySplit: 1 }] });
  const cot = Object.entries(COT[khoa]);
  ws.columns = cot.map(([k, ten]) => ({ header: ten, key: k, width: doRong[k] ?? 18 }));
  for (const d of dong) ws.addRow(d);
  const dau = ws.getRow(1);
  dau.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  dau.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MAU_DO } };
  dau.height = 22;
  ws.eachRow((r, i) => {
    if (i > 1) r.alignment = { vertical: 'top', wrapText: true };
  });
  return ws;
}

async function taoFileMau(duongDan) {
  const d = DU_LIEU_MAU;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Trợ lý bình luận';

  trangTinh(wb, 'chienDich', d.chienDich.map((c) => ({
    ten: c.ten, tuKhoa: c.tuKhoa.join(', '), tuLoaiTru: c.tuLoaiTru.join(', '),
  })), { ten: 20, tuKhoa: 60, tuLoaiTru: 45 });

  const sp = trangTinh(wb, 'sanPham', d.sanPham.map((p) => ({
    chienDich: p.chienDich, ten: p.ten, gia: p.gia, dacDiem: p.dacDiem.join(', '),
    moTa: p.moTa, link: p.link, anh: p.anh, conHang: 'Có',
  })), { chienDich: 16, ten: 28, gia: 12, dacDiem: 36, moTa: 42, link: 30, anh: 30, conHang: 10 });
  sp.getColumn('gia').numFmt = '#,##0';

  trangTinh(wb, 'mauBinhLuan', d.mauBinhLuan, { chienDich: 16, noiDung: 100 });

  const cd = trangTinh(wb, 'caiDat', [d.caiDat], { tenToi: 18, sdt: 18, zalo: 18 });
  cd.getColumn('sdt').numFmt = '@';
  cd.getColumn('zalo').numFmt = '@';

  const hd = wb.addWorksheet('Hướng dẫn');
  hd.getColumn(1).width = 110;
  const dongHd = [
    'CÁCH DÙNG FILE NÀY',
    '• Giữ nguyên tên 4 trang tính: Chiến dịch, Sản phẩm, Mẫu bình luận, Cài đặt. Giữ nguyên dòng 1 (tên cột).',
    '• Chiến dịch: mỗi dòng một mặt hàng. "Từ khóa" là chữ khách hay viết khi hỏi mua (cách nhau dấu phẩy). "Từ loại trừ" là chữ hay gặp trong bài của người bán/rao.',
    '• Sản phẩm: cột "Chiến dịch" ghi đúng tên chiến dịch. Cột "Giá" CHỈ GÕ SỐ (vd 199000), không gõ chữ. "Đặc điểm" cách nhau dấu phẩy (vd: biếu sếp, có rượu, Cầu Giấy).',
    '• "Còn hàng": gõ "Không" để tạm ẩn sản phẩm. Dòng trên cùng được ưu tiên khi khách không nói giá.',
    '• Mẫu bình luận: nên có 3 mẫu trở lên cho mỗi chiến dịch để bình luận không bị lặp. Các chỗ trống tự điền:',
    '    {san_pham} tên + giá (chọn nhiều thì thành "A 199k và B 230k", để cuối dòng thì thành danh sách)',
    '    {ten_sp} {gia} {mo_ta} {link}: của sản phẩm đầu tiên được chọn',
    '    {ten_toi} {sdt} {zalo}: lấy ở trang Cài đặt',
    '• Dòng nào chỉ có chỗ trống mà không có dữ liệu (vd "Zalo: {zalo}" khi chưa điền Zalo) sẽ tự bị bỏ.',
    '• Trang "Hướng dẫn" này không ảnh hưởng gì, xóa đi cũng được.',
  ];
  dongHd.forEach((t, i) => {
    const c = hd.getCell(i + 1, 1);
    c.value = t;
    c.alignment = { wrapText: true, vertical: 'top' };
    if (i === 0) c.font = { bold: true, size: 13 };
  });

  mkdirSync(dirname(duongDan), { recursive: true });
  await wb.xlsx.writeFile(duongDan);
}

await taoFileMau(DUONG_DAN);
console.log('Đã tạo', DUONG_DAN);
