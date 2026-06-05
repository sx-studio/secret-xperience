// Per-photo thumbnail focal point. `focus` is the listing's image_focus map,
// keyed by image URL → { x, y } in percentages. Falls back to a top-biased
// crop (good default for portrait photos of people) when no focus is set.
export function focusPosition(focus: any, url: string | undefined | null): string {
  const f = focus && url ? focus[url] : null
  if (f && typeof f.x === 'number' && typeof f.y === 'number') {
    return `${f.x}% ${f.y}%`
  }
  return 'center 30%'
}

// Analyzes an image/canvas element and returns the most visually interesting
// focal point as { x, y } percentages (0–100). Uses luminance variance per
// 4×4 grid cell: high variance = lots of detail = likely the subject (face,
// clothing, hair). Biased toward horizontal center and upper 60% of frame.
export async function detectFocalPoint(
  source: HTMLCanvasElement | HTMLImageElement
): Promise<{ x: number; y: number }> {
  const S = 32
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  if (!ctx) return { x: 50, y: 30 }
  ctx.drawImage(source as CanvasImageSource, 0, 0, S, S)
  const { data } = ctx.getImageData(0, 0, S, S)

  const lum = new Float32Array(S * S)
  for (let i = 0; i < S * S; i++) {
    const p = i * 4
    lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
  }

  const CELL = 4       // 8×8 cells of 4×4 pixels
  const CELLS = S / CELL
  let bestScore = -1, bestX = 50, bestY = 30

  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      let sum = 0, sum2 = 0
      for (let py = 0; py < CELL; py++) {
        for (let px = 0; px < CELL; px++) {
          const v = lum[(cy * CELL + py) * S + (cx * CELL + px)]
          sum += v; sum2 += v * v
        }
      }
      const n = CELL * CELL
      const variance = sum2 / n - (sum / n) ** 2

      const nx = (cx + 0.5) / CELLS  // 0..1
      const ny = (cy + 0.5) / CELLS
      const xBias = 1 - Math.abs(nx - 0.5) * 0.5   // prefer horizontal center
      const yBias = ny < 0.6 ? 1.3 : 0.7             // prefer upper 60%
      const score = variance * xBias * yBias

      if (score > bestScore) {
        bestScore = score
        bestX = Math.round(nx * 100)
        bestY = Math.round(ny * 100)
      }
    }
  }

  return { x: bestX, y: bestY }
}

// Load a File/Blob as an HTMLImageElement (client-side only).
export function imageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')) }
    img.src = url
  })
}

// Load an image URL with crossOrigin so the canvas isn't tainted.
export function imageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error('load failed'))
    // Strip cache-buster params that can cause CORS pre-flight issues on some CDNs.
    img.src = url.split('?')[0]
  })
}
