import type { Metadata, Viewport } from "next"
import { Sarabun } from "next/font/google"
import AppToaster from "@/components/shared/AppToaster"
import "./globals.css"

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "🏋️ ภารกิจลดไซส์ กู้ภัยพุง",
  description: "พิชิตพุง ลดไซส์ไปด้วยกัน",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <AppToaster />
      </body>
    </html>
  )
}
