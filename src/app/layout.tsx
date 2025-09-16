import { Beiruti } from "next/font/google";
import "./globals.css";

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
      <body className={`${beiruti.variable} antialiased`}>{children}</body>
    </html>
  );
}
