'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { 
  Send, 
  PlusCircle, 
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Brain,
  TrendingUp,
  Wallet,
  PieChart,
  BarChart3,
  Copy,
  Check,
  ArrowDown,
  Zap,
  Shield,
  Clock,
  Hash,
  Maximize2,
  Minimize2,
  Search,
  Lightbulb,
  Target,
  Receipt,
  Calculator,
  History,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DefaultChatTransport } from 'ai';
import { getConversations, getChatMessages, createConversation, deleteConversation } from '@/lib/actions';

// ─── Thinking Status Messages ───
const thinkingPhrases = [
  { text: 'Querying your database...', icon: Search },
  { text: 'Crunching the numbers...', icon: Calculator },
  { text: 'Analyzing financial patterns...', icon: TrendingUp },
  { text: 'Cross-referencing transactions...', icon: Hash },
  { text: 'Generating insights...', icon: Lightbulb },
  { text: 'Building your report...', icon: BarChart3 },
];

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="animate-spin text-primary" size={48} />
            <Brain size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest">Initializing BI Engine...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

// ─── Enhanced Markdown Renderer ───
function FormatMessage({ text }: { text: string }) {
  if (!text) return null;
  
  const lines = text.split('\n');
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeader: string[] = [];
  const elements: React.ReactNode[] = [];
  
  const formatInline = (line: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g);
    return parts.map((part, j) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={j} className="italic text-foreground/80">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={j} className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-mono font-semibold">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('[')) {
        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          return <a key={j} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">{match[1]}</a>;
        }
      }
      return <span key={j}>{part}</span>;
    }).filter(Boolean);
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-3 rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {tableHeader.length > 0 && (
                <thead>
                  <tr className="bg-foreground/[0.04]">
                    {tableHeader.map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left font-bold text-foreground/80 border-b border-border/50 whitespace-nowrap">{h.trim()}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-foreground/[0.02] transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-secondary whitespace-nowrap">{formatInline(cell.trim())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      tableRows = [];
      tableHeader = [];
    }
    inTable = false;
  };

  lines.forEach((line, i) => {
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      if (cells.every(c => /^[\s:-]+$/.test(c))) return;
      if (!inTable) { inTable = true; tableHeader = cells; } else { tableRows.push(cells); }
      return;
    } else if (inTable) { flushTable(); }

    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-3 border-border/30" />); return;
    }
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="font-bold text-sm text-foreground mt-3 mb-1 flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-accent" />{formatInline(line.slice(4))}</h4>); return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="font-bold text-base text-foreground mt-3 mb-1.5 flex items-center gap-2"><div className="w-1.5 h-5 rounded-full bg-primary" />{formatInline(line.slice(3))}</h3>); return;
    }
    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="font-extrabold text-lg text-foreground mt-3 mb-2 gradient-text">{formatInline(line.slice(2))}</h2>); return;
    }
    if (line.startsWith('> ')) {
      elements.push(<div key={i} className="border-l-2 border-primary/40 pl-3 py-1 text-secondary italic bg-primary/[0.03] rounded-r-lg">{formatInline(line.slice(2))}</div>); return;
    }
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<div key={i} className="flex items-start gap-2.5 pl-1"><span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-[7px] shrink-0 ring-2 ring-primary/10" /><span className="leading-relaxed">{formatInline(line.slice(2))}</span></div>); return;
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(<div key={i} className="flex items-start gap-2.5 pl-1"><span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{num}</span><span className="leading-relaxed">{formatInline(content)}</span></div>); return;
    }
    if (line.match(/^[📊💰📈💵🔮🏛️👥🤖✅⚠️🟢🟡🔴💡🔥⭐🎯📋🚀💎✂️]/)) {
      elements.push(<p key={i} className="font-semibold text-foreground pt-1.5">{formatInline(line)}</p>); return;
    }
    if (line.startsWith('💡')) {
      elements.push(<div key={i} className="mt-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 flex items-start gap-2.5"><Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" /><span className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">{formatInline(line.slice(2))}</span></div>); return;
    }
    if (line.trim() === '') { elements.push(<div key={i} className="h-1.5" />); return; }
    elements.push(<p key={i} className="leading-relaxed">{formatInline(line)}</p>);
  });
  if (inTable) flushTable();
  return <div className="space-y-1.5">{elements}</div>;
}

// ─── Dynamic Thinking Indicator ───
function ThinkingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setPhraseIndex(p => (p + 1) % thinkingPhrases.length), 2200);
    return () => clearInterval(interval);
  }, []);
  const phrase = thinkingPhrases[phraseIndex];
  const Icon = phrase.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Brain size={16} className="text-white" /></motion.div>
      </div>
      <div className="bg-foreground/[0.03] border border-border/50 px-5 py-4 rounded-2xl rounded-tl-md min-w-[220px]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 0.9, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-primary" />
            <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 0.9, repeat: Infinity, delay: 0.15 }} className="w-2 h-2 rounded-full bg-primary/80" />
            <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 0.9, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 rounded-full bg-primary/60" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={phraseIndex} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className="flex items-center gap-1.5">
              <Icon size={11} className="text-primary" />
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">{phrase.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Scroll-to-Bottom FAB ───
function ScrollToBottom({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }} onClick={onClick}
          className="absolute bottom-24 right-6 z-30 w-9 h-9 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors">
          <ArrowDown size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Follow-up Chip Suggestions ───
function FollowUpChips({ messageText, onSelect, disabled }: { messageText: string; onSelect: (text: string) => void; disabled: boolean }) {
  const msg = messageText.toLowerCase();
  let chips: { text: string; icon: React.ElementType }[] = [];
  if (msg.includes('revenue') || msg.includes('sales')) {
    chips = [{ text: "What's my profit margin?", icon: Target }, { text: "Show expense breakdown", icon: PieChart }, { text: "Forecast next 3 months", icon: TrendingUp }];
  } else if (msg.includes('expense') || msg.includes('cost') || msg.includes('breakdown')) {
    chips = [{ text: "Where can I cut costs?", icon: Target }, { text: "Show my tax estimate", icon: Calculator }, { text: "Compare to last month", icon: BarChart3 }];
  } else if (msg.includes('profit') || msg.includes('margin')) {
    chips = [{ text: "Can I afford to hire?", icon: Wallet }, { text: "Cash flow forecast", icon: TrendingUp }, { text: "Top revenue sources", icon: BarChart3 }];
  } else if (msg.includes('tax') || msg.includes('gst')) {
    chips = [{ text: "Show deductible expenses", icon: Receipt }, { text: "Quarterly tax timeline", icon: Clock }, { text: "Optimize my tax strategy", icon: Lightbulb }];
  } else if (msg.includes('forecast') || msg.includes('predict')) {
    chips = [{ text: "Revenue growth rate", icon: TrendingUp }, { text: "What risks should I watch?", icon: Shield }, { text: "Can I expand operations?", icon: Zap }];
  } else {
    chips = [{ text: "Show revenue overview", icon: TrendingUp }, { text: "Expense breakdown", icon: PieChart }, { text: "What's my forecast?", icon: Target }];
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }} className="flex flex-wrap gap-1.5 mt-2.5">
      {chips.map((chip, i) => (
        <motion.button key={chip.text} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.08 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => onSelect(chip.text)} disabled={disabled}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/40 bg-card/60 text-[10px] font-semibold text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-40">
          <chip.icon size={10} />{chip.text}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── History Sidebar ───
function HistorySidebar({ conversations, activeId, onSelect, onNew, onDelete, isOpen, onClose }: {
  conversations: any[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
          className="h-full border-r border-border/50 bg-card/40 backdrop-blur-md flex flex-col overflow-hidden shrink-0 z-20"
        >
          {/* Sidebar Header */}
          <div className="px-4 py-3.5 border-b border-border/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <History size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">Chat History</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onNew} className="p-1.5 hover:bg-foreground/5 rounded-lg text-secondary hover:text-primary transition-all" title="New Chat">
                <PlusCircle size={14} />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-foreground/5 rounded-lg text-secondary hover:text-foreground transition-all lg:hidden" title="Close">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-border/30 flex items-center justify-center mb-3">
                  <MessageSquare size={20} className="text-secondary/40" />
                </div>
                <p className="text-xs font-semibold text-secondary/50 mb-1">No conversations yet</p>
                <p className="text-[10px] text-secondary/35 leading-tight">Start a new chat to see your history here</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "group relative rounded-xl px-3 py-2.5 cursor-pointer transition-all",
                    activeId === conv.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-foreground/[0.03] border border-transparent"
                  )}
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-xs font-semibold truncate",
                        activeId === conv.id ? "text-primary" : "text-foreground/70"
                      )}>
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] text-secondary/40 font-medium">
                          {formatDate(conv.updatedAt)}
                        </span>
                        {conv._count?.messages > 0 && (
                          <>
                            <span className="text-secondary/20">·</span>
                            <span className="text-[9px] text-secondary/40 font-medium">
                              {conv._count.messages} msgs
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-secondary/40 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                      title="Delete conversation"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="px-4 py-3 border-t border-border/50 shrink-0">
            <button
              onClick={onNew}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
            >
              <PlusCircle size={14} />
              <span>New Conversation</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Chat Content ───
function ChatContent() {
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const [hasStartedInitial, setHasStartedInitial] = useState(false);

  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant' as const,
    parts: [{ type: 'text' as const, text: "Hello! I'm your **BI Assistant** — your personal CFO powered by AI. I've connected to your live business data and I'm ready to help.\n\n## What I can do:\n\n📊 **Revenue & Profit Analysis** — Deep-dive into your financial metrics\n💰 **Expense Optimization** — Find where you're overspending\n🔮 **Cash Flow Forecasting** — Predict your next 3 months\n🏛️ **Tax Estimation** — Smart tax planning for India\n👥 **Hiring Capacity** — Can you afford to grow your team?\n\n> All answers are powered by your **live transaction data**. Ask me anything!" }],
  };

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: activeConversationId ? { conversationId: activeConversationId } : undefined,
    }),
    messages: [welcomeMessage]
  }) as any;

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch {
      // User might not be logged in
    }
  };

  // Auto-create conversation on first user message
  const ensureConversation = async () => {
    if (!activeConversationId) {
      try {
        const result = await createConversation();
        if (result.success && result.conversation) {
          setActiveConversationId(result.conversation.id);
          return result.conversation.id;
        }
      } catch {
        console.error('Failed to create conversation');
      }
    }
    return activeConversationId;
  };

  // Load existing conversation messages
  const loadConversation = async (convId: string) => {
    setLoadingHistory(true);
    try {
      const msgs = await getChatMessages(convId);
      setActiveConversationId(convId);
      
      if (msgs.length > 0) {
        // Convert DB messages to UI format
        const uiMessages = msgs.map((m: any) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: 'text', text: m.content }],
        }));
        setMessages([welcomeMessage, ...uiMessages]);
      } else {
        setMessages([welcomeMessage]);
      }
    } catch {
      console.error('Failed to load conversation');
    }
    setLoadingHistory(false);
  };

  // Handle starting a new chat
  const handleNewChat = async () => {
    setActiveConversationId(null);
    setMessages([welcomeMessage]);
    inputRef.current?.focus();
  };

  // Handle deleting a conversation
  const handleDeleteConversation = async (convId: string) => {
    const result = await deleteConversation(convId);
    if (result.success) {
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        handleNewChat();
      }
    }
  };

  // Handle auto-starting a query from URL
  useEffect(() => {
    if (initialQuery && !hasStartedInitial && sendMessage && status === 'idle') {
      setHasStartedInitial(true);
      sendMessage({ text: initialQuery });
    }
  }, [initialQuery, hasStartedInitial, sendMessage, status]);

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    setMessageCount(messages.filter((m: any) => m.role === 'user').length);
  }, [messages]);

  // Smart auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
    }
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault(); inputRef.current?.focus();
      }
      if (e.key === 'Escape') inputRef.current?.blur();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleManualSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const textToSend = inputValue;
      setInputValue('');
      
      // Ensure a conversation exists before sending
      const convId = await ensureConversation();
      
      try {
        await sendMessage({ text: textToSend });
        // Refresh conversations list after sending
        setTimeout(() => loadConversations(), 1500);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const handleSuggestionClick = async (text: string) => {
    if (!isLoading) {
      await ensureConversation();
      sendMessage({ text });
      setTimeout(() => loadConversations(), 1500);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = () => {
    const chatText = messages
      .filter((m: any) => m.id !== 'welcome')
      .map((m: any) => {
        const text = m.parts ? m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') : m.content || '';
        const role = m.role === 'user' ? '👤 You' : '🤖 BI Assistant';
        return `${role}:\n${text}`;
      })
      .join('\n\n---\n\n');
    
    if (!chatText.trim()) { alert('No messages to export yet!'); return; }
    
    const header = `BizAnalytics — Chat Export\nDate: ${new Date().toLocaleString('en-IN')}\nQueries: ${messageCount}\n${'='.repeat(50)}\n\n`;
    const blob = new Blob([header + chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bizanalytics-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMessageTime = (idx: number) => {
    const now = new Date();
    const mins = Math.max(0, (messages.length - 1 - idx) * 2);
    const d = new Date(now.getTime() - mins * 60000);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const suggestions = [
    { text: "Show my revenue overview", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10", desc: "Total income & trends" },
    { text: "What's my expense breakdown?", icon: PieChart, color: "text-violet-500 bg-violet-500/10", desc: "Category-wise costs" },
    { text: "Show monthly performance", icon: BarChart3, color: "text-emerald-500 bg-emerald-500/10", desc: "Month-over-month" },
    { text: "Can I afford to hire at ₹50k?", icon: Wallet, color: "text-amber-500 bg-amber-500/10", desc: "Budget capacity" },
    { text: "What's my tax estimate?", icon: Calculator, color: "text-rose-500 bg-rose-500/10", desc: "India tax planning" },
    { text: "Forecast next 3 months", icon: Target, color: "text-cyan-500 bg-cyan-500/10", desc: "AI-powered projection" },
  ];

  return (
    <div className={cn(
      "flex relative bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500",
      isFullscreen ? "fixed inset-4 z-50 rounded-3xl" : "h-[85vh]"
    )}>
      {/* History Sidebar */}
      <HistorySidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={loadConversation}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ scale: isLoading ? [1, 1.3, 1] : 1, opacity: isLoading ? [0.02, 0.12, 0.02] : 0.03 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/30 blur-[120px]"
          />
          <motion.div 
            animate={{ scale: isLoading ? [1.2, 1, 1.2] : 1, opacity: isLoading ? [0.02, 0.1, 0.02] : 0.03 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[100px]"
          />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border/50 bg-card/60 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadConversations(); }}
              className={cn(
                "p-2 rounded-lg transition-all",
                showHistory ? "bg-primary/10 text-primary" : "hover:bg-foreground/5 text-secondary hover:text-foreground"
              )}
              title="Toggle chat history"
            >
              {showHistory ? <ChevronLeft size={16} /> : <History size={16} />}
            </button>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20"
            >
              <Brain size={20} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm tracking-tight">BI Assistant</h2>
                {messageCount > 0 && (
                  <span className="text-[9px] font-bold text-secondary bg-foreground/5 px-1.5 py-0.5 rounded-md">
                    {messageCount} {messageCount === 1 ? 'query' : 'queries'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  {isLoading
                    ? <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    : <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                  <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", isLoading ? "bg-primary" : "bg-emerald-500")} />
                </span>
                <p className="text-[10px] text-secondary uppercase tracking-[0.12em] font-semibold">
                  {isLoading ? 'Processing query...' : 'Online • Connected to your data'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={handleExportChat} suppressHydrationWarning
              className="p-2 hover:bg-foreground/5 rounded-lg text-secondary hover:text-foreground transition-all" title="Export chat as text">
              <Download size={14} />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} suppressHydrationWarning
              className="p-2 hover:bg-foreground/5 rounded-lg text-secondary hover:text-foreground transition-all" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button onClick={handleNewChat} suppressHydrationWarning
              className="p-2 hover:bg-foreground/5 rounded-lg text-secondary hover:text-foreground transition-all" title="New Chat">
              <PlusCircle size={14} />
            </button>
          </div>
        </div>

        {/* Loading history overlay */}
        {loadingHistory && (
          <div className="absolute inset-0 bg-card/60 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Loading conversation...</p>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div ref={scrollRef} onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-smooth z-10 custom-scrollbar">
          <AnimatePresence initial={false}>
            {(messages || []).map((m: any, idx: number) => {
              const messageText = m.parts 
                ? m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') 
                : m.content || '';
              const isLastAssistant = m.role === 'assistant' && idx === messages.length - 1 && !isLoading && status === 'idle' && m.id !== 'welcome';
              return (
                <motion.div key={m.id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                  className={cn("flex gap-3 group", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm",
                    m.role === 'user' ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" : "bg-gradient-to-br from-primary to-accent text-white shadow-primary/10")}>
                    {m.role === 'user' ? <User size={14} /> : <Brain size={14} />}
                  </div>
                  <div className="flex flex-col max-w-[80%] md:max-w-[72%]">
                    <div className={cn("flex items-center gap-2 mb-1 px-1", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-wider">{m.role === 'user' ? 'You' : 'BI Assistant'}</span>
                      <span className="text-[9px] text-secondary/40 font-medium">{getMessageTime(idx)}</span>
                    </div>
                    <div className={cn("relative transition-all",
                      m.role === 'user' ? "bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg shadow-primary/10" 
                        : "bg-foreground/[0.025] border border-border/40 rounded-2xl rounded-tl-sm px-5 py-4 hover:border-border/60 transition-colors")}>
                      <div className={cn("text-sm leading-relaxed", m.role === 'assistant' && "text-foreground/85")}>
                        {m.role === 'assistant' ? <FormatMessage text={messageText} /> : <span className="font-medium">{messageText}</span>}
                      </div>
                      {m.role === 'assistant' && m.id !== 'welcome' && messageText && (
                        <div className="mt-3 pt-2.5 border-t border-border/20 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[9px] text-secondary/50">
                            <Sparkles size={9} className="text-primary/60" />
                            <span className="uppercase tracking-wider font-semibold">Live data analysis</span>
                            <span className="text-secondary/30">•</span>
                            <span>{messageText.split(/\s+/).length} words</span>
                          </div>
                          <button onClick={() => handleCopy(messageText, m.id)}
                            className="p-1 rounded hover:bg-foreground/5 text-secondary/50 hover:text-foreground transition-all" title="Copy response">
                            {copiedId === m.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>
                      )}
                    </div>
                    {isLastAssistant && <FollowUpChips messageText={messageText} onSelect={handleSuggestionClick} disabled={isLoading} />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {isLoading && <ThinkingIndicator />}

          {/* Initial Suggestions */}
          <AnimatePresence>
            {messages.length === 1 && !isLoading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="pt-2 max-w-2xl mx-auto z-20">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Zap size={12} className="text-primary" />
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Quick Start</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {suggestions.map((s, i) => (
                    <motion.button key={s.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => handleSuggestionClick(s.text)}
                      className="p-3 rounded-xl border border-border/40 bg-card/50 text-left flex items-start gap-3 group hover:border-primary/30 hover:bg-primary/[0.04] transition-all">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", s.color)}><s.icon size={15} /></div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors block leading-tight">{s.text}</span>
                        <span className="text-[10px] text-secondary/50 mt-0.5 block">{s.desc}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm flex items-center gap-3 mx-auto max-w-lg">
              <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0"><AlertCircle size={16} /></div>
              <div className="flex-1">
                <p className="font-bold text-xs uppercase tracking-wider mb-0.5">Connection Error</p>
                <p className="text-[11px] opacity-80 leading-tight">{error.message || 'Please check your API configuration.'}</p>
              </div>
            </motion.div>
          )}
        </div>

        <ScrollToBottom show={showScrollBtn} onClick={scrollToBottom} />

        {/* Input Bar */}
        <div className="p-4 bg-card/60 border-t border-border/50 backdrop-blur-xl z-10">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading} suppressHydrationWarning placeholder="Ask about revenue, expenses, forecasts, tax..."
                className="w-full bg-foreground/[0.03] border border-border/50 rounded-xl py-3 px-4 pr-12 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-secondary/35 placeholder:text-sm transition-all focus:bg-foreground/[0.05] text-sm font-medium" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {!inputValue && <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-foreground/5 text-[9px] font-mono text-secondary/40 border border-border/30">/</kbd>}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
              disabled={isLoading || !inputValue?.trim()}
              className="w-11 h-11 bg-gradient-to-br from-primary to-accent text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
            </motion.button>
          </form>
          <div className="flex items-center justify-between mt-2.5 px-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[9px] text-secondary/30 font-semibold uppercase tracking-wider">
                <Shield size={8} /><span>End-to-end secure</span>
              </div>
              <div className="w-px h-2.5 bg-border/30" />
              <div className="flex items-center gap-1 text-[9px] text-secondary/30 font-semibold uppercase tracking-wider">
                <Zap size={8} /><span>Powered by Gemini</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[9px] text-secondary/30">
              <kbd className="px-1 py-0.5 rounded bg-foreground/5 text-[8px] font-mono border border-border/20">Esc</kbd>
              <span className="font-medium">to unfocus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
