// src/i18n/IntlProviderClient.tsx
"use client";

import * as React from "react";

type Props = {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
};

/**
 * Not:
 * Bu projede şu anda next-intl kullanılmıyor.
 * Bu wrapper sadece children'ı dönen basit bir provider.
 * İlerde farklı bir i18n kütüphanesi entegre etmek istersen burayı doldurabiliriz.
 */
export default function IntlProviderClient({ children }: Props) {
  return <>{children}</>;
}
