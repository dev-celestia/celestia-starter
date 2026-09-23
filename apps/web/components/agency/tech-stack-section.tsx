"use client"

import * as React from "react"
import {
  Badge,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

const CATEGORIES = [
  {
    id: "frontend",
    label: "Frontend",
    techs: [
      { name: "React", tag: "UI Library" },
      { name: "Next.js", tag: "Framework" },
      { name: "TypeScript", tag: "Language" },
      { name: "Vue", tag: "UI Library" },
      { name: "Angular", tag: "Framework" },
      { name: "Tailwind CSS", tag: "Styling" },
      { name: "Framer Motion", tag: "Animation" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    techs: [
      { name: "Node.js", tag: "Runtime" },
      { name: "Go", tag: "Language" },
      { name: "Python / Django", tag: "Framework" },
      { name: "Java / Spring", tag: "Framework" },
      { name: ".NET / C#", tag: "Framework" },
      { name: "Hono", tag: "API Framework" },
      { name: "GraphQL", tag: "API Layer" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    techs: [
      { name: "Flutter", tag: "Cross-platform" },
      { name: "React Native", tag: "Cross-platform" },
      { name: "Swift", tag: "iOS" },
      { name: "Kotlin", tag: "Android" },
      { name: "Expo", tag: "Toolchain" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    techs: [
      { name: "AWS", tag: "Cloud" },
      { name: "GCP", tag: "Cloud" },
      { name: "Azure", tag: "Cloud" },
      { name: "Docker", tag: "Containers" },
      { name: "Kubernetes", tag: "Orchestration" },
      { name: "Terraform", tag: "IaC" },
      { name: "GitHub Actions", tag: "CI/CD" },
    ],
  },
  {
    id: "data",
    label: "Data & AI",
    techs: [
      { name: "PostgreSQL", tag: "Database" },
      { name: "MongoDB", tag: "Database" },
      { name: "Redis", tag: "Cache" },
      { name: "Drizzle ORM", tag: "ORM" },
      { name: "PyTorch", tag: "ML" },
      { name: "OpenAI APIs", tag: "AI" },
      { name: "Pinecone", tag: "Vector DB" },
    ],
  },
]

export function TechStackSection() {
  return (
    <section id="tech-stack" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" mono className="mb-3 uppercase tracking-wider text-xs">
            Tech Stack
          </Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            Modern tools, proven in production
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
            We stay technology-agnostic and recommend the right tool for the job —
            not whatever is currently trendy.
          </p>
        </div>
      </Reveal>

      <div className="mt-12">
        <Tabs defaultValue="frontend" className="items-center">
          <div className="flex justify-center">
            <TabsList variant="default" className="flex-wrap h-auto p-1">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-3.5 py-1.5">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {cat.techs.map((tech) => (
                  <Card
                    key={tech.name}
                    size="sm"
                    className="flex flex-col items-center justify-center p-4 text-center transition-all duration-200 hover:ring-foreground/20"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary font-bold text-xs">
                      {tech.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-foreground leading-tight">
                      {tech.name}
                    </p>
                    <Badge variant="secondary" size="sm" mono className="mt-1 text-[9px]">
                      {tech.tag}
                    </Badge>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
