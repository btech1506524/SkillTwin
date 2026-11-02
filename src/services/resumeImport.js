import * as pdfjs from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_FILE_BYTES = 1024 * 1024;
const MAX_RESUME_CHARACTERS = 20000;
const MAX_PDF_PAGES = 10;

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function normalizeResumeText(value) {
  const text = value.replace(/\r\n?/g, '\n').replace(/\u0000/g, '').trim();
  if (!text) throw new Error('No readable text was found in this file.');
  if (text.length > MAX_RESUME_CHARACTERS) {
    throw new Error(`Imported text must be ${MAX_RESUME_CHARACTERS.toLocaleString()} characters or fewer.`);
  }
  if (new TextEncoder().encode(text).length > 48000) {
    throw new Error('The extracted text is too large to send safely. Use a shorter resume file.');
  }
  return text;
}

export async function importResumeFile(file) {
  if (!file) throw new Error('Choose a PDF or UTF-8 text file.');
  if (file.size > MAX_FILE_BYTES) throw new Error('Resume files must be 5 MB or smaller.');

  const fileName = file.name.toLowerCase();
  const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf';
  const isText = fileName.endsWith('.txt') || file.type === 'text/plain';
  if (isPdf && isText) throw new Error('The file type is ambiguous. Choose a .pdf or .txt file.');
  if (!isPdf && !isText) throw new Error('Choose a PDF or UTF-8 text file.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (isText) {
    if (file.size > MAX_TEXT_FILE_BYTES) throw new Error('Text files must be 1 MB or smaller.');
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw new Error('Text files must use UTF-8 encoding.');
    }
    return { text: normalizeResumeText(text), sourceType: 'text_file' };
  }

  const header = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 1024)));
  if (!/%PDF-\d\.\d/.test(header)) throw new Error('This file does not look like a valid PDF.');

  let loadingTask;
  try {
    loadingTask = pdfjs.getDocument({ data: bytes });
    const document = await loadingTask.promise;
    if (document.numPages > MAX_PDF_PAGES) {
      throw new Error(`PDF resumes may contain up to ${MAX_PDF_PAGES} pages.`);
    }

    const chunks = [];
    let characterCount = 0;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        for (const item of content.items) {
          if (typeof item.str !== 'string' || !item.str) continue;
          chunks.push(item.str);
          characterCount += item.str.length + 1;
          if (characterCount > MAX_RESUME_CHARACTERS) {
            throw new Error(`PDF text must be ${MAX_RESUME_CHARACTERS.toLocaleString()} characters or fewer.`);
          }
        }
        chunks.push('\n');
      } finally {
        page.cleanup();
      }
    }
    return { text: normalizeResumeText(chunks.join(' ')), sourceType: 'pdf_file' };
  } catch (error) {
    if (error instanceof Error && /^(PDF resumes|PDF text|No readable text|Imported text|The extracted text)/.test(error.message)) {
      throw error;
    }
    throw new Error('Unable to read this PDF. Use a text-based PDF or import a .txt file.');
  } finally {
    await loadingTask?.destroy();
  }
}
