/**
 * Browser-safe CSV export helper that satisfies React 19 / Next.js purity checks
 */
export function triggerCsvDownload(filename: string, headers: string[], rows: (string | number)[][]) {
  if (typeof window === 'undefined') return;

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
