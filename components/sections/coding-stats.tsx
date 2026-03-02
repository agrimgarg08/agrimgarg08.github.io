"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts"
import { SectionHeading, AnimatedCounter } from "@/components/ui-helpers"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import {
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useRef } from "react"

// -----------------------------------------------------------------------------
// Types & constants
// -----------------------------------------------------------------------------

type Platform = "LeetCode" | "Codeforces" | "GitHub"

interface PlatformInfo {
  name: Platform
  handle: string
  url: string
  color: string
}

interface HeatmapEntry {
  date: string
  count: number
}

interface RatingEntry {
  contest: string
  date: string      // ISO date used for sorting
  displayDate?: string // friendly label shown on axis
  rating: number
  change?: number
}

interface ContestEntry {
  name: string
  platform: Platform
  rank: number
  change: string
  date: string          // ISO YYYY-MM-DD — used for sorting
  displayDate?: string  // human-friendly label shown in the table
}

const platformList: PlatformInfo[] = [
  {
    name: "LeetCode",
    handle: siteConfig.handles.leetcode,
    url: siteConfig.links.leetcode,
    color: "#FFA116",
  },
  {
    name: "Codeforces",
    handle: siteConfig.handles.codeforces,
    url: siteConfig.links.codeforces,
    color: "#1F8ACB",
  },
  {
    name: "GitHub",
    handle: siteConfig.handles.github,
    url: siteConfig.links.github,
    color: "#8B5CF6",
  },
]

// LeetCode rank thresholds (based on contest rating)
function getLeetCodeRank(rating: number): { label: string; color: string } {
  if (rating >= 2228.90) return { label: "Guardian", color: "#699FE6" }
  if (rating >= 1842.73) return { label: "Knight", color: "#60CA9B" }
  return { label: "No Badge", color: "#CCCCCC" }
}

// Codeforces rank thresholds
function getCodeforcesRank(rating: number): { label: string; color: string } {
  if (rating >= 3000) return { label: "Legendary Grandmaster", color: "#FF0000" }
  if (rating >= 2600) return { label: "International Grandmaster", color: "#FF0000" }
  if (rating >= 2400) return { label: "Grandmaster", color: "#FF3333" }
  if (rating >= 2300) return { label: "International Master", color: "#FF8C00" }
  if (rating >= 2100) return { label: "Master", color: "#FF8C00" }
  if (rating >= 1900) return { label: "Candidate Master", color: "#AA00AA" }
  if (rating >= 1600) return { label: "Expert", color: "#0084FF" }
  if (rating >= 1400) return { label: "Specialist", color: "#03A89E" }
  if (rating >= 1200) return { label: "Pupil", color: "#03a903" }
  return { label: "Newbie", color: "#808080" }
}

// -----------------------------------------------------------------------------
// Helper functions for transforming API data
// -----------------------------------------------------------------------------

function mergeHeatmaps(heatmaps: Record<Platform, HeatmapEntry[]>) {
  // create a single map of date to total count
  const map: Record<string, number> = {}
  Object.values(heatmaps).forEach((entries) => {
    entries.forEach(({ date, count }) => {
      map[date] = (map[date] || 0) + count
    })
  })
  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function calcStreaks(entries: HeatmapEntry[]) {
  let max = 0
  let current = 0
  let prevDateStr: string | null = null
  entries.forEach(({ date, count }) => {
    if (count > 0) {
      // Compare dates by UTC day number to avoid DST 23/25-hour day bugs
      if (prevDateStr) {
        const prev = new Date(prevDateStr)
        const cur = new Date(date)
        // diff in whole UTC days
        const diffDays = Math.round(
          (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        )
        current = diffDays === 1 ? current + 1 : 1
      } else {
        current = 1
      }
      max = Math.max(max, current)
    } else {
      current = 0
    }
    prevDateStr = date
  })
  return { max, current }
}

function getHeatColor(count: number): string {
  if (count === 0) return "bg-secondary"
  if (count <= 2) return "bg-chart-3/25"
  if (count <= 4) return "bg-chart-3/50"
  if (count <= 6) return "bg-chart-3/75"
  return "bg-chart-3"
}

// -----------------------------------------------------------------------------
// Data-fetching hooks
// -----------------------------------------------------------------------------

// Codeforces API
function useCodeforces(handle: string) {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [ratingHistory, setRatingHistory] = useState<RatingEntry[]>([])
  const [contests, setContests] = useState<ContestEntry[]>([])
  const [totalSolved, setTotalSolved] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const CACHE_KEY = `codeforces_data_${handle}`
        const CACHE_EXPIRY = 60 * 60 * 1000 // 1 hour

        // 1. Check Cache
        const cachedStr = localStorage.getItem(CACHE_KEY)
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr)
            if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
              setHeatmap(cached.heatmap)
              setRatingHistory(cached.ratingHistory)
              setContests(cached.contests)
              if (cached.totalSolved != null) setTotalSolved(cached.totalSolved)
              return // skip fetching
            }
          } catch (e) {
            // cache invalid, ignore
          }
        }

        let finalHeatmap: HeatmapEntry[] = []
        let finalHist: RatingEntry[] = []
        let finalContests: ContestEntry[] = []

        // 2. Fetch User Status (for Heatmap)
        const statusRes = await fetch(
          `https://codeforces.com/api/user.status?handle=${handle}`
        )
        const statusData = await statusRes.json()
        let finalSolvedCF = 0
        if (statusData.status === "OK") {
          const byDate: Record<string, number> = {}
          const solvedSet = new Set<string>()
          statusData.result.forEach((sub: any) => {
            if (sub.verdict === "OK") {
              const d = new Date(sub.creationTimeSeconds * 1000)
                .toISOString()
                .slice(0, 10)
              byDate[d] = (byDate[d] || 0) + 1
              const key = `${sub.problem.contestId}-${sub.problem.index}`
              solvedSet.add(key)
            }
          })
          finalHeatmap = Object.entries(byDate).map(([date, count]) => ({ date, count }))
          setHeatmap(finalHeatmap)
          finalSolvedCF = solvedSet.size
          setTotalSolved(finalSolvedCF)
        }

        // 3. Fetch Rating History
        const ratingRes = await fetch(
          `https://codeforces.com/api/user.rating?handle=${handle}`
        )
        const ratingData = await ratingRes.json()
        if (ratingData.status === "OK") {
          finalHist = ratingData.result.map((r: any) => {
            const iso = new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10)
            return {
              contest: r.contestName,
              date: iso,
              displayDate: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              rating: r.newRating,
              change: r.newRating - r.oldRating,
            }
          })
          setRatingHistory(finalHist)

          finalContests = ratingData.result.map((r: any) => {
            const iso = new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10)
            return {
              name: r.contestName,
              platform: "Codeforces",
              rank: r.rank,
              change:
                (r.newRating - r.oldRating >= 0 ? "+" : "") +
                (r.newRating - r.oldRating),
              date: iso,
              displayDate: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            }
          })
          setContests(finalContests)
        }

        // 4. Save to Cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            heatmap: finalHeatmap,
            ratingHistory: finalHist,
            contests: finalContests,
            totalSolved: finalSolvedCF
          }))
        } catch (e) {
          console.warn("Failed saving CF cache", e)
        }
      } catch (e) {
        console.warn("CF fetch failed", e)
      }
    }
    load()
  }, [handle])

  return { heatmap, ratingHistory, contests, totalSolved }
}

// LeetCode API via alfa-leetcode-api public proxy (works on GitHub Pages / static exports)
function useLeetCode(handle: string) {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [ratingHistory, setRatingHistory] = useState<RatingEntry[]>([])
  const [contests, setContests] = useState<ContestEntry[]>([])
  const [totalSolved, setTotalSolved] = useState(0)

  // helper to fill gaps between dates
  function fillCalendar(entries: Record<string, number>): HeatmapEntry[] {
    const dates = Object.keys(entries).sort()
    if (dates.length === 0) return []
    const start = new Date(dates[0])
    const end = new Date(dates[dates.length - 1])
    const result: HeatmapEntry[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10)
      result.push({ date: iso, count: entries[iso] || 0 })
    }
    return result
  }

  useEffect(() => {
    async function load() {
      try {
        const CACHE_KEY = `leetcode_data_${handle}`
        const CACHE_EXPIRY = 60 * 60 * 1000 // 1 hour

        // 1. Check Cache
        const cachedStr = localStorage.getItem(CACHE_KEY)
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr)
            if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
              setHeatmap(cached.heatmap)
              setRatingHistory(cached.ratingHistory)
              setContests(cached.contests)
              if (cached.totalSolved != null) setTotalSolved(cached.totalSolved)
              return // skip fetching
            }
          } catch (e) {
            // cache invalid, ignore
          }
        }

        // 2. Fetch Base Calendar
        const calRes = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/calendar`)
        const calJson = await calRes.json()

        const combined: Record<string, number> = {}
        const activeYears: number[] = calJson.activeYears || []

        // Fetch all years in parallel to be fast
        const yearFetches = activeYears.map(year =>
          fetch(`https://alfa-leetcode-api.onrender.com/${handle}/calendar?year=${year}`)
            .then(res => res.json())
            .catch(err => {
              console.warn(`Failed fetching year ${year}`, err)
              return null
            })
        )

        const yearResults = await Promise.all(yearFetches)

        for (const yearData of yearResults) {
          if (!yearData) continue
          const calStr = yearData.submissionCalendar
          if (calStr) {
            try {
              const ycal: Record<string, number> = JSON.parse(calStr)
              Object.entries(ycal).forEach(([timestamp, count]) => {
                // timestamps are in unix seconds
                const iso = new Date(Number(timestamp) * 1000).toISOString().slice(0, 10)
                combined[iso] = (combined[iso] || 0) + count
              })
            } catch (err) {
              console.warn("Failed parsing calendar string", err)
            }
          }
        }

        const finalHeatmap = fillCalendar(combined)
        setHeatmap(finalHeatmap)

        // 3. Fetch Contest Ranking history
        const conRes = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/contest`)
        const conJson = await conRes.json()

        let prevRating = 1500 // LeetCode starting rating rating
        const historyRaw = conJson.contestParticipation || []

        let hist: RatingEntry[] = historyRaw.map((r: any) => {
          const iso = new Date(r.contest.startTime * 1000).toISOString().slice(0, 10)

          return {
            contest: r.contest.title,
            date: iso,
            displayDate: new Date(r.contest.startTime * 1000).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            ),
            rating: Math.round(r.rating),
          }
        })

        // Generate contest list (descending date) with display rank and change
        let computedContests: ContestEntry[] = historyRaw.map((r: any) => {
          const iso = new Date(r.contest.startTime * 1000).toISOString().slice(0, 10)
          const changeVal = r.rating - prevRating
          prevRating = r.rating // for next iteration

          return {
            name: r.contest.title,
            platform: "LeetCode",
            rank: r.ranking,
            change: (changeVal >= 0 ? "+" : "") + Math.round(changeVal),
            date: iso,
            displayDate: new Date(r.contest.startTime * 1000).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            ),
          }
        })

        // Sort histories explicitly
        hist.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        computedContests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setRatingHistory(hist)
        setContests(computedContests)

        // Fetch problems solved count
        let finalSolved = 0
        try {
          const solvedRes = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/solved`)
          const solvedJson = await solvedRes.json()
          finalSolved = solvedJson.solvedProblem || 0
          setTotalSolved(finalSolved)
        } catch (e) {
          console.warn("LeetCode solved fetch failed", e)
        }

        // 4. Save to Cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            heatmap: finalHeatmap,
            ratingHistory: hist,
            contests: computedContests,
            totalSolved: finalSolved
          }))
        } catch (e) {
          console.warn("Failed saving cache", e)
        }
      } catch (e) {
        console.warn("LeetCode fetch failed", e)
      }
    }
    if (handle) load()
  }, [handle])

  return { heatmap, ratingHistory, contests, totalSolved }
}

// GitHub data is fetched at BUILD TIME by scripts/fetch-github-data.mjs
// and written to public/github-data.json — no token is ever sent to the browser.
function useGitHub(handle: string) {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [streaks, setStreaks] = useState<{ max: number; current: number }>({
    max: 0,
    current: 0,
  })
  const [totalContributions, setTotalContributions] = useState(0)
  const [totalRepos, setTotalRepos] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const CACHE_KEY = `github_data_${handle}`
        const CACHE_EXPIRY = 60 * 60 * 1000 // 1 hour

        // 1. Check localStorage cache
        const cachedStr = localStorage.getItem(CACHE_KEY)
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr)
            if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
              setHeatmap(cached.heatmap)
              setStreaks(cached.streaks)
              setTotalContributions(cached.totalContributions)
              if (cached.totalRepos != null) setTotalRepos(cached.totalRepos)
              return
            }
          } catch {
            // cache invalid, continue to fetch
          }
        }

        // 2. Fetch the pre-built static JSON (no token needed)
        const res = await fetch("/github-data.json")
        if (!res.ok) throw new Error(`Failed to fetch github-data.json: ${res.status}`)

        const data = await res.json()

        // data shape: { totalContributions, totalRepos, heatmap: [{date, count}] }
        const finalHeatmap: HeatmapEntry[] = (data.heatmap ?? [])
          .sort((a: HeatmapEntry, b: HeatmapEntry) => a.date.localeCompare(b.date))

        const finalTotal: number = data.totalContributions ?? 0
        const finalRepos: number = data.totalRepos ?? 0
        const finalStreaks = calcStreaks(finalHeatmap)

        setHeatmap(finalHeatmap)
        setStreaks(finalStreaks)
        setTotalContributions(finalTotal)
        setTotalRepos(finalRepos)

        // 3. Cache in localStorage so subsequent visits are instant
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            heatmap: finalHeatmap,
            streaks: finalStreaks,
            totalContributions: finalTotal,
            totalRepos: finalRepos,
          }))
        } catch {
          // localStorage full or unavailable — silently ignore
        }
      } catch (e) {
        console.warn("GitHub data fetch failed:", e)
      }
    }
    load()
  }, [handle])

  return { heatmap, streaks, totalContributions, totalRepos }
}


// -----------------------------------------------------------------------------
// UI components that accept dynamic data
// -----------------------------------------------------------------------------

interface HeatmapProps {
  data: HeatmapEntry[]            // year-filtered data (for grid + activeDays)
  allTimeData: HeatmapEntry[]     // full all-time data (for max streak + current streak)
  viewMode: "activity" | "streak"
  streaks?: { max: number; current: number }   // GitHub streaks (all-time)
  years?: number[]
  selectedYear?: number
  onYearChange?: (year: number) => void
}

function Heatmap({ data, allTimeData, viewMode, streaks, years, selectedYear, onYearChange }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string
    count: number
    x: number
    y: number
  } | null>(null)
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!yearDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) {
        setYearDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [yearDropdownOpen])

  const activeDays = useMemo(() => data.filter((e) => e.count > 0).length, [data])
  const allTimeStreaks = useMemo(() => calcStreaks(allTimeData), [allTimeData])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Single header row: Submissions | stats | year dropdown */}
      <div className="mb-4 flex items-center gap-6">
        <div className="text-base font-semibold text-foreground leading-none shrink-0">
          {viewMode === "activity" ? "Submissions" : "Contributions"}:{" "}
          <span className="font-bold">{data.reduce((sum, e) => sum + e.count, 0)}</span>
        </div>

        {/* Stats — pushed to the right, before the dropdown */}
        <div className="ml-auto flex items-center gap-6 text-xs text-muted-foreground">
          {viewMode === "activity" && (
            <>
              <span>Active Days: <span className="font-medium text-foreground">{activeDays}</span></span>
              <span>Max Streak: <span className="font-medium text-foreground">{allTimeStreaks.max}</span></span>
              <span>Current Streak: <span className="font-medium text-foreground">{allTimeStreaks.current}</span></span>
            </>
          )}
          {viewMode === "streak" && streaks && (
            <>
              <span>Active Days: <span className="font-medium text-foreground">{activeDays}</span></span>
              <span>Max Streak: <span className="font-medium text-foreground">{streaks.max}</span></span>
              <span>Current Streak: <span className="font-medium text-foreground">{streaks.current}</span></span>
            </>
          )}
        </div>

        {years && selectedYear !== undefined && onYearChange && (
          <div ref={yearDropdownRef} className="relative shrink-0">
            <button
              onClick={() => setYearDropdownOpen((o) => !o)}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200",
                yearDropdownOpen
                  ? "border-primary/40 text-foreground shadow-sm shadow-primary/10"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {selectedYear}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  yearDropdownOpen && "rotate-180"
                )}
              />
            </button>
            {yearDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-1.5 min-w-[80px] overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/10">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => { onYearChange(y); setYearDropdownOpen(false) }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors duration-150",
                      y === selectedYear
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px]" style={{ minWidth: 700 }}>
          {/** build week-by-week grid with fixed weekday rows and month separators */}
          {(() => {
            // build columns: split at month boundary within weeks
            const columns: HeatmapEntry[][] = []
            const gapAfter: boolean[] = []

            // helper to create empty column
            const newCol = () => [...Array(7)].map(() => ({ date: "", count: 0 }))
            let col: HeatmapEntry[] = newCol()
            let prevDate: Date | null = null

            data.forEach((e) => {
              const d = new Date(e.date)
              // Use UTC methods: ISO date strings are UTC midnight, so getDay()
              // would give the wrong weekday in negative-offset timezones.
              const dow = d.getUTCDay()
              if (prevDate && d.getUTCMonth() !== prevDate.getUTCMonth()) {
                // Month boundary: if the col is empty it means the previous month
                // ended exactly on Saturday (dow=6 already committed it). In that
                // case just flip the last gapAfter from false → true instead of
                // pushing a blank column, which would create double spacing.
                if (col.some((x) => x.date !== "")) {
                  columns.push(col)
                  gapAfter.push(true)
                  col = newCol()
                } else {
                  if (gapAfter.length > 0) gapAfter[gapAfter.length - 1] = true
                }
              }
              col[dow] = e
              if (dow === 6) {
                columns.push(col)
                gapAfter.push(false)
                col = newCol()
              }
              prevDate = d
            })
            if (col.some((x) => x.date !== "")) {
              columns.push(col)
              gapAfter.push(false)
            }

            return columns.map((week, wi) => (
              <React.Fragment key={wi}>
                <div className="flex flex-col gap-[3px]">
                  {week.map((day, di) => {
                    if (!day.date) return <div key={di} className="h-3 w-3" />
                    return (
                      <div
                        key={di}
                        className={cn(
                          "h-3 w-3 rounded-sm transition-colors duration-150",
                          getHeatColor(day.count)
                        )}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip({
                            date: day.date,
                            count: day.count,
                            x: rect.left,
                            y: rect.top,
                          })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}
                </div>
                {gapAfter[wi] && <div className="w-[6px] flex-shrink-0" />}
              </React.Fragment>
            ))
          })()}
        </div>
      </div>
      {
        tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg text-center"
            style={{ left: tooltip.x - 40, top: tooltip.y - 50 }}
          >
            <span className="font-medium text-popover-foreground">
              {tooltip.count}{" "}
              {viewMode === "activity"
                ? tooltip.count === 1 ? "Submission" : "Submissions"
                : tooltip.count === 1 ? "Contribution" : "Contributions"}
            </span>
            <br />
            <span className="text-muted-foreground">
              {new Date(tooltip.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              })}
            </span>
          </div>
        )}
    </div>
  )
}

interface RatingGraphProps {
  data: RatingEntry[]
}

function RatingGraph({ data }: RatingGraphProps) {
  const indigo = "#818CF8"

  // Graph needs oldest→newest so the area chart goes left-to-right chronologically
  const ascending = useMemo(() =>
    [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data]
  )

  const [yMin, yMax] = useMemo(() => {
    if (!ascending.length) return [0, 2000]
    const ratings = ascending.map(d => d.rating)
    const min = Math.min(...ratings)
    const max = Math.max(...ratings)
    const lower = Math.max(0, Math.floor(min / 100) * 100 - 100)
    const upper = Math.ceil(max / 100) * 100 + 100
    return [lower, upper]
  }, [ascending])

  const startLabel = ascending.length > 0
    ? new Date(ascending[0].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : ""
  const endLabel = ascending.length > 0
    ? new Date(ascending[ascending.length - 1].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : ""

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Rating Progress</h3>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={ascending}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={indigo} stopOpacity={0.2} />
                <stop offset="95%" stopColor={indigo} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" hide />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              domain={[yMin, yMax]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const entry = payload[0].payload as RatingEntry
                return (
                  <div style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    maxWidth: 240,
                  }}>
                    <p style={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
                      {entry.contest}
                    </p>
                    <p style={{ color: "var(--muted-foreground)", marginBottom: 2 }}>{entry.displayDate ?? entry.date}</p>
                    <p style={{ color: indigo, fontWeight: 700, fontSize: 14 }}>Rating: {entry.rating}</p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="rating"
              stroke={indigo}
              strokeWidth={2}
              fill="url(#ratingGradient)"
              activeDot={{ r: 6, fill: indigo, fillOpacity: 1, stroke: "var(--background)", strokeWidth: 2 }}
              dot={{ r: 4, fill: indigo, fillOpacity: 1, stroke: "var(--background)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface ContestHistoryTableProps {
  contests: ContestEntry[]
}

function ContestHistoryTable({ contests }: ContestHistoryTableProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex-shrink-0 text-sm font-semibold text-foreground">Recent Contests</h3>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b border-border text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <th className="pb-3 pr-4">Contest</th>
              <th className="pb-3 pr-4 text-right">Rank</th>
              <th className="pb-3 pr-4 text-right">Rating</th>
              <th className="pb-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contests.map((c, i) => (
              <tr key={i} className="group transition-colors hover:bg-secondary/50">
                <td className="py-3 pr-4 font-medium text-foreground">{c.name}</td>
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
                    {c.change.replace(/^[+-]/, "")}
                  </span>
                </td>
                <td className="py-3 text-right text-muted-foreground whitespace-nowrap">
                  {c.displayDate ?? new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Main section component
// -----------------------------------------------------------------------------

export function CodingStatsSection() {
  const cf = useCodeforces(siteConfig.handles.codeforces)
  const lc = useLeetCode(siteConfig.handles.leetcode)
  const gh = useGitHub(siteConfig.handles.github)

  // ── Section 1: Heatmap mode ──
  // "Problem Solving" = merged LC + CF submissions | "Contributions" = GitHub
  const [heatmapMode, setHeatmapMode] = useState<"Problem Solving" | "Contributions">("Problem Solving")

  // ── Section 2: Contest platform (LeetCode | Codeforces) ──
  // Controls BOTH the rating graph and the contest table together
  const [contestPlatform, setContestPlatform] = useState<"LeetCode" | "Codeforces">("LeetCode")

  // year selection for heatmap calendar
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // ── Heatmap: raw data depends on mode ──
  // Problem Solving = merge LC + CF; Contributions = GitHub
  const lcCfMerged = useMemo(() => mergeHeatmaps({ LeetCode: lc.heatmap, Codeforces: cf.heatmap, GitHub: [] }), [lc.heatmap, cf.heatmap])
  const rawHeatmap = useMemo((): HeatmapEntry[] => {
    return heatmapMode === "Problem Solving" ? lcCfMerged : gh.heatmap
  }, [heatmapMode, lcCfMerged, gh.heatmap])

  // ── Years available in the heatmap dropdown ──
  const availableYears = useMemo(() => {
    const set = new Set<number>(rawHeatmap.map(e => new Date(e.date).getUTCFullYear()))
    set.add(new Date().getFullYear())
    return Array.from(set).sort((a, b) => b - a)
  }, [rawHeatmap])

  useEffect(() => {
    if (availableYears.length && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [availableYears, selectedYear])

  // ── Year-filtered heatmap (every day filled so grid is always complete) ──
  const yearHeatmap = useMemo(() => {
    const map: Record<string, number> = {}
    rawHeatmap.forEach((e) => {
      // ISO date strings are UTC midnight — use getUTCFullYear to avoid timezone shift
      if (new Date(e.date).getUTCFullYear() === selectedYear)
        map[e.date] = (map[e.date] || 0) + e.count
    })
    const result: HeatmapEntry[] = []
    for (let d = new Date(selectedYear, 0, 1); d.getFullYear() === selectedYear; d.setDate(d.getDate() + 1)) {
      // Build ISO string from local parts — avoids toISOString() UTC conversion
      // that shifts Jan 1 back to Dec 31 in UTC+5:30 and similar timezones
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      result.push({ date: iso, count: map[iso] || 0 })
    }
    return result
  }, [rawHeatmap, selectedYear])

  const yearStreaks = useMemo(() => calcStreaks(yearHeatmap), [yearHeatmap])
  const ghStreaks = useMemo(() => calcStreaks(gh.heatmap), [gh.heatmap])
  const heatmapViewMode = heatmapMode === "Contributions" ? "streak" : "activity"

  // ── Contest section: rating graph (ascending) ──
  const ratingData = useMemo(() => {
    const raw = contestPlatform === "LeetCode" ? lc.ratingHistory : cf.ratingHistory
    return [...raw].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [contestPlatform, lc.ratingHistory, cf.ratingHistory])

  // ── Contest section: contest table (descending: newest first) ──
  const contestData = useMemo(() => {
    const raw = contestPlatform === "LeetCode" ? lc.contests : cf.contests
    return [...raw].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [contestPlatform, lc.contests, cf.contests])

  return (
    <section id="coding-stats" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Coding Stats"
          subtitle="Analytics dashboard across competitive programming platforms"
        />

        {/* Platform summary cards — 3-col full-width */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {platformList.map((p) => {
            const lcRating = lc.ratingHistory.slice(-1)[0]?.rating || 0
            const cfRating = cf.ratingHistory.slice(-1)[0]?.rating || 0
            const rank = p.name === "LeetCode"
              ? getLeetCodeRank(lcRating)
              : p.name === "Codeforces"
                ? getCodeforcesRank(cfRating)
                : null
            return (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Header row: name + rank badge + external link */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{p.name}</span>
                    {rank && (
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `${rank.color}22`,
                          color: rank.color,
                          border: `1px solid ${rank.color}44`,
                        }}
                      >
                        {rank.label}
                      </span>
                    )}
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Stats row */}
                {p.name === "GitHub" ? (
                  <div className="flex items-stretch gap-4">
                    <div className="flex-1">
                      <div className="text-2xl font-bold font-mono text-foreground">
                        <AnimatedCounter target={gh.totalContributions} suffix="" />
                      </div>
                      <span className="text-xs text-muted-foreground">contributions</span>
                    </div>
                    <div className="w-px bg-border self-stretch" />
                    <div className="flex-1">
                      <div className="text-2xl font-bold font-mono text-foreground">
                        <AnimatedCounter target={gh.totalRepos} suffix="" />
                      </div>
                      <span className="text-xs text-muted-foreground">repos</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-stretch gap-4">
                    <div className="flex-1">
                      <div className="text-2xl font-bold font-mono text-foreground">
                        <AnimatedCounter target={p.name === "LeetCode" ? lcRating : cfRating} suffix="" />
                      </div>
                      <span className="text-xs text-muted-foreground">rating</span>
                    </div>
                    <div className="w-px bg-border self-stretch" />
                    <div className="flex-1">
                      <div className="text-2xl font-bold font-mono text-foreground">
                        <AnimatedCounter target={p.name === "LeetCode" ? lc.totalSolved : cf.totalSolved} suffix="" />
                      </div>
                      <span className="text-xs text-muted-foreground">solved</span>
                    </div>
                  </div>
                )}
              </a>
            )
          })}
        </div>

        {/* ── Section 1: Heatmap ── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["Problem Solving", "Contributions"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setHeatmapMode(mode)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                heatmapMode === mode
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        <Heatmap
          data={yearHeatmap}
          allTimeData={rawHeatmap}
          viewMode={heatmapViewMode}
          streaks={heatmapMode === "Contributions" ? ghStreaks : undefined}
          years={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

        {/* ── Section 2: Rating graph + Contest table ── */}
        <div className="mt-10 mb-4 flex flex-wrap items-center gap-2">
          {(["LeetCode", "Codeforces"] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setContestPlatform(plat)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                contestPlatform === plat
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {plat}
            </button>
          ))}
        </div>

        <div className="grid h-[420px] gap-8 lg:grid-cols-2">
          <RatingGraph data={ratingData} />
          <ContestHistoryTable contests={contestData} />
        </div>
      </div>
    </section >
  )
}
