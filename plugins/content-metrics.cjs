const CHINESE_READING_SPEED = 500;

function stripFrontMatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/, '');
}

function stripMarkdownSyntax(content) {
  return stripFrontMatter(content)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/[*_~>#|[\]{}()\\]/g, ' ');
}

function countContentWords(content) {
  const text = stripMarkdownSyntax(content);
  const hanChars = text.match(/\p{Script=Han}/gu) ?? [];
  const textWithoutHan = text.replace(/\p{Script=Han}/gu, ' ');
  const latinWords =
    textWithoutHan.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) ?? [];

  return hanChars.length + latinWords.length;
}

function estimateChineseReadingTime(wordCount) {
  if (wordCount <= 0) {
    return undefined;
  }
  return Math.max(1, Math.ceil(wordCount / CHINESE_READING_SPEED));
}

module.exports = {
  countContentWords,
  estimateChineseReadingTime,
};
