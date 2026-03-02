/**
 * fetch-github-data.mjs
 *
 * Run at CI build time (NOT in the browser).
 * Fetches GitHub contribution history for all years since account creation
 * and writes the result to public/github-data.json.
 *
 * Required env var: GITHUB_TOKEN  (set as a GitHub Actions secret)
 * Required env var: GITHUB_HANDLE (e.g. "agrimgarg08")
 *
 * Usage:
 *   node scripts/fetch-github-data.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_FILE = path.join(__dirname, "..", "public", "github-data.json")

const token = process.env.GITHUB_TOKEN
const handle = process.env.GITHUB_HANDLE

if (!token) {
    console.error("❌  GITHUB_TOKEN env var is not set")
    process.exit(1)
}
if (!handle) {
    console.error("❌  GITHUB_HANDLE env var is not set")
    process.exit(1)
}

async function gql(query, variables = {}) {
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
    })
    if (!res.ok) throw new Error(`GitHub GraphQL HTTP ${res.status}`)
    const json = await res.json()
    if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL error")
    return json.data
}

async function main() {
    console.log(`⏳  Fetching GitHub data for @${handle} …`)

    // 1. Get account creation year + public repo count
    const initData = await gql(`
    query($login: String!) {
      user(login: $login) {
        createdAt
        repositories(privacy: PUBLIC, ownerAffiliations: OWNER) {
          totalCount
        }
      }
    }
  `, { login: handle })

    const creationYear = new Date(initData.user.createdAt).getFullYear()
    const currentYear = new Date().getFullYear()
    const totalRepos = initData.user.repositories.totalCount

    console.log(`   Account created: ${creationYear}  |  Public repos: ${totalRepos}`)

    // 2. Parallel-fetch all years
    const yearQueries = []
    for (let y = creationYear; y <= currentYear; y++) {
        yearQueries.push(
            gql(`
        query($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `, {
                login: handle,
                from: `${y}-01-01T00:00:00Z`,
                to: `${y}-12-31T23:59:59Z`,
            })
        )
    }

    const yearResults = await Promise.all(yearQueries)

    const map = {}
    let totalContributions = 0

    for (const data of yearResults) {
        const cal = data?.user?.contributionsCollection?.contributionCalendar
        if (!cal) continue
        totalContributions += cal.totalContributions
        for (const week of cal.weeks) {
            for (const day of week.contributionDays) {
                map[day.date] = day.contributionCount
            }
        }
    }

    const heatmap = Object.entries(map)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

    const output = {
        generatedAt: new Date().toISOString(),
        handle,
        totalContributions,
        totalRepos,
        heatmap,
    }

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
    fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2))

    console.log(`✅  Written ${heatmap.length} days → public/github-data.json`)
    console.log(`   Total contributions: ${totalContributions}`)
}

main().catch((err) => {
    console.error("❌  fetch-github-data failed:", err.message)
    process.exit(1)
})
