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
    title: "Codeforces Expert",
    description: "Reached 1850 rating with consistent top 5% finishes in Div. 2 contests",
    category: "Competitive Programming",
    icon: Trophy,
  },
  {
    title: "LeetCode Knight",
    description: "800+ problems solved, top 2% globally with 2200+ contest rating",
    category: "Competitive Programming",
    icon: Star,
  },
  {
    title: "Google Code Jam - Round 2",
    description: "Advanced to Round 2 in 2024, placing top 3000 globally",
    category: "Competitive Programming",
    icon: Trophy,
  },
  {
    title: "HackMIT 2024 - 1st Place",
    description: "Built an AI-powered code review tool winning the grand prize",
    category: "Hackathon",
    icon: Award,
  },
  {
    title: "TreeHacks 2024 - Best Technical",
    description: "Won Best Technical Implementation for a distributed systems project",
    category: "Hackathon",
    icon: Award,
  },
  {
    title: "CalHacks - 2nd Place",
    description: "Built a real-time collaboration platform with conflict resolution",
    category: "Hackathon",
    icon: Medal,
  },
  {
    title: "PennApps - Best AI/ML",
    description: "Created an ML pipeline for automated vulnerability detection",
    category: "Hackathon",
    icon: Award,
  },
  {
    title: "HackTech - Innovation Award",
    description: "Developed a blockchain-based credential verification system",
    category: "Hackathon",
    icon: Award,
  },
  {
    title: "AWS Solutions Architect",
    description: "Certified AWS Solutions Architect Associate credential",
    category: "Certification",
    icon: ShieldCheck,
  },
  {
    title: "Presidential Scholarship",
    description: "Full academic scholarship for outstanding merit and leadership",
    category: "Academic",
    icon: Star,
  },
  {
    title: "ICPC Regionals Finalist",
    description: "Advanced to ICPC North America Regional Finals, top 50 teams",
    category: "Competitive Programming",
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((item, idx) => (
            <div
              key={idx}
              className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
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
