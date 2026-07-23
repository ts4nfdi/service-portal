import type { Metadata } from "next";
import "./globals.css";
import Footer from "./ui/site/footer";
import Header from "./ui/site/header";
import { MatomoTracker, TrackingConsentForm } from "@/app/clientExports";
import 'flowbite';
import { SessionProviderWrapper } from "./libs/sessionProvider";
import OAuthCallback from "./ui/user/oauthCallback";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "TS4NFDI Service Portal",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <Suspense>
          <OAuthCallback />
        </Suspense>
        <MatomoTracker />
        <div className="grid min-h-screen" id="app-layout">
          <SessionProviderWrapper>
            <Header />
            <main className="site-content" key={"site-content"}>
              <TrackingConsentForm />
              {children}
            </main>
            <Footer />
          </SessionProviderWrapper>
        </div>
      </body>
    </html>
  );
}
