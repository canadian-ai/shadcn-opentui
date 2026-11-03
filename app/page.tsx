"use client"

import type React from "react"
import { Command } from "@/components/command"
import type { CommandHandler } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  Github,
  TerminalIcon,
  Zap,
  Layers,
  Code2,
  Sparkles,
  Copy,
  Check,
  LayoutPanelTop,
  WandSparkles,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { MatrixRain } from "@/components/matrix-rain"
import { OpenTUIRuntimeStatusCard } from "@/components/opentui/runtime-status-card"
import { Terminal } from "@/components/ui/terminal"
import { TerminalThemeProvider, prebuiltThemes, useTerminalTheme, type ThemeConfig } from "@/lib/opentui/themes"
import { TerminalMessage } from "@/components/ui/terminal-message"
import { TerminalThinkingIndicator } from "@/components/ui/terminal-thinking-indicator"
import { TerminalStreamText } from "@/components/ui/terminal-stream-text"
import { TerminalSessionContent } from "@/components/ui/terminal-session-content"
import { TerminalEditBlock } from "@/components/ui/terminal-edit-block"
import { TerminalJsTable } from "@/components/ui/terminal-js-table"
import { TerminalEmailDraft } from "@/components/ui/terminal-email-draft"
import { TerminalParallelTasks, type ParallelTask } from "@/components/ui/terminal-parallel-tasks"
import { AgentQuickstartCard } from "@/components/docs/agent-quickstart-card"

const homePreviewThemeNames = ["matrix", "tokyo-night", "catppuccin", "cai-dark", "cai-light"]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors p-1">
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function AnimatedThemeSelectorDemoContent() {
  const { theme: selectedTheme, setTheme } = useTerminalTheme()
  const [autoPreview, setAutoPreview] = useState(false)

  const previewThemes = useMemo(
    () =>
      homePreviewThemeNames
        .map((name) => prebuiltThemes.find((theme) => theme.name === name))
        .filter(Boolean) as ThemeConfig[],
    [],
  )

  useEffect(() => {
    if (!autoPreview || previewThemes.length === 0) return

    const timer = window.setInterval(() => {
      const currentIndex = previewThemes.findIndex((theme) => theme.name === selectedTheme.name)
      const nextTheme = previewThemes[(currentIndex + 1) % previewThemes.length]
      setTheme(nextTheme.name)
    }, 1500)

    return () => window.clearInterval(timer)
  }, [autoPreview, previewThemes, selectedTheme.name, setTheme])

  const chooseTheme = (name: string) => {
    setAutoPreview(false)
    setTheme(name)
  }

  const commands: Record<string, CommandHandler> = {
    colors: {
      name: "colors",
      description: "Show active theme colors",
      handler: (_args, context) => {
        context?.addLines?.([
          `Theme: ${selectedTheme.displayName}`,
          `Background: ${selectedTheme.colors.background}`,
          `Text: ${selectedTheme.colors.text}`,
          `Primary: ${selectedTheme.colors.primary}`,
        ])
      },
    },
  }

  return (
    <div
      className="md:col-span-3 rounded-xl border bg-black shadow-lg overflow-hidden transition-colors duration-500"
      onFocusCapture={() => setAutoPreview(false)}
      style={{ borderColor: selectedTheme.colors.border, boxShadow: `0 25px 60px -24px ${selectedTheme.colors.primary}` }}
    >
      <div
        className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ backgroundColor: selectedTheme.colors.backgroundPanel, borderColor: selectedTheme.colors.border }}
      >
        <div>
          <div className="text-xs font-mono font-semibold" style={{ color: selectedTheme.colors.primary }}>
            Animated theme selector
          </div>
          <div className="text-xs" style={{ color: selectedTheme.colors.textMuted }}>
            Choose a theme or type <span className="font-mono">theme</span> for keyboard navigation.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {previewThemes.map((theme) => (
            <button
              key={theme.name}
              type="button"
              onClick={() => chooseTheme(theme.name)}
              className="h-8 rounded-full border px-3 text-xs font-mono transition-all duration-300"
              style={{
                backgroundColor: theme.name === selectedTheme.name ? theme.colors.primary : theme.colors.backgroundElement,
                borderColor: theme.name === selectedTheme.name ? theme.colors.primary : theme.colors.border,
                color: theme.name === selectedTheme.name ? theme.colors.textInverse : theme.colors.text,
              }}
            >
              {theme.displayName}
            </button>
          ))}
        </div>
      </div>
      <Terminal
        commands={commands}
        welcomeMessage={[
          `Live theme preview: ${selectedTheme.displayName}`,
          "Type 'theme' for keyboard navigation, preview-on-arrow, Enter-to-save.",
          "Type 'colors' to print the active palette.",
        ]}
        className="h-[320px] rounded-none border-0 shadow-none"
        prompt="→"
      />
    </div>
  )
}

function LandingDemoShowcase() {
  const [slide, setSlide] = useState<"theme" | "agent">("theme")

  return (
    <TerminalThemeProvider defaultTheme="matrix">
      <div className="space-y-6">
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setSlide("theme")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-mono transition-all ${
              slide === "theme"
                ? "border-primary bg-primary/20 text-primary"
                : "border-primary/30 text-muted-foreground hover:text-primary"
            }`}
          >
            <WandSparkles className="w-4 h-4" />
            Theme selection
          </button>
          <button
            type="button"
            onClick={() => setSlide("agent")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-mono transition-all ${
              slide === "agent"
                ? "border-primary bg-primary/20 text-primary"
                : "border-primary/30 text-muted-foreground hover:text-primary"
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
            Agent session
          </button>
        </div>

        {slide === "theme" ? <AnimatedThemeSelectorDemoContent /> : <AgentSlideWithAutoStart />}
      </div>
    </TerminalThemeProvider>
  )
}

function ParallelTasksRunner({ useCaseDep }: { useCaseDep: number }) {
  const [pts, setPts] = useState<ParallelTask[]>([
    { id: "lint", label: "lint --fix", status: "pending", duration: "---" },
    { id: "typecheck", label: "typecheck", status: "pending", duration: "---" },
    { id: "test", label: "test --run", status: "pending", duration: "---" },
    { id: "build", label: "build --prod", status: "pending", duration: "---" },
  ])

  useEffect(() => {
    setPts([
      { id: "lint", label: "lint --fix", status: "pending", duration: "---" },
      { id: "typecheck", label: "typecheck", status: "pending", duration: "---" },
      { id: "test", label: "test --run", status: "pending", duration: "---" },
      { id: "build", label: "build --prod", status: "pending", duration: "---" },
    ])
    const start = Date.now()

    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      setPts((prev) =>
        prev.map((t) => {
          if (t.id === "lint") {
            if (elapsed < 0.8) return { ...t, status: "running" as const, progress: Math.round((elapsed / 0.8) * 100), duration: `${elapsed.toFixed(1)}s` }
            return { ...t, status: "success" as const, progress: 100, duration: "0.8s" }
          }
          if (t.id === "typecheck") {
            if (elapsed < 0.4) return { ...t, status: "pending" as const }
            const runElapsed = elapsed - 0.4
            const prog = Math.min(100, Math.round((runElapsed / 1.2) * 100))
            if (elapsed < 1.6) return { ...t, status: "running" as const, progress: prog, duration: `${runElapsed.toFixed(1)}s` }
            return { ...t, status: "success" as const, progress: 100, duration: "1.6s" }
          }
          if (t.id === "test") {
            if (elapsed < 0.9) return { ...t, status: "pending" as const }
            const runElapsed = elapsed - 0.9
            const prog = Math.min(100, Math.round((runElapsed / 1.5) * 100))
            if (elapsed < 2.4) return { ...t, status: "running" as const, progress: prog, duration: `${runElapsed.toFixed(1)}s` }
            return { ...t, status: "success" as const, progress: 100, duration: "1.5s" }
          }
          if (t.id === "build") {
            if (elapsed < 1.5) return { ...t, status: "pending" as const }
            const runElapsed = elapsed - 1.5
            const prog = Math.min(100, Math.round((runElapsed / 1.8) * 100))
            if (elapsed < 3.3) return { ...t, status: "running" as const, progress: prog, duration: `${runElapsed.toFixed(1)}s` }
            return { ...t, status: "success" as const, progress: 100, duration: "1.8s" }
          }
          return t
        }),
      )
    }, 80)

    return () => clearInterval(interval)
  }, [useCaseDep])

  return <TerminalParallelTasks tasks={pts} />
}

function AgentSlideWithAutoStart() {
  const [started, setStarted] = useState(false)
  const [useCase, setUseCase] = useState<"code" | "email" | "database" | "prompt" | "parallel">("code")
  const [phase, setPhase] = useState<"idle" | "command" | "intro" | "artifact" | "final">("idle")
  const [introStreamDone, setIntroStreamDone] = useState(false)

  useEffect(() => {
    setPhase("idle")
    setIntroStreamDone(false)
    const t = setTimeout(() => setPhase("command"), 30)
    return () => clearTimeout(t)
  }, [useCase])

  useEffect(() => {
    if (phase === "command") {
      const t = setTimeout(() => setPhase("intro"), 200)
      return () => clearTimeout(t)
    }
  }, [phase])

  useEffect(() => {
    if (introStreamDone && phase === "intro") {
      setPhase("artifact")
    }
  }, [introStreamDone, phase])

  useEffect(() => {
    if (phase === "artifact") {
      const t = setTimeout(() => setPhase("final"), 200)
      return () => clearTimeout(t)
    }
  }, [phase])

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true)
      setPhase("command")
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleIntroComplete = () => setIntroStreamDone(true)

  const showCommand = phase !== "idle"
  const showIntro = phase === "intro" || phase === "artifact" || phase === "final"
  const showArtifact = phase === "artifact" || phase === "final"
  const showFinal = phase === "final"
  const showAnalyzing = phase === "intro" || phase === "artifact" || phase === "final"

  const [useCaseDep, setUseCaseDep] = useState(0)

  const promptCode = `const prompt = \`Generate a React component that:
- Accepts \\\`title\\\` and \\\`onClick\\\` props
- Renders a styled button with hover/active states
- Uses Tailwind CSS classes
- Exports as default

Use TypeScript with strict typing.\`

// Optimized with structured output constraints
const optimizedPrompt = \`You are a React component generator.

Generate a TypeScript React component with:
1. Props interface with Title (string) and OnClick (callback)
2. Tailwind CSS styling with hover:scale-105 and active:scale-95
3. Default export

Output format:
\\\`\\\`\\\`tsx
// component code
\\\`\\\`\\\`

Example:
interface ButtonProps { title: string; onClick: () => void }
export default function Button({ title, onClick }: ButtonProps) {
  return <button onClick={onClick} className="...">{title}</button>
}\``

  const useCases = {
    code: {
      label: "Code",
      command: "/improve-the-ui",
      analyzeLabel: "Analyzing button component",
      intro: "I'll improve the primary button hover — easing the opacity transition and adding a motion-safe press scale.",
      artifact: (
        <TerminalEditBlock
          file="components/ui/button.tsx"
          startLine={12}
          highlightLines={[19, 20, 21]}
          code={agentCode}
        />
      ),
      final: "Done — hover now eases to 90% opacity with a subtle press-in effect. Want me to apply the same pass to the secondary and ghost variants?",
    },
    email: {
      label: "Email",
      command: "/rewrite-email",
      analyzeLabel: "Analyzing tone and structure",
      intro: "The original email reads too passive. I'll restructure it with a clearer subject line and direct CTA to improve response rate.",
      artifact: (
        <TerminalEmailDraft
          from="you@company.com"
          to="client@acme.com"
          subject="Proposal Follow-Up"
          body={`Hi Alex,\n\nThanks for the great call earlier.\n\nAs discussed, I've attached the updated proposal reflecting your feedback on timeline and scope.\n\nKey changes:\n- Phase 1 delivery: Oct 15 \u2192 Oct 30\n- Added Q2 maintenance retainer\n- Removed legacy migration scope\n\nLet me know if you'd like to walk through it together.\n\nBest,\nJordan`}
        />
      ),
      final: "Rewritten \u2014 127 \u2192 89 words, tone shifted from passive to direct/actionable. Estimated reply rate +35%.",
    },
    database: {
      label: "Database",
      command: "/migrate-schema",
      analyzeLabel: "Analyzing migration plan",
      intro: "The users table needs a timezone column and the existing preferences JSONB needs a migration path. Here's the affected data set:",
      artifact: (
        <TerminalJsTable
          columns={[
            { key: "table", header: "Table", width: "25%" },
            { key: "action", header: "Action", width: "20%" },
            { key: "status", header: "Status", width: "18%" },
            { key: "rows", header: "Rows", align: "right" as const, width: "15%" },
            { key: "eta", header: "ETA", align: "right" as const, width: "15%" },
          ]}
          data={[
            { table: "users", action: "ADD COLUMN", status: "pending", rows: 12480, eta: "1.2s" },
            { table: "users", action: "CREATE INDEX", status: "pending", rows: 12480, eta: "0.8s" },
            { table: "preferences", action: "ALTER JSONB", status: "pending", rows: 8920, eta: "2.4s" },
            { table: "audit_log", action: "ADD CONSTRAINT", status: "done", rows: 0, eta: "0.1s" },
          ]}
        />
      ),
      final: "Migration complete \u2014 1 column added, 1 index created, 1 JSONB migrated. 0 rows affected by constraint.",
    },
    prompt: {
      label: "Prompt",
      command: "/prompt-optimize",
      analyzeLabel: "Analyzing prompt structure",
      intro: "The original prompt lacks specificity. I'll add output formatting constraints and few-shot examples to improve reliability.",
      artifact: (
        <TerminalEditBlock
          file="prompts/generate-component.ts"
          startLine={1}
          highlightLines={[13, 14, 15, 16, 17, 18]}
          code={promptCode}
        />
      ),
      final: "Done — prompt optimized with structured output format + 3 examples. Estimated quality improvement +40%.",
    },
    parallel: {
      label: "Parallel",
      command: "/run-pipeline",
      analyzeLabel: "Executing parallel tasks",
      intro: "Running the CI pipeline with parallel task execution. Lint, typecheck, test, and build will run concurrently where possible.",
      artifact: <ParallelTasksRunner useCaseDep={useCaseDep} />,
      final: "Pipeline complete — 4/4 tasks passed in 3.3s. All checks green.",
    },
  }

  const current = useCases[useCase]

  if (!started) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-black/50 p-12 text-center">
        <div className="inline-flex items-center gap-2 text-terminal-muted">
          <TerminalThinkingIndicator label="Starting session" variant="blob" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-black/50 p-5 font-mono">
      {/* use-case tabs */}
      <div className="flex items-center gap-1 border-b border-terminal-border/30 pb-2 text-xs">
        {(Object.keys(useCases) as Array<keyof typeof useCases>).map((uc) => (
          <button
            key={uc}
            type="button"
            onClick={() => { setUseCase(uc); setUseCaseDep((d) => d + 1) }}
            className={`rounded-md px-3 py-1 transition-colors ${
              useCase === uc
                ? "bg-terminal-primary/20 text-terminal-primary"
                : "text-terminal-muted hover:text-terminal-text"
            }`}
          >
            {useCases[uc].label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-terminal-border/30 pb-1 text-xs text-terminal-muted">
        <span className="font-semibold text-terminal-primary">agent session</span>
      </div>

      <div className="space-y-3">
        {showCommand && <TerminalMessage>{current.command}</TerminalMessage>}

        {showIntro && (
          <TerminalStreamText speed={85} mode="fade" onComplete={handleIntroComplete}>
            {current.intro}
          </TerminalStreamText>
        )}

        {showArtifact && current.artifact}

        {showFinal && (
          <TerminalStreamText speed={85} mode="fade">
            {current.final}
          </TerminalStreamText>
        )}
      </div>

      {showAnalyzing && (
        <div className="border-t border-terminal-border/20 pt-2">
          <TerminalThinkingIndicator label={current.analyzeLabel} variant="blob" tone="active" />
        </div>
      )}
    </div>
  )
}

const agentCode = `export function PrimaryButton({ children, className }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        "px-4 py-2 bg-[var(--terminal-white)]",
        "text-[var(--terminal-bg)]",
        "transition-[opacity,transform]",
        "duration-150 ease-out",
        "hover:opacity-90 active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}`

function AgentSessionDemo() {
  const [demoStarted, setDemoStarted] = useState(false)

  if (!demoStarted) {
    return (
      <div className="lg:col-span-2 space-y-4 rounded-2xl border border-primary/20 bg-black/50 p-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Agent session</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Streaming transcript with thinking indicator, stream text, and edit block in a terminal-native layout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDemoStarted(true)}
          className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-mono text-primary hover:bg-primary/20 transition-colors"
        >
          Start demo session
        </button>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2 space-y-4 rounded-2xl border border-primary/20 bg-black/50 p-5 font-mono">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-terminal-border/30 text-xs text-terminal-muted">
        <span className="text-terminal-primary font-semibold">agent session</span>
      </div>
      <TerminalSessionContent autoScroll streaming>
        <TerminalMessage>/improve-the-ui</TerminalMessage>
        <TerminalThinkingIndicator label="Thinking" />
        <TerminalStreamText speed={60} mode="fade">
          I'll improve the primary button hover — easing the opacity transition and adding a motion-safe press scale.
        </TerminalStreamText>
        <TerminalEditBlock
          file="components/ui/button.tsx"
          startLine={12}
          highlightLines={[19, 20, 21]}
          code={agentCode}
        />
        <TerminalStreamText speed={60} mode="fade">
          Done — hover now eases to 90% opacity with a subtle press-in effect. Want me to apply the same pass to the secondary and ghost variants?
        </TerminalStreamText>
      </TerminalSessionContent>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="group p-6 rounded-xl border border-primary/10 bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:border-primary/30 transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary glow-text">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function RegistrySetupBlock() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: "Initialize shadcn with the Shadcn OpenTUI registry",
      command: "bunx shadcn@latest init -r https://opentui.vercel.app/api/registry",
      description: "Set up shadcn/ui with the independent Shadcn OpenTUI registry.",
    },
    {
      title: "Add terminal component",
      command: "bunx shadcn@latest add terminal",
      description: "Install the main shadcn terminal component.",
    },
    {
      title: "Explore codegen direction",
      command: "open lib/opentui-codegen/README.md",
      description: "Review the OpenTUI-to-shadcn generator scaffold and Hunk validation target.",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
              activeStep === i
                ? "bg-primary text-primary-foreground"
                : "bg-black/40 text-primary/60 hover:text-primary border border-primary/20"
            }`}
          >
            Step {i + 1}
          </button>
        ))}
      </div>

      <div className="bg-black/60 border border-primary/30 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-primary/20 flex items-center justify-between">
          <span className="text-sm text-primary font-medium">{steps[activeStep].title}</span>
          <CopyButton text={steps[activeStep].command} />
        </div>
        <div className="p-4 font-mono text-sm">
          <span className="text-primary">$</span> <span className="text-foreground">{steps[activeStep].command}</span>
        </div>
        <div className="px-4 pb-4 text-xs text-muted-foreground">{steps[activeStep].description}</div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <TerminalIcon className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-lg text-primary">Shadcn OpenTUI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Docs
              </Link>
              <Link
                href="/docs/components/terminal"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Components
              </Link>
              <Link
                href="/docs/components/examples"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Examples
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" asChild>
                <Link href="https://github.com/canadian-ai/shadcn-opentui" target="_blank" rel="noreferrer" aria-label="Open Shadcn OpenTUI on GitHub">
                  <Github className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 animate-pulse-glow"
                asChild
              >
                <Link href="/docs">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Glowing OpenTUI Title */}
              <div className="fade-in-up">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4 font-mono">
                  <span className="text-primary glow-text-strong">Shadcn OpenTUI</span>
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-black/40 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary/80">Independent OpenTUI-inspired web experiment</span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight fade-in-up-delay-1 text-balance">
                <span className="text-foreground">The terminal component</span>
                <br />
                <span className="text-primary glow-text">for modern apps</span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto fade-in-up-delay-2 text-balance leading-relaxed">
                An independent shadcn/ui project for bringing OpenTUI-style terminal applications to the web with
                inspectable React code, command handling, and TypeScript support.
              </p>

              <div className="mx-auto max-w-3xl rounded-xl border border-primary/20 bg-black/40 px-5 py-4 text-sm text-muted-foreground">
                Built for <span className="font-semibold text-foreground">React and Next.js apps in the browser</span>.
                This is not the native OpenTUI project. The canonical Shadcn OpenTUI source is canadian-ai/shadcn-opentui.
              </div>

              <div className="mx-auto max-w-3xl text-left">
                <OpenTUIRuntimeStatusCard />
              </div>

              <div className="mx-auto w-full max-w-4xl text-left fade-in-up-delay-2">
                <AgentQuickstartCard />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-up-delay-3">
                <Button
                  size="lg"
                  className="px-8 bg-transparent border-2 border-primary text-primary hover:bg-primary/10"
                  asChild
                >
                  <Link href="/docs">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Documentation
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 bg-black/40 border-border/50 hover:bg-black/60"
                  asChild
                >
                  <Link href="https://github.com/canadian-ai/shadcn-opentui" target="_blank" rel="noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Link>
                </Button>
              </div>

              {/* Install command with glow */}
              <div className="pt-4 fade-in-up-delay-3">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-black/60 border border-primary/30 font-mono text-sm backdrop-blur-sm">
                  <span className="text-primary">$</span>
                  <span className="text-foreground">npx shadcn@latest add https://opentui.vercel.app/r/terminal.json</span>
                  <CopyButton text="npx shadcn@latest add https://opentui.vercel.app/r/terminal.json" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Compatible with npm, yarn, pnpm, and bun
                </div>
               </div>
            </div>
          </div>
        </section>

        {/* Animated Demos - Using the shadcn OpenTUI Terminal */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">See it in action</h2>
                <p className="text-muted-foreground text-lg">Live shadcn terminal components running in the browser</p>
              </div>

              <LandingDemoShowcase />
            </div>
          </section>

        <section className="py-20 px-6 border-y border-primary/10 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Terminal-native patterns</h2>
              <p className="text-muted-foreground text-lg">
                Reusable OpenTUI-inspired interaction systems that stay inside the terminal instead of drifting into generic UI.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono text-primary">
                  <LayoutPanelTop className="w-4 h-4" />
                  <span>In-terminal workflows</span>
                </div>
                <TerminalScenarioCard
                  title="Forms and menus as first-class terminal flows"
                  description="Drive onboarding, settings, and command routing from one reusable terminal surface."
                  commands={{
                    profile: {
                      name: "profile",
                      description: "Open a profile form",
                      handler: (_args, context) => {
                        context?.setState?.((prev: { menuSelection: number }) => ({
                          ...prev,
                          mode: "form",
                          formData: {},
                          activeComponent: {
                            id: `profile-${Date.now()}`,
                            type: "form",
                            props: { fields: ["name", "role"] },
                            active: true,
                          },
                        }))
                      },
                    },
                    menu: {
                      name: "menu",
                      description: "Open a workspace menu",
                      handler: (_args, context) => {
                        context?.setState?.((prev: { menuSelection: number }) => ({
                          ...prev,
                          mode: "ui",
                          menuSelection: 0,
                          activeComponent: {
                            id: `workspace-${Date.now()}`,
                            type: "menu",
                            props: { items: ["Workspace", "Deployments", "Themes", "Logs"] },
                            active: true,
                          },
                        }))
                      },
                    },
                  }}
                  welcomeMessage={[
                    "Run 'profile' for a form.",
                    "Run 'menu' for a keyboard-driven menu.",
                  ]}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono text-primary">
                  <WandSparkles className="w-4 h-4" />
                  <span>Terminal dashboards</span>
                </div>
                <TerminalScenarioCard
                  title="Dashboards that still feel like a terminal"
                  description="Show progress, system status, and generated output without falling back to stock sliders."
                  commands={{
                    status: {
                      name: "status",
                      description: "Show environment status",
                      handler: (_args, context) => {
                        context?.addLine?.("CPU: 42%", "success")
                        context?.addLine?.("Memory: 6.1 GB / 16 GB", "output")
                        context?.addLine?.("Network: 842 Mbps", "output")
                      },
                    },
                    progress: {
                      name: "progress",
                      description: "Animate a deploy progress bar",
                      handler: async (_args, context) => {
                        context?.addLine?.("Deploying preview environment...", "success")
                        context?.addLine?.("Deploy: [.....] 0%", "output")
                        for (let step = 1; step <= 5; step += 1) {
                          context?.updateLastLine?.(`Deploy: [${"#".repeat(step)}${".".repeat(5 - step)}] ${step * 20}%`)
                          await new Promise((resolve) => setTimeout(resolve, 180))
                        }
                        context?.addLine?.("Preview deploy complete.", "success")
                      },
                    },
                    banner: {
                      name: "banner",
                      description: "Render a launch banner",
                      handler: (_args, context) => {
                        context?.addLine?.("+------------------+", "success")
                        context?.addLine?.("| OPEN TUI READY   |", "success")
                        context?.addLine?.("+------------------+", "success")
                      },
                    },
                  }}
                  welcomeMessage={[
                    "Run 'status' for a live readout.",
                    "Run 'progress' or 'banner' for richer terminal output.",
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 grid lg:grid-cols-2 gap-8">
            <AgentSessionDemo />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem value="15+" label="Built-in commands" />
              <StatItem value="5" label="UI components" />
              <StatItem value="100%" label="TypeScript" />
              <StatItem value="<5kb" label="Bundle size" />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Everything you need</h2>
              <p className="text-muted-foreground text-lg">Powerful features for building terminal experiences</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureCard
                icon={TerminalIcon}
                title="Command History"
                description="Navigate through previous commands with arrow keys, just like a real terminal."
              />
              <FeatureCard
                icon={Zap}
                title="Tab Completion"
                description="Intelligent tab completion with suggestions for faster command entry."
              />
              <FeatureCard
                icon={Layers}
                title="UI Components"
                description="Built-in forms, menus, tables, and progress flows for interactive terminal UIs."
              />
              <FeatureCard
                icon={Code2}
                title="Async Commands"
                description="Full support for async command handlers with loading states."
              />
            </div>
          </div>
        </section>

        {/* Interactive Demo - Using actual OpenTUI Terminal */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Try it yourself</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Experience the Shadcn OpenTUI terminal component. Type commands, use tab completion, and
                  explore the built-in functionality including interactive UI modes.
                </p>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Available commands</h3>
                  <div className="grid gap-2">
                    {[
                      { cmd: "help", desc: "Show all commands" },
                      { cmd: "ui menu [items]", desc: "Create interactive menu" },
                      { cmd: "form [fields]", desc: "Create interactive form" },
                      { cmd: "progress [ms]", desc: "Show animated progress" },
                      { cmd: "ascii [text]", desc: "Generate ASCII art" },
                      { cmd: "clear", desc: "Clear terminal" },
                    ].map((item) => (
                      <div key={item.cmd} className="flex items-center gap-3">
                        <Command>{item.cmd}</Command>
                        <span className="text-sm text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 overflow-hidden shadow-xl shadow-primary/10">
                <Terminal
                  className="h-[500px] bg-black"
                  welcomeMessage={["Interactive shadcn terminal", "Try: help", "Try: menu Dashboard Projects Settings"]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Ready to get started?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Add the Shadcn OpenTUI terminal component to your project using the @shadcn-opentui registry.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow"
                  asChild
                >
                  <Link href="/docs">
                    Read the docs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-black/40 border-border/50 hover:bg-black/60" asChild>
                  <Link href="/docs/installation">Installation guide</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-primary/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <TerminalIcon className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Shadcn OpenTUI - independent OpenTUI-inspired project</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
                <Link
                  href="https://github.com/canadian-ai/shadcn-opentui"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub
                </Link>
                <Link
                  href="https://twitter.com/shadcn"
                  target="_blank"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Twitter
                </Link>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-primary/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img src="https://sequence-flow.canadian-ai.app/icon-black.svg" alt="Canadian AI" width={22} height={22} className="size-5 dark:invert" />
                <div className="flex flex-col">
                  <span>Open source from Canadian AI.</span>
                  <span className="text-xs opacity-80">Built in Montréal by Canadian AI.</span>
                </div>
              </div>
              <a href="https://canadian-ai.ca" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Canadian AI</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function TerminalScenarioCard({
  title,
  description,
  commands,
  welcomeMessage,
}: {
  title: string
  description: string
  commands: Record<string, CommandHandler>
  welcomeMessage: string[]
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-black/50 p-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Terminal commands={commands} welcomeMessage={welcomeMessage} className="h-64 bg-black" />
      <div className="space-y-1 border-t border-primary/10 pt-3 text-xs text-primary/70">
        {welcomeMessage.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </div>
    </div>
  )
}
