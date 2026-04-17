import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CarSure AI",
    description: "Immersive AI-powered used-car analysis interface",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
