import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { matchesSecret } from '@/lib/secretGate'

export const dynamic = 'force-dynamic'

const PRIVATE_MEDIA_ROOT = path.join(process.cwd(), 'private-media')

const FEATURE_TOKENS: Record<string, string | undefined> = {
  bianca: process.env.BIANCA_TOKEN,
  'one-month': process.env.ONE_MONTH_TOKEN,
}

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
}

interface Params {
  params: Promise<{ feature: string; secret: string; file: string[] }>
}

// Same shape for every rejection (bad feature, bad secret, missing file, path
// escape attempt) so a prober can't tell "wrong token" apart from "not there".
function notFound() {
  return new NextResponse('Not found', { status: 404 })
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { feature, secret, file } = await params

  const expectedToken = FEATURE_TOKENS[feature]
  if (!expectedToken || !matchesSecret(secret, expectedToken)) {
    return notFound()
  }

  if (file.length === 0 || file.some((segment) => segment === '..' || segment === '' || segment.includes('\\'))) {
    return notFound()
  }

  const ext = path.extname(file[file.length - 1]).toLowerCase()
  const contentType = MIME_TYPES[ext]
  if (!contentType) {
    return notFound()
  }

  const featureRoot = path.join(PRIVATE_MEDIA_ROOT, feature)
  const filePath = path.join(featureRoot, ...file)

  // Defense in depth: the resolved path must stay inside this feature's folder.
  if (!filePath.startsWith(featureRoot + path.sep)) {
    return notFound()
  }

  try {
    const data = await readFile(filePath)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return notFound()
  }
}
