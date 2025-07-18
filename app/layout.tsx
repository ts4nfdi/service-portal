import type {Metadata} from "next";
import "./globals.css";
import Footer from "./ui/site/footer";
import Header from "./ui/site/header";
// import {createMatomoScript} from "@/app/matomo/matomo";
import MatomoTracker from "@/app/matomo/useMatomo";

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
        {/*<head>*/}
        {/*    <script*/}
        {/*        dangerouslySetInnerHTML={{*/}
        {/*            __html: createMatomoScript(),*/}
        {/*        }}*/}
        {/*    />*/}
        {/*</head>*/}
        <body
            className={`antialiased`}
        >
        <MatomoTracker/>
        <div className="grid min-h-screen" id="app-layout">
            <Header/>
            <main className="site-content" key={"site-content"}>
                {children}
            </main>
            <Footer/>
        </div>
        </body>
        </html>
    );
}
