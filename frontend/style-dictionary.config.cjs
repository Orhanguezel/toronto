// src/frontend/style-dictionary.config.cjs

module.exports = {
  source: ["tokens/**/*.json"],
  transform: {
    // px → rem isteğe bağlı: örneği sade tutuyoruz
  },
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "src/styles/tokens/",
      files: [{ destination: "tokens.css", format: "css/variables" }]
    },
    js: {
      transformGroup: "js",
      buildPath: "src/styles/tokens/",
      files: [{ destination: "tokens.ts", format: "javascript/es6" }]
    }
  }
};

/*

### 0.4 FE kullanımı
- **Global CSS Variables**: `src/styles/tokens/tokens.css` dosyasını `app/layout.tsx` içinde import edin.
- **Theme merge**: `src/styles/themes/torontoTheme.ts` içinde Style Dictionary çıktısını import edip TS theme ile birleştirin.

*/