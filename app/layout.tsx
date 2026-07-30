import type { Metadata } from "next";
import "./globals.css";
import Footer from "./ui/site/footer";
import Header from "./ui/site/header";
import { MatomoTracker, TrackingConsentForm } from "@/app/clientExports";
import 'flowbite';
import { SessionProviderWrapper } from "./libs/sessionProvider";
import OAuthCallback from "./ui/user/oauthCallback";
import { Suspense } from "react";
import { headers } from "next/headers";
import { LocaleProvider, type Locale } from "./i18n";

export const metadata: Metadata = {
  title: "TS4NFDI Service Portal",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = ((await headers()).get("x-locale") || "en") as Locale;


  return (
    <html lang={locale}>
      <body
        className={`antialiased`}
      >
        <Suspense>
          <OAuthCallback />
        </Suspense>
        <MatomoTracker />
        <div className="grid min-h-screen" id="app-layout">
          <LocaleProvider locale={locale}>
            <SessionProviderWrapper>
              <Header />
              <main className="site-content" key={"site-content"}>
                <TrackingConsentForm />
                {children}
              </main>
              <Footer />
            </SessionProviderWrapper>
          </LocaleProvider>
        </div>
      </body>
    </html>
  );
}
