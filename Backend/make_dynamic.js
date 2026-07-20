const fs = require('fs');

let html = fs.readFileSync('eway_bill_extracted.html', 'utf8');

// Replace hardcoded values with placeholders supported by CustomHTMLTemplate
html = html.replace(/6615 2278 3444/g, '{{invoiceNumber}}');
html = html.replace(/08\/02\/2023 06:12PM/g, '{{date}}');

// First <Company Name here> is From (Seller), Second is To (Buyer)
html = html.replace('<Company Name here>', '{{companyName}}');
html = html.replace('<Company Name Here>', '{{customerName}}');

// For GSTINs, we need to match the exact string "29GH1234##########"
html = html.replace('29GH1234##########', '{{sellerGstin}}');
html = html.replace('29GH1234##########', '{{buyerGstin}}');

// For State
html = html.replace('<State>', '{{sellerState}}');
html = html.replace('<State>', '{{buyerState}}');

// Replace the Goods Details section with {{itemsTable}}
// The Goods Details section starts after the row containing "3. Goods Details"
// Let's locate the table row with "HSN Code" and the items rows, and replace them.
// A simpler way: we know it has "Item 01", "Item 02", "Item 03", "Item 04".
// Let's just find the index of "HSN Code" and everything after it.
const hsnIndex = html.indexOf('HSN Code');
if (hsnIndex !== -1) {
    // Find the <tr> that contains HSN Code
    const trStartIndex = html.lastIndexOf('<tr', hsnIndex);
    // Let's replace from this <tr> to the end of the table
    // The table ends with </table>
    const tableEndIndex = html.lastIndexOf('</table>');
    if (trStartIndex !== -1 && tableEndIndex !== -1) {
        const goodsSection = html.substring(trStartIndex, tableEndIndex);
        html = html.replace(goodsSection, '<tr><td colspan="12" style="padding: 10px;">{{itemsTable}}</td></tr>');
    }
}

fs.writeFileSync('eway_bill_dynamic.html', html, 'utf8');
console.log('Saved dynamic HTML to eway_bill_dynamic.html');
