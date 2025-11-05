import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root { color-scheme: dark; }

  :root{
    --container-max: ${({theme})=>theme.layout.containerWidth};
    --container-padX: clamp(16px, 4vw, 32px);

    --color-title: ${({theme})=>theme.colors.title};
    --color-text: ${({theme})=>theme.colors.text};
    --color-textSecondary: ${({theme})=>theme.colors.textSecondary};
    --color-link: ${({theme})=>theme.colors.link};
    --color-linkHover: ${({theme})=>theme.colors.linkHover};

    --border-thin: ${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
    --transition-normal: ${({theme})=>theme.transition.normal};

    --btn-primary-bg: ${({theme})=>theme.buttons.primary.background};
    --btn-primary-text: ${({theme})=>theme.buttons.primary.text};
    --btn-danger-bg: ${({theme})=>theme.buttons.danger.background};
    --btn-danger-text: ${({theme})=>theme.buttons.danger.text};
    --btn-ghost-border: ${({theme})=>theme.colors.borderLight};

    --color-surface: ${({theme})=>theme.cards.background};
  }

  *,*::before,*::after{ box-sizing:border-box; }
  html,body{ height:100%; }

  body{
    margin:0;
    font-family:${({theme})=>theme.fonts.body};
    background:${({theme})=>theme.colors.background};
    color:${({theme})=>theme.colors.text};
    line-height:${({theme})=>theme.lineHeights.normal};
    font-size:${({theme})=>theme.fontSizes.base};
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    text-rendering:optimizeLegibility;
  }

  img,picture,video,canvas,svg{ display:block; max-width:100%; }
  img{ height:auto; }

  a{ color:var(--color-link); text-decoration:none; transition:color var(--transition-normal); }
  a:hover{ color:var(--color-linkHover); }

  :focus-visible{ outline:2px solid ${({theme})=>theme.colors.borderHighlight}; outline-offset:2px; }

  @media (prefers-reduced-motion: reduce){
    *,*::before,*::after{
      animation-duration:0.001ms !important;
      animation-iteration-count:1 !important;
      transition-duration:0.001ms !important;
      scroll-behavior:auto !important;
    }
  }

  [hidden]{ display:none !important; }
`;
