export interface Run {
  text: string;
  color: string | null; // hex e.g. "#77206D", null = default
}

export interface Segment {
  order: number; // cell index (0-based)
  runs: Run[];
}

export interface Translation {
  language: string; // ISO 639-1: "en", "ta", "ur"
  text: string;
  source?: string;
}

export interface Line {
  lineNumber: number;   // 1-based within page
  verseNumber: number;  // Quran verse number parsed from arabicText
  arabicText: string;   // full Arabic line (paragraph above the table)
  arabicSegments: Segment[];
  tamilSegments: Segment[];
  translations: Translation[];
}

export interface PageInput {
  pageNumber: number;
  lines: Line[];
}
