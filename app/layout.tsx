import type { Metadata, Viewport } from "next"
import { Sarabun } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "🏋️ Weight Tracker",
  description: "บันทึกน้ำหนักเพื่อสุขภาพที่ดีขึ้น",
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
      <body className="min-h-full flex flex-col bg-[#FDFAF5]">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
