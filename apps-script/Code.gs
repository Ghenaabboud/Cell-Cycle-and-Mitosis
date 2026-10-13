/**
 * Cell Cycle and Mitosis – student app and teacher panel
 * EISM Science
 *
 * This script lives inside YOUR Google Sheet (Extensions → Apps Script).
 * It serves the student page and the teacher panel, and saves progress in this Sheet.
 *
 *   Student link:  your Web app URL
 *   Teacher link:  your Web app URL + ?page=teacher   (opens only for you, the owner of this script)
 *
 * Deploy as: Web app · Execute as: Me · Who has access: Anyone within your school.
 * The page designs are loaded from your GitHub repository, so page updates appear without redeploying.
 */

const PAGES_BASE = 'https://raw.githubusercontent.com/Ghenaabboud/Cell-Cycle-and-Mitosis/main/';
const PROGRESS_SHEET = 'Progress';
const LOG_SHEET = 'Activity log';
const HEADERS = [
  'School email', 'Name', 'Class', 'Last active', 'Last action', 'Steps done',
  'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6',
  'Checkpoint A L1', 'Checkpoint A L2', 'Checkpoint A L3',
  'Checkpoint B L1', 'Checkpoint B L2', 'Checkpoint B L3',
  'Details (do not edit)'
];

// ---------- pages ----------
function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) || 'student';
  if (page === 'teacher') {
    if (!isTeacher_()) {
      return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:24px">This page is for the teacher only.</p>');
    }
    return serve_('teacher-app.html', 'Teacher Panel · Cell Cycle and Mitosis');
  }
  return serve_('app.html', 'Cell Cycle and Mitosis');
}

function serve_(file, title) {
  const res = UrlFetchApp.fetch(PAGES_BASE + file + '?t=' + Math.floor(Date.now() / 60000), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:24px">The page could not load. Please refresh in a minute.</p>');
  }
  return HtmlService.createHtmlOutput(res.getContentText())
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ---------- called by the student page ----------
function getMe() {
  const email = Session.getActiveUser().getEmail();
  const found = findRow_(email);
  if (!found) return { email: email };
  const v = found.values;
  let details = {};
  try { details = JSON.parse(v[HEADERS.length - 1] || '{}'); } catch (err) {}
  return { email: email, name: v[1], cls: v[2], details: details };
}

function saveProgress(data) {
  const email = Session.getActiveUser().getEmail();
  if (!email) throw new Error('Please sign in with your school account.');
  data = data || {};
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
    const log = getSheet_(ss, LOG_SHEET, ['Time', 'School email', 'Name', 'Class', 'Action']);
    const now = new Date();
    const stepKeys = ['s1', 's2', 's3', 's4', 's5', 's6'];
    const levelCell = (cp, t) => {
      const q = quiz[cp + '-' + t];
      if (!q) return '';
      const star = (data[cp] && data[cp][t]) ? '★ ' : '';
      return star + q.best + '/4 (' + q.tries + (q.tries === 1 ? ' try)' : ' tries)');
    };
    const details = JSON.stringify({ steps: steps, cpA: data.cpA || {}, cpB: data.cpB || {}, quiz: quiz }).slice(0, 45000);
    const row = [
      email, name, cls, now, event, stepKeys.filter(k => steps[k] === true).length,
      ...stepKeys.map(k => steps[k] === true ? '✓' : ''),
      levelCell('cpA', 'f'), levelCell('cpA', 'c'), levelCell('cpA', 'e'),
      levelCell('cpB', 'f'), levelCell('cpB', 'c'), levelCell('cpB', 'e'),
      details
    ];
    const found = findRow_(email, sheet);
    if (found) sheet.getRange(found.index, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
    log.appendRow([now, email, name, cls, event]);
  } finally {
    lock.releaseLock();
  }
  return true;
}

// ---------- called by the teacher panel (owner only) ----------
function getAll() {
  if (!isTeacher_()) throw new Error('Teacher only.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PROGRESS_SHEET);
  const rows = [];
  if (sheet && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues().forEach(v => {
      let d = {};
      try { d = JSON.parse(v[HEADERS.length - 1] || '{}'); } catch (err) {}
      rows.push({
        id: v[0], email: v[0], name: v[1], cls: v[2],
        lastActive: v[3] instanceof Date ? v[3].toISOString() : String(v[3]),
        lastAction: v[4], steps: d.steps || {}, cpA: d.cpA || {}, cpB: d.cpB || {}, quiz: d.quiz || {}
      });
    });
  }
  return { rows: rows, updated: new Date().toISOString(), sheetUrl: ss.getUrl() };
}

// ---------- helpers ----------
function isTeacher_() {
  const me = Session.getActiveUser().getEmail();
  return !!me && me === Session.getEffectiveUser().getEmail();
}

function findRow_(email, sheet) {
  if (!email) return null;
  sheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROGRESS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === email.toLowerCase()) return { index: i + 2, values: values[i] };
  }
  return null;
}

function getSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (sh && sh.getLastRow() > 0 && sh.getRange(1, 1).getValue() !== headers[0]) {
    // An older version of this sheet exists: keep it, and start a fresh one.
    sh.setName(name + ' (old ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') + ')');
    sh = null;
  }
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
