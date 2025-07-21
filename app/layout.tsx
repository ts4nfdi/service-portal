import type {Metadata} from "next";
import "./globals.css";
import Footer from "./ui/site/footer";
import Header from "./ui/site/header";
import MatomoTracker from "@/app/matomo/useMatomo";
import TrackingConsentForm from "@/app/matomo/trackingConsent";

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
        <MatomoTracker/>
        <div className="grid min-h-screen" id="app-layout">
            <Header/>
            <main className="site-content" key={"site-content"}>
                <TrackingConsentForm/>
                {children}
            </main>
            <Footer/>
        </div>
        </body>
        </html>
    );
}
