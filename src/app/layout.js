import localFont from "next/font/local";
import { Oxanium } from 'next/font/google'
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const oxanium = Oxanium({ subsets: ['latin'] })

export const metadata = {
  title: "Web3 Project Landing Page",
  description: "A minimalistic and clean landing page for our Web3 project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={oxanium.className}>{children}</body>
    </html>
  );
}
