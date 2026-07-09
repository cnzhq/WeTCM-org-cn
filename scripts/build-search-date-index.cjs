const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'static', 'search', 'date-index.json');

const sources = [
  {dir: 'blog', section: '博客', routeBasePath: '/blog', inferDateFromFilename: true},
  {dir: 'literature', section: '文学', routeBasePath: '/literature'},
  {dir: 'docs', section: '文档', routeBasePath: '/docs'},
  {dir: 'book', section: '图书', routeBasePath: '/book'},
];

function listMarkdownFiles(dir) {
  const absoluteDir = path.join(rootDir, dir);

  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  return fs.readdirSync(absoluteDir, {withFileTypes: true}).flatMap((entry) => {
    const entryPath = path.join(absoluteDir, entry.name);

    if (entry.isDirectory()) {
      return listMarkdownFiles(path.relative(rootDir, entryPath));
    }

    if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      return [entryPath];
    }

    return [];
  });
}

function parseFrontMatter(content) {
  if (!content.startsWith('---')) {
    return {frontMatter: {}, body: content};
  }

  const end = content.indexOf('\n---', 3);

  if (end === -1) {
    return {frontMatter: {}, body: content};
  }

  const frontMatterText = content.slice(3, end).trim();
  const body = content.slice(end + 4).replace(/^\r?\n/, '');
  const frontMatter = {};

  for (const line of frontMatterText.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    frontMatter[key] = rawValue
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .replace(/\s+#.*$/, '');
  }

  return {frontMatter, body};
}

function normalizeDate(value) {
  const match = String(value ?? '').match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function inferDateFromFilename(filePath) {
  return normalizeDate(path.basename(filePath));
}

function resolveDate(source, frontMatter, filePath) {
  const searchDate = normalizeDate(frontMatter.searchDate);

  if (searchDate) {
    return {date: searchDate, dateType: '检索日期'};
  }

  const frontMatterDate = normalizeDate(frontMatter.date);

  if (frontMatterDate) {
    return {
      date: frontMatterDate,
      dateType: source.dir === 'blog' ? '发布日期' : '检索日期',
    };
  }

  const inferredDate = source.inferDateFromFilename
    ? inferDateFromFilename(filePath)
    : '';

  return {
    date: inferredDate,
    dateType: source.dir === 'blog' ? '发布日期' : '检索日期',
  };
}

function stripMarkdown(content) {
  return content
    .replace(/\{\/\*\s*truncate\s*\*\/\}/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_\-|~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTitle(frontMatter, body, filePath) {
  if (frontMatter.title) {
    return frontMatter.title;
  }

  const heading = body.match(/^#\s+(.+)$/m);

  if (heading) {
    return heading[1].trim();
  }

  return path.basename(filePath, path.extname(filePath));
}

function toRoutePath(source, filePath, frontMatter) {
  if (frontMatter.slug) {
    const slug = frontMatter.slug.replace(/^\/+|\/+$/g, '');
    return `${source.routeBasePath}/${slug}`;
  }

  const relative = path
    .relative(path.join(rootDir, source.dir), filePath)
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\/index$/, '');

  if (source.dir === 'blog') {
    const slug = relative
      .replace(/\/index$/, '')
      .replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return `${source.routeBasePath}/${slug}`;
  }

  return `${source.routeBasePath}/${relative}`;
}

function buildIndex() {
  const items = [];

  for (const source of sources) {
    for (const filePath of listMarkdownFiles(source.dir)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const {frontMatter, body} = parseFrontMatter(content);

      if (String(frontMatter.draft).toLowerCase() === 'true') {
        continue;
      }

      const {date, dateType} = resolveDate(source, frontMatter, filePath);
      const plainText = stripMarkdown(body);

      items.push({
        title: getTitle(frontMatter, body, filePath),
        url: toRoutePath(source, filePath, frontMatter),
        date,
        dateType,
        section: source.section,
        excerpt: plainText.slice(0, 220),
      });
    }
  }

  items.sort((a, b) => {
    if (!a.date && !b.date) {
      return a.title.localeCompare(b.title, 'zh-Hans');
    }

    if (!a.date) {
      return 1;
    }

    if (!b.date) {
      return -1;
    }

    return b.date.localeCompare(a.date);
  });

  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(`${outputPath}`, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(rootDir, outputPath)} with ${items.length} items.`);
}

buildIndex();
