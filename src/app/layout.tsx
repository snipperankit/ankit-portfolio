import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./fieldnotes.css";
import LanguageProvider, { SkipToContent } from "@/components/LanguageProvider";
import Analytics from "@/components/Analytics";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ankitanand.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ankit@ulm: ~ — Ankit Anand",
  description:
    "Ankit Anand — Solution Architect & Distributed Systems / GenAI engineer. Ulm, Germany.",
  openGraph: {
    title: "ankit@ulm: ~ — Ankit Anand",
    description:
      "Ankit Anand — Solution Architect & Distributed Systems / GenAI engineer. Ulm, Germany.",
    url: siteUrl,
    siteName: "Ankit Anand",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ankit@ulm: ~ — Ankit Anand",
    description:
      "Ankit Anand — Solution Architect & Distributed Systems / GenAI engineer. Ulm, Germany.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        <script
          // set the theme before paint to avoid a flash of the wrong theme
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}",
          }}
        />
      </head>
      <body><LanguageProvider><Analytics /><SkipToContent />{children}</LanguageProvider></body>
    </html>
  );
}
