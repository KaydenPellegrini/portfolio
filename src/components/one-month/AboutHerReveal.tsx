'use client'

import { useEffect, useRef, useState } from 'react'

const HIGHLIGHTS = new Set(
  [
    'colour',
    'love',
    'joy',
    'happiness',
    'passion',
    'creative',
    'fearlessly',
    'vibrant',
    'kind',
    'funny',
    'inspiring',
    'unforgettable',
    'amazing',
    'proud',
    'special',
    'dream',
    'design',
    'smile',
    'page',
  ].map((w) => w.toLowerCase()),
)

function tokenize(paragraph: string): { text: string; isWord: boolean }[] {
  // Split into words and whitespace, keep order to preserve exact wording.
  const tokens: { text: string; isWord: boolean }[] = []
  const parts = paragraph.match(/\S+|\s+/g) ?? [paragraph]
  for (const part of parts) {
    tokens.push({ text: part, isWord: !/^\s+$/.test(part) })
  }
  return tokens
}

function stripWord(word: string) {
  return word.toLowerCase().replace(/[^a-z']/g, '')
}

function AnimatedParagraph({ text, baseDelay }: { text: string; baseDelay: number }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const tokens = tokenize(text)
  let wordCount = 0

  return (
    <p ref={ref} className="leading-8">
      {tokens.map((token, idx) => {
        if (!token.isWord) return <span key={idx}>{token.text}</span>

        const i = wordCount++
        const cleaned = stripWord(token.text)
        const isHighlight = HIGHLIGHTS.has(cleaned)
        const wordClass = visible ? 'one-month-word' : ''
        const highlightClass = isHighlight ? 'one-month-highlight font-semibold' : ''

        return (
          <span
            key={idx}
            className={`${wordClass} ${highlightClass}`.trim()}
            style={
              visible
                ? { animationDelay: `${baseDelay + i * 22}ms` }
                : { opacity: 0, transform: 'translateY(14px)', filter: 'blur(4px)', display: 'inline-block' }
            }
          >
            {token.text}
          </span>
        )
      })}
    </p>
  )
}

export default function AboutHerReveal({ text }: { text: string }) {
  const paragraphs = text.split('\n\n')

  return (
    <div className="space-y-5 text-base text-slate-200 md:text-lg">
      {paragraphs.map((paragraph, idx) => (
        <AnimatedParagraph key={idx} text={paragraph} baseDelay={idx * 280} />
      ))}
    </div>
  )
}
