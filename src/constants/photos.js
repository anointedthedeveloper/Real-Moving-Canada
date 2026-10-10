/**
 * Site photos. Each photo ships in two sizes — `name.webp` (1200px wide) and
 * `name@2x.webp` (2400px) — so phones with high-density screens get a sharp image
 * without desktop-sized downloads everywhere. Use with <img src srcSet sizes>.
 */
const files = import.meta.glob('../assets/images/*.webp', { eager: true, import: 'default' });

export function photo(name) {
  const src = files[`../assets/images/${name}.webp`];
  const large = files[`../assets/images/${name}@2x.webp`];
  if (!src) throw new Error(`Missing photo: ${name}`);
  return { src, srcSet: large ? `${src} 1200w, ${large} 2400w` : undefined };
}
