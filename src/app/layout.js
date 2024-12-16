import localFont from "next/font/local";
import { Oxanium } from 'next/font/google'
import "./globals.css";



export const metadata = {
  title: "Web3 Project Landing Page",
  description: "A minimalistic and clean landing page for our Web3 project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
