type Map = Record<string, string>; // locale → public_id/url
const IMAGES: Record<string, Map> = {
  'home.hero': { tr: 'toronto/home/hero-tr', en: 'toronto/home/hero-en', de: 'toronto/home/hero-de' },
};
export function i18nImage(key: string, locale: string){
  const m = IMAGES[key];
  return (m && (m[locale] || m.tr)) || '';
}

/***Kullanım (Hero)**
```tsx
const src = i18nImage('home.hero', locale);
<Image loader={cloudinaryLoader} src={src} alt="Hero" width={1600} height={900} priority />
`
*/