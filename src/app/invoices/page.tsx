'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Trash2, Send, CheckCircle2, Clock, IndianRupee,
  X, Download, Eye, ChevronDown, Package
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice } from '@/lib/invoice-actions';

interface LineItem {
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGST, setClientGST] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ name: '', qty: 1, rate: 0, amount: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  async function fetchInvoices() {
    setIsLoading(true);
    const data = await getInvoices();
    setInvoices(data);
    setIsLoading(false);
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'qty' || field === 'rate') {
      updated[index].amount = updated[index].qty * updated[index].rate;
    }
    setItems(updated);
  }

  function addItem() {
    setItems([...items, { name: '', qty: 1, rate: 0, amount: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  async function handleCreate() {
    if (!clientName || items.some(i => !i.name || i.rate <= 0)) return;
    setSaving(true);
    const result = await createInvoice({
      clientName, clientEmail, clientAddress, clientGST,
      items, taxRate, dueDate, notes,
    });
    if (result.success) {
      setShowCreate(false);
      resetForm();
      fetchInvoices();
    }
    setSaving(false);
  }

  function resetForm() {
    setClientName(''); setClientEmail(''); setClientAddress(''); setClientGST('');
    setTaxRate(18); setDueDate(''); setNotes('');
    setItems([{ name: '', qty: 1, rate: 0, amount: 0 }]);
  }

  async function handleStatusChange(id: string, status: string) {
    await updateInvoiceStatus(id, status);
    fetchInvoices();
  }

  async function handleDelete(id: string) {
    await deleteInvoice(id);
    fetchInvoices();
  }

  const statusConfig: Record<string, { color: string; icon: any; bg: string }> = {
    DRAFT: { color: 'text-slate-400', icon: Clock, bg: 'bg-slate-500/10' },
    SENT: { color: 'text-blue-400', icon: Send, bg: 'bg-blue-500/10' },
    PAID: { color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10' },
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Invoices</h1>
          <p className="text-secondary mt-1">Create and manage professional GST invoices</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: invoices.length, color: 'text-white' },
          { label: 'Draft', value: invoices.filter(i => i.status === 'DRAFT').length, color: 'text-slate-400' },
          { label: 'Sent', value: invoices.filter(i => i.status === 'SENT').length, color: 'text-blue-400' },
          { label: 'Paid', value: `₹${invoices.filter(i => i.status === 'PAID').reduce((s: number, i: any) => s + i.total, 0).toLocaleString()}`, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5 text-center" delay={i * 0.05}>
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Invoice List */}
      <GlassCard className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-secondary/30 mb-4" size={48} />
            <p className="text-secondary font-medium">No invoices yet</p>
            <p className="text-xs text-secondary/60 mt-1">Create your first invoice to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv, i) => {
              const cfg = statusConfig[inv.status] || statusConfig.DRAFT;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Icon size={18} className={cfg.color} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{inv.invoiceNumber}</p>
                      <p className="text-xs text-secondary">{inv.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-bold tabular-nums">₹{inv.total.toLocaleString()}</p>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${cfg.bg} ${cfg.color}`}>
                      {inv.status}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inv.status === 'DRAFT' && (
                        <button onClick={() => handleStatusChange(inv.id, 'SENT')} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400" title="Mark as Sent">
                          <Send size={14} />
                        </button>
                      )}
                      {inv.status === 'SENT' && (
                        <button onClick={() => handleStatusChange(inv.id, 'PAID')} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400" title="Mark as Paid">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <button onClick={() => setPreviewInvoice(inv)} className="p-2 rounded-lg hover:bg-white/10 text-secondary" title="Preview">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-card border border-border rounded-3xl w-full max-w-3xl my-10 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2"><FileText size={20} className="text-primary" /> New Invoice</h2>
                <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-2 rounded-lg hover:bg-white/10"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Client Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Client Name *" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  <input placeholder="Client Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  <input placeholder="Client Address" value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  <input placeholder="Client GSTIN" value={clientGST} onChange={e => setClientGST(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                {/* Line Items */}
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5"><Package size={12} /> Line Items</p>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input placeholder="Item description" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                        <input type="number" placeholder="Qty" value={item.qty || ''} onChange={e => updateItem(i, 'qty', parseFloat(e.target.value) || 0)} className="w-20 bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm outline-none text-center focus:ring-2 focus:ring-primary/50" />
                        <input type="number" placeholder="Rate" value={item.rate || ''} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} className="w-28 bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-sm outline-none text-right focus:ring-2 focus:ring-primary/50" />
                        <span className="w-28 text-right font-bold text-sm tabular-nums">₹{item.amount.toLocaleString()}</span>
                        <button onClick={() => removeItem(i)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addItem} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {/* Tax & Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">GST Rate (%)</label>
                    <select value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none">
                      <option value={0} className="bg-[#0f1729]">0% (Exempt)</option>
                      <option value={5} className="bg-[#0f1729]">5%</option>
                      <option value={12} className="bg-[#0f1729]">12%</option>
                      <option value={18} className="bg-[#0f1729]">18%</option>
                      <option value={28} className="bg-[#0f1729]">28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Notes</label>
                    <input placeholder="Payment terms..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" />
                  </div>
                </div>

                {/* Totals */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-secondary">Subtotal</span><span className="font-bold tabular-nums">₹{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-secondary">GST ({taxRate}%)</span><span className="font-bold tabular-nums">₹{taxAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-lg border-t border-white/10 pt-2 mt-2"><span className="font-bold">Total</span><span className="font-black tabular-nums text-primary">₹{total.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button onClick={() => { setShowCreate(false); resetForm(); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-secondary hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleCreate} disabled={saving || !clientName} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02]">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={16} />}
                  Create Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {previewInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white text-black rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" id="invoice-preview">
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">INVOICE</h2>
                    <p className="text-sm text-slate-500 mt-1">{previewInvoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">BizAnalytics</p>
                    <p className="text-xs text-slate-500">AI Business Intelligence Platform</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bill To</p>
                    <p className="font-bold text-slate-900">{previewInvoice.clientName}</p>
                    {previewInvoice.clientEmail && <p className="text-sm text-slate-500">{previewInvoice.clientEmail}</p>}
                    {previewInvoice.clientAddress && <p className="text-sm text-slate-500">{previewInvoice.clientAddress}</p>}
                    {previewInvoice.clientGST && <p className="text-sm text-slate-500">GSTIN: {previewInvoice.clientGST}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Date</p>
                    <p className="font-medium text-slate-900">{new Date(previewInvoice.createdAt).toLocaleDateString('en-IN')}</p>
                    {previewInvoice.dueDate && (
                      <>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3 mb-1">Due Date</p>
                        <p className="font-medium text-slate-900">{new Date(previewInvoice.dueDate).toLocaleDateString('en-IN')}</p>
                      </>
                    )}
                  </div>
                </div>

                <table className="w-full text-sm mb-8">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 text-slate-500 font-bold">Item</th>
                      <th className="text-center py-3 text-slate-500 font-bold">Qty</th>
                      <th className="text-right py-3 text-slate-500 font-bold">Rate</th>
                      <th className="text-right py-3 text-slate-500 font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JSON.parse(previewInvoice.items).map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-3 font-medium">{item.name}</td>
                        <td className="py-3 text-center">{item.qty}</td>
                        <td className="py-3 text-right tabular-nums">₹{item.rate.toLocaleString()}</td>
                        <td className="py-3 text-right font-bold tabular-nums">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold">₹{previewInvoice.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">GST ({previewInvoice.taxRate}%)</span><span className="font-bold">₹{previewInvoice.taxAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-lg border-t-2 border-slate-900 pt-2"><span className="font-bold">Total</span><span className="font-black">₹{previewInvoice.total.toLocaleString()}</span></div>
                  </div>
                </div>

                {previewInvoice.notes && (
                  <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-slate-600">{previewInvoice.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3 print:hidden">
                <button onClick={() => setPreviewInvoice(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">Close</button>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all">
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
