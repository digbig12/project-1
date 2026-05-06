import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "BizAnalytics — AI-Powered Business Intelligence & Financial Dashboard",
    template: "%s | BizAnalytics",
  },
  description:
    "BizAnalytics is an AI-powered financial dashboard that provides real-time business intelligence, predictive analytics, expense tracking, OCR receipt scanning, and CFO-level insights to help businesses grow smarter.",
  keywords: [
    "business analytics",
    "AI dashboard",
    "financial intelligence",
    "expense tracker",
    "revenue analytics",
    "AI CFO",
    "business insights",
    "predictive analytics",
    "OCR receipt scanner",
    "financial dashboard",
    "small business tools",
    "SaaS analytics",
  ],
  authors: [{ name: "BizAnalytics Team" }],
  creator: "BizAnalytics",
  publisher: "BizAnalytics",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "BizAnalytics",
    title: "BizAnalytics — AI-Powered Business Intelligence",
    description:
      "Transform your business decisions with real-time AI analytics, predictive forecasting, and automated financial insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BizAnalytics Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BizAnalytics — AI-Powered Business Intelligence",
    description:
      "Real-time AI analytics, predictive forecasting, and automated financial insights for modern businesses.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased h-full overflow-hidden bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
