import type { TerminalCommand } from "./types"
import { filterTerminalChoices } from "./terminal-picker"
import { renderAsciiBanner, renderTable, sampleTerminalTableData } from "./renderers"

// Built-in system commands
export const createBuiltInCommands = (): TerminalCommand[] => [
  {
    name: "clear",
    description: "Clear the terminal screen",
    category: "system",
    aliases: ["cls"],
    handler: (_, context) => {
      context.clearLines()
    },
  },
  {
    name: "help",
    description: "Show available commands",
    category: "system",
    aliases: ["?", "commands"],
    usage: "help [command]",
    handler: (args, context) => {
      const commands = context.getCommands()

      if (args[0]) {
        // Show help for specific command
        const command = commands.find((cmd) => cmd.name === args[0])
        if (command) {
          context.addLine(`Command: ${command.name}`, "success")
          context.addLine(`  ${command.description}`)
          if (command.usage) {
            context.addLine(`  Usage: ${command.usage}`)
          }
          if (command.aliases?.length) {
            context.addLine(`  Aliases: ${command.aliases.join(", ")}`)
          }
        } else {
          context.addLine(`Unknown command: ${args[0]}`, "error")
        }
        return
      }

      // Group commands by category
      const categories = new Map<string, TerminalCommand[]>()
      commands.forEach((cmd) => {
        const category = cmd.category || "custom"
        if (!categories.has(category)) {
          categories.set(category, [])
        }
        categories.get(category)!.push(cmd)
      })

      context.addLine("Available commands:", "success")
      context.addLine("")

      categories.forEach((cmds, category) => {
        context.addLine(`[${category.toUpperCase()}]`, "system")
        cmds.forEach((cmd) => {
          const padding = " ".repeat(Math.max(0, 12 - cmd.name.length))
          context.addLine(`  ${cmd.name}${padding} - ${cmd.description}`)
        })
        context.addLine("")
      })

      context.addLine("Type 'help <command>' for detailed information")
    },
  },
  {
    name: "history",
    description: "Show command history",
    category: "system",
    handler: (_, context) => {
      const history = context.state.commandHistory

      if (history.length === 0) {
        context.addLine("No commands in history")
        return
      }

      context.addLine("Command history:", "success")
      history.forEach((cmd, index) => {
        context.addLine(`  ${(index + 1).toString().padStart(3)}  ${cmd}`)
      })
    },
  },
  {
    name: "date",
    description: "Show current date and time",
    category: "system",
    aliases: ["time", "now"],
    handler: (_, context) => {
      context.addLine(new Date().toLocaleString(), "success")
    },
  },
  {
    name: "echo",
    description: "Display a message",
    category: "system",
    usage: "echo <message>",
    handler: (args, context) => {
      context.addLine(args.join(" "))
    },
  },
  {
    name: "version",
    description: "Show OpenTUI version",
    category: "system",
    aliases: ["ver", "v"],
    handler: (_, context) => {
      context.addLine("OpenTUI Terminal v1.0.0", "success")
      context.addLine("Built with React 19 and Next.js 16")
      context.addLine("shadcn/ui component wrapper")
    },
  },
]

// UI-related commands
export const createUICommands = (): TerminalCommand[] => [
  {
    name: "palette",
    description: "Search and select commands using the terminal-native UI picker",
    category: "ui",
    usage: "palette [search terms]",
    handler: (args, context) => {
      const choices = Array.from(
        new Map(context.getCommands().map((command) => [command.name, command])).values(),
      ).filter((command) => command.name !== "palette").map((command) => ({
        id: command.name,
        label: command.name,
        description: command.description,
        keywords: [command.category ?? "custom", ...(command.aliases ?? [])],
      }))
      const matches = filterTerminalChoices(choices, args.join(" "))
      if (matches.length === 0) {
        context.addLine("No matching commands", "system")
        return
      }
      context.showUI({
        id: "command-palette",
        type: "menu",
        props: { items: matches.map((item) => item.label), descriptions: matches.map((item) => item.description), query: args.join(" ") },
        active: true,
        onComplete: (result) => {
          const selection = result as { index?: number; item?: string }
          const selected = typeof selection.index === "number" ? matches[selection.index] : matches.find((item) => item.label === selection.item)
          if (!selected) return
          // Surface the command, do not automatically execute arbitrary actions.
          context.hideUI("command-palette")
          context.addLine("Selected command: " + selected.id, "success")
          context.addLine("Run '" + selected.id + "' to execute it.")
        },
      })
      context.addLine("Use ↑↓ to navigate, ENTER to select, ESC to cancel")
    },
  },
  {
    name: "menu",
    description: "Create an interactive menu",
    category: "ui",
    usage: "menu <item1> <item2> ...",
    handler: (args, context) => {
      const items = args.length > 0 ? args : ["Option 1", "Option 2", "Option 3"]

      context.showUI({
        id: `menu-${Date.now()}`,
        type: "menu",
        props: { items },
        active: true,
      })

      context.addLine(`Menu created with ${items.length} options`, "success")
      context.addLine("Use ↑↓ arrows to navigate, ENTER to select, ESC to cancel")
    },
  },
  {
    name: "form",
    description: "Create an interactive form",
    category: "ui",
    usage: "form <field1> <field2> ...",
    handler: (args, context) => {
      const fields = args.length > 0 ? args : ["name", "email"]

      context.showUI({
        id: `form-${Date.now()}`,
        type: "form",
        props: { fields },
        active: true,
      })

      context.addLine(`Form created with fields: ${fields.join(", ")}`, "success")
      context.addLine("Use TAB to navigate, ENTER to submit, ESC to cancel")
    },
  },
  {
    name: "progress",
    description: "Show a progress bar animation",
    category: "ui",
    usage: "progress [duration_ms]",
    handler: async (args, context) => {
      const duration = Number.parseInt(args[0]) || 3000
      const steps = 20
      const stepDuration = duration / steps

      context.addLine("Starting progress...")

      // Add the initial progress line
      context.addLine(`Progress: [░░░░░░░░░░░░░░░░░░░░] 0%`)

      for (let i = 1; i <= steps; i++) {
        const percent = Math.round((i / steps) * 100)
        const filled = "█".repeat(i)
        const empty = "░".repeat(steps - i)
        const bar = `[${filled}${empty}] ${percent}%`

        // Always update the last line - never add a new one
        context.updateLastLine(`Progress: ${bar}`)

        if (i < steps) {
          await new Promise((resolve) => setTimeout(resolve, stepDuration))
        }
      }

      context.addLine("Progress complete!", "success")
    },
  },
  {
    name: "ascii",
    description: "Generate ASCII art",
    category: "ui",
    usage: "ascii [text]",
    handler: (args, context) => {
      const text = args.join(" ") || "OpenTUI"

      context.addLine("Generating ASCII art...", "success")
      renderAsciiBanner(text).forEach((line) => context.addLine(line, "success"))
    },
  },
  {
    name: "table",
    description: "Display data in table format",
    category: "ui",
    handler: (_, context) => {
      context.addLine("Sample Data Table:", "success")
      renderTable(sampleTerminalTableData).forEach((line) => context.addLine(line))
    },
  },
]
