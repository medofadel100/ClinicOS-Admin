import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ClinicOS Admin",
  description: "Internal dashboard for ClinicOS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  let initialLanguage: "ar" | "en" = "ar";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: adminData } = await supabase
      .from("platform_admins")
      .select("preferred_language")
      .eq("auth_user_id", user.id)
      .single();

    if (adminData && adminData.preferred_language) {
      initialLanguage = adminData.preferred_language as "ar" | "en";
    }
  }

  const dir = initialLanguage === "ar" ? "rtl" : "ltr";

  return (
    <html lang={initialLanguage} dir={dir} className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <LanguageProvider initialLanguage={initialLanguage}>
          {children}
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
