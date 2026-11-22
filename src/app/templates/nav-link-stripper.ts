export function stripInternalNavLinks(typstCode: string): string {
  if (!typstCode) return '';

  // Process text to unwrap #link("nav:section:...")[...] and #link("nav:entry:...")[...]
  // We handle nested brackets accurately using balanced bracket parsing
  let result = '';
  let i = 0;
  const navPrefixes = ['#link("nav:section:', '#link("nav:entry:'];

  while (i < typstCode.length) {
    let matchedPrefix = false;
    for (const prefix of navPrefixes) {
      if (typstCode.startsWith(prefix, i)) {
        matchedPrefix = true;
        // Find closing quote and paren: '")[[' or '")['
        const quoteClose = typstCode.indexOf('")[', i);
        if (quoteClose !== -1) {
          const contentStart = quoteClose + 3; // right after '")['
          let depth = 1;
          let contentEnd = contentStart;

          while (contentEnd < typstCode.length && depth > 0) {
            const char = typstCode[contentEnd];
            const prevChar = contentEnd > 0 ? typstCode[contentEnd - 1] : '';

            if (char === '[' && prevChar !== '\\') {
              depth++;
            } else if (char === ']' && prevChar !== '\\') {
              depth--;
            }
            contentEnd++;
          }

          if (depth === 0) {
            // content is from contentStart to contentEnd - 1
            const inner = typstCode.slice(contentStart, contentEnd - 1);
            result += inner;
            i = contentEnd;
            break;
          }
        }
      }
    }

    if (!matchedPrefix) {
      result += typstCode[i];
      i++;
    }
  }

  return result;
}
