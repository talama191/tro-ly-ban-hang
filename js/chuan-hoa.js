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

// Các vị trí cụm (đã chuẩn hóa) xuất hiện trọn từ trong văn bản (đã chuẩn hóa).
export function viTriCum(vanBan, cum) {
  const kq = [];
  if (!cum) return kq;
  for (let i = vanBan.indexOf(cum); i >= 0; i = vanBan.indexOf(cum, i + 1)) {
    const truoc = i === 0 ? '' : vanBan[i - 1];
    const sau = vanBan[i + cum.length] ?? '';
    if (!/[a-z0-9]/.test(truoc) && !/[a-z0-9]/.test(sau)) kq.push(i);
  }
  return kq;
}

export function coCum(vanBan, cum) {
  return viTriCum(vanBan, cum).length > 0;
}
