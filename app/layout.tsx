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
import { GatewayProvider } from "./ui/commons/gatewayProvider";

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
        <GatewayProvider value={process.env.GATEWAY_BASE_URL}>
          <Suspense>
            <OAuthCallback />
          </Suspense>
          <MatomoTracker siteId={process.env.MATOMO_TRACKER_ID} />
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
        </GatewayProvider>
      </body>
    </html>
  );
}
