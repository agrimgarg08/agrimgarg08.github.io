"use client"

import { SectionHeading } from "@/components/ui-helpers"
import { Briefcase, Calendar } from "lucide-react"

interface Experience {
  role: string
  organization: string
  duration: string
  points: string[]
  tech: string[]
}

const experiences: Experience[] = [
  {
    role: "Placeholder Role",
    organization: "Placeholder Company",
    duration: "Placeholder Duration",
    points: [
      "Placeholder Duty 1",
      "Placeholder Duty 2",
      "Placeholder Duty 3",
      "Placeholder Duty 4",
    ],
    tech: ["Placeholder Tech 1", "Placeholder Tech 2", "Placeholder Tech 3", "Placeholder Tech 4"],
  },
]

export function ResumeSection() {
  return (
    <section id="experience" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          title="Experience"
          subtitle="My professional journey and contributions"
        />

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 hidden h-full w-px bg-border md:left-8 md:block" />

          <div className="space-y-8">
            {experiences.map((exp, idx) => (
              <div key={idx} className="relative flex gap-6 md:ml-8 md:pl-10">
                {/* Timeline dot */}
                <div className="absolute -left-10 top-1 hidden h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background md:flex">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>

                <div className="w-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{exp.role}</h3>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Briefcase className="h-3.5 w-3.5" />
                        {exp.organization}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {exp.duration}
                    </div>
                  </div>

                  <ul className="mb-4 space-y-1.5">
                    {exp.points.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/40" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {exp.tech.map((t) => (
                      <span key={t} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
