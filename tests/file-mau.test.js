import { test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { chuyenDuLieu, TRANG } from '../js/sheet.js';
import { DU_LIEU_MAU } from '../js/du-lieu-mau.js';

const FILE = fileURLToPath(new URL('../file-mau/tro-ly-ban-hang-mau.xlsx', import.meta.url));

test('file Excel mẫu đọc lại ra đúng dữ liệu mẫu', { skip: !existsSync(FILE) && 'chưa chạy npm run tao-file-mau' }, async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);
  assert.equal(wb.worksheets[0].name, TRANG.chienDich); // gviz trả về trang đầu khi gõ sai tên
  const bang = {};
  for (const [khoa, ten] of Object.entries(TRANG)) {
    const ws = wb.getWorksheet(ten);
    assert.ok(ws, `thiếu trang ${ten}`);
    const dong = [];
    ws.eachRow((r) => dong.push(r.values.slice(1).map((v) => (v == null ? '' : String(v)))));
    bang[khoa] = dong;
  }
  const d = chuyenDuLieu(bang);
  assert.deepEqual(d.chienDich, DU_LIEU_MAU.chienDich);
  assert.deepEqual(d.sanPham.map((p) => [p.ten, p.gia]), DU_LIEU_MAU.sanPham.map((p) => [p.ten, p.gia]));
  assert.deepEqual(d.mauBinhLuan, DU_LIEU_MAU.mauBinhLuan);
  assert.deepEqual(d.caiDat, DU_LIEU_MAU.caiDat);
});
