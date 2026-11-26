// Chuẩn hóa chữ tiếng Việt để so khớp: chữ thường, bỏ dấu, đ → d, gộp khoảng trắng.

export function chuanHoa(s) {
  if (s == null) return '';
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// "a, b;c\n" → ['a', 'b', 'c']
export function tachDanhSach(s) {
  if (s == null) return [];
  return String(s)
    .split(/[,;\n\r]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

// Cụm (đã chuẩn hóa) có xuất hiện trọn từ trong văn bản (đã chuẩn hóa) không.
export function coCum(vanBan, cum) {
  if (!cum) return false;
  let tu = 0;
  while (true) {
    const i = vanBan.indexOf(cum, tu);
    if (i < 0) return false;
    const truoc = i === 0 ? '' : vanBan[i - 1];
    const sau = vanBan[i + cum.length] ?? '';
    if (!/[a-z0-9]/.test(truoc) && !/[a-z0-9]/.test(sau)) return true;
    tu = i + 1;
  }
}
