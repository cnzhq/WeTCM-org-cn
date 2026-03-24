import React from 'react';
import Layout from '@theme/Layout';

export default function NotFound() {
  return (
    // Layout 组件会自动为你保留网站的顶部导航栏 (Navbar) 和底部页脚 (Footer)
    <Layout title="页面未找到 | Page Not Found">
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3" style={{ textAlign: 'center' }}>
            <h1 className="hero__title">
              哎呀，你来到了没有知识的荒原...
            </h1>
            <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>
              我们找不到你要访问的地址。
            </p>
            <p>
              可能是网址输入有误，或者该页面已经被转移或者删除了。
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
    </Layout>
  );
}