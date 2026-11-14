import { describe, expect, it, vi } from "vitest"
import {
  createTerminalPickerState,
  dispatchTerminalPickerKey,
  filterTerminalChoices,
  reduceTerminalPicker,
  type TerminalChoice,
} from "@/lib/opentui/terminal-picker"
import { createUICommands } from "@/lib/opentui/commands"

const items: TerminalChoice[] = [
  { id: "open", label: "Open project", description: "Browse projects", keywords: ["browse"] },
  { id: "delete", label: "Delete project", disabled: true },
  { id: "close", label: "Close project", description: "Finish work" },
]

describe("terminal-native UI SDK parity model", () => {
  it("matches label, description and keywords case-insensitively", () => {
    expect(filterTerminalChoices(items, "OPEN").map((item) => item.id)).toEqual(["open"])
    expect(filterTerminalChoices(items, "browse").map((item) => item.id)).toEqual(["open"])
    expect(filterTerminalChoices(items, "finish").map((item) => item.id)).toEqual(["close"])
  })

  it("keeps roving focus on enabled filtered items, including wrapping", () => {
    let state = reduceTerminalPicker(createTerminalPickerState(items), { type: "open" }, items)
    expect(state.activeId).toBe("open")
    state = dispatchTerminalPickerKey(state, "ArrowDown", items)
    expect(state.activeId).toBe("close")
    state = dispatchTerminalPickerKey(state, "ArrowDown", items)
    expect(state.activeId).toBe("open")
    state = dispatchTerminalPickerKey(state, "End", items)
    expect(state.activeId).toBe("close")
    state = dispatchTerminalPickerKey(state, "Home", items)
    expect(state.activeId).toBe("open")
  })

  it("selects active option, closes, and preserves selection on escape", () => {
    let state = reduceTerminalPicker(createTerminalPickerState(items), { type: "open" }, items)
    state = dispatchTerminalPickerKey(state, "ArrowDown", items)
    state = dispatchTerminalPickerKey(state, "Enter", items)
    expect(state.selectedId).toBe("close")
    expect(state.open).toBe(false)
    state = reduceTerminalPicker(state, { type: "open" }, items)
    state = dispatchTerminalPickerKey(state, "Escape", items)
    expect(state.selectedId).toBe("close")
    expect(state.open).toBe(false)
  })

  it("updates query, handles no results and clears selection", () => {
    let state = reduceTerminalPicker(createTerminalPickerState(items, "close"), { type: "open" }, items)
    state = reduceTerminalPicker(state, { type: "query", value: "not-found" }, items)
    expect(state.activeId).toBeNull()
    expect(dispatchTerminalPickerKey(state, "Enter", items).selectedId).toBe("close")
    state = reduceTerminalPicker(state, { type: "clear" }, items)
    expect(state).toMatchObject({ query: "", selectedId: null, activeId: "open" })
  })

  it("does not select disabled items", () => {
    const state = createTerminalPickerState(items, "delete")
    expect(state.selectedId).toBeNull()
    const onlyDisabled: TerminalChoice[] = [items[1]]
    expect(reduceTerminalPicker(createTerminalPickerState(onlyDisabled), { type: "open" }, onlyDisabled).activeId).toBeNull()
  })
})

describe("palette command", () => {
  it("filters available commands and displays a terminal menu without executing", () => {
    const showUI = vi.fn()
    const addLine = vi.fn()
    const hideUI = vi.fn()
    const handler = createUICommands().find((command) => command.name === "palette")!.handler
    const commands = [
      { name: "help", description: "Show commands", category: "system" as const },
      { name: "clear", description: "Clear output", category: "system" as const },
    ]
    const context = { getCommands: () => commands, showUI, hideUI, addLine } as any
    handler(["hel"], context)
    expect(showUI).toHaveBeenCalledOnce()
    const ui = showUI.mock.calls[0][0]
    expect(ui.props.items).toEqual(["help"])
    ui.onComplete({ index: 0 })
    expect(hideUI).toHaveBeenCalledWith("command-palette")
    expect(addLine).toHaveBeenCalledWith("Selected command: help", "success")
    expect(showUI).toHaveBeenCalledTimes(1)
  })

  it("displays a meaningful no-results state", () => {
    const addLine = vi.fn()
    const showUI = vi.fn()
    const handler = createUICommands().find((command) => command.name === "palette")!.handler
    handler(["nothing"], { getCommands: () => [], addLine, showUI } as any)
    expect(showUI).not.toHaveBeenCalled()
    expect(addLine).toHaveBeenCalledWith("No matching commands", "system")
  })
})
