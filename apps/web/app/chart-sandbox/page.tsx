"use client"

import {
  ChartArea,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartRadial,
  ChartRadar,
  ChartSparkline,
} from "@celestia-project/ui"

const revenueData = [
  { month: "Jan", revenue: 4200, expenses: 2400 },
  { month: "Feb", revenue: 5100, expenses: 2900 },
  { month: "Mar", revenue: 4800, expenses: 2700 },
  { month: "Apr", revenue: 6200, expenses: 3100 },
  { month: "May", revenue: 5900, expenses: 3300 },
  { month: "Jun", revenue: 7400, expenses: 3600 },
]

const stackData = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 45 },
  { month: "Feb", desktop: 305, mobile: 200, tablet: 60 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 90 },
  { month: "Apr", desktop: 173, mobile: 190, tablet: 70 },
  { month: "May", desktop: 209, mobile: 130, tablet: 55 },
]

const barData = [
  { browser: "Chrome", visitors: 275 },
  { browser: "Safari", visitors: 200 },
  { browser: "Firefox", visitors: 187 },
  { browser: "Edge", visitors: 173 },
]

const pieData = [
  { name: "Direct", value: 300 },
  { name: "Organic", value: 220 },
  { name: "Referral", value: 140 },
  { name: "Social", value: 90 },
]

const radarData = [
  { skill: "Frontend", teamA: 86, teamB: 65 },
  { skill: "Backend", teamA: 72, teamB: 90 },
  { skill: "DevOps", teamA: 54, teamB: 78 },
  { skill: "Design", teamA: 91, teamB: 60 },
  { skill: "QA", teamA: 68, teamB: 82 },
]

const sparkData = [12, 18, 9, 22, 15, 27, 19, 31, 24]

function Sample({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export default function ChartSandboxPage() {
  return (
    <main className="min-h-screen space-y-10 bg-background p-10 text-foreground">
      <h1 className="text-xl font-bold">Chart sandbox — light</h1>
      <div className="grid grid-cols-2 gap-6">
        <Sample title="ChartArea (auto series)">
          <ChartArea data={revenueData} xKey="month" showLegend />
        </Sample>
        <Sample title="ChartArea stacked">
          <ChartArea data={stackData} xKey="month" stacked showLegend />
        </Sample>
        <Sample title="ChartBar">
          <ChartBar data={barData} xKey="browser" />
        </Sample>
        <Sample title="ChartBar horizontal">
          <ChartBar data={barData} xKey="browser" horizontal />
        </Sample>
        <Sample title="ChartBar stacked">
          <ChartBar data={stackData} xKey="month" stacked showLegend />
        </Sample>
        <Sample title="ChartLine with dots">
          <ChartLine data={revenueData} xKey="month" dots showLegend />
        </Sample>
        <Sample title="ChartPie">
          <ChartPie data={pieData} showLegend />
        </Sample>
        <Sample title="ChartPie donut + center">
          <ChartPie data={pieData} donut className="max-w-56">
            <span className="text-3xl font-bold tabular-nums">750</span>
            <span className="text-xs text-muted-foreground">Visitors</span>
          </ChartPie>
        </Sample>
        <Sample title="ChartRadial (default)">
          <ChartRadial value={65} />
        </Sample>
        <Sample title="ChartRadial (270° gauge, center children)">
          <ChartRadial
            value={42}
            max={80}
            startAngle={225}
            endAngle={-45}
            color="var(--chart-4)"
          >
            <span className="text-3xl font-bold tabular-nums">42/80</span>
            <span className="text-xs text-muted-foreground">Tasks done</span>
          </ChartRadial>
        </Sample>
        <Sample title="ChartRadar">
          <ChartRadar data={radarData} xKey="skill" showLegend />
        </Sample>
        <Sample title="ChartSparkline variants">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="w-16 text-xs">line</span>
              <ChartSparkline data={sparkData} className="w-40" showDot />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-xs">area</span>
              <ChartSparkline
                data={sparkData}
                variant="area"
                className="w-40"
                color="var(--chart-3)"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-xs">bar</span>
              <ChartSparkline
                data={sparkData}
                variant="bar"
                className="w-40"
                color="var(--chart-2)"
              />
            </div>
          </div>
        </Sample>
      </div>

      <h1 className="text-xl font-bold">Chart sandbox — dark</h1>
      <div className="dark">
        <div className="grid grid-cols-2 gap-6 rounded-xl bg-background p-6 text-foreground">
          <Sample title="ChartArea">
            <ChartArea data={revenueData} xKey="month" showLegend />
          </Sample>
          <Sample title="ChartBar stacked">
            <ChartBar data={stackData} xKey="month" stacked showLegend />
          </Sample>
          <Sample title="ChartPie donut">
            <ChartPie data={pieData} donut className="max-w-56">
              <span className="text-3xl font-bold tabular-nums">750</span>
            </ChartPie>
          </Sample>
          <Sample title="ChartRadial">
            <ChartRadial value={65} />
          </Sample>
          <Sample title="ChartRadar">
            <ChartRadar data={radarData} xKey="skill" showLegend />
          </Sample>
          <Sample title="ChartSparkline">
            <div className="flex items-center gap-4">
              <ChartSparkline
                data={sparkData}
                variant="area"
                className="w-40"
                showDot
              />
            </div>
          </Sample>
        </div>
      </div>
    </main>
  )
}
