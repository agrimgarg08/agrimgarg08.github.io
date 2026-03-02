"use client"

import { SectionHeading, AnimatedCounter } from "@/components/ui-helpers"
import { Code2, Trophy, GitBranch, Zap } from "lucide-react"

const stats = [
  { icon: Code2, label: "Problems Solved", value: 800, suffix: "+" },
  { icon: Trophy, label: "Contests", value: 150, suffix: "+" },
  { icon: GitBranch, label: "Projects Built", value: 15, suffix: "+" },
  { icon: Zap, label: "Hackathon Wins", value: 5, suffix: "" },
]

export function AboutSection() {
  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          title="About Me"
          subtitle="Engineer. Problem Solver. Builder."
        />

        <div className="mb-12">
          <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-muted-foreground text-pretty">
            I am a passionate software engineer and competitive programmer with deep expertise in
            algorithms, system design, and full-stack development. I thrive on solving complex
            problems and building performant, scalable applications. With a strong foundation in
            data structures and a track record in competitive programming, I bring analytical
            rigor and engineering discipline to every project.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-foreground sm:text-3xl">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
