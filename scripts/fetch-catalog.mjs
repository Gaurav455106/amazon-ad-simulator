// Fetches real amazon.in product data for the given ASINs from Mindcase and writes
// src/data/catalog.json. Runs in Node only, so the API key never reaches the browser bundle.
//
// Usage: put MINDCASE_API_KEY=mk_live_... in .env.local (git-ignored), then
//   npm run fetch:catalog -- B0BSXC1Z63 B09J578NDM ...   (no ASINs = the demo catalogue)
import { writeFile } from 'node:fs/promises';
import { MINDCASE_PRODUCTS_URL, buildProductsRequest, mapMindcaseRows } from '../src/data/mindcaseCatalog.js';
import { BASE_PRODUCTS } from '../src/data/demoProducts.js';

const OUT_FILE = new URL('../src/data/catalog.json', import.meta.url);
const ERRORS = {
  401: 'Invalid or missing API key (check MINDCASE_API_KEY).',
  402: 'Mindcase wallet balance is empty; top up at console.mindcase.co.',
  422: 'Mindcase rejected a request parameter.',
  429: 'Rate limited (60 requests/min); wait a minute and retry.',
};

async function main() {
  const key = process.env.MINDCASE_API_KEY;
  if (!key) throw new Error('MINDCASE_API_KEY is not set. Add it to .env.local and run with --env-file=.env.local');
  const asins = process.argv.length > 2 ? process.argv.slice(2) : BASE_PRODUCTS.map(p => p.asin);
  const body = buildProductsRequest(asins);
  console.log(`Fetching ${body.params.urls.length} product(s) from Mindcase…`);

  const res = await fetch(MINDCASE_PRODUCTS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status}: ${ERRORS[res.status] || json.error || res.statusText}`);
  if (json.status === 'running') throw new Error(`Job ${json.job_id} still running after 60s; retry with fewer ASINs.`);
  if (json.status === 'failed') throw new Error(`Mindcase job failed: ${json.error}`);

  const products = mapMindcaseRows(json.data);
  if (!products.length) throw new Error('Mindcase returned no usable products.');
  await writeFile(OUT_FILE, `${JSON.stringify(products, null, 2)}\n`);
  console.log(`Wrote ${products.length} product(s) to src/data/catalog.json`);
}

main().catch((err) => {
  console.error(`fetch-catalog failed: ${err.message}`);
  process.exit(1);
});
