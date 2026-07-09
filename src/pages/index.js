import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const featureCards = [
  {
    title: '文档',
    subtitle: '从中医基础理论开始，整理可反复查阅的知识路径。',
    primaryLabel: '进入文档',
    primaryTo: '/docs/intro',
    tone: 'light',
  },
  {
    title: '博客',
    subtitle: '记录学习、生活与中医相关的观察，保留思考的现场。',
    primaryLabel: '阅读博客',
    primaryTo: '/blog',
    tone: 'dark',
  },
  {
    title: '文学',
    subtitle: '把叙事、想象与日常经验放在同一个安静的书架上。',
    primaryLabel: '进入文学',
    primaryTo: '/literature/intro',
    tone: 'warm',
  },
  {
    title: '百科',
    subtitle: '连接到更开放的资料空间，作为延伸阅读的入口。',
    primaryLabel: '访问百科',
    primaryTo: 'https://wiki.wetcm.org.cn',
    tone: 'blue',
  },
];

function CtaLinks({primaryLabel, primaryTo, secondaryLabel, secondaryTo}) {
  return (
    <div className={styles.ctaGroup}>
      <Link className={styles.primaryCta} to={primaryTo}>
        {primaryLabel}
      </Link>
      {secondaryLabel && secondaryTo ? (
        <Link className={styles.secondaryCta} to={secondaryTo}>
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}

function ShowcaseCard({title, subtitle, primaryLabel, primaryTo, tone}) {
  return (
    <article className={`${styles.showcaseCard} ${styles[tone]}`}>
      <div className={styles.cardCopy}>
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <CtaLinks primaryLabel={primaryLabel} primaryTo={primaryTo} />
      </div>
      {/* <div className={styles.cardVisual} aria-hidden="true">
        <span> d1 </span>
        <span> d2 </span>
        <span> d3 </span>
      </div> */}
    </article>
  );
}

export default function Home() {
  return (
    <Layout title="首页" description="皇家太医院 WeTCM，中医知识、写作与资料入口。">
      <main className={styles.homepage}>
        <section className={`${styles.heroSection} ${styles.fullBleed}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>WeTCM</p>
            <h1>皇家太医院</h1>
            <p className={styles.heroSubtitle}>
              不仅是一个安静、清晰、可持续整理的中医知识站。
            </p>
            <CtaLinks
              primaryLabel="开始阅读"
              primaryTo="/docs/intro"
              secondaryLabel="查看博客"
              secondaryTo="/blog"
            />
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroStack}>
              <span>医</span>
              <span>文</span>
              <span>理</span>
            </div>
          </div>
        </section>

        <section className={`${styles.statementSection} ${styles.fullBleed}`}>
          <div className={styles.statementCopy}>
            <h2>传承精华 守正创新</h2>
            <p>
              加快推进中医药现代化、产业化，坚持中西医并重，推动中医药和西医药相互补充、协调发展，推动中医药事业和产业高质量发展，推动中医药走向世界，充分发挥中医药防病治病的独特优势和作用，为建设健康中国、实现中华民族伟大复兴的中国梦贡献力量。
            </p>
          </div>
        </section>

        <section className={styles.productSection}>
          <article className={`${styles.widePanel} ${styles.docsPanel}`}>
            <div className={styles.panelCopy}>
              <p className={styles.eyebrow}>Knowledge</p>
              <h2>文档</h2>
              <p>把中医基础、大学资料与长期笔记放进一条清晰的阅读路线。</p>
              <CtaLinks
                primaryLabel="进入文档"
                primaryTo="/docs/intro"
                secondaryLabel="中医基础"
                secondaryTo="/book/intro"
              />
            </div>
            <div className={styles.docsVisual} aria-hidden="true">
              <span>阴阳者天地之道也</span>
              <span>气血津液运行有常</span>
              <span>望闻问切以辨寒热</span>
              <span>君臣佐使各有所主</span>
              <span>读书临证反复参详</span>
              <span>经络脏腑互为表里</span>
              <span>五运六气各有所纪</span>
              <span>寒热虚实审证求因</span>
              <span>升降出入无器不有</span>
              <span>法随证立方从法出</span>
            </div>
          </article>

          <div className={styles.cardGrid}>
            {featureCards.map((card) => (
              <ShowcaseCard key={card.title} {...card} />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
