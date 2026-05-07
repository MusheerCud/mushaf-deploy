import unzipper from 'unzipper';
import { parseStringPromise } from 'xml2js';
import { PageInput, Line, Segment, Run } from '../types/page.types';

// ── XML namespace helpers ────────────────────────────────────────────────────

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

/**
 * xml2js stores namespaced attributes as e.g. `w:val`.
 * When using xml2js with explicitArray:false we get "$" for attributes.
 * We look for the color value inside <w:color w:val="RRGGBB"/>.
 */
function getColor(rPr: Record<string, unknown> | undefined): string | null {
  if (!rPr) return null;
  const pr = Array.isArray(rPr) ? rPr[0] : rPr;
  if (!pr) return null;

  const colorEl = pr['w:color'];
  if (!colorEl) return null;
  const colorNode = Array.isArray(colorEl) ? colorEl[0] : colorEl;

  // xml2js puts attributes in "$"
  const attrs = colorNode['$'] as Record<string, string> | undefined;
  const val = attrs?.['w:val'];
  if (!val || val.toLowerCase() === 'auto') return null;
  return '#' + val.toUpperCase();
}

/** Extract all runs from a <w:p> element (xml2js parsed) */
function extractRunsFromParagraph(para: Record<string, unknown>): Run[] {
  const p = Array.isArray(para) ? para[0] : para;
  if (!p) return [];

  const runs: Run[] = [];
  const rawRuns = (p['w:r'] || []) as Record<string, unknown>[];
  const runArray = Array.isArray(rawRuns) ? rawRuns : [rawRuns];

  for (const run of runArray) {
    const r = Array.isArray(run) ? run[0] : run;
    if (!r) continue;

    const rPr = r['w:rPr'] as Record<string, unknown> | undefined;
    const color = getColor(rPr);

    const tEls = (r['w:t'] || []) as (string | Record<string, unknown>)[];
    const tArray = Array.isArray(tEls) ? tEls : [tEls];

    for (const t of tArray) {
      let text = '';
      if (typeof t === 'string') {
        text = t;
      } else if (t && typeof t === 'object') {
        // xml2js with explicitCharkey: the text is inside "_"
        text = (t as Record<string, string>)['_'] ?? '';

        // xml2js (sax-js) drops text nodes that contain ONLY whitespace.
        // If this <w:t> had xml:space="preserve" but no text was captured,
        // it was purely spaces (typically a single space between words).
        if (!text) {
          const attrs = (t as Record<string, any>)['$'];
          if (attrs && attrs['xml:space'] === 'preserve') {
            text = ' ';
          }
        }
      }
      if (text) {
        runs.push({ text, color });
      }
    }
  }
  return runs;
}

/** Collapse all runs in a paragraph into a plain string (for arabicText) */
function paragraphToText(para: Record<string, unknown>): string {
  return extractRunsFromParagraph(para)
    .map((r) => r.text)
    .join('');
}

/** Parse verse number from the end of the full Arabic line string */
function parseVerseNumber(arabicText: string): number {
  const match = arabicText.match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Build Segment[] from a table row (one row = arabic or tamil) */
function buildSegments(row: Record<string, unknown>): Segment[] {
  const rObj = Array.isArray(row) ? row[0] : row;
  const cells = (rObj['w:tc'] || []) as Record<string, unknown>[];
  const cellArray = Array.isArray(cells) ? cells : [cells];

  return cellArray.map((cell, idx) => {
    const cellObj = Array.isArray(cell) ? cell[0] : cell;
    const paras = (cellObj['w:p'] || []) as Record<string, unknown>[];
    const paraArray = Array.isArray(paras) ? paras : [paras];

    const allRuns: Run[] = [];
    for (const para of paraArray) {
      allRuns.push(...extractRunsFromParagraph(para));
    }

    return { order: idx, runs: allRuns };
  });
}

// ── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parse a .docx file buffer into a structured PageInput.
 *
 * Document structure assumed:
 *   <w:body>
 *     <w:p>  ← full Arabic line + verse number
 *     <w:tbl> ← Row 0: Arabic segments (cells), Row 1: Tamil segments (cells)
 *     <w:p>  ← full Arabic line for next verse
 *     <w:tbl> ← ...
 *   </w:body>
 */
export async function parseDocx(
  buffer: Buffer,
  pageNumber: number
): Promise<PageInput> {
  // 1. Unzip and read word/document.xml
  const directory = await unzipper.Open.buffer(buffer);
  const docFile = directory.files.find(
    (f) => f.path === 'word/document.xml'
  );
  if (!docFile) throw new Error('Invalid .docx: word/document.xml not found');

  const xmlBuffer = await docFile.buffer();
  const xmlStr = xmlBuffer.toString('utf8');

  // 2. Parse XML
  const parsed = await parseStringPromise(xmlStr, {
    explicitArray: false,    // single children are objects, not arrays
    explicitCharkey: true,   // text nodes stored in "_"
    trim: false,             // preserve arabic diacritics spacing
    xmlns: false,            // keep w: prefixes as-is
  });

  const body = parsed['w:document']?.['w:body'];
  if (!body) throw new Error('Could not find <w:body> in document.xml');

  // 3. Walk body children (paragraphs and tables interleaved)
  //    xml2js with explicitArray:false may give single element as object
  const children: (
    | { type: 'p'; el: Record<string, unknown> }
    | { type: 'tbl'; el: Record<string, unknown> }
  )[] = [];

  const paragraphs = body['w:p']
    ? Array.isArray(body['w:p'])
      ? body['w:p']
      : [body['w:p']]
    : [];
  const tables = body['w:tbl']
    ? Array.isArray(body['w:tbl'])
      ? body['w:tbl']
      : [body['w:tbl']]
    : [];

  // We need the original order. xml2js doesn't preserve order by default,
  // but we can reconstruct it by walking the raw XML character positions.
  // Simpler approach: re-parse with preserveChildrenOrder using childrenTag.
  // Instead, we re-parse with explicitArray:true and then flatten:
  const parsed2 = await parseStringPromise(xmlStr, {
    explicitArray: true,
    explicitCharkey: true,
    trim: false,
    xmlns: false,
    childkey: '$$',        // children into $$
    charsAsChildren: false,
  });

  const body2 = parsed2['w:document']?.['w:body']?.[0];
  if (!body2) throw new Error('Could not parse body children');

  // Collect paragraphs and tables in document order
  let pendingArabicLine: string | null = null;
  const lines: Line[] = [];
  let lineNumber = 0;

  // Merge all top-level paragraph and table references in their xml order
  // We'll just iterate paragraphs & tables in parallel with a simple heuristic:
  // track the "last non-empty paragraph before a table"
  const allParas: Record<string, unknown>[] = (
    Array.isArray(body2['w:p']) ? body2['w:p'] : []
  ) as Record<string, unknown>[];

  const allTables: Record<string, unknown>[] = (
    Array.isArray(body2['w:tbl']) ? body2['w:tbl'] : []
  ) as Record<string, unknown>[];

  // Since xml2js doesn't give us a unified ordered list easily, we re-parse
  // using a lightweight approach: extract ordered children via regex on the
  // raw XML to determine the paragraph-before-table associations.
  const tagOrder = await extractTagOrderRobust(xmlStr);

  let paraIdx = 0;
  let tableIdx = 0;
  let lastNonEmptyPara = '';

  for (const tag of tagOrder) {
    if (tag === 'p') {
      if (paraIdx < allParas.length) {
        const text = paragraphToText(allParas[paraIdx] as Record<string, unknown>).trim();
        if (text) lastNonEmptyPara = text;
        paraIdx++;
      }
    } else if (tag === 'tbl') {
      if (tableIdx < allTables.length) {
        const tbl = allTables[tableIdx] as Record<string, unknown>;
        const rows = (
          Array.isArray(tbl['w:tr']) ? tbl['w:tr'] : [tbl['w:tr']]
        ) as Record<string, unknown>[];

        if (rows.length >= 1) {
          lineNumber++;
          const verseNumber = parseVerseNumber(lastNonEmptyPara);
          const arabicSegments = buildSegments(rows[0]);
          const tamilSegments =
            rows.length >= 2 ? buildSegments(rows[1]) : [];
          const tagSegments =
            rows.length >= 3 ? buildSegments(rows[2]) : [];

          lines.push({
            lineNumber,
            verseNumber,
            arabicText: lastNonEmptyPara,
            arabicSegments,
            tamilSegments,
            tagSegments,
            translations: [],
          });
        }

        tableIdx++;
      }
    }
  }

  return { pageNumber, lines };
}

/**
 * Re-parse the XML with `explicitChildren: true` to get the true document order
 * of the <w:body> top-level children, specifically paragraphs and tables.
 */
async function extractTagOrderRobust(xmlStr: string): Promise<('p' | 'tbl')[]> {
  const parsed = await parseStringPromise(xmlStr, {
    explicitArray: true,
    explicitChildren: true,
    preserveChildrenOrder: true,
    xmlns: false,
    childkey: '$$',
    charsAsChildren: false,
  });

  const documentNode = parsed['w:document'];
  if (!documentNode || !documentNode['$$']) return [];

  const bodyNode = documentNode['$$'].find((n: any) => n['#name'] === 'w:body');
  if (!bodyNode || !bodyNode['$$']) return [];

  return bodyNode['$$']
    .map((node: any) => {
      const name = node['#name'];
      if (name === 'w:p') return 'p';
      if (name === 'w:tbl') return 'tbl';
      return null;
    })
    .filter((name: string | null) => name !== null) as ('p' | 'tbl')[];
}
