import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NaijaJobber — Building Africa's Biggest Opportunity Platform",
    template: "%s · NaijaJobber",
  },
  description:
    "Africa’s opportunity engine — a grassroots JobTech platform connecting job seekers with verified local, remote, and Web3 work.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "NaijaJobber — Building Africa's Biggest Opportunity Platform",
    description:
      "Bridging African talent with real-time local, remote, and Web3 opportunities. The opportunity is NaijaJobber.",
    type: "website",
    images: ["/logo.jpeg"],
  },
  icons: {
    icon: [{ url: "/logo.jpeg", type: "image/jpeg" }],
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
