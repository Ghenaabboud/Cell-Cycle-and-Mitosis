/**
 * Cell Cycle and Mitosis – student progress tracker
 * EISM Science
 *
 * This script lives inside YOUR Google Sheet (Extensions → Apps Script).
 * - Students' pages send their progress here (doPost).
 * - Your teacher panel reads it here, but only with your passcode (doGet).
 * The passcode is stored only in this script. It never appears on GitHub.
 */

// 1. CHANGE THIS to your own passcode before you deploy. Do not share it with students.
const TEACHER_PASSCODE = 'CHANGE-ME';

const PROGRESS_SHEET = 'Progress';
const LOG_SHEET = 'Activity log';
const HEADERS = [
  'Student ID', 'Name', 'Class', 'Last active', 'Last action', 'Steps done',
  'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6',
  'Checkpoint A L1', 'Checkpoint A L2', 'Checkpoint A L3',
  'Checkpoint B L1', 'Checkpoint B L2', 'Checkpoint B L3',
  'Details (do not edit)'
];

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return text_('bad request');
  }
  if (!data || typeof data.id !== 'string' || !/^st-[a-z0-9-]{4,40}$/.test(data.id)) return text_('bad request');

  const name = clean_(data.name, 80);
  const cls = clean_(data.cls, 12);
  const event = clean_(data.event, 120);
  const steps = data.steps || {};
  const quiz = data.quiz || {};

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet_(ss, PROGRESS_SHEET, HEADERS);
    const log = getSheet_(ss, LOG_SHEET, ['Time', 'Name', 'Class', 'Action']);

    const now = new Date();
    const stepKeys = ['s1', 's2', 's3', 's4', 's5', 's6'];
    const stepsDone = stepKeys.filter(k => steps[k] === true).length;
    const levelCell = (cp, t) => {
      const q = quiz[cp + '-' + t];
      if (!q) return '';
      const star = (data[cp] && data[cp][t]) ? '★ ' : '';
      return star + q.best + '/4 (' + q.tries + (q.tries === 1 ? ' try)' : ' tries)');
    };
    const details = JSON.stringify({ steps: steps, cpA: data.cpA || {}, cpB: data.cpB || {}, quiz: quiz }).slice(0, 45000);
    const row = [
      data.id, name, cls, now, event, stepsDone,
      ...stepKeys.map(k => steps[k] === true ? '✓' : ''),
      levelCell('cpA', 'f'), levelCell('cpA', 'c'), levelCell('cpA', 'e'),
      levelCell('cpB', 'f'), levelCell('cpB', 'c'), levelCell('cpB', 'e'),
      details
    ];

    const last = sheet.getLastRow();
    let rowIndex = -1;
    if (last > 1) {
      const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (ids[i][0] === data.id) { rowIndex = i + 2; break; }
      }
    }
    if (rowIndex > 0) sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
    log.appendRow([now, name, cls, event]);
  } finally {
    lock.releaseLock();
  }
  return text_('ok');
}

function doGet(e) {
  const key = (e && e.parameter && e.parameter.key) || '';
  if (TEACHER_PASSCODE === 'CHANGE-ME') return json_({ error: 'Set your passcode in the Apps Script first (TEACHER_PASSCODE).' });
  if (key !== TEACHER_PASSCODE) return json_({ error: 'Wrong passcode.' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PROGRESS_SHEET);
  const rows = [];
  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
    values.forEach(v => {
      let d = {};
      try { d = JSON.parse(v[HEADERS.length - 1] || '{}'); } catch (err) {}
      rows.push({
        id: v[0], name: v[1], cls: v[2],
        lastActive: v[3] instanceof Date ? v[3].toISOString() : String(v[3]),
        lastAction: v[4], stepsDone: v[5],
        steps: d.steps || {}, cpA: d.cpA || {}, cpB: d.cpB || {}, quiz: d.quiz || {}
      });
    });
  }
  return json_({ rows: rows, updated: new Date().toISOString() });
}

function getSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#EAD1DC');
  }
  return sh;
}

function clean_(v, max) {
  // Stops a value from being read as a spreadsheet formula.
  return String(v == null ? '' : v).replace(/^[=+\-@]+/, '').slice(0, max);
}

function text_(s) { return ContentService.createTextOutput(s); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
