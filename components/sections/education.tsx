"use client"

import { SectionHeading } from "@/components/ui-helpers"
import { GraduationCap, Award } from "lucide-react"

interface EducationItem {
  university: string
  degree: string
  gpa: string
  duration: string
  coursework: string[]
  awards: string[]
}

const education: EducationItem[] = [
  {
    university: "Stanford University",
    degree: "M.S. Computer Science",
    gpa: "3.92 / 4.0",
    duration: "2025 - 2027 (Expected)",
    coursework: ["Advanced Algorithms", "Distributed Systems", "Machine Learning", "Computer Networks"],
    awards: ["Graduate Fellowship", "Dean's List"],
  },
  {
    university: "State University",
    degree: "B.S. Computer Science",
    gpa: "3.88 / 4.0",
    duration: "2021 - 2025",
    coursework: ["Data Structures", "Operating Systems", "Database Systems", "Computer Architecture", "Software Engineering"],
    awards: ["Summa Cum Laude", "CS Department Award", "Presidential Scholarship"],
  },
]

export function EducationSection() {
  return (
    <section id="education" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          title="Education"
          subtitle="Academic background and achievements"
        />

        <div className="space-y-6">
          {education.map((edu, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{edu.university}</h3>
                    <p className="text-sm text-primary">{edu.degree}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                  <span>{edu.duration}</span>
                  <span className="font-mono text-foreground">{edu.gpa}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Relevant Coursework</h4>
                <div className="flex flex-wrap gap-1.5">
                  {edu.coursework.map((c) => (
                    <span key={c} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{c}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Awards</h4>
                <div className="flex flex-wrap gap-3">
                  {edu.awards.map((a) => (
                    <div key={a} className="flex items-center gap-1.5 text-sm text-foreground">
                      <Award className="h-3.5 w-3.5 text-chart-4" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
