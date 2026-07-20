import React from 'react';
import { renderToString } from 'react-dom/server';

export function CustomHTMLTemplate({ invoice, printSet, gstSet, customHtml, activeColor }) {
  if (!customHtml) return null;

  let html = customHtml;
  
  // Replace basic fields
  html = html.replace(/{{customerName}}/g, invoice.customer || '');
  html = html.replace(/{{invoiceNumber}}/g, invoice.meta.invoiceNumber || '');
  html = html.replace(/{{date}}/g, invoice.meta.date || '');
  html = html.replace(/{{companyName}}/g, printSet.companyName || '');
  html = html.replace(/{{address}}/g, printSet.address || '');
  html = html.replace(/{{phone}}/g, printSet.phone || '');
  html = html.replace(/{{email}}/g, printSet.email || '');
  html = html.replace(/{{subtotal}}/g, invoice.totals.subtotal.toFixed(2));
  html = html.replace(/{{taxAmount}}/g, invoice.totals.gstAmount.toFixed(2));
  html = html.replace(/{{grandTotal}}/g, invoice.totals.grand.toFixed(2));
  html = html.replace(/{{paymentMethod}}/g, invoice.paymentMethod || '');
  html = html.replace(/{{status}}/g, invoice.status || '');
  
  html = html.replace(/{{sellerGstin}}/g, gstSet?.gstin || '');
  html = html.replace(/{{buyerGstin}}/g, invoice.meta?.billedToGstin || '');
  html = html.replace(/{{sellerState}}/g, printSet?.state || invoice.meta?.placeOfSupply || '');
  html = html.replace(/{{buyerState}}/g, invoice.meta?.billedToState || invoice.meta?.placeOfSupply || '');
  
  // Handle items table if placeholder exists
  if (html.includes('{{itemsTable}}')) {
    const tableHtml = renderToString(
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: activeColor.raw || '#1e293b', color: '#fff' }}>
            <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>Price</th>
            <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((item, idx) => {
            const q = Number(item.qty) || 0;
            const r = Number(item.rate || item.price) || 0;
            const lineTotal = q * r;
            return (
              <tr key={idx}>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.name || item.item}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>{q}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>{r.toFixed(2)}</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
    html = html.replace(/{{itemsTable}}/g, tableHtml);
  }

  return (
    <div
      className="custom-html-template-wrapper w-full h-full"
      style={{ '--theme-color': activeColor?.raw || '#1e293b' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
