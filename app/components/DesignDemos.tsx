'use client'
import { useEffect } from 'react'

// Injects 4 visual upgrade demos on the homepage:
// 1. Hero text stagger  2. ScrollTrigger card reveals
// 3. Spotlight glow cards  4. Magnetic 3D tilt
export default function DesignDemos() {
  useEffect(() => {
    let gsap: any
    let ScrollTrigger: any

    async function init() {
      const gsapMod = await import('gsap')
      const stMod = await import('gsap/ScrollTrigger')
      gsap = gsapMod.gsap || gsapMod.default
      ScrollTrigger = stMod.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      heroTextAnimation(gsap)
      setupScrollReveal(gsap, ScrollTrigger)
      injectSpotlightCSS()
      setupSpotlightAndTilt()
    }

    init().catch(() => {})

    return () => {
      if (ScrollTrigger) ScrollTrigger.getAll().forEach((t: any) => t.kill())
    }
  }, [])

  return null
}

// ── 1. HERO TEXT ANIMATION ──────────────────────────────────────────────────
function heroTextAnimation(gsap: any) {
  const h1 = document.querySelector<HTMLElement>('#editorialHero h1')
  if (!h1) return

  // Collect text nodes and the italic <em> child
  const children = Array.from(h1.childNodes)
  const wrapped: HTMLElement[] = []

  children.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node as Text).textContent || ''
      const words = text.split(/(\s+)/)
      words.forEach(word => {
        if (!word) return
        if (/^\s+$/.test(word)) {
          const sp = document.createTextNode(word)
          node.parentNode?.insertBefore(sp, node)
        } else {
          const span = document.createElement('span')
          span.style.cssText = 'display:inline-block;overflow:hidden;'
          const inner = document.createElement('span')
          inner.style.cssText = 'display:inline-block;'
          inner.textContent = word
          span.appendChild(inner)
          node.parentNode?.insertBefore(span, node)
          wrapped.push(inner)
        }
      })
      node.parentNode?.removeChild(node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.tagName === 'EM') {
        const outerSpan = document.createElement('span')
        outerSpan.style.cssText = 'display:inline-block;overflow:hidden;'
        el.parentNode?.insertBefore(outerSpan, el)
        outerSpan.appendChild(el)
        wrapped.push(el)
      } else if (el.tagName === 'BR') {
        // keep it
      }
    }
  })

  if (!wrapped.length) return

  gsap.set(wrapped, { y: '110%', opacity: 0 })
  gsap.to(wrapped, {
    y: '0%',
    opacity: 1,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
    delay: 0.15,
  })

  // Gold shimmer sweep on the <em> element after words land
  const em = h1.querySelector('em') as HTMLElement | null
  if (em) {
    gsap.to(em, {
      backgroundPosition: '200% center',
      duration: 2.5,
      ease: 'none',
      delay: wrapped.length * 0.08 + 0.4,
      repeat: -1,
      yoyo: true,
    })
    // Ensure the gradient is wide enough for the sweep
    em.style.backgroundSize = '200% auto'
  }
}

// ── 2. SCROLL REVEAL ────────────────────────────────────────────────────────
function setupScrollReveal(gsap: any, ScrollTrigger: any) {
  // Observe mutations so dynamically injected cards also get the treatment
  const observe = () => {
    const cards = document.querySelectorAll<HTMLElement>('#listingCards .card:not([data-sr])')
    if (!cards.length) return
    cards.forEach(card => {
      card.dataset.sr = '1'
      gsap.fromTo(card,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            once: true,
          },
        }
      )
    })
  }

  // Initial pass
  observe()

  // Watch for cards injected by renderCards()
  const mo = new MutationObserver(observe)
  const container = document.getElementById('listingCards')
  if (container) mo.observe(container, { childList: true })

  // Also animate the hero stats row
  const statItems = document.querySelectorAll<HTMLElement>('#editorialHero .hero-stats > div')
  gsap.fromTo(statItems,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.9 }
  )
}

// ── 3 & 4. SPOTLIGHT + TILT — shared mousemove handler per card ─────────────
function injectSpotlightCSS() {
  if (document.getElementById('sx-demo-css')) return
  const style = document.createElement('style')
  style.id = 'sx-demo-css'
  style.textContent = `
    .card {
      position: relative;
      transform-style: preserve-3d;
      transition: box-shadow 0.3s ease, transform 0.05s linear;
      will-change: transform;
    }
    .card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: radial-gradient(
        320px circle at var(--sx, 50%) var(--sy, 50%),
        rgba(197,160,90,0.18) 0%,
        transparent 65%
      );
      opacity: 0;
      transition: opacity 0.25s ease;
      pointer-events: none;
      z-index: 4;
    }
    .card:hover::before {
      opacity: 1;
    }
    .card:hover {
      box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(197,160,90,0.35);
    }
  `
  document.head.appendChild(style)
}

function setupSpotlightAndTilt() {
  // Use event delegation on the cards container so dynamically added cards work too
  const container = document.getElementById('listingCards')
  if (!container) return

  let activeCard: HTMLElement | null = null

  container.addEventListener('mousemove', (e: MouseEvent) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.card')

    // If cursor moved to a different card, reset the previous one
    if (activeCard && activeCard !== card) {
      activeCard.style.transform = ''
    }
    activeCard = card || null
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = (x / rect.width) * 100
    const py = (y / rect.height) * 100

    // Spotlight: update CSS custom props
    card.style.setProperty('--sx', `${px}%`)
    card.style.setProperty('--sy', `${py}%`)

    // Magnetic tilt: max ±6deg
    const cx = (x / rect.width - 0.5) * 2
    const cy = (y / rect.height - 0.5) * 2
    card.style.transform = `perspective(600px) rotateX(${-cy * 6}deg) rotateY(${cx * 6}deg) scale3d(1.025,1.025,1.025)`
  })

  container.addEventListener('mouseleave', () => {
    if (activeCard) {
      activeCard.style.transform = ''
      activeCard = null
    }
  })
}
