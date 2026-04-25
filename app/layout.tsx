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
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              success:
                "border-[#F59E0B]/35 bg-[#2A1B0A] text-[#FFE8B8]",
              error:
                "border-[#6B2A2A]/70 bg-[#2A1719] text-[#F2C8C8]",
            },
          }}
        />
      </body>
    </html>
  )
}
