import styles from './CodeSnippet.module.css'

export type Snippet = {
  /** owner/name on GitHub. */
  repo: string
  /** Full commit hash the lines were copied from. */
  commit: string
  path: string
  startLine: number
  language: 'sql' | 'markdown'
  code: string
}

type TokenKind = 'keyword' | 'string' | 'number' | 'comment' | 'template' | 'operator' | 'code' | 'strong' | 'quote'
type Token = { text: string; kind?: TokenKind }
type Rule = [TokenKind | undefined, RegExp]

// Deliberately small highlighters: enough to make a short excerpt readable,
// rendered on the server, with no dependency added to the client bundle.
const SQL: Rule[] = [
  ['comment', /^--.*/],
  ['template', /^\{\{[^}]*\}\}|^\{%[^%]*%\}/],
  ['string', /^'(?:[^']|'')*'/],
  ['keyword', /^(?:select|from|where|with|as|and|or|not|is|null|count|distinct|group|by|order|left|inner|join|on|sum|abs|case|when|then|else|end|true|false|having|union|all|in)\b/i],
  [undefined, /^[A-Za-z_][A-Za-z0-9_]*/],
  ['number', /^\d+(?:\.\d+)?/],
  ['operator', /^(?:<>|<=|>=|!=|[=<>*(),.+])/],
  [undefined, /^\s+/],
]

const MARKDOWN: Rule[] = [
  ['code', /^`[^`]+`/],
  ['strong', /^\*\*[^*]+\*\*/],
  [undefined, /^[^`*]+/],
]

function tokenize(line: string, language: Snippet['language']): Token[] {
  const tokens: Token[] = []
  let rest = line
  if (language === 'markdown') {
    const quote = rest.match(/^> ?/)
    if (quote) {
      tokens.push({ text: quote[0], kind: 'quote' })
      rest = rest.slice(quote[0].length)
    }
  }
  const rules = language === 'sql' ? SQL : MARKDOWN
  while (rest.length) {
    const rule = rules.find(([, pattern]) => pattern.test(rest))
    const text = rule ? rest.match(rule[1])![0] : rest[0]
    const kind = rule?.[0]
    const last = tokens[tokens.length - 1]
    if (last && !last.kind && !kind) last.text += text
    else tokens.push({ text, kind })
    rest = rest.slice(text.length)
  }
  return tokens
}

export function snippetUrl(snippet: Snippet) {
  const end = snippet.startLine + snippet.code.split('\n').length - 1
  return `https://github.com/${snippet.repo}/blob/${snippet.commit}/${snippet.path}#L${snippet.startLine}-L${end}`
}

type Props = {
  snippet: Snippet
  caption: string
}

/**
 * A short excerpt from a public repository, with its real line numbers and a
 * link to exactly those lines at the commit they were copied from.
 */
export default function CodeSnippet({ snippet, caption }: Props) {
  const lines = snippet.code.split('\n')
  const endLine = snippet.startLine + lines.length - 1

  return (
    <figure className={styles.snippet}>
      <div className={styles.head}>
        <span className={styles.path}>{snippet.path}</span>
        <span className={styles.meta}>
          lines {snippet.startLine} to {endLine}, commit {snippet.commit.slice(0, 7)}
        </span>
      </div>
      <pre className={`${styles.body} ${snippet.language === 'markdown' ? styles.prose : ''}`}>
        <code>
          {lines.map((line, index) => (
            <span key={index} className={styles.row}>
              <span className={styles.gutter} aria-hidden="true">
                {snippet.startLine + index}
              </span>
              <span className={styles.text}>
                {line.length === 0
                  ? ' '
                  : tokenize(line, snippet.language).map((token, i) =>
                      token.kind ? (
                        <span key={i} className={styles[token.kind]}>
                          {token.text}
                        </span>
                      ) : (
                        token.text
                      ),
                    )}
              </span>
            </span>
          ))}
        </code>
      </pre>
      <figcaption className={styles.caption}>
        <span>{caption}</span>
        <a className={styles.link} href={snippetUrl(snippet)} target="_blank" rel="noopener noreferrer">
          View these lines on GitHub
        </a>
      </figcaption>
    </figure>
  )
}
