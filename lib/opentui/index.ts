// OpenTUI Library Exports
// Clean public API for the shadcn terminal wrapper around opentui runtime

// Types
export type {
  TerminalLine,
  TerminalCommand,
  UIComponent,
  TerminalMode,
  OpenTUIRuntimeState,
  OpenTUIRuntimeContext,
  TerminalTheme,
  TerminalEvent,
  TerminalEventHandler,
  OpenTUIPlugin,
  TerminalMiddleware,
} from "./types"

// Runtime Provider and Context
export {
  OpenTUIProvider,
  useOpenTUIRuntime,
  useOpenTUIOptional,
  OpenTUIContext,
} from "./runtime"

// Hooks
export {
  useTerminalLines,
  useCommandHistory,
  useTabCompletion,
  useUIComponent,
  useCommand,
  useTerminalKeyboard,
} from "./hooks"

// Built-in Commands
export {
  createBuiltInCommands,
  createUICommands,
} from "./commands"

// Headless terminal interaction parity with the Canadian AI UI SDK pilots
export {
  createTerminalPickerState,
  reduceTerminalPicker,
  filterTerminalChoices,
  dispatchTerminalPickerKey,
} from "./terminal-picker"
export type {
  TerminalChoice,
  TerminalPickerState,
  TerminalPickerAction,
  TerminalPickerKey,
} from "./terminal-picker"
