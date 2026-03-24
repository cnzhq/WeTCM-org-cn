// src/theme/NotFound/Content/index.js
import React from 'react';
import clsx from 'clsx'; // Docusaurus 默认自带的类名合并工具

export default function NotFoundContent({ className }) {
  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className="row">
        <div className="col col--6 col--offset-3" style={{ textAlign: 'center' }}>
          <h1 className="hero__title">
            哎呀！你来到了没有知识的荒原...
          </h1>
          <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>
            我们找不到你要访问的地址。
          </p>
          <p>
            可能是网址输入有误，或者该页面已经被转移（删除）了。
          </p>
          <a 
            href="/" 
            className="button button--primary button--lg" 
            style={{ marginTop: '20px' }}
          >
            返回首页
          </a>
        </div>
      </div>
    </main>
  );
}