import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
//import { Analytics } from "@vercel/analytics/next";


export const metadata: Metadata = {
  title: "PDFKit Pro – Every PDF Tool You'll Ever Need",
  description:
    "Merge, split, compress, convert, protect, OCR and edit PDFs in a fast, secure and easy way. No sign-up required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <ThemeProvider>
            <AuthProvider>
              <div className="app">
                <Navbar />
                {children}
                <Footer />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}