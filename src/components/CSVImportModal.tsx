'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Database,
  Sparkles,
  Loader2
} from 'lucide-react';
import Papa from 'papaparse';
import { mapCSVHeaders, importTransactionsBatch } from '@/lib/actions';
import { GlassCard } from './GlassCard';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setHeaders(results.meta.fields || []);
          setSampleData(results.data.slice(0, 5));
          setFullData(results.data);
          handleStartMapping(results.meta.fields || [], results.data.slice(0, 5));
        }
      });
    }
  };

  const handleStartMapping = async (headers: string[], sample: any[]) => {
    setIsProcessing(true);
    const result = await mapCSVHeaders(headers, sample);
    if (result.success) {
      setMapping(result.mapping);
      setStep(2);
    } else {
      setError('AI could not map headers automatically. Please map manually.');
      setStep(2); // Still move to manual mapping
    }
    setIsProcessing(false);
  };

  const executeImport = async () => {
    setIsProcessing(true);
    // Apply mapping to all data
    const mappedRows = fullData.map(row => ({
      date: row[mapping.date],
      description: row[mapping.description],
      amount: row[mapping.amount],
      type: mapping.type ? row[mapping.type] : null
    }));

    const result = await importTransactionsBatch(mappedRows);
    if (result.success) {
      setStep(3);
      setTimeout(() => {
        onSuccess();
        onClose();
        reset();
      }, 2000);
    } else {
      setError('Failed to import data. Please check file format.');
    }
    setIsProcessing(false);
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setMapping(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl"
      >
        <GlassCard className="p-8 border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Database size={20} />
              </div>
              <h2 className="text-xl font-bold">Bulk AI Import</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-secondary hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : 
                    step > s ? "bg-green-500 text-white" : "bg-white/5 text-secondary"
                  }`}>
                    {step > s ? <CheckCircle2 size={16} /> : s}
                  </div>
                  {s < 3 && <div className="w-8 h-[2px] bg-white/5" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:text-primary mx-auto mb-6 transition-all group-hover:scale-110">
                  {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                </div>
                <h3 className="text-lg font-bold mb-2">Upload Bank Statement</h3>
                <p className="text-sm text-secondary">Drag and drop your CSV file here, or click to browse</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-secondary bg-white/5 py-2 px-4 rounded-full w-fit mx-auto">
                  <FileText size={14} />
                  Max size: 10MB
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-primary" size={20} />
                    <p className="text-sm font-medium">AI has mapped your columns automatically.</p>
                  </div>
                  <button onClick={() => setMapping(null)} className="text-xs font-bold text-primary underline">Reset Mapping</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MappingField label="Date" current={mapping?.date} options={headers} onSelect={(v) => setMapping({...mapping, date: v})} />
                  <MappingField label="Description" current={mapping?.description} options={headers} onSelect={(v) => setMapping({...mapping, description: v})} />
                  <MappingField label="Amount" current={mapping?.amount} options={headers} onSelect={(v) => setMapping({...mapping, amount: v})} />
                  <MappingField label="Type (Optional)" current={mapping?.type} options={headers} onSelect={(v) => setMapping({...mapping, type: v})} />
                </div>

                <button 
                  onClick={executeImport}
                  disabled={isProcessing || !mapping?.date || !mapping?.description || !mapping?.amount}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                  <span>{isProcessing ? 'Processing Transactions...' : `Import ${fullData.length} Transactions`}</span>
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="py-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-500 mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Import Successful</h3>
                  <p className="text-secondary mt-2">AI is now categorizing your business history.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function MappingField({ label, current, options, onSelect }: { label: string, current: string, options: string[], onSelect: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-secondary uppercase px-1">{label}</label>
      <select 
        value={current || ""} 
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="" disabled>Select Header</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
