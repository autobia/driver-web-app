import { Beiruti } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";

const beiruti = Beiruti({
  variable: "--font-beiruti",
  subsets: ["arabic", "latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${beiruti.variable} antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
