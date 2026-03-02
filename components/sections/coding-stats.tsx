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
import { cn } from "@/lib/utils"
import {
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

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
  date: string
}

const platformList: PlatformInfo[] = [
  {
    name: "LeetCode",
    handle: "agrimgarg",
    url: "https://leetcode.com/u/agrimgarg",
    color: "#FFA116",
  },
  {
    name: "Codeforces",
    handle: "agrimgarg",
    url: "https://codeforces.com/profile/agrimgarg",
    color: "#1F8ACB",
  },
  {
    name: "GitHub",
    handle: "agrimgarg08",
    url: "https://github.com/agrimgarg08",
    color: "#8B5CF6",
  },
]

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
  let prevDate: string | null = null
  entries.forEach(({ date, count }) => {
    if (count > 0) {
      if (prevDate && new Date(date).getTime() - new Date(prevDate).getTime() === 86400000) {
        current += 1
      } else {
        current = 1
      }
      max = Math.max(max, current)
    } else {
      current = 0
    }
    prevDate = date
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

  useEffect(() => {
    async function load() {
      try {
        const statusRes = await fetch(
          `https://codeforces.com/api/user.status?handle=${handle}`
        )
        const statusData = await statusRes.json()
        if (statusData.status === "OK") {
          const byDate: Record<string, number> = {}
          statusData.result.forEach((sub: any) => {
            if (sub.verdict === "OK") {
              const d = new Date(sub.creationTimeSeconds * 1000)
                .toISOString()
                .slice(0, 10)
              byDate[d] = (byDate[d] || 0) + 1
            }
          })
          setHeatmap(
            Object.entries(byDate).map(([date, count]) => ({ date, count }))
          )
        }

        const ratingRes = await fetch(
          `https://codeforces.com/api/user.rating?handle=${handle}`
        )
        const ratingData = await ratingRes.json()
        if (ratingData.status === "OK") {
          const hist = ratingData.result.map((r: any) => ({
            contest: r.contestName,
            date: new Date(r.ratingUpdateTimeSeconds * 1000)
              .toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            rating: r.newRating,
            change: r.newRating - r.oldRating,
          }))
          setRatingHistory(hist)
          setContests(
            ratingData.result.map((r: any) => ({
              name: r.contestName,
              platform: "Codeforces",
              rank: r.newRating, // placeholder
              change:
                (r.newRating - r.oldRating >= 0 ? "+" : "") +
                (r.newRating - r.oldRating),
              date: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
            }))
          )
        }
      } catch (e) {
        console.warn("CF fetch failed", e)
      }
    }
    load()
  }, [handle])

  return { heatmap, ratingHistory, contests }
}

// LeetCode API (GraphQL)
function useLeetCode(handle: string) {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [ratingHistory, setRatingHistory] = useState<RatingEntry[]>([])
  const [contests, setContests] = useState<ContestEntry[]>([])

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
        const calQuery = `
          query userProfileCalendar($username: String!, $year: Int) {
            matchedUser(username: $username) {
              userCalendar(year: $year) {
                activeYears
                submissionCalendar
              }
            }
          }
        `
        // fetch active years and then per-year calendars
        let combined: Record<string, number> = {}
        const baseRes = await fetch("/api/leetcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: calQuery, variables: { username: handle, year: null } }),
        })
        console.log("LeetCode baseRes status", baseRes.status)
        const baseJson = await baseRes.json()
        console.log("LeetCode baseJson", baseJson)
        const calendarInfo = baseJson.data?.matchedUser?.userCalendar
        if (calendarInfo) {
          const years: number[] = calendarInfo.activeYears || []
          for (const y of years) {
            const yearRes = await fetch("/api/leetcode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: calQuery, variables: { username: handle, year: y } }),
            })
            console.log("LeetCode year", y, "status", yearRes.status)
            const yearJson = await yearRes.json()
            console.log("LeetCode yearJson", yearJson)
            const calStr =
              yearJson.data?.matchedUser?.userCalendar?.submissionCalendar
            if (calStr) {
              try {
                const ycal: Record<string, number> = JSON.parse(calStr)
                Object.entries(ycal).forEach(([d, c]) => {
                  // original keys are unix seconds; convert to ISO date string
                  const iso = new Date(Number(d) * 1000)
                    .toISOString()
                    .slice(0, 10)
                  combined[iso] = (combined[iso] || 0) + c
                })
              } catch (err) {
                console.warn("parse calendar year", y, err)
              }
            }
          }
          setHeatmap(fillCalendar(combined))
        }

        // fetch contest ranking info
        const contestQuery = `
          query userContestRankingInfo($username: String!) {
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              totalParticipants
              topPercentage
              badge { name }
            }
            userContestRankingHistory(username: $username) {
              attended
              trendDirection
              problemsSolved
              totalProblems
              finishTimeInSeconds
              rating
              ranking
              contest { title startTime }
            }
          }
        `
        const rres = await fetch("/api/leetcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: contestQuery, variables: { username: handle } }),
        })
        console.log("LeetCode contest status", rres.status)
        const rjson = await rres.json()
        console.log("LeetCode contest json", rjson)
        const user = rjson.data
        if (user) {
          let hist: RatingEntry[] =
            rjson.data?.userContestRankingHistory.map((r: any) => {
              const iso = new Date(r.contest.startTime * 1000)
                .toISOString()
                .slice(0, 10)
              return {
                contest: r.contest.title,
                date: iso,
                displayDate: new Date(r.contest.startTime * 1000).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                ),
                rating: Math.round(r.rating),
              }
            }) || []
          // sort descending by date (most recent first)
          hist = hist.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setRatingHistory(hist)
          setContests(
            hist.map((h) => ({
              name: h.contest,
              platform: "LeetCode",
              rank: 0,
              change: "",
              date: h.displayDate,
            }))
          )
        }
      } catch (e) {
        console.warn("LeetCode fetch failed", e)
      }
    }
    load()
  }, [handle])

  return { heatmap, ratingHistory, contests }
}

// GitHub GraphQL (needs a token in NEXT_PUBLIC_GITHUB_TOKEN or similar)
function useGitHub(handle: string) {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [streaks, setStreaks] = useState<{ max: number; current: number }>({
    max: 0,
    current: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        // Use internal proxy to avoid exposing tokens client-side and to
        // ensure the server-side token (GITHUB_TOKEN) is used when available.
        const query = `
          query($login:String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
                totalCommitContributions
                maxConsecutiveCommitContributions
                currentConsecutiveCommitContributions
              }
            }
          }
        `
        const res = await fetch("/api/github", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, variables: { login: handle } }),
        })
        console.log("GitHub proxy status", res.status)
        const json = await res.json()
        console.log("GitHub json", json)
        const weeks =
          json.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
        const map: Record<string, number> = {}
        weeks.forEach((w: any) => {
          w.contributionDays.forEach((d: any) => {
            map[d.date] = d.contributionCount
          })
        })
        setHeatmap(
          Object.entries(map).map(([date, count]) => ({ date, count }))
        )
        const maxStreak =
          json.data?.user?.contributionsCollection?.maxConsecutiveCommitContributions || 0
        const currStreak =
          json.data?.user?.contributionsCollection?.currentConsecutiveCommitContributions || 0
        setStreaks({ max: maxStreak, current: currStreak })
      } catch (e) {
        console.warn("GitHub fetch failed", e)
      }
    }
    load()
  }, [handle])

  return { heatmap, streaks }
}

// -----------------------------------------------------------------------------
// UI components that accept dynamic data
// -----------------------------------------------------------------------------

interface HeatmapProps {
  data: HeatmapEntry[]
  viewMode: "activity" | "streak"
  streaks?: { max: number; current: number }
  problemStreaks?: { max: number; current: number }
  years?: number[]
  selectedYear?: number
  onYearChange?: (year: number) => void
}

function Heatmap({ data, viewMode, streaks, problemStreaks, years, selectedYear, onYearChange }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string
    count: number
    x: number
    y: number
  } | null>(null)

  const activeDays = useMemo(() => data.filter((e) => e.count > 0).length, [data])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {viewMode === "activity" ? "Activity Heatmap" : "Contributions Heatmap"}
        </h3>
        {viewMode === "activity" && years && selectedYear !== undefined && onYearChange && (
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="rounded bg-secondary px-2 py-1 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
      </div>

      {viewMode === "activity" && (
        <>
          <div className="mb-2">
            <span className="lc-md:text-xl mr-[5px] text-base font-medium">
              {data.reduce((sum, e) => sum + e.count, 0)}
            </span>
            <span className="lc-md:text-base whitespace-nowrap text-label-2 dark:text-dark-label-2">
              {viewMode === "activity" ? "submissions in the past one year" : "contributions in the past one year"}
            </span>
          </div>
          <div className="mb-2 flex gap-6 text-xs">
            <div>
              <span className="text-label-3 dark:text-dark-label-3">
                Total active days:
              </span>{" "}
              <span className="font-medium text-label-2 dark:text-dark-label-2">
                  {activeDays}
                </span>
            </div>
          </div>
        </>
      )}

      {viewMode === "activity" && problemStreaks && (
        <div className="mb-4 flex gap-6 text-xs">
          <div>Max streak: {problemStreaks.max} days</div>
          <div>Current streak: {problemStreaks.current} days</div>
        </div>
      )}
      {viewMode === "streak" && streaks && (
        <div className="mb-4 flex gap-6 text-xs">
          <div>Max streak: {streaks.max} days</div>
          <div>Current streak: {streaks.current} days</div>
        </div>
      )}

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
              const dow = d.getDay()
              if (prevDate && d.getMonth() !== prevDate.getMonth()) {
                // month boundary crossed -> commit current column with gap after it
                columns.push(col)
                gapAfter.push(true)
                col = newCol()
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
                          "h-3 w-3 rounded-sm transition-all duration-150 hover:ring-1 hover:ring-primary/50",
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
                {gapAfter[wi] && <div className="w-[12px] flex-shrink-0" />}
              </React.Fragment>
            ))
          })()}
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
            <span className="font-medium text-popover-foreground">
            {tooltip.count}
            {viewMode === "activity" ? " submissions" : " contributions"}
          </span>
          <br />
          <span className="text-muted-foreground">{tooltip.date}</span>
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

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Rating Progress</h3>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={indigo} stopOpacity={0.2} />
                <stop offset="95%" stopColor={indigo} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value, name, props) => {
                const idx = props.payloadIndex as number
                const entry = data[idx]
                return [`${value}`, `Rating`]
              }}
              labelFormatter={(label) => {
                const entry = data.find((d) => d.displayDate === label)
                return entry ? entry.contest : label
              }}
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

interface ContestHistoryTableProps {
  contests: ContestEntry[]
}

function ContestHistoryTable({ contests }: ContestHistoryTableProps) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? contests : contests.slice(0, 5)

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
      {contests.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {showAll ? (
            <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>Show All ({contests.length}) <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Main section component
// -----------------------------------------------------------------------------

export function CodingStatsSection() {
  const cf = useCodeforces("agrimgarg")
  const lc = useLeetCode("agrimgarg")
  const gh = useGitHub("agrimgarg08")

  const [heatmapMode, setHeatmapMode] = useState<"activity" | "streak">
    ("activity")
  const [ratingPlatform, setRatingPlatform] = useState<"LeetCode" | "Codeforces">
    ("LeetCode")

  // year selection for calendar
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // compute problem-only heatmap (leetcode + codeforces)
  const problemHeatmap = useMemo(() => {
    return mergeHeatmaps({ LeetCode: lc.heatmap, Codeforces: cf.heatmap })
  }, [lc.heatmap, cf.heatmap])

  const mergedHeatmap = useMemo(() => {
    if (heatmapMode === "activity") {
      // only show problem activity (exclude GitHub)
      return problemHeatmap
    }
    // for streak mode show GitHub contributions
    return gh.heatmap
  }, [heatmapMode, problemHeatmap, gh.heatmap])

  // list of years available for dropdown (down to 2022)
  const availableYears = useMemo(() => {
    const set = new Set<number>(mergedHeatmap.map(e => new Date(e.date).getFullYear()))
    const curr = new Date().getFullYear()
    for (let y = curr; y >= 2022; y--) set.add(y)
    return Array.from(set).sort((a, b) => b - a)
  }, [mergedHeatmap])

  // filter the merged heatmap to only show entries from selectedYear and fill missing days
  // ensure selectedYear is valid when availableYears update
  useEffect(() => {
    if (availableYears.length && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [availableYears, selectedYear])

  const yearHeatmap = useMemo(() => {
    const map: Record<string, number> = {}
    mergedHeatmap.forEach((e) => {
      if (new Date(e.date).getFullYear() === selectedYear) {
        map[e.date] = (map[e.date] || 0) + e.count
      }
    })
    const result: HeatmapEntry[] = []
    for (let d = new Date(selectedYear, 0, 1); d.getFullYear() === selectedYear; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10)
      result.push({ date: iso, count: map[iso] || 0 })
    }
    return result
  }, [mergedHeatmap, selectedYear])

  const streaks = useMemo(() => {
    if (heatmapMode === "streak") {
      return calcStreaks(gh.heatmap)
    }
    return undefined
  }, [heatmapMode, gh.heatmap])

  const problemStreaks = useMemo(() => {
    return calcStreaks(problemHeatmap)
  }, [problemHeatmap])

  // streaks specific to currently selected year (activity mode)
  const yearStreaks = useMemo(() => {
    return calcStreaks(yearHeatmap)
  }, [yearHeatmap])

  const ratingData = useMemo(() => {
    return ratingPlatform === "LeetCode" ? lc.ratingHistory : cf.ratingHistory
  }, [ratingPlatform, lc.ratingHistory, cf.ratingHistory])

  const contestData = useMemo(() => {
    return ratingPlatform === "LeetCode" ? lc.contests : cf.contests
  }, [ratingPlatform, lc.contests, cf.contests])

  return (
    <section id="coding-stats" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Coding Stats"
          subtitle="Analytics dashboard across competitive programming platforms"
        />

        {/* Platform cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {platformList.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {p.name}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {p.name === "GitHub" ? (
                  <AnimatedCounter target={gh.heatmap.reduce((a,b)=>a+b.count,0)} suffix="" />
                ) : p.name === "LeetCode" ? (
                  <AnimatedCounter target={lc.ratingHistory.slice(-1)[0]?.rating || 0} suffix="" />
                ) : (
                  <AnimatedCounter target={cf.ratingHistory.slice(-1)[0]?.rating || 0} suffix="" />
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
                  {/* placeholder rank */}
                  -
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {p.name === "GitHub" ? `repos` : `rating`}
              </div>
            </a>
          ))}
        </div>

        {/* heatmap controls */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setHeatmapMode("activity")}
            className={cn(
              "px-3 py-1 rounded-md text-sm",
              heatmapMode === "activity" ? "bg-primary text-primary-foreground" : "bg-secondary"
            )}
          >
            Problem Activity
          </button>
          <button
            onClick={() => setHeatmapMode("streak")}
            className={cn(
              "px-3 py-1 rounded-md text-sm",
              heatmapMode === "streak" ? "bg-primary text-primary-foreground" : "bg-secondary"
            )}
          >
            Streaks / Contributions
          </button>
        </div>


        <Heatmap
          data={yearHeatmap}
          viewMode={heatmapMode}
          streaks={streaks}
          problemStreaks={heatmapMode === "activity" ? yearStreaks : problemStreaks}
          years={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

        {/* rating selector */}
        <div className="mt-8 mb-4 flex gap-4">
          {(["LeetCode", "Codeforces"] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setRatingPlatform(plat)}
              className={cn(
                "px-3 py-1 rounded-md text-sm",
                ratingPlatform === plat ? "bg-primary text-primary-foreground" : "bg-secondary"
              )}
            >
              {plat}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <RatingGraph data={ratingData} />
          <ContestHistoryTable contests={contestData} />
        </div>
      </div>
    </section>
  )
}
