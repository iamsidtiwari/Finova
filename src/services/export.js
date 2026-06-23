import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

// ─── Export Service ────────────────────────────────────────────────────────
// Handles CSV, Excel, and PDF exports with error handling.

export const exportService = {
    /**
     * Export expenses to Excel (.xlsx)
     */
    toExcel(data, filename = 'finova_expenses') {
        try {
            if (!data || data.length === 0) {
                toast.error('No data to export.');
                return;
            }
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
            XLSX.writeFile(wb, `${filename}_${getDateString()}.xlsx`);
            toast.success('Excel file exported!');
        } catch (err) {
            console.error('[exportService.toExcel]', err);
            toast.error('Failed to export Excel file.');
        }
    },

    /**
     * Export expenses to CSV
     */
    toCSV(data, filename = 'finova_expenses') {
        try {
            if (!data || data.length === 0) {
                toast.error('No data to export.');
                return;
            }
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row =>
                Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
            );
            const csv = [headers, ...rows].join('\n');
            downloadBlob(csv, `${filename}_${getDateString()}.csv`, 'text/csv');
            toast.success('CSV file exported!');
        } catch (err) {
            console.error('[exportService.toCSV]', err);
            toast.error('Failed to export CSV file.');
        }
    },

    /**
     * Export expenses to PDF (basic, no jsPDF dependency to avoid breaking builds)
     */
    toPDF(data, filename = 'finova_report') {
        try {
            if (!data || data.length === 0) {
                toast.error('No data to export.');
                return;
            }
            // Build a simple HTML table and trigger print
            const html = buildHTMLReport(data);
            const win = window.open('', '_blank');
            if (!win) { toast.error('Pop-up blocked. Allow pop-ups to export PDF.'); return; }
            win.document.write(html);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); win.close(); }, 500);
            toast.success('PDF print dialog opened!');
        } catch (err) {
            console.error('[exportService.toPDF]', err);
            toast.error('Failed to export PDF.');
        }
    },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function getDateString() {
    return new Date().toISOString().split('T')[0];
}

function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function buildHTMLReport(data) {
    const headers = ['Date', 'Category', 'Amount (₹)', 'Payment Method', 'Note', 'Subject'];
    const rows = data.map(e => [
        e.date ? new Date(e.date).toLocaleDateString('en-IN') : '-',
        e.category || '-',
        Number(e.amount || 0).toLocaleString('en-IN'),
        e.paymentMethod || '-',
        e.note || '-',
        e.subjectName || '-',
    ]);

    const totalAmount = data.reduce((s, e) => s + Number(e.amount || 0), 0);

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Finova Expense Report</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
  h1 { color: #0284c7; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #0284c7; color: white; padding: 10px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .total { font-weight: bold; color: #0284c7; font-size: 15px; text-align: right; padding-top: 12px; }
  .footer { color: #94a3b8; font-size: 12px; margin-top: 20px; }
</style>
</head>
<body>
<h1>💰 Finova – Expense Report</h1>
<p>Generated: ${new Date().toLocaleString('en-IN')}</p>
<table>
  <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
</table>
<p class="total">Total Expenses: ₹${totalAmount.toLocaleString('en-IN')}</p>
<p class="footer">Finova v2.0 • For personal use only</p>
</body>
</html>`;
}
