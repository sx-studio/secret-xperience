/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:  { DEFAULT: 'var(--bg)',  1: 'var(--bg1)', 2: 'var(--bg2)', 3: 'var(--bg3)', 4: 'var(--bg4)', deepest: 'var(--bg-deepest)' },
        b:   { DEFAULT: 'var(--b)',   2: 'var(--b2)',  3: 'var(--b3)' },
        t:   { DEFAULT: 'var(--t)',   2: 'var(--t2)',  3: 'var(--t3)', 'on-gold': 'var(--t-on-gold)' },

        gold:  { DEFAULT: 'var(--gold)',  l: 'var(--goldl)',  d: 'var(--goldd)',  bg: 'var(--gbg)',  brd: 'var(--gbrd)' },
        wine:  { DEFAULT: 'var(--wine)',  l: 'var(--winel)',  d: 'var(--wined)',  bg: 'var(--wbg)',  brd: 'var(--wbrd)' },
        plum:  { DEFAULT: 'var(--plum)',  l: 'var(--pluml)',  d: 'var(--plumd)',  bg: 'var(--plumbg)', brd: 'var(--plumbrd)' },
        champ: { DEFAULT: 'var(--champ)', d: 'var(--champd)', bg: 'var(--champbg)' },
        blush: 'var(--blush)',
        rose:  { DEFAULT: 'var(--rose)',  bg: 'var(--rosebg)' },
        pink:  { DEFAULT: 'var(--pink)',  bg: 'var(--pbg)' },
        teal:  { DEFAULT: 'var(--teal)',  bg: 'var(--tbg)' },
        sapphire: { DEFAULT: 'var(--sapphire)', bg: 'var(--sapphirebg)' },

        verified: 'var(--verified)',
        online:   'var(--online)',
        premium:  'var(--premium)',
        trending: 'var(--trending)',
        warn:     'var(--warn)',
        danger:   'var(--danger)',
      },
      fontFamily: {
        serif: ['var(--serif)'],
        sans:  ['var(--sans)'],
      },
      borderRadius: {
        r:   'var(--r)',
        rl:  'var(--rl)',
        rxl: 'var(--rxl)',
        rcurve: 'var(--rcurve)',
      },
      boxShadow: {
        card:    'var(--shadow-card)',
        'card-h': 'var(--shadow-card-h)',
        gold:    'var(--shadow-gold)',
        'gold-h': 'var(--shadow-gold-h)',
        wine:    'var(--shadow-wine)',
        'wine-h': 'var(--shadow-wine-h)',
        modal:   'var(--shadow-modal)',
        emboss:  'var(--shadow-emboss)',
      },
      transitionTimingFunction: {
        out:  'var(--ease-out)',
        luxe: 'var(--ease-luxe)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '220ms',
        slow: '380ms',
      },
      backgroundImage: {
        'grad-gold':      'var(--grad-gold)',
        'grad-gold-soft': 'var(--grad-gold-soft)',
        'grad-wine':      'var(--grad-wine)',
        'grad-plum':      'var(--grad-plum)',
        'grad-noir':      'var(--grad-noir)',
        'grad-velvet':    'var(--grad-velvet)',
        'grad-candle':    'var(--grad-candle)',
        'grad-boudoir':   'var(--grad-boudoir)',
        'grad-silk':      'var(--grad-silk)',
        'grad-spotlight': 'var(--grad-spotlight)',
      },
    },
  },
  plugins: [],
}
