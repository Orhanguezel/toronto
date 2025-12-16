"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import type { AppStore } from "@/store";
import { makeStore } from "@/store";

let _store: AppStore | null = null;
function getStore(): AppStore { return (_store ??= makeStore()); }

export default function Providers({ children }: { children: React.ReactNode }) {
  const store = getStore();
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
