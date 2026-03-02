"use client"

import { useState } from "react"
import { SectionHeading } from "@/components/ui-helpers"
import { Mail, MapPin, Send, Github, Linkedin, Twitter, CheckCircle2 } from "lucide-react"

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false)
  const [formState, setFormState] = useState({ name: "", email: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormState({ name: "", email: "", message: "" })
    }, 3000)
  }

  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          title="Get In Touch"
          subtitle="Have a project in mind or want to connect? Let's talk."
        />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-xl border border-border bg-card p-6">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chart-3/10">
                  <CheckCircle2 className="h-8 w-8 text-chart-3" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Message Sent!</h3>
                <p className="text-sm text-muted-foreground">Thanks for reaching out. I will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Email</h4>
                  <a href="mailto:alex@alexchen.dev" className="text-sm text-muted-foreground transition-colors hover:text-primary">alex@alexchen.dev</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Location</h4>
                  <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connect</h4>
              <div className="flex gap-3">
                {[
                  { icon: Github, label: "GitHub", href: "https://github.com/alexchen" },
                  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/in/alexchen" },
                  { icon: Twitter, label: "Twitter", href: "https://twitter.com/alexchen" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Resume link */}
            <a
              href="/resume.pdf"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Download Resume (PDF)
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
