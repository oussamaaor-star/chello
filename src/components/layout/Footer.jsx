import { NavLink, Link } from 'react-router-dom';
import { ArrowRight, Truck, Banknote, ShieldCheck, MessageCircle } from 'lucide-react';
import { SHOP_CONFIG } from '../../utils/config';
import { useLanguage } from '../../contexts/LanguageContext';
import categoriesData from '../../data/categories.json';

const WA_URL        = SHOP_CONFIG.wa_url;
const INSTAGRAM_URL = SHOP_CONFIG.instagram_url;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2m0-2.2C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.31-1.46.72-2.13 1.38a6.1 6.1 0 00-1.38 2.13c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a6.1 6.1 0 002.13 1.38c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a6.1 6.1 0 002.13-1.38 6.1 6.1 0 001.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a6.1 6.1 0 00-1.38-2.13A6.1 6.1 0 0019.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0z"/>
      <path d="M12 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84m0 10.16A4 4 0 1116 12a4 4 0 01-4 4zm6.41-9.99a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z"/>
    </svg>
  );
}

export function Footer() {
  const { t } = useLanguage();

  const serviceLinks = [
    { key: 'footerAPropos',   to: '/a-propos'          },
    { key: 'footerLivraison', to: '/livraison-retours' },
    { key: 'footerFaq',       to: '/faq'               },
    { key: 'footerContact',   to: '/contact'           },
    { key: 'footerSuivi',     to: '/suivi'             },
    { key: 'navFidelite',     to: '/fidelite'          },
  ];

  const categoryLinks = categoriesData.map((cat) => ({
    key: cat.slug,
    label: cat.label,
    to: `/categorie/${cat.slug}`,
  }));

  const legalLinks = [
    { key: 'footerMentions',        to: '/mentions-legales'          },
    { key: 'footerCgv',             to: '/cgv'                       },
    { key: 'footerConfidentialite', to: '/politique-confidentialite' },
    { key: 'footerLivraison',       to: '/livraison-retours'         },
  ];

  return (
    <footer className="bg-ink text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-6 sm:pb-8">

        {/* ── Bande réassurance ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-8 sm:pb-10 mb-8 sm:mb-12 border-b border-cream/10">
          {[
            { Icon: Truck,         title: t('footerReassLivT'),  sub: t('footerReassLivSub')  },
            { Icon: Banknote,      title: t('footerReassPaiT'),  sub: t('footerReassPaiSub')  },
            { Icon: ShieldCheck,   title: t('footerReassAuthT'), sub: t('footerReassAuthSub') },
            { Icon: MessageCircle, title: t('footerReassSupT'),  sub: t('footerReassSupSub')  },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-full border border-silver/40 flex items-center justify-center">
                <Icon className="w-4 h-4 text-silver-light" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-cream leading-tight">{title}</p>
                <p className="text-xs text-cream/50 leading-tight mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Top grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10 lg:gap-8 mb-8 sm:mb-12">

          {/* Marque */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="mb-3 sm:mb-5">
              <p className="text-2xl sm:text-3xl font-serif italic tracking-wide text-cream">Chello</p>
              <p className="text-[9px] tracking-[0.35em] text-cream/40 uppercase mt-1">Women's Fashion</p>
            </div>
            <p className="text-sm text-cream/50 leading-relaxed max-w-xs">
              {t('footerSlogan')}
            </p>
            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-cream/15 text-cream/60 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-200">
                <WhatsAppIcon />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-cream/15 text-cream/60 hover:border-silver hover:text-silver-light transition-all duration-200">
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Service client */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-cream/40 mb-3">
              {t('footerService')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {serviceLinks.map(({ key, to }) => (
                <li key={key}>
                  <Link to={to} className="text-sm text-cream/70 hover:text-cream transition-colors duration-150">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-cream/40 mb-3">
              {t('footerPopulaire')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {categoryLinks.map(({ key, to, label }) => (
                <li key={key}>
                  <NavLink to={to} className="text-sm text-cream/70 hover:text-cream transition-colors duration-150">
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-cream/40 mb-3">
              {t('footerLegal')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {legalLinks.map(({ key, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-cream/70 hover:text-cream transition-colors duration-150">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-cream/40 mb-3">
              {t('footerNewsletter')}
            </h3>
            <p className="text-xs sm:text-sm text-cream/50 mb-3 sm:mb-5 leading-relaxed">
              {t('footerNlDesc')}
              <span className="block mt-1 text-silver-light font-medium">{t('footerNlDiscount')}</span>
            </p>
            <Link to="/#newsletter"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-cream/30 hover:border-cream text-cream text-xs sm:text-sm font-medium uppercase tracking-wide rounded-full transition-colors">
              {t('footerNlBtn')}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>

        </div>

        {/* ── Barre du bas ── */}
        <div className="pt-5 sm:pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs text-cream/40">
            &copy; {new Date().getFullYear()} Chello. {t('footerRights')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-cream/40">
            <Link to="/mentions-legales"          className="hover:text-cream transition-colors">{t('footerMentions')}</Link>
            <Link to="/cgv"                       className="hover:text-cream transition-colors">{t('footerCgv')}</Link>
            <Link to="/politique-confidentialite" className="hover:text-cream transition-colors">{t('footerConfidentialite')}</Link>
            <Link to="/livraison-retours"         className="hover:text-cream transition-colors">{t('footerLivraison')}</Link>
          </div>
        </div>

      </div>

      {/* ── Bloc SEO — lu par Google, invisible pour les visiteurs ── */}
      <div aria-hidden="true" className="hidden">
        <div className="border-t border-cream/10 pt-5 grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-[10px] font-medium text-cream/70 mb-1.5">Chello — أزياء نسائية في مسقط، عُمان</h2>
            <p className="text-cream/70 text-[10px] leading-relaxed mb-1">
              Chello متجر متخصص في الملابس الجاهزة، العبايات، الشنط، الأحذية والعطورات في العريمي بوليفارد، السيب، مسقط. تواصل واتساب لتأكيد الطلب.
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-medium text-cream/70 mb-1.5">لماذا تختارين Chello؟</h3>
            <ul className="space-y-0.5 text-cream/70 text-[10px]">
              <li>✓ تصاميم أنيقة وعصرية</li>
              <li>✓ خدمة عملاء واتساب</li>
              <li>✓ برنامج ولاء بمكافآت</li>
              <li>✓ زورونا في المتجر — العريمي بوليفارد، السيب</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
