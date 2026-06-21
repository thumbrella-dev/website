/**
 * Fetches and maps demo gallery data from demo.thumbrella.dev.
 * Runs server-side (SSR) — fetch is available in both Node 18+ and CF Workers.
 *
 * Uses the index.json template URLs (media/thumb/data) to construct paths
 * instead of manually assembling them.  Timing and kind data are now in the
 * index, so we no longer fetch individual result JSONs for basic carousel data.
 */

const DEMO_BASE = 'https://demo.thumbrella.dev';

// ── Index.json shape (new schema) ─────────────────────────────────────────

interface DemoIndex {
  generated: string;
  media: string;   // "https://demo.thumbrella.dev/media/{{name}}"
  thumb: string;   // "https://demo.thumbrella.dev/thumb/{{name}}.jpg"
  data: string;    // "https://demo.thumbrella.dev/results/{{name}}.json"
  files: DemoIndexFile[];
}

interface DemoIndexFile {
  name: string;
  size: number;
  kind: string;
  extension: string;
  link: string;
  description: string;
  duration: number;  // seconds
}

// ── Per-result JSON shape (only fetched lazily for popup) ─────────────────

interface DemoResult {
  result?: {
    url: string;
    status: string;
    duration: number;
    download_size: number;
    media?: {
      file_size: number;
      kind: string;
      extension: string;
      mime: string;
      properties: Record<string, unknown>;
      thumbnail?: string;
    };
  };
}

// ── Carousel item (consumed by MediaCarousel.astro) ───────────────────────

export interface CarouselItem {
  name: string;
  src: string;
  resolution: string;
  codec: string;
  type: string;
  kind: string;
  duration: string;
  size: string;
  procMs: number;
  /** URL to fetch the full result JSON for popup details. */
  resultUrl: string;
  /** Full result JSON (minus thumbnail), populated lazily on the client. */
  resultJson?: string;
}

// ── Lookup tables ─────────────────────────────────────────────────────────

const KIND_TO_TYPE: Record<string, string> = {
  image: 'photo',
  video: 'video',
  audio: 'audio',
  geometry: '3d',
  document: 'document',
  vector: 'vector',
};

const EXT_OVERRIDE: Record<string, string> = {
  jpeg: 'JPEG',  png: 'PNG',   gif: 'GIF',   webp: 'WebP',
  avif: 'AVIF',  heic: 'HEIC', mp4: 'MP4',   avi: 'AVI',
  mkv: 'MKV',    mp3: 'MP3',   svg: 'SVG',   glb: 'GLB',
  stl: 'STL',    cr2: 'CR2',   pef: 'PEF',   jp2: 'JP2',
  exr: 'EXR',    dds: 'DDS',   tiff: 'TIFF',
};

// ── Helpers ───────────────────────────────────────────────────────────────

/** Naive {{name}} template substitution. */
function resolveTemplate(template: string, name: string): string {
  return template.replaceAll('{{name}}', encodeURIComponent(name));
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

// ── Mapping ───────────────────────────────────────────────────────────────

function mapIndexFile(file: DemoIndexFile, thumbTemplate: string, dataTemplate: string): CarouselItem {
  const ext = (file.extension || file.name.split('.').pop() || '').toLowerCase();

  return {
    name: file.name,
    src: resolveTemplate(thumbTemplate, file.name),
    resolution: '',   // only available from per-result JSON (fetched lazily)
    codec: EXT_OVERRIDE[ext] ?? ext.toUpperCase(),
    type: KIND_TO_TYPE[file.kind] ?? 'photo',
    kind: file.kind,
    duration: '',      // media duration (not in index — in result JSON only)
    size: formatSize(file.size),
    procMs: Math.round((file.duration || 0) * 1000),
    resultUrl: resolveTemplate(dataTemplate, file.name),
  };
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Fetches the demo gallery index and maps to CarouselItem[].
 *
 * Only one HTTP request — the new index.json includes kind, extension, and
 * duration so we don't need to fetch individual result JSONs for basic tile
 * data.  Per-result JSON is fetched lazily on the client when the popup opens.
 *
 * If `includeNames` is given, only those files are returned (faster seed).
 */
export async function fetchDemoGallery(
  includeNames?: string[],
): Promise<CarouselItem[]> {
  const indexPath = `${DEMO_BASE}/index.json`;
  const indexRes = await fetch(indexPath);
  if (!indexRes.ok) {
    console.error(`Demo index fetch failed: ${indexRes.status}`);
    return [];
  }
  const index = await indexRes.json() as DemoIndex;

  const files = includeNames
    ? index.files.filter((f) => includeNames.includes(f.name))
    : index.files;

  return files.map((f) => mapIndexFile(f, index.thumb, index.data));
}

/**
 * Shuffles an array using a semi-random pass-through algorithm:
 * repeatedly picks a random item from the first 4 positions, extracts it,
 * and appends to the result until the source is empty.
 * This keeps nearby items somewhat near each other in the output.
 */
export function shuffleGallery<T>(items: T[]): T[] {
  const source = [...items];
  const result: T[] = [];
  while (source.length > 0) {
    const maxIdx = Math.min(3, source.length - 1);
    const idx = Math.floor(Math.random() * (maxIdx + 1));
    result.push(source.splice(idx, 1)[0]);
  }
  return result;
}
