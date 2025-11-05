// src/styles/StyledProviders.tsx

"use client";

import React from "react";
import { ThemeProvider } from "styled-components";
import classicTheme from "@/styles/themes/classicTheme";
import { GlobalStyle } from "@/styles/GlobalStyle";

export default function StyledProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={classicTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
