import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.doctor.name}`,
    template: `%s | ${site.name}`,
  },
  description: `Physiotherapy clinic of ${site.doctor.name} (${site.doctor.credentials}) — back & neck pain, sports injury rehab, post-surgical recovery, home visits and online consultations. ${site.address.line2}.`,
  keywords: [
    "physiotherapist",
    "physiotherapy clinic",
    "back pain treatment",
    "sports injury rehab",
    "home visit physiotherapy",
    "online physiotherapy consultation",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.doctor.name}`,
    description: site.tagline,
    url: site.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
