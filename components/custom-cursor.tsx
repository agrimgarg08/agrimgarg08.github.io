"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches
    if (isTouchDevice) return

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    const onEnter = () => setVisible(true)
    const onLeave = () => setVisible(false)

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseenter", onEnter)
    document.addEventListener("mouseleave", onLeave)

    let raf: number
    const animateRing = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`
      }
      raf = requestAnimationFrame(animateRing)
    }
    raf = requestAnimationFrame(animateRing)

    const onHoverStart = () => setHovering(true)
    const onHoverEnd = () => setHovering(false)

    const addHoverListeners = () => {
      document.querySelectorAll("a, button, [role='button'], input, textarea, select").forEach((el) => {
        el.addEventListener("mouseenter", onHoverStart)
        el.addEventListener("mouseleave", onHoverEnd)
      })
    }

    addHoverListeners()
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseenter", onEnter)
      document.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [visible])

  return (
    <>
      <style jsx global>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          className="rounded-full bg-foreground"
          style={{
            width: hovering ? 6 : 8,
            height: hovering ? 6 : 8,
            transition: "width 0.2s ease, height 0.2s ease",
          }}
        />
      </div>
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:block"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          className="rounded-full border border-foreground/30"
          style={{
            width: hovering ? 48 : 40,
            height: hovering ? 48 : 40,
            transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease",
            borderColor: hovering ? "var(--primary)" : undefined,
          }}
        />
      </div>
    </>
  )
}
