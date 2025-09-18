"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors={true}
      expand={true}
      visibleToasts={5}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "8px",
          fontSize: "14px",
          fontFamily: "var(--font-beiruti), system-ui, sans-serif",
          fontWeight: "500",
        },
        className: "font-medium",
        descriptionClassName: "text-sm opacity-90",
        unstyled: false,
      }}
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-border": "hsl(var(--border))",
          "--normal-text": "hsl(var(--foreground))",
          "--success-bg": "#10b981",
          "--success-border": "#059669",
          "--success-text": "#ffffff",
          "--error-bg": "#ef4444",
          "--error-border": "#dc2626",
          "--error-text": "#ffffff",
          "--warning-bg": "#f59e0b",
          "--warning-border": "#d97706",
          "--warning-text": "#ffffff",
          "--info-bg": "#3b82f6",
          "--info-border": "#2563eb",
          "--info-text": "#ffffff",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
