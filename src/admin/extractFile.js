// Extrai texto de um ficheiro no browser. PDF via pdfjs (import dinâmico, fica
// fora do bundle principal); .txt/.md/.csv lidos diretamente.
export async function extractFileText(file) {
  const name = (file.name || '').toLowerCase();
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');

  if (!isPdf) {
    // Texto simples
    return await file.text();
  }

  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  let text = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(' ') + '\n\n';
  }
  return text.trim();
}

export const ACCEPTED_FILES = '.pdf,.txt,.md,.markdown,.csv,text/plain';
