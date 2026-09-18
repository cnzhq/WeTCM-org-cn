import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const columns = [
  {key: '地区', label: '国家或地区'},
  {key: '名称', label: '名称'},
  {key: '类型', label: '类型'},
  {key: '语言', label: '语言'},
  {key: '状态', label: '状态'},
  {key: '最后核验', label: '最后核验'},
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(value.trim());
      value = '';
    } else if (character === '\n') {
      row.push(value.trim());
      if (row.some((cell) => cell !== '')) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else if (character !== '\r') {
      value += character;
    }
  }

  row.push(value.trim());
  if (row.some((cell) => cell !== '')) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((cells, rowIndex) => ({
    ...Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])),
    __rowId: rowIndex,
  }));
}

function SiteCell({row}) {
  const content = (
    <span className={styles.siteIdentity}>
      {row['图片'] ? (
        <img src={row['图片']} alt="" loading="lazy" />
      ) : null}
      <span>{row['名称']}</span>
    </span>
  );

  return row['网址'] ? (
    <a href={row['网址']} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : content;
}

function RegionCell({row}) {
  return (
    <span className={styles.regionIdentity}>
      {row['旗帜'] ? <span className={styles.flag}>{row['旗帜']}</span> : null}
      <span>{row['地区']}</span>
    </span>
  );
}

function renderCell(row, key) {
  if (key === '地区') {
    return <RegionCell row={row} />;
  }
  if (key === '名称') {
    return <SiteCell row={row} />;
  }
  return row[key];
}

export default function CsvSortableTable({src}) {
  const csvUrl = useBaseUrl(src);
  const [rows, setRows] = useState([]);
  const [sort, setSort] = useState({key: '地区', direction: 'asc'});
  const [state, setState] = useState('loading');
  const collator = useMemo(
    () => new Intl.Collator('zh-Hans', {numeric: true, sensitivity: 'base'}),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    fetch(csvUrl, {cache: 'no-store'})
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        if (!cancelled) {
          setRows(parseCsv(text));
          setState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [csvUrl]);

  const sortedRows = useMemo(
    () =>
      rows
        .map((row, originalIndex) => ({row, originalIndex}))
        .sort((left, right) => {
          const result = collator.compare(
            left.row[sort.key] ?? '',
            right.row[sort.key] ?? '',
          );
          return result === 0
            ? left.originalIndex - right.originalIndex
            : sort.direction === 'asc'
              ? result
              : -result;
        })
        .map(({row}) => row),
    [collator, rows, sort],
  );

  function changeSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <div className={styles.tableFrame}>
      <div className={styles.scrollArea} tabIndex="0">
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => {
                const isActive = sort.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      isActive
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }>
                    <button type="button" onClick={() => changeSort(column.key)}>
                      <span>{column.label}</span>
                      <span
                        className={`${styles.sortMark} ${
                          isActive ? styles[sort.direction] : styles.unsorted
                        }`}
                        aria-hidden="true">
                        <span className={styles.sortUp} />
                        <span className={styles.sortDown} />
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {state === 'loading' ? (
              <tr><td className={styles.emptyCell} colSpan={columns.length}>正在读取资料……</td></tr>
            ) : null}
            {state === 'error' ? (
              <tr><td className={styles.emptyCell} colSpan={columns.length}>CSV 文件读取失败，请检查文件路径和编码。</td></tr>
            ) : null}
            {state === 'ready' && sortedRows.length === 0 ? (
              <tr><td className={styles.emptyCell} colSpan={columns.length}>CSV 文件中暂无资料。</td></tr>
            ) : null}
            {state === 'ready'
              ? sortedRows.map((row) => (
                  <tr key={row.__rowId}>
                    {columns.map((column) => (
                      <td key={column.key}>{renderCell(row, column.key)}</td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
