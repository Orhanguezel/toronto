// Server component: sadece client komponenti çağırır.
// Böylece markup tek kaynaktan (LandingClient) gelir.

import LandingClient from "./LandingClient";

export default function Landing({ locale }: { locale: "tr" | "en" | "de" }) {
  return <LandingClient locale={locale} initialSection="" />;
}
