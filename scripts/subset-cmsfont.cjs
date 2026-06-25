const fs = require('fs/promises');
const path = require('path');
const subsetFont = require('subset-font');

const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'static', 'fonts', 'CMSFont-Bold.woff2');
const outputPath = path.join(projectRoot, 'static', 'fonts', 'CMSFont-Bold.subset.woff2');
const text = '皇家太医院';

async function main() {
  const source = await fs.readFile(sourcePath);
  const subset = await subsetFont(source, text, {
    targetFormat: 'woff2',
    preserveNameIds: [1, 2, 4, 6],
  });

  await fs.writeFile(outputPath, subset);

  const saved = source.length - subset.length;
  const percent = ((saved / source.length) * 100).toFixed(1);

  console.log(`CMSFont subset generated: ${path.relative(projectRoot, outputPath)}`);
  console.log(`Characters: ${text}`);
  console.log(`Size: ${formatBytes(source.length)} -> ${formatBytes(subset.length)} (${percent}% smaller)`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
