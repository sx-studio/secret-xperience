// Per-photo thumbnail focal point. `focus` is the listing's image_focus map,
// keyed by image URL → { x, y } in percentages. Falls back to a top-biased
// crop (good default for portrait photos of people) when no focus is set.
export function focusPosition(focus: any, url: string | undefined | null): string {
  const f = focus && url ? focus[url] : null
  if (f && typeof f.x === 'number' && typeof f.y === 'number') {
    return `${f.x}% ${f.y}%`
  }
  return 'center 20%'
}
