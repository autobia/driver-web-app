import { Beiruti } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import Navbar from "@/components/Navabr";

const beiruti = Beiruti({
  variable: "--font-beiruti",
  subsets: ["arabic", "latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} className="h-full">
      <body className={`${beiruti.variable} antialiased h-full`}>
        <NextIntlClientProvider>
          <div className="h-full flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
