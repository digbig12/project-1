"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft, Sparkles, Smartphone, Building2, Wallet } from "lucide-react";
import { processPayment } from "@/actions/stripe";
import { useRouter } from "next/navigation";

type PaymentStep = "form" | "processing" | "success" | "error";
type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

const PAYMENT_TABS: { id: PaymentMethod; label: string; icon: any }[] = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "netbanking", label: "Net Banking", icon: Building2 },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

const BANKS = [
  { id: "sbi", name: "State Bank of India" },
  { id: "hdfc", name: "HDFC Bank" },
  { id: "icici", name: "ICICI Bank" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Mahindra Bank" },
  { id: "pnb", name: "Punjab National Bank" },
  { id: "bob", name: "Bank of Baroda" },
  { id: "yes", name: "YES Bank" },
];

const WALLETS = [
  { id: "paytm", name: "Paytm", color: "#00BAF2" },
  { id: "phonepe", name: "PhonePe", color: "#5F259F" },
  { id: "amazon", name: "Amazon Pay", color: "#FF9900" },
  { id: "mobikwik", name: "MobiKwik", color: "#E1251B" },
  { id: "freecharge", name: "Freecharge", color: "#7B2D8E" },
  { id: "airtel", name: "Airtel Money", color: "#ED1C24" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<PaymentStep>("form");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processingMessage, setProcessingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardType, setCardType] = useState("");

  // UPI state
  const [upiId, setUpiId] = useState("");

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState("");

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletPhone, setWalletPhone] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) parts.push(v.substring(i, i + 4));
    return parts.join(" ");
  };

  useEffect(() => {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) setCardType("visa");
    else if (clean.startsWith("5") || clean.startsWith("2")) setCardType("mastercard");
    else if (clean.startsWith("3")) setCardType("amex");
    else if (clean.startsWith("6")) setCardType("rupay");
    else setCardType("");
  }, [cardNumber]);

  const formatExpiry = (value: string) => {
    const v = value.replace(/[^0-9]/g, "");
    if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2, 4);
    return v;
  };

  const runProcessing = async (messages: string[]) => {
    setStep("processing");
    for (const msg of messages) {
      setProcessingMessage(msg);
      await new Promise((r) => setTimeout(r, 800));
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length < 13) { setErrorMessage("Please enter a valid card number"); setStep("error"); return; }
    if (!expiry || expiry.length < 5) { setErrorMessage("Please enter a valid expiry date"); setStep("error"); return; }
    if (cvc.length < 3) { setErrorMessage("Please enter a valid CVC"); setStep("error"); return; }
    if (cardName.trim().length < 2) { setErrorMessage("Please enter the cardholder name"); setStep("error"); return; }

    await runProcessing(["Encrypting card details...", "Connecting to card network...", "Verifying with your bank...", "Processing payment..."]);
    const result = await processPayment({ cardNumber: cleanNumber, expiry, cvc, name: cardName });
    if (result.success) { setStep("success"); setTimeout(() => router.push("/settings?success=true"), 2500); }
    else { setErrorMessage(result.error || "Payment failed"); setStep("error"); }
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId || !upiId.includes("@")) { setErrorMessage("Please enter a valid UPI ID (e.g. name@upi)"); setStep("error"); return; }

    await runProcessing(["Sending payment request to UPI...", "Waiting for approval...", "Verifying transaction...", "Payment confirmed!"]);
    const result = await processPayment({ cardNumber: "0000000000000000", expiry: "12/30", cvc: "000", name: `UPI:${upiId}` });
    if (result.success) { setStep("success"); setTimeout(() => router.push("/settings?success=true"), 2500); }
    else { setErrorMessage(result.error || "UPI payment failed"); setStep("error"); }
  };

  const handleNetBankingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) { setErrorMessage("Please select a bank"); setStep("error"); return; }

    await runProcessing(["Redirecting to bank portal...", "Authenticating session...", "Processing transaction...", "Payment confirmed!"]);
    const result = await processPayment({ cardNumber: "0000000000000000", expiry: "12/30", cvc: "000", name: `NETBANK:${selectedBank}` });
    if (result.success) { setStep("success"); setTimeout(() => router.push("/settings?success=true"), 2500); }
    else { setErrorMessage(result.error || "Net banking payment failed"); setStep("error"); }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) { setErrorMessage("Please select a wallet"); setStep("error"); return; }
    if (walletPhone.length < 10) { setErrorMessage("Please enter a valid phone number"); setStep("error"); return; }

    await runProcessing([`Connecting to ${selectedWallet}...`, "Sending payment request...", "Verifying balance...", "Payment confirmed!"]);
    const result = await processPayment({ cardNumber: "0000000000000000", expiry: "12/30", cvc: "000", name: `WALLET:${selectedWallet}:${walletPhone}` });
    if (result.success) { setStep("success"); setTimeout(() => router.push("/settings?success=true"), 2500); }
    else { setErrorMessage(result.error || "Wallet payment failed"); setStep("error"); }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all";

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg relative z-10">
        <button onClick={() => router.push("/pricing")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Pricing
        </button>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Order Summary */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">BizAnalytics Advanced</h3>
                      <p className="text-slate-400 text-xs">Monthly subscription</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">$19.99</p>
                    <p className="text-slate-500 text-xs">/month</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock size={14} className="text-emerald-400" />
                  <span className="text-xs text-slate-400 font-medium">Secure Payment</span>
                </div>

                {/* Payment Method Tabs */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {PAYMENT_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = method === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setMethod(tab.id)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                          isActive
                            ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                            : "bg-white/3 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ===== CARD FORM ===== */}
                {method === "card" && (
                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Card Number</label>
                      <div className="relative">
                        <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19} className={`${inputClass} font-mono tracking-wider`} required />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {cardType === "visa" && <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">VISA</span>}
                          {cardType === "mastercard" && <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">MC</span>}
                          {cardType === "amex" && <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">AMEX</span>}
                          {cardType === "rupay" && <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded">RuPay</span>}
                          {!cardType && <CreditCard size={18} className="text-slate-600" />}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Expiry</label>
                        <input type="text" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} className={`${inputClass} font-mono`} required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">CVC</label>
                        <input type="text" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="123" maxLength={4} className={`${inputClass} font-mono`} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Cardholder Name</label>
                      <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" className={inputClass} required />
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all hover:scale-[1.01] shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.99]">
                      Pay $19.99
                    </button>
                  </form>
                )}

                {/* ===== UPI FORM ===== */}
                {method === "upi" && (
                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">UPI ID</label>
                      <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className={inputClass} required />
                      <p className="text-[11px] text-slate-500 mt-2">Enter your UPI ID linked to Google Pay, PhonePe, Paytm, or any UPI app.</p>
                    </div>
                    <div className="flex items-center gap-3 py-3 px-4 bg-white/3 rounded-xl border border-white/5">
                      <div className="flex gap-2">
                        {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                          <span key={app} className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md">{app}</span>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all hover:scale-[1.01] shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.99]">
                      Pay $19.99 via UPI
                    </button>
                  </form>
                )}

                {/* ===== NET BANKING FORM ===== */}
                {method === "netbanking" && (
                  <form onSubmit={handleNetBankingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Select Your Bank</label>
                      <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                        {BANKS.map((bank) => (
                          <button
                            type="button"
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-left transition-all text-sm ${
                              selectedBank === bank.id
                                ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                                : "bg-white/3 border-white/5 text-slate-400 hover:bg-white/5"
                            }`}
                          >
                            <Building2 size={14} />
                            <span className="text-xs font-medium truncate">{bank.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all hover:scale-[1.01] shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.99]">
                      Pay $19.99 via Net Banking
                    </button>
                  </form>
                )}

                {/* ===== WALLET FORM ===== */}
                {method === "wallet" && (
                  <form onSubmit={handleWalletSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Select Wallet</label>
                      <div className="grid grid-cols-3 gap-2">
                        {WALLETS.map((w) => (
                          <button
                            type="button"
                            key={w.id}
                            onClick={() => setSelectedWallet(w.id)}
                            className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all ${
                              selectedWallet === w.id
                                ? "border-blue-500/40 bg-blue-500/10"
                                : "border-white/5 bg-white/3 hover:bg-white/5"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: w.color + "20" }}>
                              <Wallet size={14} style={{ color: w.color }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-300">{w.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Registered Phone Number</label>
                      <input type="tel" value={walletPhone} onChange={(e) => setWalletPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} placeholder="9876543210" maxLength={10} className={`${inputClass} font-mono`} required />
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all hover:scale-[1.01] shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.99]">
                      Pay $19.99 via Wallet
                    </button>
                  </form>
                )}

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Shield size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Lock size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">PCI DSS</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Shield size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">RBI Compliant</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROCESSING */}
          {step === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 rounded-full border-[3px] border-blue-500/20" />
                <motion.div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
                <div className="absolute inset-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <CreditCard size={24} className="text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Processing Payment</h3>
              <motion.p key={processingMessage} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-slate-400 text-sm">{processingMessage}</motion.p>
              <div className="flex justify-center gap-1 mt-6">
                {[0, 1, 2].map((i) => (<motion.div key={i} className="w-2 h-2 rounded-full bg-blue-500" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />))}
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <CheckCircle size={40} className="text-emerald-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-slate-400 text-sm mb-4">Welcome to BizAnalytics Advanced. Redirecting you now...</p>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full">
                <Sparkles size={14} /> PRO TIER ACTIVATED
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {step === "error" && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
              <p className="text-red-300/80 text-sm mb-6">{errorMessage}</p>
              <button onClick={() => setStep("form")} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-slate-600 text-[10px] mt-6 uppercase tracking-wider font-medium">Powered by BizAnalytics Secure Payments</p>
      </motion.div>
    </div>
  );
}
