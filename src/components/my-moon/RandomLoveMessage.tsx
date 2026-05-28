'use client'

import { useCallback, useEffect, useState } from 'react'
import { Heart, RefreshCw } from 'lucide-react'
import { loveMessages } from '@/data/myMoon/messages'

const storageKey = 'my-moon-recent-messages'
const recentLimit = Math.min(5, loveMessages.length - 1)

function pickMessage(recent: string[]) {
  const available = loveMessages.filter((message) => !recent.includes(message))
  const pool = available.length > 0 ? available : loveMessages
  return pool[Math.floor(Math.random() * pool.length)]
}

function getRecentMessages() {
  try {
    const storedRecent = localStorage.getItem(storageKey)
    const parsedRecent = storedRecent ? (JSON.parse(storedRecent) as unknown) : []
    return Array.isArray(parsedRecent) ? parsedRecent.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export default function RandomLoveMessage() {
  const [message, setMessage] = useState(loveMessages[0])

  const showAnotherMessage = useCallback(() => {
    const recent = getRecentMessages()
    const nextMessage = pickMessage(recent)
    const nextRecent = [nextMessage, ...recent.filter((item) => item !== nextMessage)].slice(0, recentLimit)

    localStorage.setItem(storageKey, JSON.stringify(nextRecent))
    setMessage(nextMessage)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(showAnotherMessage, 0)
    return () => window.clearTimeout(timer)
  }, [showAnotherMessage])

  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur md:p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-200/80">Little love note</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">For right now</h2>
        </div>
        <div className="grid size-11 place-items-center rounded-full border border-white/15 bg-slate-950/50 text-pink-100">
          <Heart size={18} aria-hidden="true" />
        </div>
      </div>

      <p className="min-h-28 text-lg leading-8 text-slate-100 md:text-xl">{message}</p>

      <button
        type="button"
        onClick={showAnotherMessage}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-200/30 bg-pink-200/10 px-4 py-2 text-sm font-semibold text-pink-50 transition hover:bg-pink-200/20 focus:outline-none focus:ring-2 focus:ring-pink-200/60"
      >
        <RefreshCw size={16} aria-hidden="true" />
        Give me another one
      </button>
    </section>
  )
}
