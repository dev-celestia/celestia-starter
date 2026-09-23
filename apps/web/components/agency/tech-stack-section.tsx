"use client"

import {
  Badge,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { SectionHeading } from "./section-heading"

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
    <section
      id="tech-stack"
      className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Tech stack"
          title="Modern tools, proven in production"
          description="We stay technology-agnostic and recommend the right tool for the job — not whatever is currently trendy."
        />
      </Reveal>

      <Reveal>
        <Tabs defaultValue="frontend" className="mt-12 items-center">
          <div className="flex justify-center">
            <TabsList variant="default" className="h-auto flex-wrap p-1">
              {CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="px-3.5 py-1.5 text-xs"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-8">
              {/* The two-letter monogram that used to sit here ("RE" for React,
                  "NE" for Next.js) read as a broken logo. The name and the role
                  are the information; there is nothing to abbreviate. */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                {category.techs.map((tech) => (
                  <Card
                    key={tech.name}
                    size="sm"
                    className="items-center justify-center gap-2 p-4 text-center transition-colors duration-normal hover:ring-foreground/20"
                  >
                    <p className="text-xs font-semibold leading-tight text-foreground">
                      {tech.name}
                    </p>
                    <Badge variant="secondary" size="sm" mono className="text-3xs">
                      {tech.tag}
                    </Badge>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Reveal>
    </section>
  )
}
