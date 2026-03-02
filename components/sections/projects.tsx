"use client"

import { useState } from "react"
import { SectionHeading } from "@/components/ui-helpers"
import { cn } from "@/lib/utils"
import { ExternalLink, Github, X, ChevronRight } from "lucide-react"

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

const projects: Project[] = [
  {
    title: "CodeCollab",
    description: "Real-time collaborative code editor with syntax highlighting, multi-cursor support, and live execution.",
    longDescription: "A full-featured collaborative coding platform that supports real-time editing with conflict resolution using CRDTs. Features include multi-language syntax highlighting, integrated terminal, and WebSocket-based synchronization for up to 50 concurrent users.",
    category: "Web",
    tech: ["Next.js", "TypeScript", "WebSocket", "Redis", "Docker"],
    github: "https://github.com/alexchen/codecollab",
    live: "https://codecollab.dev",
    challenges: "Implementing conflict-free replicated data types (CRDTs) for real-time text synchronization without data loss was the core challenge.",
    learnings: "Deep understanding of distributed systems, operational transforms, and WebSocket optimization for low-latency communication.",
  },
  {
    title: "MLPipeline",
    description: "Automated ML pipeline for training, evaluating, and deploying machine learning models at scale.",
    longDescription: "An end-to-end machine learning platform that automates data preprocessing, model training with hyperparameter optimization, evaluation, and deployment. Supports distributed training across multiple GPUs with fault tolerance.",
    category: "AI/ML",
    tech: ["Python", "PyTorch", "FastAPI", "Kubernetes", "PostgreSQL"],
    github: "https://github.com/alexchen/mlpipeline",
    live: "https://mlpipeline.dev",
    challenges: "Building fault-tolerant distributed training with checkpoint recovery and efficient resource scheduling across GPU nodes.",
    learnings: "Gained expertise in distributed computing, GPU optimization, and building production ML systems with proper monitoring.",
  },
  {
    title: "DistributedKV",
    description: "Distributed key-value store with Raft consensus, automatic sharding, and fault tolerance.",
    longDescription: "A distributed key-value database implementing the Raft consensus protocol for strong consistency. Features automatic data sharding, replica management, and transparent failover with sub-second recovery times.",
    category: "Systems",
    tech: ["Go", "gRPC", "Raft", "Protocol Buffers"],
    github: "https://github.com/alexchen/distributedkv",
    live: "",
    challenges: "Correctly implementing Raft consensus with log compaction, snapshotting, and membership changes while maintaining linearizability.",
    learnings: "Thorough understanding of consensus algorithms, network partitioning handling, and performance optimization in distributed storage.",
  },
  {
    title: "AlgoViz",
    description: "Interactive algorithm visualization platform with 50+ algorithms and step-by-step execution.",
    longDescription: "An educational platform for visualizing algorithms and data structures. Features step-by-step execution, speed control, custom input, and detailed complexity analysis for each algorithm.",
    category: "Web",
    tech: ["React", "TypeScript", "Tailwind CSS", "Canvas API"],
    github: "https://github.com/alexchen/algoviz",
    live: "https://algoviz.dev",
    challenges: "Creating smooth animations for complex data structure operations while maintaining accurate state representation.",
    learnings: "Advanced canvas rendering techniques, animation optimization, and how to make complex algorithms accessible to beginners.",
  },
  {
    title: "CPHelper",
    description: "CLI tool for competitive programming with auto-testing, template generation, and submission.",
    longDescription: "A command-line toolkit that streamlines the competitive programming workflow. Auto-parses sample tests from contest pages, generates boilerplate in C++/Python, runs parallel test cases, and submits solutions directly.",
    category: "Competitive Programming",
    tech: ["Rust", "Python", "REST APIs", "CLI"],
    github: "https://github.com/alexchen/cphelper",
    live: "",
    challenges: "Building a reliable web scraper for multiple competitive programming platforms with varying DOM structures.",
    learnings: "Rust systems programming, efficient process management, and building developer tools with excellent UX.",
  },
  {
    title: "SmartDeploy",
    description: "AI-powered deployment platform with automatic rollbacks, canary releases, and cost optimization.",
    longDescription: "An intelligent deployment platform that uses ML to predict deployment failures, automatically manages canary releases, and optimizes cloud resource allocation to reduce costs by up to 40%.",
    category: "AI/ML",
    tech: ["Python", "Kubernetes", "Terraform", "AWS", "React"],
    github: "https://github.com/alexchen/smartdeploy",
    live: "https://smartdeploy.io",
    challenges: "Training accurate failure prediction models with limited historical deployment data and high class imbalance.",
    learnings: "Cloud infrastructure automation, MLOps best practices, and building reliable systems with multiple failure modes.",
  },
  {
    title: "NetSim",
    description: "Network protocol simulator for TCP/IP, BGP, and OSPF with real-time packet visualization.",
    longDescription: "A network simulation tool that allows users to design network topologies and simulate packet routing through various protocols. Includes real-time visualization of packet flow, congestion, and routing table updates.",
    category: "Systems",
    tech: ["C++", "Qt", "Python", "NetworkX"],
    github: "https://github.com/alexchen/netsim",
    live: "",
    challenges: "Accurately simulating timing-dependent network protocols while maintaining interactive visualization performance.",
    learnings: "Deep understanding of networking protocols, event-driven simulation architecture, and real-time rendering optimization.",
  },
  {
    title: "DataDash",
    description: "Real-time analytics dashboard with customizable widgets, data connectors, and alerting.",
    longDescription: "A configurable analytics dashboard platform supporting multiple data sources including SQL databases, REST APIs, and streaming data. Features drag-and-drop widget creation, real-time data refresh, and threshold-based alerting.",
    category: "Web",
    tech: ["Next.js", "PostgreSQL", "Redis", "WebSocket", "D3.js"],
    github: "https://github.com/alexchen/datadash",
    live: "https://datadash.dev",
    challenges: "Efficiently rendering hundreds of real-time charts while keeping the UI responsive and memory usage bounded.",
    learnings: "Data visualization at scale, WebSocket connection management, and building extensible plugin architectures.",
  },
]

const categories = ["All", "Web", "AI/ML", "Systems", "Competitive Programming"]

export function ProjectsSection() {
  const [filter, setFilter] = useState("All")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const filtered = filter === "All"
    ? projects
    : projects.filter((p) => p.category === filter)

  return (
    <section id="projects" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Projects"
          subtitle="Selected work across systems, web, and AI"
        />

        {/* Filters */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                filter === cat
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <button
              key={project.title}
              onClick={() => setSelectedProject(project)}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
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
