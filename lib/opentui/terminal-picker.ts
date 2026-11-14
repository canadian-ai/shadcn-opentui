/**
 * Terminal-native counterparts to the Canadian AI UI SDK combobox and command
 * palette pilots. No DOM, browser focus or @ui-sdk/react dependency.
 * The browser and terminal variants share the same interaction contract:
 * search, filter, roving active item, select, cancel, and restore query.
 */
export interface TerminalChoice {
  id: string
  label: string
  description?: string
  keywords?: readonly string[]
  disabled?: boolean
}

export interface TerminalPickerState {
  query: string
  activeId: string | null
  selectedId: string | null
  open: boolean
}

export type TerminalPickerAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "query"; value: string }
  | { type: "move"; delta: number }
  | { type: "first" | "last" | "select" | "clear" }

export function filterTerminalChoices(
  choices: readonly TerminalChoice[],
  query: string,
): TerminalChoice[] {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return [...choices]
  return choices.filter((choice) =>
    [choice.label, choice.description ?? "", ...(choice.keywords ?? [])]
      .some((value) => value.toLocaleLowerCase().includes(needle)),
  )
}

export function createTerminalPickerState(
  choices: readonly TerminalChoice[],
  selectedId: string | null = null,
): TerminalPickerState {
  const first = choices.find((choice) => !choice.disabled)
  return {
    query: "",
    activeId: first?.id ?? null,
    selectedId: choices.some((choice) => choice.id === selectedId && !choice.disabled)
      ? selectedId : null,
    open: false,
  }
}

export function reduceTerminalPicker(
  state: TerminalPickerState,
  action: TerminalPickerAction,
  choices: readonly TerminalChoice[],
): TerminalPickerState {
  const filtered = filterTerminalChoices(choices, state.query)
    .filter((choice) => !choice.disabled)
  const active = filtered.findIndex((choice) => choice.id === state.activeId)
  switch (action.type) {
    case "open":
      return { ...state, open: true, activeId: filtered[active >= 0 ? active : 0]?.id ?? null }
    case "close":
      return { ...state, open: false }
    case "clear":
      return { ...state, query: "", selectedId: null, activeId: choices.find((choice) => !choice.disabled)?.id ?? null }
    case "query": {
      const matches = filterTerminalChoices(choices, action.value).filter((choice) => !choice.disabled)
      return { ...state, query: action.value, activeId: matches.find((choice) => choice.id === state.activeId)?.id ?? matches[0]?.id ?? null, open: true }
    }
    case "first":
      return { ...state, activeId: filtered[0]?.id ?? null }
    case "last":
      return { ...state, activeId: filtered[filtered.length - 1]?.id ?? null }
    case "move": {
      if (!filtered.length) return { ...state, activeId: null }
      const start = active < 0 ? (action.delta > 0 ? -1 : 0) : active
      const next = ((start + action.delta) % filtered.length + filtered.length) % filtered.length
      return { ...state, activeId: filtered[next].id }
    }
    case "select":
      return state.open && filtered.some((choice) => choice.id === state.activeId)
        ? { ...state, selectedId: state.activeId, open: false }
        : state
  }
}

export type TerminalPickerKey = "ArrowDown" | "ArrowUp" | "Home" | "End" | "Enter" | "Escape"

export function dispatchTerminalPickerKey(
  state: TerminalPickerState,
  key: string,
  choices: readonly TerminalChoice[],
): TerminalPickerState {
  switch (key as TerminalPickerKey) {
    case "ArrowDown": return reduceTerminalPicker(state, { type: "move", delta: 1 }, choices)
    case "ArrowUp": return reduceTerminalPicker(state, { type: "move", delta: -1 }, choices)
    case "Home": return reduceTerminalPicker(state, { type: "first" }, choices)
    case "End": return reduceTerminalPicker(state, { type: "last" }, choices)
    case "Enter": return reduceTerminalPicker(state, { type: "select" }, choices)
    case "Escape": return reduceTerminalPicker(state, { type: "close" }, choices)
    default: return state
  }
}
