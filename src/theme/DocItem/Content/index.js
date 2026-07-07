import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import styles from './styles.module.css';

function useSyntheticTitle() {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

function isLiteratureDoc(source) {
  return (
    typeof source === 'string' &&
    source.replaceAll('\\', '/').startsWith('@site/literature/')
  );
}

function normalizeAuthors(rawAuthors) {
  if (!rawAuthors) {
    return [];
  }
  return Array.isArray(rawAuthors) ? rawAuthors : [rawAuthors];
}

function resolveAuthor(author, authorsMap) {
  if (typeof author === 'string') {
    return {
      key: author,
      ...(authorsMap?.[author] ?? {}),
      name: authorsMap?.[author]?.name ?? author,
    };
  }

  if (author && typeof author === 'object') {
    const key = author.key ?? author.name;
    return {
      key,
      ...(key ? authorsMap?.[key] : {}),
      ...author,
      name: author.name ?? (key ? authorsMap?.[key]?.name : undefined) ?? key,
    };
  }

  return null;
}

function DocAuthorImage({author}) {
  const imageUrl = author.image_url ?? author.imageURL;
  if (!imageUrl) {
    return <span className={styles.authorFallback}>{author.name.charAt(0)}</span>;
  }
  return (
    <img
      className={styles.authorImage}
      src={imageUrl}
      alt=""
      loading="lazy"
    />
  );
}

function DocAuthorName({author}) {
  if (!author.url) {
    return <span className={styles.authorName}>{author.name}</span>;
  }
  return (
    <Link className={styles.authorName} to={author.url}>
      {author.name}
    </Link>
  );
}

function LiteratureAuthors() {
  const {metadata, frontMatter} = useDoc();
  const pluginData = usePluginData('literature-authors');

  if (!isLiteratureDoc(metadata.source)) {
    return null;
  }

  const authorItems = normalizeAuthors(frontMatter.authors ?? frontMatter.author)
    .map((author) => resolveAuthor(author, pluginData?.authors))
    .filter((author) => author?.name);

  if (authorItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.authors} aria-label="作者">
      {authorItems.map((author) => (
        <div className={styles.author} key={author.key ?? author.name}>
          <DocAuthorImage author={author} />
          <div className={styles.authorText}>
            <DocAuthorName author={author} />
            {author.title && (
              <span className={styles.authorTitle}>{author.title}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat('zh-Hans').format(value);
}

function LiteratureMetrics() {
  const {metadata} = useDoc();
  const pluginData = usePluginData('literature-authors');

  if (!isLiteratureDoc(metadata.source)) {
    return null;
  }

  const metrics = pluginData?.literatureMetrics?.[metadata.source];
  if (!metrics?.wordCount) {
    return null;
  }

  return (
    <div className={styles.metrics}>
      {metrics.readingTime && (
        <>
          <span>约 {formatNumber(metrics.readingTime)} 分钟阅读</span>
          <span aria-hidden="true"> · </span>
        </>
      )}
      <span>约 {formatNumber(metrics.wordCount)} 字</span>
    </div>
  );
}

export default function DocItemContent({children}) {
  const syntheticTitle = useSyntheticTitle();
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
        </header>
      )}
      <LiteratureAuthors />
      <LiteratureMetrics />
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
