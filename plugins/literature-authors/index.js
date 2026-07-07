const fs = require('fs/promises');
const path = require('path');
const yaml = require('js-yaml');
const {
  countContentWords,
  estimateChineseReadingTime,
} = require('../content-metrics.cjs');

async function collectMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectMarkdownFiles(fullPath);
      }
      if (/\.(md|mdx)$/i.test(entry.name)) {
        return [fullPath];
      }
      return [];
    }),
  );

  return files.flat();
}

function toSiteSourceKey(siteDir, filePath) {
  const relativePath = path.relative(siteDir, filePath).split(path.sep).join('/');
  return `@site/${relativePath}`;
}

module.exports = function literatureAuthorsPlugin(context) {
  return {
    name: 'literature-authors',

    async loadContent() {
      const authorsPath = path.join(context.siteDir, 'blog', 'authors.yml');
      const literaturePath = path.join(context.siteDir, 'literature');
      const [authorsContent, literatureFiles] = await Promise.all([
        fs.readFile(authorsPath, 'utf8'),
        collectMarkdownFiles(literaturePath),
      ]);

      const metricsEntries = await Promise.all(
        literatureFiles.map(async (filePath) => {
          const content = await fs.readFile(filePath, 'utf8');
          const wordCount = countContentWords(content);
          return [
            toSiteSourceKey(context.siteDir, filePath),
            {
              wordCount,
              readingTime: estimateChineseReadingTime(wordCount),
            },
          ];
        }),
      );

      return {
        authors: yaml.load(authorsContent) ?? {},
        literatureMetrics: Object.fromEntries(metricsEntries),
      };
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
