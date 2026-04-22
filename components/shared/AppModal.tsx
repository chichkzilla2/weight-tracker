"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"

interface AppModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  backdropColor?: string
}

export default function AppModal({
  open,
  onClose,
  children,
  backdropColor = "rgba(0,0,0,0.45)",
}: AppModalProps) {
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [open])

  // SSR-safe: during server render document is undefined; modals always start closed so no hydration mismatch
  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: backdropColor }}
        onClick={onClose}
      />
      {children}
    </div>,
    document.body,
  )
}
