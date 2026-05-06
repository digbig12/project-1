'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  RefreshCcw,
  Plus,
  ChevronDown
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { processReceipt, saveOCRTransaction, getCategories } from '@/lib/actions';
import { DynamicIcon } from './DynamicIcon';

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OCRModal({ isOpen, onClose, onSuccess }: OCRModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'scanning' | 'success' | 'error'>('idle');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setStatus('idle');
    }
  };

  const handleScan = async () => {
    if (!preview) return;
    setStatus('scanning');
    
    try {
      // Extract base64 and mimeType
      const base64Content = preview.split(',')[1];
      const mimeType = file?.type || 'image/jpeg';
      
      const result = await processReceipt(base64Content, mimeType);
      
      if (result.success) {
        setExtractedData(result.data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Scanning failed:', error);
      setStatus('error');
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;
    setStatus('uploading');
    try {
      // Find the category ID for the selected category
      const selectedCategory = categories.find(c => c.name === extractedData.category) || 
                               categories.find(c => c.id === extractedData.categoryId);
      
      const saveData = {
        ...extractedData,
        categoryId: extractedData.categoryId || selectedCategory?.id
      };

      const result = await saveOCRTransaction(saveData);
      if (result.success) {
        onSuccess();
        onClose();
        reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setExtractedData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl overflow-hidden"
      >
        <GlassCard className="p-0 border-white/20 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Smart Receipt Scanner</h3>
                <p className="text-xs text-secondary italic">AI-Powered Extraction</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {status === 'idle' && !file && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">Click to Upload Receipt</p>
                    <p className="text-sm text-secondary">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </motion.div>
              )}

              {file && status === 'idle' && (
                <motion.div key="preview" className="space-y-6">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                    {preview && (
                      <img src={preview} alt="Receipt Preview" className="w-full h-full object-contain" />
                    )}
                    <button 
                      onClick={reset}
                      className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={handleScan}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Sparkles size={20} />
                    Scan with Gemini AI
                  </button>
                </motion.div>
              )}

              {status === 'scanning' && (
                <motion.div key="scanning" className="py-20 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 size={64} className="text-primary animate-spin" />
                    <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-bold text-xl">Analyzing Receipt...</p>
                    <p className="text-sm text-secondary animate-pulse">Gemini is extracting merchant, date, and items.</p>
                  </div>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div key="success" className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400">
                    <CheckCircle2 size={24} />
                    <div>
                      <p className="font-bold">Extraction Successful</p>
                      <p className="text-xs opacity-80">AI has accurately parsed the data</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] text-secondary uppercase font-bold">Merchant</p>
                      <input 
                        className="bg-transparent border-none outline-none text-sm font-medium w-full text-white"
                        value={extractedData.merchant}
                        onChange={(e) => setExtractedData({...extractedData, merchant: e.target.value})}
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] text-secondary uppercase font-bold">Amount</p>
                      <input 
                        className="bg-transparent border-none outline-none text-sm font-medium w-full text-primary"
                        type="number"
                        value={extractedData.amount}
                        onChange={(e) => setExtractedData({...extractedData, amount: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[10px] text-secondary uppercase font-bold">Date</p>
                      <input 
                        className="bg-transparent border-none outline-none text-sm font-medium w-full text-white"
                        type="date"
                        value={extractedData.date}
                        onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 relative group">
                      <p className="text-[10px] text-secondary uppercase font-bold">Category</p>
                      <div className="relative">
                        <select 
                          value={extractedData.categoryId || ''} 
                          onChange={(e) => setExtractedData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium appearance-none cursor-pointer"
                        >
                          <option value="">Select Category...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#0f1729]">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={reset}
                      className="flex-1 border border-white/10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-secondary"
                    >
                      <RefreshCcw size={18} />
                      Scan Again
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                    >
                      <Plus size={18} />
                      Confirm & Save
                    </button>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div key="error" className="py-12 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <AlertCircle size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">Failed to read receipt</p>
                    <p className="text-sm text-secondary">The image might be blurry or unsupported.</p>
                  </div>
                  <button onClick={reset} className="text-primary font-bold hover:underline">Try another photo</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
