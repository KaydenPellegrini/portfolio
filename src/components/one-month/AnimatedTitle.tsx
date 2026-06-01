'use client'

interface Props {
  text: string
  className?: string
  baseDelay?: number
  stepMs?: number
}

export default function AnimatedTitle({
  text,
  className = '',
  baseDelay = 220,
  stepMs = 38,
}: Props) {
  const words = text.split(' ')
  let letterIndex = -1

  return (
    <h1 className={className} aria-label={text}>
      <span className="one-month-title inline-block">
        {words.map((word, wordIdx) => (
          <span key={`${word}-${wordIdx}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, chIdx) => {
              letterIndex += 1
              return (
                <span
                  key={`${ch}-${wordIdx}-${chIdx}`}
                  aria-hidden="true"
                  className="one-month-letter"
                  style={{ animationDelay: `${baseDelay + letterIndex * stepMs}ms` }}
                >
                  {ch}
                </span>
              )
            })}
            {wordIdx < words.length - 1 ? (
              <span aria-hidden="true" className="inline-block" style={{ width: '0.32em' }} />
            ) : null}
          </span>
        ))}
      </span>
    </h1>
  )
}
