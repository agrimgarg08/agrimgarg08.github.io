"use client"

import { Mail, Linkedin } from "lucide-react"
import { siteConfig } from "@/config/site"

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <a
          href={`mailto:${siteConfig.email}`}
          className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Mail className="h-4 w-4" />
          </div>
          {siteConfig.email}
        </a>
        <a
          href={siteConfig.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Linkedin className="h-4 w-4" />
          </div>
          linkedin.com/in/{siteConfig.handles.linkedin}
        </a>
      </div>
    </footer>
  )
}
