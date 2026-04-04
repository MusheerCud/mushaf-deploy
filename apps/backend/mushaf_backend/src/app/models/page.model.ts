import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const RunSchema = new Schema(
  {
    text: { type: String, required: true },
    color: { type: String, default: null }, // hex e.g. "#77206D" or null
  },
  { _id: false }
);

const SegmentSchema = new Schema(
  {
    order: { type: Number, required: true }, // cell index within the table row
    runs: { type: [RunSchema], required: true, default: [] },
  },
  { _id: false }
);

const TranslationSchema = new Schema(
  {
    language: { type: String, required: true }, // ISO 639-1: "en", "ta", "ur"
    text: { type: String, required: true },
    source: { type: String },
  },
  { _id: false }
);

const LineSchema = new Schema(
  {
    lineNumber: { type: Number, required: true },    // 1-based order within page
    verseNumber: { type: Number, required: true },   // Quran verse number
    arabicText: { type: String, required: true },    // full Arabic line
    arabicSegments: { type: [SegmentSchema], default: [] },
    tamilSegments: { type: [SegmentSchema], default: [] },
    tagSegments: { type: [SegmentSchema], default: [] },
    translations: { type: [TranslationSchema], default: [] },
  },
  { _id: false }
);

// ── Page schema ──────────────────────────────────────────────────────────────

export interface IPage extends Document {
  pageNumber: number;
  lines: mongoose.InferSchemaType<typeof LineSchema>[];
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    pageNumber: { type: Number, required: true, unique: true, min: 1, max: 604 },
    lines: { type: [LineSchema], required: true, default: [] },
  },
  { timestamps: true }
);

// Index for fast page lookups
PageSchema.index({ pageNumber: 1 });

export const Page: Model<IPage> = mongoose.model<IPage>('Page', PageSchema);
