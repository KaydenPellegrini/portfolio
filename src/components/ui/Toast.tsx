'use client'

import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  exiting?: boolean
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, exiting: true } : x))
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300)
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t.slice(-4), { id, type, message }])
    const timer = setTimeout(() => dismiss(id), 4500)
    timers.current.set(id, timer)
  }, [dismiss])

  const success = useCallback((m: string) => toast(m, 'success'), [toast])
  const error   = useCallback((m: string) => toast(m, 'error'),   [toast])
  const warning = useCallback((m: string) => toast(m, 'warning'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const styles: Record<ToastType, string> = {
    success: 'border-accent/40 bg-accent/10',
    error:   'border-danger/40 bg-danger/10',
    warning: 'border-gold/40 bg-gold/10',
    info:    'border-border bg-raised',
  }
  const Icon = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: CheckCircle }[t.type]
  const iconColor = { success: 'text-accent', error: 'text-danger', warning: 'text-gold', info: 'text-muted' }[t.type]

  return (
    <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border
      ${styles[t.type]} ${t.exiting ? 'toast-exit' : 'toast-enter'}
      shadow-2xl min-w-[280px] max-w-[360px] backdrop-blur-sm`}>
      <Icon size={16} className={`${iconColor} shrink-0 mt-0.5`} />
      <p className="text-sm text-white flex-1 leading-relaxed">{t.message}</p>
      <button onClick={() => onDismiss(t.id)} className="text-muted hover:text-white shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}
