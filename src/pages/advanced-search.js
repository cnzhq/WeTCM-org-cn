import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './advanced-search.module.css';

const dateFormatter = new Intl.DateTimeFormat('zh-Hans', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function formatDate(date) {
  if (!date) {
    return '无日期';
  }

  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

function normalizeDateInput(value) {
  const text = String(value ?? '').trim();

  if (!text) {
    return {value: '', valid: true};
  }

  const compactMatch = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  const dashedMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const match = compactMatch || dashedMatch;

  if (!match) {
    return {value: text, valid: false};
  }

  const [, year, month, day] = match;
  const normalized = `${year}-${month}-${day}`;
  const parsed = new Date(`${normalized}T00:00:00`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() + 1 !== Number(month) ||
    parsed.getDate() !== Number(day)
  ) {
    return {value: text, valid: false};
  }

  return {value: normalized, valid: true};
}

function DateField({id, label, value, error, onChange, onBlur}) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <div className={styles.dateInputGroup}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          placeholder="YYYY-MM-DD"
          aria-invalid={error ? 'true' : 'false'}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <input
          className={styles.calendarInput}
          type="date"
          aria-label={`${label}日历选择`}
          value={normalizeDateInput(value).valid ? normalizeDateInput(value).value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {error ? <small className={styles.errorText}>{error}</small> : null}
    </label>
  );
}

export default function AdvancedSearchPage() {
  const indexUrl = useBaseUrl('/search/date-index.json');
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [status, setStatus] = useState('loading');
  const [dateErrors, setDateErrors] = useState({startDate: '', endDate: ''});

  useEffect(() => {
    let cancelled = false;

    async function loadIndex() {
      try {
        const response = await fetch(indexUrl);

        if (!response.ok) {
          throw new Error(`Failed to load ${indexUrl}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
          setStatus('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    loadIndex();

    return () => {
      cancelled = true;
    };
  }, [indexUrl]);

  const parsedStartDate = normalizeDateInput(startDate);
  const parsedEndDate = normalizeDateInput(endDate);
  const hasValidDateFilter =
    parsedStartDate.valid &&
    parsedEndDate.valid &&
    (Boolean(parsedStartDate.value) || Boolean(parsedEndDate.value));

  const results = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return items
      .filter((item) => {
        if (hasValidDateFilter) {
          if (!item.date) {
            return false;
          }

          if (parsedStartDate.value && item.date < parsedStartDate.value) {
            return false;
          }

          if (parsedEndDate.value && item.date > parsedEndDate.value) {
            return false;
          }
        }

        if (!normalizedQuery) {
          return true;
        }

        return normalizeText(
          `${item.title} ${item.section} ${item.excerpt} ${item.date} ${item.dateType}`,
        ).includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (!a.date && !b.date) {
          return normalizeText(a.title).localeCompare(normalizeText(b.title), 'zh-Hans');
        }

        if (!a.date) {
          return 1;
        }

        if (!b.date) {
          return -1;
        }

        return sortOrder === 'asc'
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      });
  }, [
    items,
    query,
    hasValidDateFilter,
    parsedStartDate.value,
    parsedEndDate.value,
    sortOrder,
  ]);

  function normalizeField(field, value) {
    const normalized = normalizeDateInput(value);

    if (normalized.valid) {
      if (field === 'startDate') {
        setStartDate(normalized.value);
      } else {
        setEndDate(normalized.value);
      }
    }

    setDateErrors((current) => ({
      ...current,
      [field]: normalized.valid ? '' : '请输入 YYYY-MM-DD 或 8 位数字日期',
    }));
  }

  return (
    <Layout title="高级搜索" description="站内高级搜索、日期排序和日期范围筛选">
      <main className={styles.page}>
        <section className={styles.header}>
          <p className={styles.eyebrow}>站内搜索</p>
          <h1>高级搜索</h1>
          <p>在站内内容中按关键词、日期和时间范围检索，并按日期排序。</p>
        </section>

        <section className={styles.controls} aria-label="高级搜索条件">
          <label className={styles.field} htmlFor="advanced-search-query">
            <span>关键词</span>
            <input
              id="advanced-search-query"
              type="search"
              value={query}
              placeholder="输入标题、正文片段或内容分区"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <DateField
            id="advanced-search-start-date"
            label="开始日期"
            value={startDate}
            error={dateErrors.startDate}
            onChange={(value) => {
              setStartDate(value);
              setDateErrors((current) => ({...current, startDate: ''}));
            }}
            onBlur={() => normalizeField('startDate', startDate)}
          />

          <DateField
            id="advanced-search-end-date"
            label="结束日期"
            value={endDate}
            error={dateErrors.endDate}
            onChange={(value) => {
              setEndDate(value);
              setDateErrors((current) => ({...current, endDate: ''}));
            }}
            onBlur={() => normalizeField('endDate', endDate)}
          />

          <label className={styles.field} htmlFor="advanced-search-sort">
            <span>排序</span>
            <select
              id="advanced-search-sort"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}>
              <option value="desc">最新优先</option>
              <option value="asc">最早优先</option>
            </select>
          </label>

          <button
            className={styles.clearButton}
            type="button"
            onClick={() => {
              setQuery('');
              setStartDate('');
              setEndDate('');
              setSortOrder('desc');
              setDateErrors({startDate: '', endDate: ''});
            }}>
            清空
          </button>
        </section>

        <section className={styles.hints} aria-label="搜索模式">
          <span>关键词搜索</span>
          <span>日期筛选</span>
          <span>日期范围筛选</span>
        </section>

        <section className={styles.summary} aria-live="polite">
          {status === 'loading' ? '正在读取搜索索引...' : null}
          {status === 'error' ? '搜索索引读取失败，请先重新构建站点。' : null}
          {status === 'ready' ? `共找到 ${results.length} 条内容` : null}
        </section>

        <section className={styles.results} aria-label="高级搜索结果">
          {status === 'ready' && results.length === 0 ? (
            <p className={styles.empty}>没有找到符合条件的内容。</p>
          ) : null}

          {results.map((item) => (
            <article className={styles.resultItem} key={`${item.url}-${item.date}`}>
              <div className={styles.resultMeta}>
                <span>{item.section}</span>
                <time dateTime={item.date || undefined}>
                  {item.dateType ?? '日期'}：{formatDate(item.date)}
                </time>
              </div>
              <h2>
                <Link to={item.url}>{item.title}</Link>
              </h2>
              {item.excerpt ? <p>{item.excerpt}</p> : null}
            </article>
          ))}
        </section>
      </main>
    </Layout>
  );
}
