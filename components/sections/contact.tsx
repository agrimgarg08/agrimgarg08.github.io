
"use client"

import { SectionHeading } from "@/components/ui-helpers"
import { Mail, Linkedin } from "lucide-react"
import { siteConfig } from "@/config/site"

export function ContactSection() {
  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          title="Get In Touch"
          subtitle="Have a project in mind or want to connect? Reach out directly."
        />

        <div className="flex flex-col gap-4">
          {/* Email */}
          <a
            href={`mailto:${siteConfig.email}`}
            className="group flex items-center gap-5 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
              <p className="mt-0.5 text-base font-medium text-foreground transition-colors group-hover:text-primary">
                {siteConfig.email}
              </p>
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-5 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <Linkedin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">LinkedIn</p>
              <p className="mt-0.5 text-base font-medium text-foreground transition-colors group-hover:text-primary">
                linkedin.com/in/{siteConfig.handles.linkedin}
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
