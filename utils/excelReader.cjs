/**
 * Reads the first worksheet of an .xlsx file and prints its rows as JSON.
 *
 * Why a separate script? exceljs only reads asynchronously, but Playwright must know every
 * row when it COLLECTS the tests (to create one test per row), which is synchronous.
 * DataReader.readExcel() runs this file with execFileSync and parses the printed JSON.
 *
 * Usage: node utils/excelReader.cjs <file.xlsx>
 */
const ExcelJS = require('exceljs');

async function main(file) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error(`No worksheet in ${file}`);

  const headers = [];
  sheet.getRow(1).eachCell((cell, col) => { headers[col] = cell.text.trim(); });

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header row
    const record = {};
    headers.forEach((header, col) => {
      if (header) record[header] = row.getCell(col).text; // empty cell -> ''
    });
    rows.push(record);
  });
  process.stdout.write(JSON.stringify(rows));
}

main(process.argv[2]).catch((error) => {
  process.stderr.write(String(error && error.message ? error.message : error));
  process.exit(1);
});
