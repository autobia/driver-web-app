import { Beiruti } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import Navbar from "@/components/Navabr";
import StoreProvider from "@/store/ReduxProvider";
import AuthInitializer from "@/components/AuthInitializer";
import AuthGuard from "@/components/AuthGuard";

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
        <StoreProvider>
          <NextIntlClientProvider>
            <AuthInitializer>
              <AuthGuard>
                <div className="h-full flex flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                </div>
              </AuthGuard>
            </AuthInitializer>
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
