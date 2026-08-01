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
    default: "NaijaJobber — Remote careers for African talent",
    template: "%s · NaijaJobber",
  },
  description:
    "AI-powered remote employment platform connecting African talent with verified employers worldwide.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "NaijaJobber",
    description:
      "Discover legitimate remote jobs and hire skilled African professionals.",
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
