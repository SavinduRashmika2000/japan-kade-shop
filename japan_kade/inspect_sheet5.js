const fs = require('fs');

const jsonPath = "D:\\pp\\japan-kade-shop\\resource\\all_inventory_data.json";
let rawData = fs.readFileSync(jsonPath, 'utf8');
rawData = rawData.replace(/:\s*NaN\b/g, ': null').replace(/,\s*NaN\b/g, ', null');
const data = JSON.parse(rawData);

const sheet5 = data["Tools.xlsx - Sheet2.csv"];
console.log("Sheet 5 (first 15 rows):");
console.log(JSON.stringify(sheet5.slice(0, 15), null, 2));
