/**
 * A locale template is plain text with `{token}` placeholders. Components
 * render the text parts as-is and replace each token with a control (a
 * spinner, an inline select) or a value derived from the field.
 *
 * Splitting is done up-front so the word order is entirely owned by the
 * locale: English can put the value before the unit while Chinese puts it
 * after, without the components having to reorder anything.
 */
export interface LocaleTemplatePart {
  /** Text to render verbatim. Empty for token parts. */
  readonly text: string
  /** Token name, or null when this part is literal text. */
  readonly token: string | null
}

const TOKEN_PATTERN = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g

/**
 * Split a template into literal text and control tokens.
 *
 * Tokens listed in `textTokens` are resolved to their string value and folded
 * into the surrounding text, so they do not become separate elements. That
 * matters for units such as `{unit}` in Chinese, where punctuation must stay
 * glued to the unit ("分钟，从第 …"), and for suffixes that must stay attached
 * to the unit ("minutes").
 */
export function parseLocaleTemplate(
  template: string,
  textTokens: Readonly<Record<string, string>> = {},
): LocaleTemplatePart[] {
  const parts: LocaleTemplatePart[] = []
  let pending = ''
  let cursor = 0

  TOKEN_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_PATTERN.exec(template)) !== null) {
    pending += template.slice(cursor, match.index)
    cursor = match.index + match[0].length

    const replacement = textTokens[match[1]]
    if (replacement !== undefined) {
      pending += replacement
      continue
    }

    if (pending) parts.push({ text: pending, token: null })
    pending = ''
    parts.push({ text: '', token: match[1] })
  }

  pending += template.slice(cursor)
  if (pending) parts.push({ text: pending, token: null })

  return parts
}

/** Fill a template with plain values. Unknown tokens are left untouched. */
export function renderLocaleTemplate(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replace(TOKEN_PATTERN, (whole, name: string) => values[name] ?? whole)
}

/**
 * Prepare parts for rendering inside a flex row, where the row's `gap`
 * already separates elements: drop empty text parts and trim spaces from
 * the ends of the remaining ones.
 */
export function compactTemplateParts(
  parts: ReadonlyArray<LocaleTemplatePart>,
): LocaleTemplatePart[] {
  return parts
    .map((part) => (part.token === null ? { text: part.text.trim(), token: null } : part))
    .filter((part) => part.token !== null || part.text !== '')
}
