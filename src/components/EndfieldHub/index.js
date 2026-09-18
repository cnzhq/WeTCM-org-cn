import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const sectionCards = [
  {
    index: '01',
    eyebrow: 'EVENTS',
    title: '活动日历',
    description: '按地区、服务器与时间整理正在进行和即将开始的活动。',
    to: '/endfield/activities',
    accent: 'orange',
  },
  {
    index: '02',
    eyebrow: 'OFFICIAL',
    title: '官方信息',
    description: '分开归档中国大陆与全球发行体系的公告和官方入口。',
    to: '/endfield/official',
    accent: 'cyan',
  },
  {
    index: '03',
    eyebrow: 'MEDIA',
    title: '视频资料',
    description: '收录宣传片、版本前瞻、角色演示、音乐与开发者内容。',
    to: '/endfield/media',
    accent: 'violet',
  },
  {
    index: '04',
    eyebrow: 'DIRECTORY',
    title: '站点导航',
    description: '集中管理官方网站、平台商店、社区与第三方工具。',
    to: '/endfield/sites',
    accent: 'green',
  },
  {
    index: '05',
    eyebrow: 'OBSERVATORY',
    title: '社区观察',
    description: '观察不同语言玩家的关注点，同时保留来源与样本边界。',
    to: '/endfield/community',
    accent: 'blue',
  },
  {
    index: '06',
    eyebrow: 'DISCUSS',
    title: '讨论区',
    description: '提出观点、补充线索、报告错误，并参与资料共建。',
    to: '/endfield/discussion',
    accent: 'red',
  },
];

const regions = [
  {code: 'CN', name: '中国大陆', state: '待接入'},
  {code: 'GL', name: '全球发行', state: '待接入'},
  {code: 'JP', name: '日本', state: '待接入'},
  {code: 'KR', name: '韩国', state: '待接入'},
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function SectionCard({card}) {
  return (
    <Link className={`${styles.sectionCard} ${styles[card.accent]}`} to={card.to}>
      <div className={styles.cardTopline}>
        <span>{card.eyebrow}</span>
        <span>{card.index}</span>
      </div>
      <div className={styles.cardBody}>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </div>
      <span className={styles.cardArrow}>
        <ArrowIcon />
      </span>
    </Link>
  );
}

export default function EndfieldHub() {
  return (
    <div className={`${styles.hub} endfieldHubRoot`}>
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>
            <span className={styles.kickerDot} />
            <span>ENDFIELD INTELLIGENCE HUB</span>
            <span className={styles.version}>FRAMEWORK 0.1</span>
          </div>
          <h1>
            <span>终末地</span>
            <span className={styles.outline}>情报站</span>
          </h1>
          <p>
            面向中国大陆玩家的多语言资料索引、地区对照与社区讨论空间。
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} to="/endfield/activities">
              查看活动框架 <ArrowIcon />
            </Link>
            <Link className={styles.secondaryAction} to="/endfield/discussion">
              参与讨论
            </Link>
          </div>
        </div>

        <div className={styles.orbit} aria-hidden="true">
          <div className={styles.planet}>
            <span>II</span>
          </div>
          <div className={styles.orbitLabel}>TALOS · INFORMATION NETWORK</div>
        </div>

        <div className={styles.heroMeta}>
          <span>REGION-AWARE</span>
          <span>MULTILINGUAL</span>
          <span>SOURCE-VERIFIED</span>
        </div>
      </section>

      <section className={styles.statusPanel} aria-label="资料状态概览">
        <div className={styles.statusLead}>
          <span className={styles.sectionEyebrow}>SYSTEM STATUS</span>
          <h2>资料状态</h2>
          <p>数据接口尚未接入。这里将显示版本、活动和来源核验状态。</p>
        </div>
        <div className={styles.statusMetrics}>
          <div>
            <span>当前版本</span>
            <strong>—</strong>
          </div>
          <div>
            <span>进行中活动</span>
            <strong>00</strong>
          </div>
          <div>
            <span>待核验条目</span>
            <strong>00</strong>
          </div>
        </div>
      </section>

      <section className={styles.sections}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionEyebrow}>KNOWLEDGE MODULES</span>
            <h2>探索板块</h2>
          </div>
          <p>第一版先确定信息架构，具体内容将在后续共同补充。</p>
        </div>
        <div className={styles.sectionGrid}>
          {sectionCards.map((card) => (
            <SectionCard key={card.to} card={card} />
          ))}
        </div>
      </section>

      <section className={styles.regionPanel}>
        <div className={styles.regionIntro}>
          <span className={styles.sectionEyebrow}>REGION MATRIX</span>
          <h2>从地区开始整理，而不是从翻译开始。</h2>
          <p>
            同一条消息可能只适用于特定发行区域、服务器或平台。框架会保留这些差异，不把它们合并成一条含混的信息。
          </p>
        </div>
        <div className={styles.regionList}>
          {regions.map((region) => (
            <div className={styles.regionRow} key={region.code}>
              <span className={styles.regionCode}>{region.code}</span>
              <strong>{region.name}</strong>
              <span className={styles.regionState}>{region.state}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.buildNote}>
        <span className={styles.buildIndex}>00</span>
        <div>
          <span className={styles.sectionEyebrow}>BUILD TOGETHER</span>
          <h2>这是起点，不是定稿。</h2>
          <p>页面结构、用词、颜色和交互都可以继续调整。先让框架跑起来，再逐层补充真实内容。</p>
        </div>
        <Link className={styles.buildLink} to="/endfield/discussion">
          留下建议 <ArrowIcon />
        </Link>
      </section>
    </div>
  );
}
