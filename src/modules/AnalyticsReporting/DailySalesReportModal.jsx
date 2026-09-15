import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  TrendingUp,
  PackageCheck
} from 'lucide-react';

export default function DailySalesReportModal({ isOpen, onClose, transactions = [], medicines = [] }) {
  if (!isOpen) return null;

  // Selected date (defaults to today in YYYY-MM-DD format)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Filter transactions for the selected date
  const filteredTxns = useMemo(() => {
    return transactions.filter(t => {
      if (!t) return false;
      const tDateStr = t.date || t.created_at;
      if (!tDateStr) return false;
      // Match YYYY-MM-DD
      return tDateStr.includes(selectedDate);
    });
  }, [transactions, selectedDate]);

  // Compute Daily Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalItemsCount = 0;
    const paymentMethods = { Cash: 0, Card: 0, "Digital Wallet (LANKAQR)": 0, Other: 0 };
    const itemsSoldMap = {};

    filteredTxns.forEach(t => {
      const amt = Number(t.total) || 0;
      totalRevenue += amt;
      totalDiscount += Number(t.discountAmt || t.discount) || 0;
      totalTax += Number(t.taxAmt || t.tax) || 0;

      // Payment method breakdown
      const pm = t.paymentMethod || t.payment_method || 'Cash';
      if (pm.toLowerCase().includes('cash')) paymentMethods.Cash += amt;
      else if (pm.toLowerCase().includes('card')) paymentMethods.Card += amt;
      else if (pm.toLowerCase().includes('qr') || pm.toLowerCase().includes('wallet')) paymentMethods["Digital Wallet (LANKAQR)"] += amt;
      else paymentMethods.Other += amt;

      // Items count & map
      const items = Array.isArray(t.items) ? t.items : [];
      items.forEach(item => {
        const qty = Number(item.qty || item.quantity) || 1;
        totalItemsCount += qty;
        const name = item.name || 'Medicine Item';
        if (!itemsSoldMap[name]) {
          itemsSoldMap[name] = { name, qty: 0, total: 0 };
        }
        itemsSoldMap[name].qty += qty;
        itemsSoldMap[name].total += Number(item.total || (qty * (item.price || 0))) || 0;
      });
    });

    const topItems = Object.values(itemsSoldMap).sort((a, b) => b.total - a.total);
    const avgTicket = filteredTxns.length > 0 ? totalRevenue / filteredTxns.length : 0;

    return {
      totalRevenue,
      totalDiscount,
      totalTax,
      totalItemsCount,
      paymentMethods,
      topItems,
      avgTicket,
      txCount: filteredTxns.length
    };
  }, [filteredTxns, selectedDate]);

  // Export to CSV functionality
  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "PHARMART PHARMACY - DAILY SALES REPORT\n";
    csvContent += `Report Date: ${selectedDate}\n\n`;
    csvContent += "Invoice No,Customer Name,Cashier Name,Payment Method,Items,Total (LKR)\n";

    filteredTxns.forEach(t => {
      const itemsList = (t.items || []).map(i => `${i.name} (x${i.qty || 1})`).join(" | ");
      const line = `"${t.invoiceNo || t.invoice_no || t.id}","${t.customerName || t.customer_name || 'Walk-in'}","${t.cashierName || t.cashier_name || 'Staff'}","${t.paymentMethod || 'Cash'}","${itemsList}",${t.total}`;
      csvContent += line + "\n";
    });

    csvContent += `\nTotal Sales Revenue: LKR ${metrics.totalRevenue.toFixed(2)}\n`;
    csvContent += `Total Transactions: ${metrics.txCount}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Sales_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col font-sans">
        
        {/* Header (Hidden during print) */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-400/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Daily Sales & Financial Report Generator</h2>
              <p className="text-xs text-sky-200/80 mt-0.5 font-medium">Export, inspect and print daily POS revenue data</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV Sheet</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Printable Document Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-slate-900">PHARMART PHARMACY</span>
                <span className="text-xs px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-md font-bold">Enterprise Audit Report</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">Main Counter & E-Pharmacy Daily Checkout Ledger</p>
            </div>

            {/* Date Selector Filter */}
            <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 print:hidden">
              <Calendar className="w-4 h-4 text-sky-600 ml-2" />
              <label className="text-xs font-bold text-slate-700">Select Date:</label>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 font-mono font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              />
            </div>

            <div className="hidden print:block text-right text-xs text-slate-600 font-mono">
              Report Date: <strong>{selectedDate}</strong><br />
              Generated: {new Date().toLocaleString()}
            </div>
          </div>

          {/* Metric Highlights Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
              <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Gross Sales Revenue</div>
              <div className="text-xl sm:text-2xl font-black text-sky-900 font-mono mt-1">
                LKR {metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Transactions</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                {metrics.txCount} Invoices
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Items Dispensed</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                {metrics.totalItemsCount} Units
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Transaction Value</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                LKR {metrics.avgTicket.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center">
              <CreditCard className="w-4 h-4 mr-1.5 text-sky-600" />
              Payment Collection Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-600">Cash Collections</span>
                <span className="font-mono font-black text-slate-900">LKR {metrics.paymentMethods.Cash.toFixed(2)}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-600">Credit / Debit Card</span>
                <span className="font-mono font-black text-slate-900">LKR {metrics.paymentMethods.Card.toFixed(2)}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-600">Digital / LANKAQR</span>
                <span className="font-mono font-black text-slate-900">LKR {metrics.paymentMethods["Digital Wallet (LANKAQR)"].toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Detailed Transaction Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-extrabold text-slate-900">
                Detailed Invoices Ledger for {selectedDate}
              </h4>
              <span className="text-xs text-slate-500 font-bold">{filteredTxns.length} Transactions Found</span>
            </div>

            {filteredTxns.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
                No checkout transactions recorded for date {selectedDate}.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Time / Cashier</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items Sold</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3 text-right">Total (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredTxns.map((t, index) => (
                      <tr key={t.id || index} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-sky-700">
                          {t.invoiceNo || t.invoice_no || t.id}
                        </td>
                        <td className="p-3 text-slate-500">
                          <span className="font-semibold block text-slate-700">{t.date ? t.date.split(' ')[1] + ' ' + (t.date.split(' ')[2] || '') : 'POS'}</span>
                          <span className="text-[10px]">{t.cashierName || t.cashier_name || 'Cashier'}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {t.customerName || t.customer_name || 'Walk-in Customer'}
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            {(t.items || []).map((itm, i) => (
                              <div key={i} className="text-[11px] text-slate-600">
                                • {itm.name} <span className="font-mono font-bold text-slate-800">×{itm.qty || 1}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-bold border border-slate-200">
                            {t.paymentMethod || t.payment_method || 'Cash'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-slate-900 text-sm">
                          LKR {(Number(t.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Selling Products List for the day */}
          {metrics.topItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center">
                <PackageCheck className="w-4 h-4 mr-1.5 text-sky-600" />
                Top Performing Items (By Revenue)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metrics.topItems.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{item.qty} units sold today</div>
                    </div>
                    <div className="text-right font-mono font-black text-sky-800">
                      LKR {item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 print:hidden text-xs">
          <span className="text-slate-500 font-medium">PHARMART Enterprise POS Reporting System</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>

    </div>
  );
}
