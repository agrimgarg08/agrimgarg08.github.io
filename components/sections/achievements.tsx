"use client"

import { SectionHeading } from "@/components/ui-helpers"
import { Trophy, Medal, Award, Star, ShieldCheck } from "lucide-react"

interface Achievement {
  title: string
  description: string
  category: string
  icon: typeof Trophy
}

const achievements: Achievement[] = [
  {
    title: "Winner of TRYST CTF '26",
    description: "It was a Jeopardy-style Red Team CTF contest, organised by DevClub, IIT Delhi in their annual tech fest - TRYST.",
    category: "Cyber Security",
    icon: Trophy,
  },
]

export function AchievementsSection() {
  return (
    <section id="achievements" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Achievements"
          subtitle="Awards, certifications, and competitive milestones"
        />

        <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-6 lg:gap-8">
          {achievements.map((item, idx) => (
            <div
              key={idx}
              className="group flex w-full max-w-[340px] flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 sm:max-w-[400px] sm:flex-row"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 sm:text-left text-center sm:items-start items-center">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                <span className="mt-1 text-xs font-medium text-primary/70">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
