import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080612',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.secretxperience.eu'),
  title: 'SecretXperience.eu — Premium Adult Services Platform',
  description: 'Discreet, verified, premium adult experiences across Europe. Browse escorts, companions, nightlife, creators, rentals, and more.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SecretXperience' },
  openGraph: {
    type: 'website',
    locale: 'en_EU',
    url: 'https://www.secretxperience.eu',
    siteName: 'SecretXperience.eu',
    title: 'SecretXperience.eu — Premium Adult Services Platform',
    description: 'Discreet, verified, premium adult experiences across Europe.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SecretXperience.eu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecretXperience.eu — Premium Adult Services Platform',
    description: 'Discreet, verified, premium adult experiences across Europe.',
    images: ['/og-image.jpg'],
  },
  icons: {
    apple: '/icon-192.png',
    icon: '/favicon.ico',
  },
}

// Theme bootstrap — runs before paint to avoid a flash of the wrong theme.
// Default is "velvet". A stored localStorage.theme overrides.
const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.theme;
    var t = (stored === 'dark' || stored === 'light' || stored === 'velvet') ? stored : 'velvet';
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'velvet';
  }
})();
`

const gtInit = `
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'fr,nl,de,es,it,pt,pl,ro',
    autoDisplay: false
  }, 'google_translate_element');
}
`

const langPickerScript = `
(function() {
  var LANGS = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'it', flag: '🇮🇹', label: 'Italiano' },
    { code: 'pt', flag: '🇵🇹', label: 'Português' },
    { code: 'pl', flag: '🇵🇱', label: 'Polski' },
    { code: 'ro', flag: '🇷🇴', label: 'Română' }
  ];

  var currentLang = localStorage.getItem('sx_lang') || 'en';

  function applyLang(code) {
    currentLang = code;
    localStorage.setItem('sx_lang', code);
    var btn = document.getElementById('langPickerBtn');
    var langObj = LANGS.find(function(l){ return l.code === code; }) || LANGS[0];
    if (btn) btn.innerHTML = langObj.flag + ' <span style="font-size:11px;font-weight:600;letter-spacing:.04em">' + langObj.code.toUpperCase() + '</span> <i class="ti ti-chevron-down" style="font-size:10px;opacity:0.6"></i>';
    // Trigger Google Translate
    var attempt = 0;
    function tryTranslate() {
      var combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = code === 'en' ? '' : code;
        combo.dispatchEvent(new Event('change'));
      } else if (attempt < 15) {
        attempt++;
        setTimeout(tryTranslate, 300);
      }
    }
    tryTranslate();
  }

  function buildPicker() {
    var wrap = document.getElementById('langPickerWrap');
    if (!wrap) return;

    var btn = document.createElement('button');
    btn.id = 'langPickerBtn';
    btn.setAttribute('aria-label', 'Select language');
    var initLang = LANGS.find(function(l){ return l.code === currentLang; }) || LANGS[0];
    btn.innerHTML = initLang.flag + ' <span style="font-size:11px;font-weight:600;letter-spacing:.04em">' + initLang.code.toUpperCase() + '</span> <i class="ti ti-chevron-down" style="font-size:10px;opacity:0.6"></i>';
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 10px;background:var(--bg2,rgba(255,255,255,0.06));border:0.5px solid var(--b2,rgba(255,255,255,0.1));border-radius:10px;cursor:pointer;color:var(--t,#ece8e1);font-family:inherit;font-size:13px;transition:border-color .2s;white-space:nowrap;';

    var dropdown = document.createElement('div');
    dropdown.id = 'langDropdown';
    dropdown.style.cssText = 'display:none;position:absolute;bottom:calc(100% + 8px);right:0;background:var(--bg1,#100e1a);border:0.5px solid var(--b2,rgba(255,255,255,0.12));border-radius:12px;padding:6px;min-width:170px;box-shadow:0 16px 48px rgba(0,0,0,0.7);z-index:10000;';

    LANGS.forEach(function(lang) {
      var item = document.createElement('button');
      item.style.cssText = 'display:flex;align-items:center;gap:9px;width:100%;background:none;border:none;padding:8px 10px;border-radius:8px;cursor:pointer;color:var(--t2,rgba(236,232,225,0.65));font:400 13px inherit;transition:background .15s,color .15s;text-align:left;';
      item.innerHTML = '<span style="font-size:16px">' + lang.flag + '</span><span style="flex:1">' + lang.label + '</span>' + (lang.code === currentLang ? '<i class="ti ti-check" style="font-size:12px;color:var(--gold,#c5a05a)"></i>' : '');
      item.onmouseenter = function(){ item.style.background='var(--bg2,rgba(255,255,255,0.05))'; item.style.color='var(--t,#ece8e1)'; };
      item.onmouseleave = function(){ item.style.background='none'; item.style.color='var(--t2,rgba(236,232,225,0.65))'; };
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.style.display = 'none';
        dropdown.querySelectorAll('i.ti-check').forEach(function(el){ el.remove(); });
        item.innerHTML = '<span style="font-size:16px">' + lang.flag + '</span><span style="flex:1">' + lang.label + '</span><i class="ti ti-check" style="font-size:12px;color:var(--gold,#c5a05a)"></i>';
        applyLang(lang.code);
      });
      dropdown.appendChild(item);
    });

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = dropdown.style.display !== 'none';
      dropdown.style.display = open ? 'none' : 'block';
    });
    document.addEventListener('click', function() { dropdown.style.display = 'none'; });

    wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9997;';
    wrap.appendChild(btn);
    wrap.appendChild(dropdown);

    // Restore saved language after GT loads
    if (currentLang !== 'en') {
      setTimeout(function(){ applyLang(currentLang); }, 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPicker);
  } else {
    buildPicker();
  }
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="velvet">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        {/* Hide Google Translate banner/toolbar so it doesn't push layout */}
        <style>{`
          .goog-te-banner-frame, .goog-te-ftab-float, #goog-gt-tt { display:none!important; }
          body { top:0!important; }
          .goog-te-combo { display:none!important; }
        `}</style>
      </head>
      <body>
        {children}
        {/* Hidden GT mount point */}
        <div id="google_translate_element" style={{ display: 'none', visibility: 'hidden', position: 'absolute' }} />
        {/* Language picker floating button */}
        <div id="langPickerWrap" />
        <Script id="gt-init" strategy="afterInteractive">{gtInit}</Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="lang-picker" strategy="afterInteractive">{langPickerScript}</Script>
      </body>
    </html>
  )
}
