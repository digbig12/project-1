'use client';

import { 
  User, 
  Key, 
  Database,
  Save,
  Eye,
  EyeOff,
  Plus,
  Tag,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  Building2,
  MapPin,
  Shield,
  Lock,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  BadgeCheck,
  AlertTriangle,
  Target,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { getCategories, createCategory, deleteCategory, exportTransactionsToCSV, injectSampleDataAction, getProfile, updateProfile, changePassword } from '@/lib/actions';
import { createCustomerPortalSession, getSubscriptionAction } from '@/actions/stripe';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { DynamicIcon } from '@/components/DynamicIcon';

const CATEGORY_ICONS = [
  'Tag', 'Wallet', 'CreditCard', 'ShoppingCart', 'Utensils', 
  'Zap', 'Car', 'Home', 'Smartphone', 'Cpu', 
  'Globe', 'Heart', 'Briefcase', 'GraduationCap', 'Plane',
  'LayoutGrid', 'Settings', 'Package', 'Receipt', 'TrendingUp',
  'Lightbulb', 'Target', 'Users', 'Megaphone', 'HardDrive',
  'Music', 'Camera', 'Gift', 'Coffee', 'Truck'
];

const INDUSTRIES = [
  'Information Technology', 'E-Commerce', 'Retail', 'Manufacturing', 
  'Healthcare', 'Education', 'Finance & Banking', 'Real Estate', 
  'Food & Beverage', 'Consulting', 'Marketing & Advertising', 
  'Logistics & Transport', 'Agriculture', 'Textiles', 'Other'
];

const BUSINESS_TYPES = [
  'Sole Proprietorship', 'Private Limited (Pvt Ltd)', 'Limited Liability Partnership (LLP)', 
  'Partnership Firm', 'One Person Company (OPC)', 'Public Limited', 'Freelancer / Self-Employed'
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh'
];

function InputField({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-secondary uppercase tracking-wider px-1 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-primary/60" />}
        {label}
      </label>
      <input 
        {...props}
        suppressHydrationWarning
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none",
          "focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all text-sm font-medium",
          "placeholder:text-white/20",
          props.readOnly && "opacity-60 cursor-not-allowed",
          props.className
        )}
      />
    </div>
  );
}

function SelectField({ label, icon: Icon, options, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-secondary uppercase tracking-wider px-1 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-primary/60" />}
        {label}
      </label>
      <select 
        {...props}
        suppressHydrationWarning
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none",
          "focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all text-sm font-medium",
          "appearance-none cursor-pointer",
          props.className
        )}
      >
        <option value="" className="bg-[#0f1729]">Select...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-[#0f1729]">{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-secondary uppercase tracking-wider px-1 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-primary/60" />}
        {label}
      </label>
      <textarea 
        {...props}
        suppressHydrationWarning
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none",
          "focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all text-sm font-medium",
          "placeholder:text-white/20 min-h-[120px] resize-none",
          props.className
        )}
      />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 mt-0.5">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-base">{title}</h3>
        {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatParentId, setNewCatParentId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Password change state
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Billing state
  const [subscription, setSubscription] = useState<any>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCategories();
    fetchProfile();
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const data = await getSubscriptionAction();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  }

  if (!mounted) return null;

  async function fetchProfile() {
    try {
      const data = await getProfile();
      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          companyName: data.companyName || '',
          phone: data.phone || '',
          role: data.role || '',
          industry: data.industry || '',
          businessType: data.businessType || '',
          companySize: data.companySize || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          financialYearStart: data.financialYearStart || 'april',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          city: data.city || '',
          state: data.state || '',
          pinCode: data.pinCode || '',
          country: data.country || 'India',
          aiContext: data.aiContext || '',
          aiTone: data.aiTone || 'CFO',
          targetRevenue: data.targetRevenue || 100000,
          maxExpenseRatio: data.maxExpenseRatio || 70,
          businessGoals: data.businessGoals || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    const result = await updateProfile(formData);
    if (result.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setPasswordStatus('Passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordStatus('Password must be at least 6 characters');
      return;
    }
    setPasswordStatus('Changing...');
    const result = await changePassword(passwordData.current, passwordData.new);
    if (result.success) {
      setPasswordStatus('Password changed successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } else {
      setPasswordStatus(result.error || 'Failed to change password');
    }
    setTimeout(() => setPasswordStatus(''), 4000);
  };

  async function fetchCategories() {
    const data = await getCategories();
    setCategories(data);
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const result = await createCategory(newCatName, newCatColor, newCatIcon, newCatParentId || undefined);
    if (result.success) {
      setNewCatName('');
      setNewCatIcon('Tag');
      setNewCatParentId('');
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (name === 'General') {
      alert('The "General" category cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${name}"? Transactions will be moved to "General".`)) return;
    
    setDeleteLoading(id);
    const result = await deleteCategory(id);
    setDeleteLoading(null);
    
    if (result.success) {
      fetchCategories();
    } else {
      alert(result.error || 'Failed to delete category');
    }
  };

  const handleExport = async () => {
    const csvData = await exportTransactionsToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biz_analytics_full_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'billing', name: 'Billing & Plan', icon: CreditCard },
    { id: 'categories', name: 'Categories', icon: Tag },
    { id: 'intelligence', name: 'AI Intelligence', icon: Sparkles },
    { id: 'api', name: 'AI API Key', icon: Key },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

  // Generate avatar initials
  const initials = String(formData.name || profile?.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-secondary mt-1">Configure your workspace and AI preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          {sections.map((section) => (
            <button 
              key={section.id} 
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group font-medium",
                activeSection === section.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white/5 text-secondary hover:text-white"
              )}
            >
              <section.icon size={20} className={activeSection === section.id ? "" : "group-hover:text-primary transition-colors"} />
              <span>{section.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeSection === 'profile' && (
            <>
              {/* Profile Header Card */}
              <GlassCard className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-primary/30">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0f1729] flex items-center justify-center">
                      <BadgeCheck size={12} className="text-white" />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{formData.name || profile?.email || 'Your Name'}</h2>
                    <p className="text-secondary text-sm mt-0.5">
                      {formData.role || 'Set your role'} {formData.companyName ? `at ${formData.companyName}` : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active Account
                      </span>
                      {memberSince && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/5 text-secondary border border-white/10 px-3 py-1 rounded-full">
                          <Calendar size={11} />
                          Member since {memberSince}
                        </span>
                      )}
                      {formData.industry && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                          <Briefcase size={11} />
                          {formData.industry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Personal Information */}
              <GlassCard className="p-8">
                <SectionHeader icon={User} title="Personal Information" subtitle="Your identity and contact details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField 
                    label="Full Name" icon={User}
                    type="text" placeholder="Satendra Singh"
                    value={formData.name || ''}
                    onChange={(e: any) => handleFieldChange('name', e.target.value)}
                  />
                  <InputField 
                    label="Email Address" icon={Mail}
                    type="email" value={profile?.email || ''}
                    readOnly
                  />
                  <InputField 
                    label="Phone Number" icon={Phone}
                    type="tel" placeholder="+91 98765 43210"
                    value={formData.phone || ''}
                    onChange={(e: any) => handleFieldChange('phone', e.target.value)}
                  />
                  <InputField 
                    label="Role / Designation" icon={Briefcase}
                    type="text" placeholder="Founder & CEO"
                    value={formData.role || ''}
                    onChange={(e: any) => handleFieldChange('role', e.target.value)}
                  />
                </div>
              </GlassCard>

              {/* Business Information */}
              <GlassCard className="p-8">
                <SectionHeader icon={Building2} title="Business Information" subtitle="Your company and registration details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField 
                    label="Company Name" icon={Building2}
                    type="text" placeholder="BizAnalytics Inc."
                    value={formData.companyName || ''}
                    onChange={(e: any) => handleFieldChange('companyName', e.target.value)}
                  />
                  <SelectField 
                    label="Industry" icon={Briefcase}
                    options={INDUSTRIES}
                    value={formData.industry || ''}
                    onChange={(e: any) => handleFieldChange('industry', e.target.value)}
                  />
                  <SelectField 
                    label="Business Type" icon={Building2}
                    options={BUSINESS_TYPES}
                    value={formData.businessType || ''}
                    onChange={(e: any) => handleFieldChange('businessType', e.target.value)}
                  />
                  <SelectField 
                    label="Company Size" icon={User}
                    options={COMPANY_SIZES}
                    value={formData.companySize || ''}
                    onChange={(e: any) => handleFieldChange('companySize', e.target.value)}
                  />
                  <InputField 
                    label="GST Number" icon={Building2}
                    type="text" placeholder="22AAAAA0000A1Z5"
                    value={formData.gstNumber || ''}
                    onChange={(e: any) => handleFieldChange('gstNumber', e.target.value)}
                  />
                  <InputField 
                    label="PAN Number" icon={Shield}
                    type="text" placeholder="ABCDE1234F"
                    value={formData.panNumber || ''}
                    onChange={(e: any) => handleFieldChange('panNumber', e.target.value)}
                  />
                  <SelectField 
                    label="Financial Year Start" icon={Calendar}
                    options={['April (India Standard)', 'January (Calendar Year)']}
                    value={formData.financialYearStart || ''}
                    onChange={(e: any) => handleFieldChange('financialYearStart', e.target.value)}
                  />
                </div>
              </GlassCard>

              {/* Business Address */}
              <GlassCard className="p-8">
                <SectionHeader icon={MapPin} title="Business Address" subtitle="Your registered office or primary location" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <InputField 
                      label="Address Line 1" icon={MapPin}
                      type="text" placeholder="123, Business Park Tower"
                      value={formData.addressLine1 || ''}
                      onChange={(e: any) => handleFieldChange('addressLine1', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <InputField 
                      label="Address Line 2"
                      type="text" placeholder="Sector 62, Near Metro Station"
                      value={formData.addressLine2 || ''}
                      onChange={(e: any) => handleFieldChange('addressLine2', e.target.value)}
                    />
                  </div>
                  <InputField 
                    label="City"
                    type="text" placeholder="Noida"
                    value={formData.city || ''}
                    onChange={(e: any) => handleFieldChange('city', e.target.value)}
                  />
                  <SelectField 
                    label="State"
                    options={INDIAN_STATES}
                    value={formData.state || ''}
                    onChange={(e: any) => handleFieldChange('state', e.target.value)}
                  />
                  <InputField 
                    label="PIN Code"
                    type="text" placeholder="201301"
                    value={formData.pinCode || ''}
                    onChange={(e: any) => handleFieldChange('pinCode', e.target.value)}
                  />
                  <InputField 
                    label="Country"
                    type="text" value={formData.country || 'India'}
                    onChange={(e: any) => handleFieldChange('country', e.target.value)}
                  />
                </div>
              </GlassCard>

              {/* Security */}
              <GlassCard className="p-8">
                <SectionHeader icon={Lock} title="Security & Password" subtitle="Manage your account credentials" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InputField 
                    label="Current Password" icon={Lock}
                    type={showPasswords ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwordData.current}
                    onChange={(e: any) => setPasswordData(p => ({ ...p, current: e.target.value }))}
                  />
                  <InputField 
                    label="New Password" icon={Lock}
                    type={showPasswords ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={passwordData.new}
                    onChange={(e: any) => setPasswordData(p => ({ ...p, new: e.target.value }))}
                  />
                  <InputField 
                    label="Confirm New Password" icon={Lock}
                    type={showPasswords ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={passwordData.confirm}
                    onChange={(e: any) => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="text-xs text-secondary hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showPasswords ? 'Hide' : 'Show'} passwords
                    </button>
                    {passwordStatus && (
                      <span className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-full",
                        passwordStatus.includes('success') ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {passwordStatus}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={handleChangePassword}
                    disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Shield size={16} />
                    Change Password
                  </button>
                </div>
              </GlassCard>

              {/* Danger Zone */}
              <GlassCard className="p-8 border-red-500/20">
                <SectionHeader icon={AlertTriangle} title="Danger Zone" subtitle="Irreversible actions — proceed with caution" />
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-red-400">Delete Account</h4>
                    <p className="text-xs text-secondary mt-0.5">Permanently delete your account and all associated data</p>
                  </div>
                  <button className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
                    <Trash2 size={14} />
                    Delete Account
                  </button>
                </div>
              </GlassCard>
            </>
          )}

          {activeSection === 'billing' && (
            <div className="space-y-6">
              {/* Current Plan Card */}
              <GlassCard className="p-8">
                <SectionHeader icon={CreditCard} title="Your Current Plan" subtitle="Manage your subscription and features" />
                
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* FREE Plan */}
                  <div className={cn(
                    "flex-1 p-6 rounded-2xl border-2 transition-all",
                    subscription?.plan !== 'ADVANCED'
                      ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                      : "border-white/10 bg-white/[0.02] opacity-60"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Basic</h4>
                      {subscription?.plan !== 'ADVANCED' && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black">Free</p>
                    <p className="text-xs text-secondary mt-1">Forever</p>
                    <ul className="mt-4 space-y-2 text-sm text-secondary">
                      <li className="flex items-center gap-2">✅ Dashboard & Transactions</li>
                      <li className="flex items-center gap-2">✅ Invoice Generator</li>
                      <li className="flex items-center gap-2">✅ Recurring Transactions</li>
                      <li className="flex items-center gap-2">✅ Basic Analytics & AI Chat</li>
                      <li className="flex items-center gap-2">❌ Budget Planner</li>
                      <li className="flex items-center gap-2">❌ P&L Statement & GST Report</li>
                      <li className="flex items-center gap-2">❌ Executive & CFO Report</li>
                    </ul>
                  </div>

                  {/* ADVANCED Plan */}
                  <div className={cn(
                    "flex-1 p-6 rounded-2xl border-2 transition-all",
                    subscription?.plan === 'ADVANCED'
                      ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                      : "border-white/10 bg-white/[0.02] opacity-60"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Advanced</h4>
                      {subscription?.plan === 'ADVANCED' && (
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black">$19.99<span className="text-sm font-normal text-secondary">/mo</span></p>
                    <p className="text-xs text-secondary mt-1">Billed monthly</p>
                    <ul className="mt-4 space-y-2 text-sm text-secondary">
                      <li className="flex items-center gap-2">✅ Everything in Basic</li>
                      <li className="flex items-center gap-2">✅ Budget Planner</li>
                      <li className="flex items-center gap-2">✅ P&L Statement</li>
                      <li className="flex items-center gap-2">✅ GST Report</li>
                      <li className="flex items-center gap-2">✅ Executive & CFO Report</li>
                      <li className="flex items-center gap-2">✅ AI Forecasting & OCR</li>
                    </ul>
                  </div>
                </div>

                {subscription?.plan === 'ADVANCED' && subscription?.currentPeriodEnd && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-sm text-secondary flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" />
                    Your subscription renews on <strong className="text-white">{new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </div>
                )}
              </GlassCard>

              {/* Action Buttons */}
              <GlassCard className="p-8">
                <SectionHeader icon={Sparkles} title="Manage Plan" subtitle="Upgrade, downgrade, or test your subscription" />
                
                <div className="space-y-4">
                  {subscription?.plan === 'ADVANCED' ? (
                    <>
                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-4">
                        <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
                        <div>
                          <p className="font-bold text-emerald-400">You're on the Advanced Plan</p>
                          <p className="text-xs text-secondary mt-1">You have access to all premium features including CFO Report and Executive Report.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={async () => {
                            setPortalLoading(true);
                            const result = await (await import('@/actions/stripe')).togglePlan();
                            if (result.success) {
                              setSubscription({ ...subscription, plan: result.plan, isPro: result.plan === 'ADVANCED' });
                              window.location.reload();
                            }
                            setPortalLoading(false);
                          }}
                          disabled={portalLoading}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 text-sm"
                        >
                          {portalLoading ? 'Processing...' : 'Downgrade to Basic'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-center gap-4">
                        <Lock className="text-amber-400 shrink-0" size={24} />
                        <div>
                          <p className="font-bold text-amber-400">You're on the Basic Plan</p>
                          <p className="text-xs text-secondary mt-1">Upgrade to Advanced to unlock CFO Report, Executive Report, and Predictive Forecasting.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <a
                          href="/pricing"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20 text-sm"
                        >
                          <Sparkles size={16} />
                          Upgrade to Advanced — $19.99/mo
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {activeSection === 'categories' && (
            <div className="space-y-8">
              <GlassCard className="p-8">
                <div className="flex items-center gap-2 mb-8 text-xs font-bold text-primary uppercase tracking-[0.2em]">
                  <Plus size={14} />
                  <span>Create New Category</span>
                </div>
                <form onSubmit={handleCreateCategory} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="Category name (e.g. Marketing)" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium" 
                    />
                    

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4">
                      <input 
                        type="color" 
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="w-8 h-8 rounded-full border-none bg-transparent cursor-pointer" 
                      />
                      <span className="text-xs font-bold text-secondary uppercase whitespace-nowrap">Pick Color</span>
                    </div>
                    <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                      <Plus size={18} />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Select Icon</label>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {CATEGORY_ICONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewCatIcon(iconName)}
                          className={cn(
                            "p-3 rounded-xl border transition-all flex items-center justify-center hover:bg-white/5",
                            newCatIcon === iconName 
                              ? "bg-primary/20 border-primary text-primary" 
                              : "bg-white/5 border-white/10 text-secondary"
                          )}
                        >
                          <DynamicIcon name={iconName} size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </GlassCard>

              <GlassCard className="p-8">
                <div className="flex items-center gap-2 mb-8 text-xs font-bold text-primary uppercase tracking-[0.2em]">
                  <Tag size={14} />
                  <span>Active Categories</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center" 
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          <DynamicIcon name={cat.icon || 'Tag'} size={18} style={{ color: cat.color }} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{cat.name}</span>
                          {cat.parent && (
                            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                              Sub-category of {cat.parent.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        disabled={deleteLoading === cat.id}
                        className={cn(
                          "p-2 text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all",
                          deleteLoading === cat.id && "animate-pulse"
                        )}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full py-12 text-center text-secondary border border-dashed border-white/10 rounded-2xl">
                      No categories found. Create your first one above.
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {activeSection === 'intelligence' && (
            <>
              <GlassCard className="p-8">
                <SectionHeader 
                  icon={Sparkles} 
                  title="AI Knowledge Base" 
                  subtitle="Train the AI on your specific business model and challenges" 
                />
                <div className="space-y-6">
                  <TextareaField 
                    label="Business Context & Goals" 
                    icon={Target}
                    placeholder="Describe your business model, key clients, and current challenges. (e.g., 'We are a SaaS startup in India. Our goal is to reach ₹50L ARR by end of year. Our main challenge is high AWS costs.')"
                    value={formData.aiContext || ''}
                    onChange={(e: any) => handleFieldChange('aiContext', e.target.value)}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SelectField 
                      label="AI Personality" icon={Sparkles}
                      options={['CFO (Professional & Analytical)', 'Advisor (Strategic & Supportive)', 'Friendly (Direct & Simple)', 'Aggressive (Cost-Cutter Mode)']}
                      value={formData.aiTone || 'CFO'}
                      onChange={(e: any) => handleFieldChange('aiTone', e.target.value)}
                    />
                    <InputField 
                      label="Custom Business Goals" icon={CheckCircle2}
                      type="text" placeholder="e.g. Reach ₹10L profit, Reduce CAC by 20%"
                      value={formData.businessGoals || ''}
                      onChange={(e: any) => handleFieldChange('businessGoals', e.target.value)}
                    />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8">
                <SectionHeader 
                  icon={TrendingUp} 
                  title="Financial Benchmarks" 
                  subtitle="Set targets for the AI to measure your performance against" 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField 
                    label="Target Monthly Revenue (₹)" icon={Target}
                    type="number" 
                    value={formData.targetRevenue || ''}
                    onChange={(e: any) => handleFieldChange('targetRevenue', e.target.value)}
                  />
                  <InputField 
                    label="Max Healthy Expense Ratio (%)" icon={AlertTriangle}
                    type="number" 
                    value={formData.maxExpenseRatio || ''}
                    onChange={(e: any) => handleFieldChange('maxExpenseRatio', e.target.value)}
                  />
                </div>
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-secondary leading-relaxed">
                    <span className="font-bold text-primary mr-1">Note:</span>
                    The AI uses these benchmarks to flag anomalies. For example, if your expense ratio exceeds {formData.maxExpenseRatio || 70}%, the AI will mark it as a "Critical" anomaly in your reports.
                  </p>
                </div>
              </GlassCard>
            </>
          )}

          {activeSection === 'api' && (
            <GlassCard className="p-8">
              <div className="flex items-center gap-2 mb-8 text-xs font-bold text-primary uppercase tracking-[0.2em]">
                <Key size={14} />
                <span>AI & LLM Settings</span>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary px-1">Google Gemini API Key</label>
                  <div className="relative">
                    <input 
                      type={showApiKey ? "text" : "password"}
                      defaultValue="sk-ant-gtwy-mock-key-12345"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium pr-12"
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors">
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {activeSection === 'data' && (
            <GlassCard className="p-8">
              <div className="flex items-center gap-2 mb-8 text-xs font-bold text-primary uppercase tracking-[0.2em]">
                <Database size={14} />
                <span>Data Management</span>
              </div>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">Backup Your Analytics</h4>
                    <p className="text-sm text-secondary">Download all transactions and categories as a CSV file.</p>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
                  >
                    <Download size={18} />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">Populate Sample Data</h4>
                    <p className="text-sm text-secondary">Instantly fill your dashboard with 12 months of realistic data.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      setIsSaving(true);
                      const result = await injectSampleDataAction();
                      setIsSaving(false);
                      if (result.success) {
                        alert('Sample data injected! Check your dashboard.');
                      }
                    }}
                    className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl font-bold hover:bg-primary/20 transition-all text-sm"
                  >
                    <Sparkles size={18} />
                    <span>Generate Data</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Save Button */}
          {(activeSection === 'profile' || activeSection === 'intelligence' || activeSection === 'api' || activeSection === 'data') && (
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSaveProfile}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold shadow-lg transition-all",
                  saveStatus === 'saved' 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : saveStatus === 'error'
                    ? "bg-red-500 text-white shadow-red-500/20"
                    : "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {saveStatus === 'saving' && <Save size={18} className="animate-spin" />}
                {saveStatus === 'saved' && <CheckCircle2 size={18} />}
                {saveStatus === 'error' && <AlertTriangle size={18} />}
                {saveStatus === 'idle' && <Save size={18} />}
                <span>
                  {saveStatus === 'saving' ? 'Saving...' : 
                   saveStatus === 'saved' ? 'Saved!' : 
                   saveStatus === 'error' ? 'Failed' : 
                   'Save Changes'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

