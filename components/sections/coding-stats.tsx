"use client"

import { useState } from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts"
import { SectionHeading, AnimatedCounter } from "@/components/ui-helpers"
import { cn } from "@/lib/utils"
import {
  ExternalLink,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// --- Mock Data ---

const platforms = [
  {
    name: "LeetCode",
    rating: 2200,
    rank: "Knight",
    problems: 823,
    badges: 15,
    url: "https://leetcode.com/u/alexchen",
    color: "#FFA116",
  },
  {
    name: "Codeforces",
    rating: 1850,
    rank: "Expert",
    problems: 620,
    badges: 8,
    url: "https://codeforces.com/profile/alexchen",
    color: "#1F8ACB",
  },
  {
    name: "CodeChef",
    rating: 1920,
    rank: "3 Star",
    problems: 340,
    badges: 5,
    url: "https://codechef.com/users/alexchen",
    color: "#5B4638",
  },
  {
    name: "HackerRank",
    rating: 2150,
    rank: "Gold",
    problems: 180,
    badges: 12,
    url: "https://hackerrank.com/alexchen",
    color: "#00EA64",
  },
  {
    name: "GitHub",
    rating: 1200,
    rank: "Active",
    problems: 1200,
    badges: 6,
    url: "https://github.com/alexchen",
    color: "#8B5CF6",
  },
]

// Deterministic seeded random to avoid hydration mismatch
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Pre-computed static heatmap data (deterministic, no Date/Math.random)
const HEATMAP_DATA: { date: string; count: number }[][] = (() => {
  const rand = seededRandom(42)
  const data: { date: string; count: number }[][] = []
  // Use a fixed reference date to avoid server/client date drift
  const refYear = 2025
  const refMonth = 11 // December (0-indexed)
  const refDay = 31
  for (let w = 51; w >= 0; w--) {
    const week: { date: string; count: number }[] = []
    for (let d = 0; d < 7; d++) {
      const daysAgo = w * 7 + (6 - d)
      const date = new Date(refYear, refMonth, refDay - daysAgo)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const r = rand()
      const count = r > 0.3 ? Math.floor(rand() * 8) : 0
      week.push({ date: `${y}-${m}-${day}`, count })
    }
    data.push(week)
  }
  return data
})()

// Rating history mock data
const ratingHistory = [
  { contest: "Round 820", date: "Jan '24", rating: 1580, change: 45 },
  { contest: "Round 825", date: "Feb '24", rating: 1620, change: 40 },
  { contest: "Round 831", date: "Mar '24", rating: 1590, change: -30 },
  { contest: "Round 836", date: "Apr '24", rating: 1650, change: 60 },
  { contest: "Round 842", date: "May '24", rating: 1710, change: 60 },
  { contest: "Round 847", date: "Jun '24", rating: 1680, change: -30 },
  { contest: "Round 852", date: "Jul '24", rating: 1740, change: 60 },
  { contest: "Round 858", date: "Aug '24", rating: 1780, change: 40 },
  { contest: "Round 863", date: "Sep '24", rating: 1750, change: -30 },
  { contest: "Round 870", date: "Oct '24", rating: 1810, change: 60 },
  { contest: "Round 876", date: "Nov '24", rating: 1830, change: 20 },
  { contest: "Round 882", date: "Dec '24", rating: 1850, change: 20 },
]

const contestHistory = [
  { name: "Codeforces Round 882", platform: "Codeforces", rank: 342, change: "+20", date: "Dec 15, 2024" },
  { name: "Weekly Contest 431", platform: "LeetCode", rank: 156, change: "+35", date: "Dec 8, 2024" },
  { name: "Codeforces Round 876", platform: "Codeforces", rank: 289, change: "+20", date: "Nov 24, 2024" },
  { name: "Starters 164", platform: "CodeChef", rank: 412, change: "+18", date: "Nov 20, 2024" },
  { name: "Weekly Contest 428", platform: "LeetCode", rank: 98, change: "+52", date: "Nov 10, 2024" },
  { name: "Codeforces Round 870", platform: "Codeforces", rank: 198, change: "+60", date: "Oct 28, 2024" },
  { name: "Biweekly Contest 144", platform: "LeetCode", rank: 205, change: "+28", date: "Oct 19, 2024" },
  { name: "Codeforces Round 863", platform: "Codeforces", rank: 510, change: "-30", date: "Sep 22, 2024" },
  { name: "Starters 155", platform: "CodeChef", rank: 321, change: "+25", date: "Sep 11, 2024" },
  { name: "Codeforces Round 858", platform: "Codeforces", rank: 275, change: "+40", date: "Aug 18, 2024" },
]

function getHeatColor(count: number): string {
  if (count === 0) return "bg-secondary"
  if (count <= 2) return "bg-chart-3/25"
  if (count <= 4) return "bg-chart-3/50"
  if (count <= 6) return "bg-chart-3/75"
  return "bg-chart-3"
}

// --- Heatmap ---

function ContributionHeatmap() {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Contribution Activity</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px]" style={{ minWidth: 700 }}>
          {HEATMAP_DATA.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={cn(
                    "h-3 w-3 rounded-sm transition-all duration-150 hover:ring-1 hover:ring-primary/50",
                    getHeatColor(day.count)
                  )}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-secondary" />
          <div className="h-3 w-3 rounded-sm bg-chart-3/25" />
          <div className="h-3 w-3 rounded-sm bg-chart-3/50" />
          <div className="h-3 w-3 rounded-sm bg-chart-3/75" />
          <div className="h-3 w-3 rounded-sm bg-chart-3" />
        </div>
        <span>More</span>
      </div>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltip.x - 40, top: tooltip.y - 50 }}
        >
          <span className="font-medium text-popover-foreground">{tooltip.count} submissions</span>
          <br />
          <span className="text-muted-foreground">{tooltip.date}</span>
        </div>
      )}
    </div>
  )
}

// --- Rating Graph ---

function RatingGraph() {
  const indigo = "#818CF8"
  const indigoBg = "rgba(129, 140, 248, 0.1)"

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Rating Progress</h3>
        <div className="flex items-center gap-1 text-xs text-chart-3">
          <TrendingUp className="h-3.5 w-3.5" />
          +270 this year
        </div>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ratingHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={indigo} stopOpacity={0.2} />
                <stop offset="95%" stopColor={indigo} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              domain={[1500, 1900]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="rating"
              stroke={indigo}
              strokeWidth={2}
              fill="url(#ratingGradient)"
              dot={{ r: 4, fill: indigo, stroke: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: indigo }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// --- Contest History ---

function ContestHistoryTable() {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? contestHistory : contestHistory.slice(0, 5)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Contests</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <th className="pb-3 pr-4">Contest</th>
              <th className="pb-3 pr-4">Platform</th>
              <th className="pb-3 pr-4 text-right">Rank</th>
              <th className="pb-3 pr-4 text-right">Rating</th>
              <th className="pb-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayed.map((c, i) => (
              <tr key={i} className="group transition-colors hover:bg-secondary/50">
                <td className="py-3 pr-4 font-medium text-foreground">{c.name}</td>
                <td className="py-3 pr-4 text-muted-foreground">{c.platform}</td>
                <td className="py-3 pr-4 text-right font-mono text-foreground">#{c.rank}</td>
                <td className="py-3 pr-4 text-right">
                  <span className={cn(
                    "inline-flex items-center gap-0.5 font-mono text-sm font-medium",
                    c.change.startsWith("+") ? "text-chart-3" : "text-chart-5"
                  )}>
                    {c.change.startsWith("+") ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {c.change}
                  </span>
                </td>
                <td className="py-3 text-right text-muted-foreground">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {contestHistory.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {showAll ? (
            <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>Show All ({contestHistory.length}) <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      )}
    </div>
  )
}

// --- Main Export ---

export function CodingStatsSection() {
  return (
    <section id="coding-stats" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Coding Stats"
          subtitle="Analytics dashboard across competitive programming platforms"
        />

        {/* Platform cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{p.name}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {p.name === "GitHub" ? (
                  <AnimatedCounter target={p.problems} suffix="" />
                ) : (
                  <AnimatedCounter target={p.rating} suffix="" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {p.name === "GitHub" ? "contributions" : "rating"}
                </span>
                <span
                  className="rounded-md px-2 py-0.5 font-medium"
                  style={{
                    backgroundColor: `${p.color}20`,
                    color: p.color,
                  }}
                >
                  {p.rank}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {p.name === "GitHub" ? `${p.badges} repos` : `${p.problems} solved`}
              </div>
            </a>
          ))}
        </div>

        {/* Heatmap */}
        <div className="mb-8">
          <ContributionHeatmap />
        </div>

        {/* Rating graph + Contest history */}
        <div className="grid gap-8 lg:grid-cols-2">
          <RatingGraph />
          <ContestHistoryTable />
        </div>
      </div>
    </section>
  )
}
