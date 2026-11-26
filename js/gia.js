// Đọc mức giá khách nói trong bài viết tiếng Việt.
// docGia('giỏ quà tầm 200k') → { min: 150000, max: 250000, kieu: 'tam', nhan: '~200k' }

import { chuanHoa } from './chuan-hoa.js';

const NGHIN = 1e3;
const TRAM = 1e5;
const TRIEU = 1e6;

// Đơn vị viết sau số (đã bỏ dấu). Thứ tự quan trọng: chữ dài thử trước.
const DON_VI = {
  trieu: TRIEU, tram: TRAM, tr: TRIEU, cu: TRIEU,
  nghin: NGHIN, ngan: NGHIN, k: NGHIN,
  lit: TRAM, xi: TRAM, // tiếng lóng: 1 lít = 1 xị = 100k, chỉ nhận khi có từ chỉ giá
  vnd: 1, dong: 1, d: 1,
};
// tr/triệu/củ được phép có số dính sau ("1tr5"); các đơn vị khác thì không ("2k5" là năm sinh 2005).
const RE_DON_VI = /^\s?(?:(trieu|tr|cu)(?![a-z])|(tram|nghin|ngan|lit|xi|vnd|dong|k|d)(?![a-z0-9]))/;

// Từ chỉ giá đứng ngay trước số: cần có thì mới coi số trần (không đơn vị) là giá.
const RE_TU_CHI_GIA = /(?:^|[^a-z])(?:tam|khoang|gia|duoi|tren|budget|tai chinh|ngan sach|toi da|max|min|khong qua|ko qua|k qua|it nhat|toi thieu|loanh quanh|tu|den|toi|hon)\s*[:=]?\s*$|[~<>]\s*$/;

// Số trần đứng trước những chữ này là số lượng/kích thước/ngày, không phải giá.
const RE_KHONG_PHAI_GIA = /^\s?(?:m2|m|met|tang|phong|pn|p|wc|ngu|nguoi|ng|tuoi|con|be|chau|ban|lan|so|gio|hop|cai|chiec|suat|phan|km|ml|kg|gr?|nam|thang|ngay|h|tieng|phut|buoi|tuan|xe|quan|qua|mon|bo|set|sp|mau|loai|hu|lo|thung)(?![a-z])|^\s?[/:]/;

const RE_TAM_TRUOC = /(?:tren duoi|xap xi)\s*[:=]?\s*$/; // "trên dưới 500k" = khoảng 500k
const RE_DUOI_TRUOC = /(?:duoi|<|toi da|max|khong qua|ko qua|k qua|nho hon|re hon|it hon|chua toi|chua den)\s*[:=]?\s*$/;
const RE_TREN_TRUOC = /(?:tren|>|toi thieu|it nhat|min|hon|tu)\s*[:=]?\s*$/;
const RE_DUOI_SAU = /^\s*(?:do lai|do ve|do xuong|tro xuong|tro lai|tro ve|doi lai|max|toi da)(?![a-z])/;
const RE_TREN_SAU = /^\s*(?:tro len|do len)(?![a-z])/;
const RE_NOI_KHOANG = /^\s*(?:-|~|den|toi)\s*/;

// "200.000" → 200000; "1,5" → 1.5; "4.5" → 4.5
function docSo(chu) {
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(chu)) return Number(chu.replace(/[.,]/g, ''));
  if (/^\d+[.,]\d+$/.test(chu)) return Number(chu.replace(',', '.'));
  if (/^\d+$/.test(chu)) return Number(chu);
  return NaN;
}

// Đọc một con số (kèm đơn vị nếu có) bắt đầu tại vị trí i của chuỗi đã chuẩn hóa.
// Trả về { so, giaTri, heSo, tran, canTuChiGia, het } hoặc null.
function docMotSo(s, i) {
  const m = /^\d+(?:[.,]\d+)*/.exec(s.slice(i));
  if (!m) return null;
  const chu = m[0];
  if (/^0\d/.test(chu)) return null; // số điện thoại "0912 345 678", mã số
  if (/^\d+$/.test(chu) && chu.length >= 9) return null;
  const so = docSo(chu);
  if (Number.isNaN(so)) return null;
  let het = i + chu.length;

  const dv = RE_DON_VI.exec(s.slice(het));
  if (!dv) {
    return { so, giaTri: so, heSo: null, tran: true, canTuChiGia: true, het };
  }
  const tenDv = dv[1] ?? dv[2];
  let heSo = DON_VI[tenDv];
  het += dv[0].length;
  let giaTri = so * heSo;
  if (heSo === 1 && so < 1000) giaTri = so * NGHIN; // "200đ" viết vội = 200k

  if (heSo === TRIEU) {
    // "1tr5", "1 triệu 2", "1 triệu 500 nghìn"
    const sau = s.slice(het);
    // Dấu câu ngay sau ("3tr5,", "1tr2.") vẫn nhận; chỉ loại khi là số thập phân/nhóm nghìn.
    const dinh = /^(\d{1,3})(?!\d|[.,]\d)/.exec(sau);
    const cach = /^\s(\d{1,3})(?!\d|[.,]\d)(?=\s*(?:$|[^a-z0-9\s]|(?:nghin|ngan|k|thoi|nhe|nha|a|la|hoac|den|toi|do|tro)(?![a-z])))/.exec(sau);
    const le = dinh || cach;
    if (le) {
      const chuLe = le[1];
      het += le[0].length;
      const donViLe = /^\s?(nghin|ngan|k)(?![a-z])/.exec(s.slice(het));
      if (donViLe) {
        giaTri += Number(chuLe) * NGHIN;
        het += donViLe[0].length;
      } else {
        giaTri += Number(chuLe) * (TRIEU / 10 ** chuLe.length);
      }
    }
  }
  if (heSo === TRIEU || heSo === TRAM) {
    const ruoi = /^\s?ruoi(?![a-z])/.exec(s.slice(het));
    if (ruoi) {
      giaTri += heSo / 2;
      het += ruoi[0].length;
    }
  }
  if (heSo === TRAM && (tenDv === 'tram')) {
    const kem = /^\s?(nghin|ngan|k)(?![a-z])/.exec(s.slice(het)); // "2 trăm nghìn"
    if (kem) het += kem[0].length;
  }
  const canTuChiGia = tenDv === 'lit' || tenDv === 'xi';
  return { so, giaTri, heSo, tran: false, canTuChiGia, het };
}

// Số trần như "200" hay "5": chọn nhân nghìn hay triệu cho gần giá tham chiếu nhất.
function chonHeSo(so, giaThamChieu) {
  if (so >= 10000) return 1;
  if (!giaThamChieu || giaThamChieu <= 0) return NGHIN;
  const lech = (h) => Math.abs(Math.log((so * h) / giaThamChieu));
  return lech(TRIEU) < lech(NGHIN) ? TRIEU : NGHIN;
}

function coTuChiGiaTruoc(s, i) {
  return RE_TU_CHI_GIA.test(s.slice(Math.max(0, i - 25), i));
}

function soTranHopLe(s, so) {
  return !RE_KHONG_PHAI_GIA.test(s.slice(so.het));
}

export function dinhDangGia(n) {
  if (n == null || !Number.isFinite(n)) return '';
  n = Math.round(n);
  const chamNghin = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (n >= TRIEU) {
    const tr = Math.floor(n / TRIEU);
    const du = n % TRIEU;
    if (du === 0) return `${tr}tr`;
    if (du % TRAM === 0) return `${tr}tr${du / TRAM}`;
    if (du % NGHIN === 0) return `${tr}tr${String(du / NGHIN).padStart(3, '0')}`;
    return `${chamNghin(n)}đ`;
  }
  if (n % NGHIN === 0 && n > 0) return `${n / NGHIN}k`;
  return `${chamNghin(n)}đ`;
}

function taoMucGia(kieu, a, b) {
  a = Math.round(a);
  if (kieu === 'khoang') {
    b = Math.round(b);
    const [min, max] = a <= b ? [a, b] : [b, a];
    return { min, max, kieu, nhan: `${dinhDangGia(min)}–${dinhDangGia(max)}` };
  }
  if (kieu === 'duoi') return { min: 0, max: a, kieu, nhan: `dưới ${dinhDangGia(a)}` };
  if (kieu === 'tren') return { min: a, max: Infinity, kieu, nhan: `trên ${dinhDangGia(a)}` };
  return { min: a * 0.75, max: a * 1.25, kieu: 'tam', nhan: `~${dinhDangGia(a)}` };
}

export function docGia(vanBan, tuyChon = {}) {
  // "cụ" (người già) và "củ" (triệu) bỏ dấu đều thành "cu": đổi "cụ" trước để không nhầm.
  const vb = String(vanBan ?? '').normalize('NFC').replace(/[cC][ụỤ]/g, 'cuu');
  const s = chuanHoa(vb).replace(/[–—]/g, '-');
  if (!s) return null;
  const { giaThamChieu } = tuyChon;
  const reSo = /\d/g;
  let m;
  while ((m = reSo.exec(s))) {
    const i = m.index;
    if (i > 0 && /[a-z0-9.,]/.test(s[i - 1])) continue; // giữa từ ("m2", "q7") hoặc giữa số
    const a = docMotSo(s, i);
    if (!a) continue;
    reSo.lastIndex = a.het;
    const coTu = coTuChiGiaTruoc(s, i);

    // Khoảng giá: "200-300k", "từ 3 đến 4tr"
    const noi = RE_NOI_KHOANG.exec(s.slice(a.het));
    if (noi) {
      const j = a.het + noi[0].length;
      const b = /^\d/.test(s.slice(j)) ? docMotSo(s, j) : null;
      // "20-30 giỏ", "25-30m2", "3-4 người", "5-10/12": cả khoảng là số lượng/kích thước/ngày.
      if (b && b.tran && !soTranHopLe(s, b)) {
        reSo.lastIndex = b.het;
        continue;
      }
      if (b && !(a.tran && b.tran && !coTu) && !(b.canTuChiGia && !coTu)) {
        let gA = a.giaTri;
        let gB = b.giaTri;
        if (a.tran && b.tran) {
          const h = chonHeSo(b.giaTri, giaThamChieu);
          gA *= h;
          gB *= h;
        } else if (a.tran) {
          // "2-300k" là 200k–300k
          const nhan = a.giaTri < 10 && b.so >= 100 && b.so < 1000 ? 10 ** (String(Math.floor(b.so)).length - 1) : 1;
          gA = a.giaTri * nhan * (b.heSo === 1 ? 1 : b.heSo);
        } else if (b.tran) {
          gB = b.giaTri * (a.heSo === 1 ? 1 : a.heSo);
        }
        if (gA != null && gB != null && gA !== gB) return taoMucGia('khoang', gA, gB);
      }
    }

    // Một mức giá
    if (a.canTuChiGia && !coTu) continue;
    let gia = a.giaTri;
    if (a.tran) {
      if (!coTu || !soTranHopLe(s, a)) continue;
      gia = a.giaTri * chonHeSo(a.giaTri, giaThamChieu);
    }
    const truoc = s.slice(Math.max(0, i - 25), i);
    const sau = s.slice(a.het);
    let kieu = 'tam';
    if (RE_TAM_TRUOC.test(truoc)) kieu = 'tam';
    else if (RE_DUOI_SAU.test(sau) || RE_DUOI_TRUOC.test(truoc)) kieu = 'duoi';
    else if (RE_TREN_SAU.test(sau) || RE_TREN_TRUOC.test(truoc)) kieu = 'tren';
    return taoMucGia(kieu, gia);
  }
  return null;
}
