import { readFile } from 'node:fs/promises';

// The browser needs each photograph's id, group, dimensions, alt text and derivatives.
// Source paths and hashes stay in public/assets/manifest.json for the build checks and the record.
const slimManifest = {
  name: 'slim-asset-manifest',
  enforce: 'pre',
  async load(id) {
    if (!id.endsWith('/public/assets/manifest.json')) return null;
    const manifest = JSON.parse(await readFile(id, 'utf8'));
    return JSON.stringify(manifest.map(({ id: assetId, group, width, height, alt, large, medium, small }) => ({ id: assetId, group, width, height, alt, large, medium, small })));
  },
};

export default {
  plugins: [slimManifest],
};
