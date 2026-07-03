'use client'

import { createContext, useContext } from 'react'

const FieldLockedContext = createContext(false)

/**
 * When `locked` is true, descendant InputField, DropdownField, TextArea, and Toggle
 * behave as non-interactive (view mode): muted styling, no hover/focus affordances,
 * and dropdowns/triggers do not open. Use alongside page-level “edit vs view” state.
 */
export function FieldLockedProvider({
  locked,
  children,
}: {
  locked: boolean
  children: React.ReactNode
}) {
  return (
    <FieldLockedContext.Provider value={locked}>{children}</FieldLockedContext.Provider>
  )
}

export function useFieldLocked(): boolean {
  return useContext(FieldLockedContext)
}
