"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    return <>{styles}</>;
  });

  // Client'ta sheet'e gerek yok
  if (typeof window !== "undefined") return <>{children}</>;

  // Server'da styled-components CSS toplanır
  return (
    <StyleSheetManager
      sheet={sheet.instance}
      shouldForwardProp={(propName, elementToBeCreated) => {
        if (typeof propName === "string" && propName.startsWith("$")) return false;
        if (typeof elementToBeCreated === "string") {
          return typeof propName === "string" ? isPropValid(propName) : true;
        }
        return true;
      }}
    >
      {children}
    </StyleSheetManager>
  );
}
