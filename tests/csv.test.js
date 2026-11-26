import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docCsv } from '../js/csv.js';

test('docCsv: ngoặc kép, "" và xuống dòng trong ô', () => {
  assert.deepEqual(docCsv('"a","b ""x"""\r\n"1","dòng\nhai"'), [['a', 'b "x"'], ['1', 'dòng\nhai']]);
});

test('docCsv: ô không ngoặc, ô rỗng, dòng cuối có xuống dòng', () => {
  assert.deepEqual(docCsv('a,,c\n1,2,3\n'), [['a', '', 'c'], ['1', '2', '3']]);
  assert.deepEqual(docCsv(''), []);
});
