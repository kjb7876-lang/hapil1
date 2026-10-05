'use strict';

const assert = require('node:assert/strict');
const baseUrl = new URL('https://kjb7876-lang.github.io/hapil1/');

function checkedUrl(file, cacheKey, cacheValue) {
  assert.equal(typeof file, 'string', 'public path must be a repository filename');
  const segments = file.split('/');
  assert(segments.every(segment => segment && segment !== '.' && segment !== '..' && !segment.includes('\\')),
    'public path must be relative and contain ordinary filename segments');
  // These are literal repository filenames. In particular, # is part of the
  // original audio name rather than a fragment, and spaces must round-trip.
  const encodedPath = segments.map(encodeURIComponent).join('/');
  const url = new URL(encodedPath, baseUrl);
  assert.equal(url.origin, baseUrl.origin, 'public file must remain on the fixed Pages origin');
  assert.equal(url.pathname, baseUrl.pathname + encodedPath, 'public path must stay under the fixed Pages root');
  assert.equal(url.hash, '', 'filenames cannot introduce a URL fragment');
  assert.equal(url.search, '', 'filenames cannot introduce query parameters');
  url.searchParams.set(cacheKey, cacheValue);
  return url;
}

module.exports = { checkedUrl };
