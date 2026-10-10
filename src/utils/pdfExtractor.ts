import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs-dist
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set pdf workerSrc:', e);
  }
}

export interface ExtractedPdfData {
  text: string;
  pageCount: number;
  topics: string[];
}

export async function extractTextFromPdf(file: File): Promise<ExtractedPdfData> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let fullText = '';
  // Extract text from up to 50 pages to keep performance high
  const maxPages = Math.min(numPages, 50);

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += `\n--- Page ${pageNum} ---\n` + pageText;
  }

  // Derive simple initial topic keywords from headings
  const topicCandidates = extractKeyTopics(fullText);

  return {
    text: fullText.trim(),
    pageCount: numPages,
    topics: topicCandidates,
  };
}

function extractKeyTopics(text: string): string[] {
  // Simple heuristic topic extraction from text
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w.toLowerCase()));

  const freq: Record<string, number> = {};
  for (const w of words) {
    const norm = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    freq[norm] = (freq[norm] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

const STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'their', 'there', 'these',
  'which', 'would', 'could', 'should', 'where', 'while', 'through', 'before',
  'being', 'between', 'during', 'under', 'study', 'chapter', 'section', 'page',
  'figure', 'table', 'using', 'based', 'often', 'every', 'other', 'another',
]);
