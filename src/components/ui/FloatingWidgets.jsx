import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, MessageCircle, Send, ChevronRight } from 'lucide-react';
import { useCartDrawer } from '../../hooks/useCartDrawer';
import { SHOP_CONFIG } from '../../utils/config';
import { useLanguage } from '../../contexts/LanguageContext';

const WA_URL    = SHOP_CONFIG.wa_url;

// ─── Chatbot FAQ data (functions that receive t) ───────────────────────────────

const getQuickTopics = (t) => [
  { id: 'decant',      emoji: '🧪', label: t('chatDecant') },
  { id: 'livraison',   emoji: '📦', label: t('chatLivraison') },
  { id: 'paiement',    emoji: '💵', label: t('chatPaiement') },
  { id: 'commande',    emoji: '🛒', label: t('chatCommande') },
  { id: 'authentique', emoji: '✅', label: t('chatAuthentique') },
  { id: 'retour',      emoji: '🔄', label: t('chatRetour') },
  { id: 'contact',     emoji: '📞', label: t('chatContact') },
];

const getBotAnswers = (t) => ({
  decant:      t('chatRepDecant'),
  livraison:   t('chatRepLivraison'),
  paiement:    t('chatRepPaiement'),
  commande:    t('chatRepCommande'),
  authentique: t('chatRepAuthentique'),
  retour:      t('chatRepRetour'),
  contact:     t('chatRepContact'),
});

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function Bubble({ msg }) {
  const isBot = msg.from === 'bot';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}>
      <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isBot
          ? 'bg-cream-deep text-ink rounded-tl-sm'
          : 'bg-ink text-cream rounded-tr-sm'
      }`}>
        {msg.text}
      </div>
    </div>
  );
}

// ─── Chatbot widget ───────────────────────────────────────────────────────────

function Chatbot({ onClose, t }) {
  const quickTopics = getQuickTopics(t);
  const botAnswers  = getBotAnswers(t);

  const [messages, setMessages] = useState([{ from: 'bot', text: t('chatBienvenue') }]);
  const [input, setInput]       = useState('');
  const [showTopics, setShowTopics] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pushBot = (text) => {
    setMessages((m) => [...m, { from: 'bot', text }]);
  };

  const handleTopic = (topic) => {
    setShowTopics(false);
    setMessages((m) => [...m, { from: 'user', text: quickTopics.find((tp) => tp.id === topic)?.label ?? '' }]);
    setTimeout(() => {
      pushBot(botAnswers[topic]);
      setTimeout(() => setShowTopics(true), 400);
    }, 300);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setShowTopics(false);
    setMessages((m) => [...m, { from: 'user', text }]);

    const lower = text.toLowerCase();
    const match = Object.keys(botAnswers).find((k) =>
      lower.includes(k) ||
      (k === 'decant' && (lower.includes('décant') || lower.includes('ml') || lower.includes('عينة'))) ||
      (k === 'livraison' && (lower.includes('livr') || lower.includes('توصيل'))) ||
      (k === 'paiement' && (lower.includes('pay') || lower.includes('cash') || lower.includes('دفع'))) ||
      (k === 'commande' && (lower.includes('command') || lower.includes('طلب'))) ||
      (k === 'retour' && (lower.includes('retour') || lower.includes('إرجاع'))) ||
      (k === 'contact' && (lower.includes('contact') || lower.includes('whatsapp') || lower.includes('واتساب')))
    );

    setTimeout(() => {
      if (match) {
        pushBot(botAnswers[match]);
      } else {
        pushBot(`${t('chatIncompris')} +${SHOP_CONFIG.wa_number}`);
      }
      setTimeout(() => setShowTopics(true), 400);
    }, 400);
  };

  return (
    <div className="flex flex-col bg-cream rounded-2xl shadow-2xl shadow-ink/10 border border-ink/10 overflow-hidden"
         style={{ width: 'min(340px, calc(100vw - 2.5rem))', height: 'min(480px, calc(100dvh - 220px))' }}>

      {/* Header */}
      <div className="bg-ink px-4 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-base">🌸</div>
          <div>
            <p className="text-sm font-semibold text-cream leading-none">Chello</p>
            <p className="text-[11px] text-cream/60 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {t('chatEnLigne')}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

        {/* Quick topics */}
        {showTopics && (
          <div className="pt-2 flex flex-wrap gap-2">
            {quickTopics.map((tp) => (
              <button
                key={tp.id}
                onClick={() => handleTopic(tp.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-deep hover:bg-gold/10 border border-ink/10 hover:border-gold/30 text-xs text-ink rounded-full transition-all"
              >
                <span>{tp.emoji}</span>{tp.label}
              </button>
            ))}
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="pt-3">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">💬</span>
              {t('chatWA')}
            </span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-ink/10 flex-shrink-0">
        <div className="flex items-center gap-2 bg-cream-deep rounded-xl px-3 py-2 border border-ink/10 focus-within:border-gold/40 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chatEcrire')}
            className="flex-1 bg-transparent text-sm text-ink placeholder-ink-soft/50 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-ink text-cream rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-soft transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FloatingWidgets() {
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);
  const [showProactiveBubble, setShowProactiveBubble] = useState(false);
  const { isOpen: cartOpen } = useCartDrawer();
  const { pathname } = useLocation();
  const isProductPage = pathname.startsWith('/produit/');

  useEffect(() => {
    if (!isProductPage) {
      setShowProactiveBubble(false);
      return;
    }
    setShowProactiveBubble(false);
    const timer = setTimeout(() => {
      setShowProactiveBubble(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [pathname, isProductPage]);

  useEffect(() => {
    if (chatOpen) setShowProactiveBubble(false);
  }, [chatOpen]);

  if (cartOpen) return null;

  return (
    <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-5 rtl:right-auto rtl:left-4 rtl:sm:left-5 z-50 flex-col items-end gap-3 transition-[bottom] duration-300 ${isProductPage ? 'hidden lg:flex' : 'flex'}`}>

      {/* Chatbot window */}
      {chatOpen && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-200">
          <Chatbot onClose={() => setChatOpen(false)} t={t} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col items-end gap-3">

        {/* Proactive Bubble */}
        {showProactiveBubble && !chatOpen && (
          <div className="relative w-64 p-4 bg-cream text-ink text-xs rounded-2xl rounded-br-sm rtl:rounded-br-none rtl:rounded-bl-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-4 fade-in duration-500 z-50 border border-ink/10">
            <button
              onClick={(e) => { e.preventDefault(); setShowProactiveBubble(false); }}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-ink-soft hover:text-ink bg-ink/5 hover:bg-ink/10 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="font-bold mb-1.5 flex items-center gap-2 text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {t('chatBesoinConseil')}
            </p>
            <p className="text-ink-soft leading-relaxed pr-2">
              {t('chatDoute')}
            </p>
          </div>
        )}

        {/* Chatbot toggle */}
        <button
          onClick={() => setChatOpen((o) => !o)}
          aria-label={t('chatAriaOuvrir')}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 ${
            chatOpen
              ? 'bg-ink text-cream'
              : 'bg-gold text-cream'
          }`}
        >
          {chatOpen
            ? <X className="w-5 h-5" />
            : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          }
        </button>

        {/* WhatsApp */}
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('chatAriaWhatsApp')}
          className="flex items-center justify-center gap-2 w-12 h-12 sm:w-auto sm:px-4 sm:py-3 bg-ink hover:bg-ink-soft border border-ink/15 hover:border-gold text-cream rounded-full shadow-lg font-medium text-sm transition-all hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-5 sm:h-5 fill-current flex-shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
