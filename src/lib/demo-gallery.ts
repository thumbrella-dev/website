/**
 * Fetches and maps demo gallery data from demo.thumbrella.dev.
 * Runs server-side (SSR) — fetch is available in both Node 18+ and CF Workers.
 */

const DEMO_BASE = 'https://demo.thumbrella.dev';

interface DemoIndexFile {
  name: string;
  full_url: string;
  file_size: number;
  mimetype: string | null;
}

interface DemoResult {
  result: {
    url: string;
    status: string;
    source: string;
    duration: number; // seconds
    download_size: number;
    media: {
      file_size: number;
      kind: string;
      extension: string;
      mime: string;
      properties: Record<string, unknown>;
    };
  };
}

export interface CarouselItem {
  name: string;
  src: string;
  resolution: string;
  codec: string;
  type: string;
  /** Original media kind from result (image, video, audio, geometry, …) */
  kind: string;
  duration: string;
  size: string;
  procMs: number;
  /** Full result JSON (minus thumbnail binary) for popup details */
  resultJson: string;
}

const KIND_TO_TYPE: Record<string, string> = {
  image: 'photo',
  video: 'video',
  audio: 'audio',
  geometry: '3d',
  document: 'document',
  vector: 'vector',
};

const EXT_OVERRIDE: Record<string, string> = {
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WebP',
  avif: 'AVIF',
  heic: 'HEIC',
  mp4: 'MP4',
  avi: 'AVI',
  mkv: 'MKV',
  mp3: 'MP3',
  svg: 'SVG',
  glb: 'GLB',
  stl: 'STL',
  cr2: 'CR2',
  pef: 'PEF',
  jp2: 'JP2',
  exr: 'EXR',
  dds: 'DDS',
  tiff: 'TIFF',
};

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function mapResult(file: DemoIndexFile, result: DemoResult): CarouselItem | null {
  const r = result.result;
  if (!r) return null;

  const media = r.media ?? ({} as DemoResult['result']['media']);
  const props = (media.properties ?? {}) as Record<string, number | undefined>;
  const w = props.width_pixels ?? 0;
  const h = props.height_pixels ?? 0;
  const ext = media.extension?.toLowerCase() ?? file.name.split('.').pop()?.toLowerCase() ?? '';

  // Strip the huge base64 thumbnail from the result before serializing
  const slimResult = { ...r, media: { ...media } };
  delete (slimResult.media as Record<string, unknown>).thumbnail;

  return {
    name: file.name,
    src: `${DEMO_BASE}/thumb/${encodeURIComponent(file.name.replace(/\.[^.]+$/, ''))}.jpg`,
    resolution: w && h ? `${w}×${h}` : '',
    codec: EXT_OVERRIDE[ext] ?? ext.toUpperCase(),
    type: KIND_TO_TYPE[media.kind] ?? 'photo',
    kind: media.kind,
    duration: '', // result JSON doesn't include video duration
    size: formatSize(file.file_size),
    procMs: Math.round(r.duration * 1000),
    resultJson: JSON.stringify(slimResult),
  };
}

/**
 * Fetches the demo gallery data.
 * Only fetches results for files specified in `includeNames`.
 * If includeNames is omitted, fetches all files from the index (slow).
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
  const index = await indexRes.json() as { files: DemoIndexFile[] };

  const files = includeNames
    ? index.files.filter((f) => includeNames.includes(f.name))
    : index.files;

  // Fetch all result JSONs in parallel
  const items = await Promise.all(
    files.map(async (file) => {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const resultPath = `${DEMO_BASE}/results/${encodeURIComponent(baseName)}.json`;
      try {
        const resultRes = await fetch(resultPath);
        if (!resultRes.ok) return null;
        const result = await resultRes.json() as DemoResult;
        return mapResult(file, result);
      } catch {
        return null;
      }
    }),
  );

  return items.filter((item): item is CarouselItem => item !== null);
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
