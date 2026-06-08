const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const directory = "D:\\pp\\japan-kade-shop\\resource";
const files = fs.readdirSync(directory).filter(f => f.endsWith('.xlsx'));

function getSKUPrefix(categoryName) {
    const words = categoryName.split(/\s+/).filter(w => w.toLowerCase() !== 'and');
    if (words.length >= 3) {
        return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    } else if (words.length === 2) {
        return (words[0][0] + words[1][0] + (words[1][1] || 'X')).toUpperCase();
    } else {
        return categoryName.substring(0, 3).toUpperCase().padEnd(3, 'X');
    }
}

function extractSKU(desc) {
    if (!desc) return null;
    const regex1 = /([A-Z]{1,}(?:\s*-\s*[A-Z0-9]+)*\s*\d+(?:\s*-\s*[A-Z0-9]+)*)/i;
    const match = desc.match(regex1);
    if (match) {
        let sku = match[1].toUpperCase().replace(/\s+/g, '');
        sku = sku.replace(/([A-Z])(\d)/g, '$1-$2');
        sku = sku.replace(/-+/g, '-');
        return sku;
    }
    return null;
}

function findHeaderRow(rows) {
    for (let i = 0; i < Math.min(5, rows.length); i++) {
        const row = rows[i];
        if (!row) continue;
        let hasDesc = false;
        let hasQty = false;
        let hasPrice = false;
        let hasPlaces = false;
        
        row.forEach(cell => {
            if (cell === null || cell === undefined) return;
            const s = String(cell).toLowerCase().trim();
            if (s.includes('quantity') || s.includes('quantitiy') || s.includes('qty')) hasQty = true;
            if (s.includes('price') || s.includes('value')) hasPrice = true;
            if (s.includes('places') || s.includes('place') || s.includes('location')) hasPlaces = true;
            if (s.includes('description') || s.includes('discription') || s.includes('size') || s.includes('tools') || s.includes('blades') || s.includes('belts') || s.includes('seats')) hasDesc = true;
        });
        
        if (hasQty || (hasDesc && (hasPrice || hasPlaces))) {
            return i;
        }
    }
    return -1;
}

const parsedItems = [];
const usedSKUs = new Set();
const baseCounters = {};

files.forEach(file => {
    const filePath = path.join(directory, file);
    const categoryName = file.replace(/\.xlsx$/i, '').trim();
    const categoryPrefix = getSKUPrefix(categoryName);
    
    const workbook = xlsx.readFile(filePath);
    
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        if (rows.length === 0) return;
        
        let headerRowIndex = findHeaderRow(rows);
        if (headerRowIndex === -1) {
            headerRowIndex = 0; // fallback
        }
        
        const headerRow = rows[headerRowIndex];
        let descCol = 0;
        let qtyCol = -1;
        let priceCol = -1;
        let remarksCol = -1;
        let placeCol = -1;
        let nameCol = -1;
        let yearsCol = -1;
        
        headerRow.forEach((cell, idx) => {
            if (cell === null || cell === undefined) return;
            const s = String(cell).toLowerCase().trim();
            if (s.includes('quantity') || s.includes('quantitiy') || s.includes('qty')) qtyCol = idx;
            else if (s.includes('price') || s.includes('value')) priceCol = idx;
            else if (s.includes('place') || s.includes('places') || s.includes('location')) placeCol = idx;
            else if (s.includes('remark') || s.includes('remarks') || s.includes('reamrks')) remarksCol = idx;
            else if (s.includes('name') || s === 'name ') nameCol = idx;
            else if (s.includes('years') || s.includes('year')) yearsCol = idx;
            else if (s.includes('description') || s.includes('discription') || s.includes('size') || s.includes('tools') || s.includes('blades') || s.includes('belts') || s.includes('seats')) descCol = idx;
        });
        
        const isMoldsAndBlades = file.toLowerCase().includes('molds and blades');
        if (isMoldsAndBlades) {
            priceCol = 4;
            placeCol = 5;
            descCol = 0;
        }
        
        let currentGroup = '';
        
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            
            const descVal = row[descCol] ? String(row[descCol]).trim() : '';
            if (!descVal || descVal === '') continue;
            if (descVal.toLowerCase() === 'total') continue;
            
            let qtyVal = qtyCol !== -1 ? row[qtyCol] : null;
            let priceVal = priceCol !== -1 ? row[priceCol] : null;
            
            if (isMoldsAndBlades) {
                qtyVal = 1;
                priceVal = row[4];
            }
            
            const hasQty = qtyVal !== null && qtyVal !== undefined && String(qtyVal).trim() !== '' && String(qtyVal).trim().toLowerCase() !== 'quantity';
            const hasPrice = priceVal !== null && priceVal !== undefined && String(priceVal).trim() !== '' && String(priceVal).trim().toLowerCase() !== 'price';
            
            if (!hasQty && !hasPrice && !isMoldsAndBlades) {
                currentGroup = descVal;
                continue;
            }
            
            // Quantity
            let quantity = 0;
            if (hasQty) {
                const parsedQty = parseInt(String(qtyVal).replace(/[^\d-]/g, ''));
                if (!isNaN(parsedQty)) quantity = parsedQty;
            } else if (isMoldsAndBlades) {
                quantity = 1;
            }
            
            // Price
            let price = 0.0;
            if (hasPrice) {
                const parsedPrice = parseFloat(String(priceVal).replace(/[^\d.]/g, ''));
                if (!isNaN(parsedPrice)) price = parsedPrice;
            }
            
            // Remarks and Place
            let remarksVal = remarksCol !== -1 ? row[remarksCol] : null;
            let placeVal = placeCol !== -1 ? row[placeCol] : null;
            
            if (isMoldsAndBlades) {
                remarksVal = null;
                placeVal = row[5];
            }
            
            let remarks = remarksVal ? String(remarksVal).trim() : '';
            let place = placeVal ? String(placeVal).trim() : '';
            
            // Name
            let name = descVal;
            if (currentGroup && currentGroup !== descVal) {
                name = `${currentGroup} - ${descVal}`;
            }
            
            if (nameCol !== -1 && row[nameCol] && String(row[nameCol]).trim() !== '' && String(row[nameCol]).toLowerCase() !== 'name') {
                name = `${name} (${String(row[nameCol]).trim()})`;
            }
            if (yearsCol !== -1 && row[yearsCol] && String(row[yearsCol]).trim() !== '' && String(row[yearsCol]).toLowerCase() !== 'years') {
                name = `${name} (${String(row[yearsCol]).trim()})`;
            }
            
            if (isMoldsAndBlades) {
                const parts = [];
                if (row[1]) parts.push(String(row[1]).trim());
                if (row[2]) parts.push(String(row[2]).trim());
                if (row[3]) parts.push(String(row[3]).trim());
                if (parts.length > 0) {
                    name = `${name} (${parts.join(', ')})`;
                }
            }
            
            name = name.replace(/\s+/g, ' ').trim();
            
            // Generate SKU
            let extracted = extractSKU(descVal);
            let baseSKU = extracted || categoryPrefix;
            let sku = baseSKU;
            
            if (usedSKUs.has(sku)) {
                if (!baseCounters[baseSKU]) {
                    baseCounters[baseSKU] = 1;
                }
                while (usedSKUs.has(sku)) {
                    sku = `${baseSKU}-${baseCounters[baseSKU]}`;
                    baseCounters[baseSKU]++;
                }
            }
            usedSKUs.add(sku);
            
            const finalRemarks = remarks === 'null' || remarks === '' ? null : remarks;
            const finalPlace = place === 'null' || place === '' ? null : place;
            const finalNote = finalPlace ? `Location: ${finalPlace}` : '';
            
            parsedItems.push({
                name: name,
                sku: sku,
                quantity: quantity,
                price: price,
                remarks: finalRemarks,
                place: finalPlace,
                categoryName: categoryName,
                note: finalNote
            });
        }
    });
});

console.log("Vehicle Tyres sample:");
console.log(JSON.stringify(parsedItems.filter(item => item.categoryName === 'Vehicle Tyres').slice(0, 5), null, 2));

console.log("Molds and Blades sample:");
console.log(JSON.stringify(parsedItems.filter(item => item.categoryName === 'Molds and Blades').slice(0, 5), null, 2));
