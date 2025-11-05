"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import classicTheme from "@/styles/themes/classicTheme";
import { GlobalStyle } from "@/styles/GlobalStyle";

export default function ThemeRoot({ children }: { children?: ReactNode }) {
  return (
    <ThemeProvider theme={classicTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
