import { ImageResponse } from 'next/og'
import { identity } from '@/data/cv/profile'
import { heroChips } from '@/data/site/home'

// The card shown when kayden.co.za is shared in Slack, WhatsApp, LinkedIn and
// similar. Rendered once at build time, so it costs nothing per request.

export const alt = `${identity.name}, ${identity.title.replace(' | ', ' and ')}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#f4f0ff',
          backgroundColor: '#050008',
          backgroundImage:
            'radial-gradient(circle at 12% 18%, rgba(106, 13, 173, 0.55), transparent 42%), radial-gradient(circle at 88% 82%, rgba(0, 255, 136, 0.22), transparent 38%)',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, color: '#00ff88', letterSpacing: 2 }}>kayden.co.za</div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {identity.name}
          </div>
          <div style={{ display: 'flex', marginTop: 22, fontSize: 42, fontWeight: 700, color: '#00ff88' }}>
            {identity.title}
          </div>
          <div style={{ display: 'flex', marginTop: 26, maxWidth: 980, fontSize: 30, color: '#d8ccf0', lineHeight: 1.4 }}>
            Dataverse, Power Platform, Power BI and Sage, with LLM tooling connected to live business systems through
            Model Context Protocol.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {heroChips.map((chip) => (
            <div
              key={chip}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid rgba(0, 255, 136, 0.45)',
                borderRadius: 999,
                padding: '12px 22px',
                fontSize: 24,
                lineHeight: 1,
                color: '#d9ffe9',
                backgroundColor: 'rgba(0, 255, 136, 0.08)',
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
