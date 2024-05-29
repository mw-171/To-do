import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getAuthenticatedAppForUser } from "../firebase/getAuthenticatedAppForUser";
import Navbar from "../components/navbar";
import { User } from "firebase/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Checkmate",
  description: "a chess-themed to-do list",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = await getAuthenticatedAppForUser();

  return (
    <html lang="en">
      <body>
        <Navbar initialUser={currentUser?.toJSON() as User} />
        <main className={inter.className}>{children}</main>
      </body>
    </html>
  );
}

