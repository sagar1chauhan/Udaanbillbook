const ExcelJS = require('exceljs');
async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('My Sheet');
  ws.mergeCells('A1:C2');
  console.log(ws._merges);
  console.log(ws.model.merges);
}
test();
