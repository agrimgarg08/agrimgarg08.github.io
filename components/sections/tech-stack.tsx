"use client"

import { useState } from "react"
import { SectionHeading } from "@/components/ui-helpers"
import { cn } from "@/lib/utils"

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert"

interface Skill {
  name: string
  level: SkillLevel
  years: number
}

interface Category {
  name: string
  skills: Skill[]
}

const categories: Category[] = [
  {
    name: "Languages",
    skills: [
      { name: "C++", level: "Expert", years: 5 },
      { name: "Python", level: "Advanced", years: 4 },
      { name: "TypeScript", level: "Advanced", years: 3 },
      { name: "JavaScript", level: "Advanced", years: 4 },
      { name: "Java", level: "Intermediate", years: 2 },
      { name: "Go", level: "Intermediate", years: 1 },
    ],
  },
  {
    name: "Frontend",
    skills: [
      { name: "React", level: "Expert", years: 3 },
      { name: "Next.js", level: "Advanced", years: 3 },
      { name: "Tailwind CSS", level: "Expert", years: 3 },
      { name: "Redux", level: "Advanced", years: 2 },
      { name: "HTML/CSS", level: "Expert", years: 5 },
    ],
  },
  {
    name: "Backend",
    skills: [
      { name: "Node.js", level: "Advanced", years: 3 },
      { name: "Express", level: "Advanced", years: 3 },
      { name: "FastAPI", level: "Intermediate", years: 2 },
      { name: "GraphQL", level: "Intermediate", years: 2 },
      { name: "REST APIs", level: "Expert", years: 4 },
    ],
  },
  {
    name: "Databases",
    skills: [
      { name: "PostgreSQL", level: "Advanced", years: 3 },
      { name: "MongoDB", level: "Advanced", years: 3 },
      { name: "Redis", level: "Intermediate", years: 2 },
      { name: "MySQL", level: "Intermediate", years: 2 },
    ],
  },
  {
    name: "DevOps & Tools",
    skills: [
      { name: "Docker", level: "Advanced", years: 2 },
      { name: "Git", level: "Expert", years: 5 },
      { name: "Linux", level: "Advanced", years: 4 },
      { name: "CI/CD", level: "Intermediate", years: 2 },
      { name: "Nginx", level: "Intermediate", years: 2 },
    ],
  },
  {
    name: "Cloud",
    skills: [
      { name: "AWS", level: "Advanced", years: 2 },
      { name: "GCP", level: "Intermediate", years: 1 },
      { name: "Firebase", level: "Intermediate", years: 2 },
    ],
  },
]

const levelColors: Record<SkillLevel, string> = {
  Beginner: "bg-chart-5/15 text-chart-5",
  Intermediate: "bg-chart-4/15 text-chart-4",
  Advanced: "bg-chart-2/15 text-chart-2",
  Expert: "bg-chart-3/15 text-chart-3",
}

export function TechStackSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All")

  const filtered = activeCategory === "All"
    ? categories
    : categories.filter((c) => c.name === activeCategory)

  return (
    <section id="tech-stack" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Tech Stack"
          subtitle="Technologies and tools I work with daily"
        />

        {/* Category filter */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {["All", ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <div className="space-y-10">
          {filtered.map((category) => (
            <div key={category.name}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {category.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <span className="text-sm font-semibold text-foreground">{skill.name}</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", levelColors[skill.level])}>
                        {skill.level}
                      </span>
                      <span className="text-xs text-muted-foreground">{skill.years}y</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
