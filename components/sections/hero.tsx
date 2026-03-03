"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ExternalLink } from "lucide-react"

const roles = [
  "Data Structures & Algorithms",
  "System Design",
  "Problem Solving",
  "Logical Reasoning",
  "Cyber Security",
]

export function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentRole = roles[roleIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && text === currentRole) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && text === "") {
      setIsDeleting(false)
      setRoleIndex((prev) => (prev + 1) % roles.length)
    } else {
      timeout = setTimeout(
        () => {
          setText(
            isDeleting
              ? currentRole.slice(0, text.length - 1)
              : currentRole.slice(0, text.length + 1)
          )
        },
        isDeleting ? 30 : 60
      )
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting, roleIndex])

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl w-full">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground animate-fade-up">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Available for opportunities
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up text-balance" style={{ animationDelay: "0.1s" }}>
              Agrim Garg
            </h1>

            {/* Typing animation */}
            <div className="mb-8 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <span className="font-mono text-primary">{">"}</span>
              <span className="font-mono text-foreground">{text}</span>
              <span className="inline-block w-0.5 h-5 bg-primary animate-pulse" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              >
                View Projects
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="/resume.pdf"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Download Resume
              </a>
            </div>
          </div>

          {/* Right side - Code block aesthetic */}
          <div className="hidden flex-1 items-center justify-center lg:flex animate-fade-up" style={{ animationDelay: "0.5s" }}>
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  <span className="ml-auto text-xs text-muted-foreground font-mono">profile.ts</span>
                </div>
                <pre className="text-sm leading-relaxed font-mono">
                  <code>
                    <span className="text-primary">{"const"}</span>{" "}
                    <span className="text-foreground">{"developer"}</span>{" "}
                    <span className="text-muted-foreground">{"="}</span>{" "}
                    <span className="text-muted-foreground">{"{"}</span>{"\n"}
                    {"  "}<span className="text-chart-3">{"name"}</span>
                    <span className="text-muted-foreground">{":"}</span>{" "}
                    <span className="text-chart-4">{"\"Agrim Garg\""}</span>
                    <span className="text-muted-foreground">{","}</span>{"\n"}
                    {"  "}<span className="text-chart-3">{"role"}</span>
                    <span className="text-muted-foreground">{":"}</span>{" "}
                    <span className="text-chart-4">{'"Student"'}</span>
                    <span className="text-muted-foreground">{","}</span>{"\n"}
                    {"  "}<span className="text-chart-3">{"hobbies"}</span>
                    <span className="text-muted-foreground">{":"}</span>{" "}
                    <span className="text-accent">{"music, minecraft, cycling"}</span>
                    <span className="text-muted-foreground">{","}</span>{"\n"}
                    {"  "}<span className="text-chart-3">{"fav show"}</span>
                    <span className="text-muted-foreground">{":"}</span>{" "}
                    <span className="text-accent">{"brooklyn nine-nine"}</span>
                    <span className="text-muted-foreground">{","}</span>{"\n"}
                    {"  "}<span className="text-chart-3">{"passion"}</span>
                    <span className="text-muted-foreground">{":"}</span>{" "}
                    <span className="text-chart-4">{'"Solving Problems"'}</span>{"\n"}
                    <span className="text-muted-foreground">{"}"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-5 w-5 text-muted-foreground" />
      </div>
    </section>
  )
}
