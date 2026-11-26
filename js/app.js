// Nối giao diện với phần xử lý. Mọi logic tính toán nằm ở các module khác.

import { docGia, dinhDangGia } from './gia.js';
import { doanChienDich, timTuLoaiTru, giaThamChieu, xepSanPham, nhuCauDocDuoc } from './khop.js';
import { dienMau } from './binh-luan.js';
import { layIdSheet, taiDuLieu, LoiDuLieu } from './sheet.js';
import { chonIdSheet } from './chon-nguon.js';
import { DU_LIEU_MAU } from './du-lieu-mau.js';

const $ = (id) => document.getElementById(id);

// ---------- Bộ nhớ trong máy (có thể bị chặn ở chế độ riêng tư) ----------
const KHOA = {
  id: 'tlbl.idSheet', cache: 'tlbl.duLieu', chienDich: 'tlbl.chienDich', mau: 'tlbl.mau.',
  daBiet: 'tlbl.idDaDung', dungMau: 'tlbl.dungMau',
};
const boNho = {
  doc(k) { try { return localStorage.getItem(k); } catch { return null; } },
  ghi(k, v) { try { localStorage.setItem(k, v); } catch { /* bỏ qua */ } },
  xoa(k) { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } },
};

function idDaBiet() {
  try {
    const ds = JSON.parse(boNho.doc(KHOA.daBiet) || '[]');
    return Array.isArray(ds) ? ds : [];
  } catch {
    return [];
  }
}
function ghiNhoId(id) {
  const ds = idDaBiet().filter((x) => x !== id);
  ds.push(id);
  boNho.ghi(KHOA.daBiet, JSON.stringify(ds.slice(-10)));
  boNho.ghi(KHOA.id, id);
  boNho.xoa(KHOA.dungMau);
}

const tt = {
  duLieu: DU_LIEU_MAU,
  nguon: 'mau', // 'mau' | 'sheet'
  idSheet: null,
  capNhatLuc: null,
  lanTaiCuoi: 0,
  chienDich: null,
  loi: null,
  chon: new Set(), // thuTu của sản phẩm đã chọn
  chonTay: false, // người dùng đã tự chọn sản phẩm thì không tự chọn đè
  chienDichTay: false, // người dùng đã tự chọn chiến dịch thì không tự đoán đè
  daSuaBinhLuan: false, // người dùng đã sửa tay ô bình luận
  ketQua: [],
  mauDangHien: 0,
};

// ---------- Tiện ích ----------
function tao(tag, lop, chu) {
  const el = document.createElement(tag);
  if (lop) el.className = lop;
  if (chu != null) el.textContent = chu;
  return el;
}

let henGioThongBao;
function thongBao(chu) {
  const el = $('thong-bao');
  el.textContent = chu;
  el.classList.add('hien');
  clearTimeout(henGioThongBao);
  henGioThongBao = setTimeout(() => el.classList.remove('hien'), 2800);
}

function gioPhut(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}`;
}

// Link ảnh Google Drive → link ảnh xem được trực tiếp. Chỉ nhận http(s).
function linkAnh(link, rong = 400) {
  const s = String(link || '').trim();
  if (!/^https?:\/\//i.test(s)) return '';
  const m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/.exec(s);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${rong}` : s;
}

function datIdVaoDiaChi(id) {
  const url = new URL(location.href);
  if (id) url.searchParams.set('sheet', id);
  else url.searchParams.delete('sheet');
  history.replaceState(null, '', url);
}

// ---------- Dữ liệu ----------
function spCuaChienDich() {
  return tt.duLieu.sanPham.filter((p) => p.chienDich === tt.chienDich);
}
function mauCuaChienDich() {
  return tt.duLieu.mauBinhLuan.filter((m) => m.chienDich === tt.chienDich);
}

function datDuLieu(duLieu, nguon, capNhatLuc = null, { giuBinhLuan = false } = {}) {
  tt.duLieu = duLieu;
  tt.nguon = nguon;
  tt.capNhatLuc = capNhatLuc;
  const ten = duLieu.chienDich.map((c) => c.ten);
  const daLuu = boNho.doc(KHOA.chienDich);
  if (!ten.includes(tt.chienDich)) tt.chienDich = ten.includes(daLuu) ? daLuu : ten[0] ?? null;
  const giuLai = new Set(spCuaChienDich().map((p) => p.thuTu));
  tt.chon = new Set([...tt.chon].filter((k) => giuLai.has(k)));
  veChonChienDich();
  veBaoNguon();
  tinhLai({ giuBinhLuan });
}

function doiChienDich(ten) {
  if (ten === tt.chienDich) return;
  tt.chienDich = ten;
  boNho.ghi(KHOA.chienDich, ten);
  tt.chon.clear();
  tt.chonTay = false;
  $('chon-chien-dich').value = ten;
}

async function taiTuSheet({ imLang = false } = {}) {
  if (!tt.idSheet) return;
  const id = tt.idSheet;
  if (!imLang) veTrangThaiNguon('Đang tải dữ liệu…');
  try {
    const duLieu = await taiDuLieu(id);
    if (id !== tt.idSheet) return; // người dùng đã đổi link trong lúc chờ
    const luc = Date.now();
    tt.lanTaiCuoi = luc;
    boNho.ghi(KHOA.cache, JSON.stringify({ id, luc, duLieu }));
    tt.loi = null;
    datDuLieu(duLieu, 'sheet', luc, { giuBinhLuan: imLang });
    veTrangThaiNguon();
    if (!imLang) {
      if ($('hop-cai-dat').open) $('hop-cai-dat').close();
      thongBao(`Đã tải ${duLieu.sanPham.length} sản phẩm, ${duLieu.chienDich.length} chiến dịch`);
    }
  } catch (e) {
    if (id !== tt.idSheet) return; // lỗi của link cũ, bỏ qua
    tt.loi = e instanceof LoiDuLieu ? e.message : `Có lỗi khi đọc dữ liệu: ${e.message}`;
    veBaoNguon();
    veTrangThaiNguon();
  }
}

function dungDuLieuMau() {
  tt.idSheet = null;
  tt.loi = null;
  boNho.xoa(KHOA.id);
  boNho.xoa(KHOA.cache);
  boNho.ghi(KHOA.dungMau, '1');
  datIdVaoDiaChi(null);
  datDuLieu(DU_LIEU_MAU, 'mau');
}

function luuLink(chu) {
  const id = layIdSheet(chu);
  if (!id) {
    veTrangThaiNguon('Link chưa đúng. Hãy dán link lấy từ nút Chia sẻ của Google Sheets (dạng https://docs.google.com/spreadsheets/d/...).', true);
    return false;
  }
  tt.idSheet = id;
  ghiNhoId(id);
  datIdVaoDiaChi(id);
  taiTuSheet();
  return true;
}

// ---------- Tính toán & vẽ ----------
function tinhLai({ tuDongChon = true, giuBinhLuan = false } = {}) {
  const vanBan = $('bai-khach').value;
  const doan = vanBan.trim() && !tt.chienDichTay ? doanChienDich(vanBan, tt.duLieu.chienDich) : null;
  if (doan && doan !== tt.chienDich) doiChienDich(doan);

  const sp = spCuaChienDich();
  const mucGia = docGia(vanBan, { giaThamChieu: giaThamChieu(sp) });
  tt.ketQua = xepSanPham(vanBan, sp, mucGia);

  if (tuDongChon && !tt.chonTay) {
    const dau = tt.ketQua[0];
    tt.chon = dau && (dau.trongTamGia || dau.dacDiemKhop.length) ? new Set([dau.sp.thuTu]) : new Set();
  }

  veNhuCau(vanBan, sp, mucGia);
  veDanhSach();
  veBinhLuan({ giuNoiDung: giuBinhLuan });
}

function veChonChienDich() {
  const sel = $('chon-chien-dich');
  sel.replaceChildren(...tt.duLieu.chienDich.map((c) => {
    const o = tao('option', null, c.ten);
    o.value = c.ten;
    return o;
  }));
  sel.value = tt.chienDich ?? '';
}

function veBaoNguon() {
  const el = $('bao-nguon');
  const canhBao = tt.nguon === 'sheet' ? tt.duLieu.canhBao ?? [] : [];
  el.classList.toggle('loi', Boolean(tt.loi));
  el.replaceChildren();
  if (tt.loi) {
    el.append(tt.loi, ' ');
    if (tt.nguon === 'sheet' && tt.capNhatLuc) el.append(`Đang dùng bản lưu lúc ${gioPhut(tt.capNhatLuc)}. `);
    else if (tt.nguon === 'mau') el.append('Đang hiện dữ liệu mẫu. ');
  } else if (tt.nguon === 'mau') {
    el.append('Đang dùng dữ liệu mẫu. ');
  } else if (canhBao.length) {
    el.append(`Lưu ý trong file Google Sheets: ${canhBao.join(' ')}`);
    el.hidden = false;
    return;
  } else {
    el.hidden = true;
    return;
  }
  const nut = tao('button', null, 'Mở cài đặt');
  nut.type = 'button';
  nut.onclick = moCaiDat;
  el.append(nut);
  el.hidden = false;
}

function veTrangThaiNguon(chu, laLoi = false) {
  const el = $('trang-thai-nguon');
  if (chu) {
    el.textContent = chu;
  } else if (tt.loi) {
    el.textContent = tt.loi;
    laLoi = true;
  } else if (tt.nguon === 'sheet') {
    el.textContent = `Đang dùng Google Sheets của bạn: ${tt.duLieu.sanPham.length} sản phẩm, cập nhật lúc ${gioPhut(tt.capNhatLuc)}.`;
  } else {
    el.textContent = 'Đang dùng dữ liệu mẫu (chưa nối Google Sheets).';
  }
  el.style.color = laLoi ? 'var(--nhan)' : '';
}

function veNhuCau(vanBan, sp, mucGia) {
  const el = $('nhu-cau');
  const canhBao = $('canh-bao');
  if (!vanBan.trim()) {
    el.hidden = true;
    canhBao.hidden = true;
    return;
  }
  el.replaceChildren(tao('span', 'nho', 'Nhu cầu:'));
  if (mucGia) el.append(tao('span', 'chip gia', mucGia.nhan));
  for (const dd of nhuCauDocDuoc(vanBan, sp)) el.append(tao('span', 'chip', dd));
  if (el.children.length === 1) el.append(tao('span', 'nho', 'chưa đọc được giá hay đặc điểm nào'));
  el.hidden = false;

  const cd = tt.duLieu.chienDich.find((c) => c.ten === tt.chienDich);
  const loaiTru = timTuLoaiTru(vanBan, cd);
  canhBao.hidden = !loaiTru.length;
  if (loaiTru.length) {
    canhBao.textContent = `Bài này có vẻ là người bán hoặc rao (có chữ "${loaiTru.join('", "')}"). Đọc kỹ trước khi bình luận.`;
  }
}

function veDanhSach() {
  const ul = $('ds-san-pham');
  if (!tt.ketQua.length) {
    ul.replaceChildren(tao('li', 'trong', tt.chienDich
      ? 'Chưa có sản phẩm nào (còn hàng) cho chiến dịch này. Thêm ở trang tính "Sản phẩm".'
      : 'Chưa có chiến dịch nào. Thêm ở trang tính "Chiến dịch".'));
  } else {
    ul.replaceChildren(...tt.ketQua.map(veMotSanPham));
  }
  $('dem-chon').textContent = tt.chon.size ? `Đã chọn ${tt.chon.size}` : 'Chạm để chọn';
}

function veMotSanPham({ sp, trongTamGia, dacDiemKhop }) {
  const li = tao('li', 'sp');
  const daChon = tt.chon.has(sp.thuTu);
  li.classList.toggle('chon', daChon);
  li.classList.toggle('mo', trongTamGia === false);

  const label = tao('label');
  const hop = tao('input');
  hop.type = 'checkbox';
  hop.checked = daChon;
  hop.setAttribute('aria-label', `${sp.ten} ${dinhDangGia(sp.gia)}`);
  hop.addEventListener('change', () => {
    tt.chonTay = true;
    if (hop.checked) tt.chon.add(sp.thuTu);
    else tt.chon.delete(sp.thuTu);
    li.classList.toggle('chon', hop.checked);
    $('dem-chon').textContent = tt.chon.size ? `Đã chọn ${tt.chon.size}` : 'Chạm để chọn';
    veBinhLuan();
  });

  const thongTin = tao('div', 'tt');
  const dong1 = tao('div', 'dong1');
  dong1.append(tao('span', 'ten', sp.ten), tao('span', 'gia', dinhDangGia(sp.gia)));
  thongTin.append(dong1);
  if (sp.moTa) thongTin.append(tao('div', 'mo-ta', sp.moTa));

  const cacThe = tao('div', 'cac-the');
  if (trongTamGia === true) cacThe.append(tao('span', 'the khop', 'khớp giá'));
  if (trongTamGia === false) cacThe.append(tao('span', 'the ngoai', 'ngoài tầm giá'));
  const khop = new Set(dacDiemKhop);
  for (const dd of sp.dacDiem) cacThe.append(tao('span', khop.has(dd) ? 'the khop' : 'the', dd));
  if (cacThe.children.length) thongTin.append(cacThe);

  label.append(hop, thongTin);
  li.append(label);

  if (sp.anh) {
    const a = tao('a', 'anh');
    a.href = linkAnh(sp.anh, 2000);
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'Mở ảnh lớn (giữ tay vào ảnh để lưu)';
    const img = tao('img');
    img.src = linkAnh(sp.anh, 300);
    img.alt = sp.ten;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = () => a.remove();
    a.append(img);
    li.append(a);
  }
  return li;
}

function conTroMau() {
  return Number(boNho.doc(KHOA.mau + tt.chienDich)) || 0;
}
function datConTroMau(n) {
  boNho.ghi(KHOA.mau + tt.chienDich, String(n));
}

// giuNoiDung: khi tải ngầm dữ liệu mới, không xóa bình luận người dùng đang sửa dở.
function veBinhLuan({ giuNoiDung = false } = {}) {
  const thanh = $('thanh-binh-luan');
  const chon = tt.ketQua.filter((k) => tt.chon.has(k.sp.thuTu)).map((k) => k.sp);
  if (!chon.length) {
    thanh.hidden = true;
    document.body.classList.remove('co-thanh');
    return;
  }
  const mau = mauCuaChienDich();
  let noiDung = '{san_pham}';
  if (mau.length) {
    tt.mauDangHien = conTroMau() % mau.length;
    noiDung = mau[tt.mauDangHien].noiDung;
    $('so-mau').textContent = `${tt.mauDangHien + 1}/${mau.length}`;
  } else {
    $('so-mau').textContent = '';
  }
  $('nut-mau-khac').disabled = mau.length < 2;
  if (!(giuNoiDung && tt.daSuaBinhLuan && !thanh.hidden)) {
    $('binh-luan').value = dienMau(noiDung, chon, tt.duLieu.caiDat);
    tt.daSuaBinhLuan = false;
  }
  thanh.hidden = false;
  document.body.classList.add('co-thanh');
}

async function chep(chu) {
  try {
    await navigator.clipboard.writeText(chu);
    return true;
  } catch {
    const o = $('binh-luan');
    o.focus();
    o.select();
    o.setSelectionRange(0, o.value.length);
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  }
}

function moCaiDat() {
  $('o-link').value = tt.idSheet ? `https://docs.google.com/spreadsheets/d/${tt.idSheet}/edit` : '';
  veTrangThaiNguon();
  $('hop-cai-dat').showModal();
}

// Link hướng dẫn trỏ về kho GitHub của chính trang (đổi tài khoản vẫn đúng)
function datLinkHuongDan() {
  const m = /^([\w-]+)\.github\.io$/.exec(location.hostname);
  const repo = location.pathname.split('/').filter(Boolean)[0];
  if (m && repo) {
    const a = $('link-huong-dan');
    a.href = `https://github.com/${m[1]}/${repo}#readme`;
    a.hidden = false;
  }
}

// ---------- Sự kiện ----------
function ganSuKien() {
  let henGio;
  const o = $('bai-khach');
  o.addEventListener('input', () => {
    clearTimeout(henGio);
    henGio = setTimeout(() => tinhLai(), 150);
  });
  o.addEventListener('paste', () => {
    tt.chonTay = false;
    tt.chienDichTay = false;
  });
  $('binh-luan').addEventListener('input', () => {
    tt.daSuaBinhLuan = true;
  });

  $('nut-dan').addEventListener('click', async () => {
    try {
      const chu = await navigator.clipboard.readText();
      if (!chu.trim()) {
        thongBao('Bộ nhớ tạm đang trống. Hãy sao chép bài của khách trước.');
        return;
      }
      o.value = chu;
      tt.chonTay = false;
      tt.chienDichTay = false;
      tinhLai();
    } catch {
      o.focus();
      thongBao('Giữ ngón tay vào ô trắng rồi chọn "Dán".');
    }
  });

  $('nut-xoa').addEventListener('click', () => {
    o.value = '';
    tt.chonTay = false;
    tt.chienDichTay = false;
    tt.chon.clear();
    tinhLai({ tuDongChon: false });
    o.focus();
  });

  $('chon-chien-dich').addEventListener('change', (e) => {
    doiChienDich(e.target.value);
    tt.chienDichTay = true; // giữ lựa chọn tay cho tới khi dán bài mới hoặc bấm Xóa
    tinhLai();
  });

  $('nut-mau-khac').addEventListener('click', () => {
    const n = mauCuaChienDich().length;
    if (n < 2) return;
    datConTroMau((tt.mauDangHien + 1) % n);
    veBinhLuan();
  });

  $('nut-chep').addEventListener('click', async () => {
    const chu = $('binh-luan').value.trim();
    if (!chu) return;
    if (await chep(chu)) {
      thongBao('Đã chép! Mở Facebook, giữ tay vào ô bình luận → Dán.');
      const n = mauCuaChienDich().length;
      if (n > 1) datConTroMau((tt.mauDangHien + 1) % n); // lần sau tự đổi mẫu
    } else {
      thongBao('Không tự chép được. Hãy bôi đen ô bình luận rồi chọn "Sao chép".');
    }
  });

  $('nut-cai-dat').addEventListener('click', moCaiDat);
  $('nut-luu-link').addEventListener('click', () => luuLink($('o-link').value));
  $('o-link').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      luuLink($('o-link').value);
    }
  });
  $('nut-tai-lai').addEventListener('click', () => {
    if (tt.idSheet) taiTuSheet();
    else veTrangThaiNguon('Chưa có link Google Sheets. Dán link vào ô bên trên trước.', true);
  });
  $('nut-dung-mau').addEventListener('click', () => {
    dungDuLieuMau();
    veTrangThaiNguon();
    thongBao('Đã chuyển sang dữ liệu mẫu');
  });

  // Quay lại trang sau một lúc (vd vừa sửa bảng tính) thì tự tải bản mới
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && tt.idSheet && Date.now() - tt.lanTaiCuoi > 2 * 60 * 1000) {
      taiTuSheet({ imLang: true });
    }
  });
}

// ---------- Khởi động ----------
function khoiDong() {
  ganSuKien();
  datLinkHuongDan();

  tt.idSheet = chonIdSheet({
    tuDiaChi: layIdSheet(new URL(location.href).searchParams.get('sheet')),
    daLuu: layIdSheet(boNho.doc(KHOA.id)),
    daBiet: idDaBiet(),
    dungMau: boNho.doc(KHOA.dungMau) === '1',
    hoi: () =>
      confirm(
        'Link bạn vừa mở dùng một file Google Sheets KHÁC với file bạn đang dùng.\n\n' +
          'Chỉ bấm OK nếu chính bạn tạo link này. Chuyển sang file mới?',
      ),
  });
  datIdVaoDiaChi(tt.idSheet); // để "Thêm vào MH chính" giữ đúng link đang dùng
  if (tt.idSheet) {
    ghiNhoId(tt.idSheet);
    let cache = null;
    try {
      cache = JSON.parse(boNho.doc(KHOA.cache) || 'null');
    } catch { /* hỏng thì bỏ */ }
    if (cache && cache.id === tt.idSheet && cache.duLieu) {
      tt.lanTaiCuoi = cache.luc;
      datDuLieu(cache.duLieu, 'sheet', cache.luc);
      taiTuSheet({ imLang: true });
    } else {
      datDuLieu(DU_LIEU_MAU, 'mau');
      $('bao-nguon').textContent = 'Đang tải dữ liệu từ Google Sheets…';
      $('bao-nguon').hidden = false;
      taiTuSheet();
    }
  } else {
    datDuLieu(DU_LIEU_MAU, 'mau');
  }
}

khoiDong();
