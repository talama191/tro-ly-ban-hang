// Đọc CSV (RFC 4180): ô trong ngoặc kép, "" là một dấu ", xuống dòng trong ô.

export function docCsv(text) {
  const bang = [];
  let dong = [];
  let o = '';
  let trongNgoac = false;
  let coO = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (trongNgoac) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          o += '"';
          i++;
        } else trongNgoac = false;
      } else o += c;
      continue;
    }
    if (c === '"') {
      trongNgoac = true;
      coO = true;
    } else if (c === ',') {
      dong.push(o);
      o = '';
      coO = true;
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      dong.push(o);
      bang.push(dong);
      dong = [];
      o = '';
      coO = false;
    } else {
      o += c;
      coO = true;
    }
  }
  if (coO || dong.length) {
    dong.push(o);
    bang.push(dong);
  }
  return bang;
}
