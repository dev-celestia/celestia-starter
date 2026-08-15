import { Reveal } from "./reveal"
import { InstallTerminal } from "./terminal"

export function InstallSection() {
  return (
    <section id="install" className="mx-auto w-full max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="text-3xl tracking-[-0.02em] text-balance sm:text-4xl">
            From npx to pnpm dev
          </h2>
          <p className="mt-5 text-fog leading-relaxed">
            One command clones the template, then walks you through the rest:
            pick features, write env files, install dependencies, push the
            schema. You land in a repository you already understand.
          </p>
          <ul className="mt-8 space-y-4 font-mono text-sm text-fog">
            <li className="flex items-baseline gap-3">
              <span className="text-[#89aacc]">✔</span>
              <span>Features are optional — auth, dashboard, blog</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-[#89aacc]">✔</span>
              <span>Dependencies and env vars keyed per package</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-[#89aacc]">✔</span>
              <span>Git initialized on the last step</span>
            </li>
          </ul>
        </Reveal>

        <Reveal>
          <InstallTerminal />
        </Reveal>
      </div>
    </section>
  )
}
