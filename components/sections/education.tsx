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
    university: "Netaji Subhas University of Technology (Main Campus), Dwarka, New Delhi",
    degree: "B.Tech in Computer Science and Engineering",
    gpa: "CGPA: 9.00",
    duration: "2025 - 2029",
    coursework: ["Data Structures", "Algorithms", "Operating Systems", "Database Systems", "Software Engineering"],
    awards: ["Member of the DSA Department, GDG On Campus"],
  },
  {
    university: "Venkateshwar International School, Sector-10, Dwarka, New Delhi",
    degree: "Senior Secondary (PCM + CS)",
    gpa: "AISSE: 97.0%\nAISSCE: 96.8%",
    duration: "2011 - 2025",
    coursework: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
    awards: ["Computer Wizard of the Batch of 2025"],
  },
]

export function EducationSection() {
  return (
    <section id="education" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          title="Education"
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
                  {edu.gpa && (
                    <div className="flex flex-col items-end text-sm font-mono text-foreground">
                      {edu.gpa.split("\n").map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {edu.coursework.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Relevant Coursework</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {edu.coursework.map((c) => (
                      <span key={c} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {edu.awards.length > 0 && (
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
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
