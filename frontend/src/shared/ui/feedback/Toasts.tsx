"use client";
import { Toaster } from "sonner";

export default function Toasts() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          color: "var(--color-text)",
          border: "var(--border-thin)"
        }
      }}
    />
  );
}
