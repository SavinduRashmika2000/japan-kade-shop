const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const xlsx = require('xlsx');

const directory = "D:\\pp\\japan-kade-shop\\resource";

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

async function main() {
    if (!fs.existsSync(directory)) {
        console.error(`Error: Resource directory not found at ${directory}`);
        process.exit(1);
    }
    
    console.log("Scanning directory for Excel files...");
    const files = fs.readdirSync(directory).filter(f => f.endsWith('.xlsx'));
    console.log(`Found ${files.length} Excel files.`);
    
    const parsedItems = [];
    const uniqueCategories = new Set();
    const usedSKUs = new Set();
    const baseCounters = {};
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const categoryName = file.replace(/\.xlsx$/i, '').trim();
        const categoryPrefix = getSKUPrefix(categoryName);
        uniqueCategories.add(categoryName);
        
        console.log(`Processing file: ${file} (Category: ${categoryName}, Prefix: ${categoryPrefix})`);
        const workbook = xlsx.readFile(filePath);
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
            if (rows.length === 0) return;
            
            let headerRowIndex = findHeaderRow(rows);
            if (headerRowIndex === -1) {
                headerRowIndex = 0;
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
    
    console.log(`Parsed ${parsedItems.length} items and ${uniqueCategories.size} categories.`);
    
    // Connect to Database
    console.log("Connecting to database...");
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'japan_kade_shop'
    });
    
    try {
        await connection.beginTransaction();
        console.log("Database transaction started.");
        
        // 1. Disable constraints
        console.log("Disabling foreign key constraints...");
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");
        
        // 2. Truncate tables
        console.log("Clearing existing stock inventory tables...");
        await connection.query("TRUNCATE TABLE stock_movements");
        await connection.query("TRUNCATE TABLE stock_transactions");
        await connection.query("TRUNCATE TABLE stock_batches");
        await connection.query("TRUNCATE TABLE stock_items");
        await connection.query("TRUNCATE TABLE categories");
        
        // 3. Re-enable constraints
        console.log("Re-enabling foreign key constraints...");
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        
        // 4. Insert Categories
        console.log("Inserting new categories...");
        const categoryMap = {};
        const categoriesList = Array.from(uniqueCategories);
        for (let catName of categoriesList) {
            const [res] = await connection.query(
                "INSERT INTO categories (name) VALUES (?)",
                [catName]
            );
            categoryMap[catName] = res.insertId;
        }
        console.log(`Inserted ${categoriesList.length} categories.`);
        
        // 5. Insert Stock Items, Batches, and Transactions
        console.log("Inserting stock items...");
        let itemIndex = 0;
        const now = new Date();
        
        for (let item of parsedItems) {
            const categoryId = categoryMap[item.categoryName];
            
            // Insert Stock Item
            const [itemRes] = await connection.query(
                `INSERT INTO stock_items 
                 (name, part_number, quantity, unit_price, reserved_quantity, category_id, is_deleted, created_at, low_stock_threshold, remarks, location) 
                 VALUES (?, ?, ?, ?, ?, ?, 0, ?, 5, ?, ?)`,
                [item.name, item.sku, item.quantity, item.price, 0, categoryId, now, item.remarks || null, item.place || null]
            );
            const stockItemId = itemRes.insertId;
            
            // If quantity > 0, insert batch and transaction
            if (item.quantity > 0) {
                // Insert Batch
                await connection.query(
                    `INSERT INTO stock_batches 
                     (stock_item_id, initial_quantity, current_quantity, unit_price, landed_cost, selling_price, is_restored, is_deleted, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`,
                    [stockItemId, item.quantity, item.quantity, item.price, item.price, item.price, now]
                );
                
                // Insert Transaction
                await connection.query(
                    `INSERT INTO stock_transactions 
                     (stock_item_id, quantity, unit_price, total_amount, transaction_type, note, timestamp) 
                     VALUES (?, ?, ?, ?, 'ADD', ?, ?)`,
                    [stockItemId, item.quantity, item.price, item.quantity * item.price, item.note || 'Initial Stock Entry', now]
                );
            }
            
            itemIndex++;
            if (itemIndex % 200 === 0) {
                console.log(`  Inserted ${itemIndex}/${parsedItems.length} items...`);
            }
        }
        
        await connection.commit();
        console.log(`Database successfully updated! Total items loaded: ${parsedItems.length}`);
        
    } catch (err) {
        console.error("Database operation failed! Rolling back changes...", err);
        await connection.rollback();
        process.exit(1);
    } finally {
        await connection.end();
        console.log("Database connection closed.");
    }
}

main();
