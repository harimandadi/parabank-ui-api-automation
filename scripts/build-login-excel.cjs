/**
 * Creates test-data/login/login-data.xlsx (the Excel source for the data-driven login tests).
 * The .xlsx is committed; run this only to recreate it:  node scripts/build-login-excel.cjs
 * You can also edit the .xlsx directly in Excel: row 1 = column names, one test per row.
 */
const path = require('path');
const ExcelJS = require('exceljs');

const rows = [
  ['testName', 'username', 'password', 'expected'],
  ['valid user logs in', '{{PARABANK_USERNAME}}', '{{PARABANK_PASSWORD}}', 'success'],
  ['valid user with wrong password', '{{PARABANK_USERNAME}}', 'wrong_pass_xlsx', 'invalid'],
  ['unknown user', 'nobody_xlsx_xyz', 'any_pass_123', 'invalid'],
  ['username with spaces', '  spaced user  ', 'any_pass_123', 'invalid'],
  ['empty password', '{{PARABANK_USERNAME}}', '', 'empty'],
  ['empty username', '', 'any_pass_123', 'empty'],
];

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('LoginData');
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => { column.width = 32; });
  const file = path.resolve(__dirname, '..', 'test-data', 'login', 'login-data.xlsx');
  await workbook.xlsx.writeFile(file);
  console.log(`Wrote ${file}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
