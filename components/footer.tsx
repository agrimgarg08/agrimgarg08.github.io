"use client"

import { Github, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {"Built with Next.js, Tailwind CSS, and attention to detail."}
        </p>
        <div className="flex items-center gap-4">
          {[
            { icon: Github, href: "https://github.com/agrimgarg08", label: "GitHub" },
            { icon: Linkedin, href: "https://linkedin.com/in/agrim-garg", label: "LinkedIn" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
