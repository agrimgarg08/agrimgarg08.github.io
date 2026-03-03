"use client"

import { useState } from "react"
import { SectionHeading } from "@/components/ui-helpers"
import { ExternalLink, Github, X, ChevronRight } from "lucide-react"
import { siteConfig } from "@/config/site"

interface Project {
  title: string
  description: string
  longDescription: string
  category: string
  tech: string[]
  github: string
  live: string
  challenges: string
  learnings: string
}

export const projects: Project[] = [
  {
    title: "DRISHTI",
    description: "AI-Driven Sustainability Operating System for Urban Water Systems.",
    longDescription: "DRISHTI is a lightweight, real-time decision support platform that helps authorities detect pollution early, predict risks, and take targeted action. Instead of waiting for damage, we enable a monitor → predict → intervene strategy.",
    category: "AI/ML",
    tech: ["Python", "PostgreSQL", "Scikit-Learn", "Streamlit", "Supabase"],
    github: "https://github.com/agrimgarg08/drishti",
    live: "https://drishti-teamrocket.streamlit.app",
    challenges: "Getting the normalisation scores right for policy simulation and setting up authentication.",
    learnings: "Learnt about how to build a web app, as this was my first ever project. Also, learnt about open source map APIs and Isolation-Forest algorithm.",
  },
]


export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <section id="projects" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Projects"
          subtitle="Selected work across systems, web, and AI"
        />

        {/* Grid/Flex Container */}
        <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-6 lg:gap-8">
          {projects.map((project) => (
            <button
              key={project.title}
              onClick={() => setSelectedProject(project)}
              className="group flex w-full max-w-[340px] flex-col rounded-xl border border-border bg-card p-5 text-left transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 sm:max-w-[400px]"
            >
              {/* Color bar */}
              <div className="mb-4 h-1 w-12 rounded-full bg-primary/40 transition-all duration-300 group-hover:w-20 group-hover:bg-primary" />

              <h3 className="mb-2 text-lg font-semibold text-foreground">{project.title}</h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 4).map((t) => (
                  <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {t}
                  </span>
                ))}
                {project.tech.length > 4 && (
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    +{project.tech.length - 4}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-primary">
                View Details
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Project detail modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">{selectedProject.category}</div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">{selectedProject.title}</h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">{selectedProject.longDescription}</p>

            <div className="mb-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.tech.map((t) => (
                  <span key={t} className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{t}</span>
                ))}
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Challenges</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{selectedProject.challenges}</p>
              </div>
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Key Learnings</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{selectedProject.learnings}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={selectedProject.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                <Github className="h-4 w-4" />
                Source Code
              </a>
              {selectedProject.live && (
                <a
                  href={selectedProject.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
