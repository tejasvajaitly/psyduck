import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Providers from "./providers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Psyduck",
  description: "analyze bank statements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${sourceCodePro.variable} antialiased`}
          >
            <header className="flex items-center justify-between">
              <Image src="/psyduck.svg" alt="psyduck" width={25} height={25} />
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton>
                    <Button className="cursor-pointer">Login</Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button variant="ghost" className="cursor-pointer">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">Dashboard</Link>
                  <UserButton />
                </SignedIn>
              </div>
            </header>
            {children}
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
