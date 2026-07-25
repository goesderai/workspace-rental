'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type { Category, SlotId } from '@/lib/slots'
import { EMPTY, reducer, type Action, type WorkspaceState } from '@/lib/state'
import { decodeState, toQuery, type UrlParts } from '@/lib/urlState'

type Ctx = {
  state: WorkspaceState
  dispatch: Dispatch<Action>
  /**
   * The category the person is currently reaching for, by hover or by drag.
   * The stage uses it to light up the slots that would accept it.
   */
  armed: Category | null
  setArmed: Dispatch<SetStateAction<Category | null>>
  /** Slot under the pointer, for the dimension callout. */
  focused: SlotId | null
  setFocused: Dispatch<SetStateAction<SlotId | null>>
  /** Absolute link to the current setup. Empty until the client has mounted. */
  shareUrl: string
}

const WorkspaceContext = createContext<Ctx | null>(null)

export function WorkspaceProvider({
  initial,
  children,
}: {
  initial: UrlParts
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, initial, decodeState)
  const [armed, setArmed] = useState<Category | null>(null)
  const [focused, setFocused] = useState<SlotId | null>(null)
  const [shareUrl, setShareUrl] = useState('')

  const query = useMemo(() => toQuery(state), [state])

  /*
   * The URL is kept in step with history.replaceState rather than the router:
   * placing an item is a local edit, and it should not cost a server render or
   * push an entry the back button has to walk through.
   */
  useEffect(() => {
    const url = `${window.location.pathname}${query}`
    window.history.replaceState(null, '', url)
    setShareUrl(`${window.location.origin}${url}`)
  }, [query])

  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      armed,
      setArmed,
      focused,
      setFocused,
      shareUrl,
    }),
    [state, armed, focused, shareUrl],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): Ctx {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}

/** Convenience for the common "add this item" path. */
export function usePlace() {
  const { dispatch } = useWorkspace()
  return useCallback(
    (itemId: string, slot?: SlotId) => dispatch({ type: 'place', itemId, slot }),
    [dispatch],
  )
}

export { EMPTY }
