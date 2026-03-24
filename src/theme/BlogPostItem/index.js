import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import GiscusComponent from '@site/src/components/Comment';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';

export default function BlogPostItemWrapper(props) {
  // useBlogPost hook 可以帮我们获取当前页面的状态
  const { isBlogPostPage } = useBlogPost();

  return (
    <>
      {/* 渲染原本的博客文章内容 */}
      <BlogPostItem {...props} />
      
      {/* 核心逻辑：只有在“博客详情页”才显示评论区，不要在“博客列表页”显示 */}
      {isBlogPostPage && <GiscusComponent />}
    </>
  );
}