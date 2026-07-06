import React from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';

const footerColumns = [
  {
    title: '探索',
    links: [
      {label: '文档', to: '/docs/intro'},
      {label: '博客', to: '/blog'},
      {label: '文学', to: '/literature/intro'},
      {label: '百科', href: 'https://wiki.wetcm.org.cn'},
      {label: '时间校对', to: '/time'},
      {label: '友情链接', to: '/links'},
    ],
  },
  {
    title: '学习中医',
    links: [
      {label: '中医基础', to: '/book/intro'},
      {label: '基础理论', to: '/book/basic-theory-of-tcm/basic-0'},
      {label: '大学资料', to: '/docs/university/ntu-interview'},
      {label: '资料索引', to: '/docs/intro'},
      {label: '阅读路径', to: '/book/intro'},
    ],
  },
  {
    title: '写作与内容',
    links: [
      {label: '最新文章', to: '/blog'},
      {label: '文学目录', to: '/literature/intro'},
      {label: '标签', to: '/blog/tags'},
      {label: '作者', to: '/blog/authors/swen'},
      {label: '归档', to: '/blog/archive'},
    ],
  },
  {
    title: '站点服务',
    links: [
      {label: 'GitHub', href: 'https://github.com/'},
      {label: 'RSS', href: 'https://wetcm.org.cn/blog/rss.xml'},
      {label: 'Atom', href: 'https://wetcm.org.cn/blog/atom.xml'},
      {label: 'Docusaurus', href: 'https://docusaurus.io/'},
      {label: 'MiSans', href: 'https://hyperos.mi.com/font/en/'},
    ],
  },
  {
    title: '法律与备案',
    links: [
      {label: 'CC BY-SA 4.0', href: 'https://creativecommons.org/licenses/by-sa/4.0/'},
      {label: '医疗免责声明', href: 'https://zgcx.nhc.gov.cn/doctor'},
      {label: '苏ICP备2024061225号-2', href: 'https://beian.miit.gov.cn/'},
      {
        label: '苏公网安备32050902103224号',
        href: 'https://beian.miit.gov.cn/#/query/webSearch?code=32050902103224',
      },
    ],
  },
];

function FooterLink({link}) {
  return (
    <li>
      <Link to={link.to} href={link.href}>
        {link.label}
      </Link>
    </li>
  );
}

function FooterColumn({column}) {
  return (
    <section className="wetcmFooterColumn">
      <h2>{column.title}</h2>
      <ul>
        {column.links.map((link) => (
          <FooterLink key={`${column.title}-${link.label}`} link={link} />
        ))}
      </ul>
    </section>
  );
}

function MobileFooterColumn({column}) {
  return (
    <details className="wetcmFooterDisclosure">
      <summary>{column.title}</summary>
      <ul>
        {column.links.map((link) => (
          <FooterLink key={`${column.title}-${link.label}`} link={link} />
        ))}
      </ul>
    </details>
  );
}

export default function Footer() {
  const {footer} = useThemeConfig();

  if (!footer) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer className="wetcmFooter" aria-labelledby="wetcm-footer-title">
      <div className="wetcmFooterInner">
        <section className="wetcmFooterNotes" aria-labelledby="wetcm-footer-title">
          <h2 id="wetcm-footer-title">WeTCM 页尾信息</h2>
          <p>
            本站内容用于学习、阅读与资料整理，不提供任何诊断、处方或治疗建议。如有身体不适，请咨询具备资质的医师。
          </p>
          <p>
            除另有说明外，本站文字内容在
            <Link href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </Link>
            协议之条款下提供，附加条款亦可能应用。
          </p>
        </section>

        <nav className="wetcmFooterDirectory" aria-label="页尾导航">
          <div className="wetcmFooterDesktopColumns">
            {footerColumns.map((column) => (
              <FooterColumn key={column.title} column={column} />
            ))}
          </div>
          <div className="wetcmFooterMobileColumns">
            {footerColumns.map((column) => (
              <MobileFooterColumn key={column.title} column={column} />
            ))}
          </div>
        </nav>

        <div className="wetcmFooterMore">
          <span>更多站点入口：</span>
          <Link to="/docs/intro">文档</Link>
          <span>、</span>
          <Link to="/blog">博客</Link>
          <span>、</span>
          <Link href="https://wiki.wetcm.org.cn">百科</Link>
          <span>。</span>
        </div>

        <div className="wetcmFooterLegal">
          <p>Copyright © {year} WeTCM. All rights reserved.</p>
          <ul>
            <li>
              <Link href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</Link>
            </li>
            <li>
              <Link href="https://beian.miit.gov.cn/">苏ICP备2024061225号-2</Link>
            </li>
            <li>
              <Link href="https://beian.miit.gov.cn/#/query/webSearch?code=32050902103224">
                苏公网安备32050902103224号
              </Link>
            </li>
            <li>中国大陆</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
