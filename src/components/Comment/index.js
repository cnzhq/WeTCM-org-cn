import React from 'react';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  const { colorMode } = useColorMode();

  return (
    // 这里的容器加一点上边距，让评论区和文章内容稍微隔开
    <div style={{ marginTop: '50px' }}>
      <Giscus
        id="comments"
        repo="cnzhq/WeTCM-org-cn"
        repoId="R_kgDOQyh2pw"           // 替换：你在 Giscus 官网获取的 repo ID
        category="Announcements"        // 替换：你在 Giscus 选择的分类（通常是 Announcements 或 General）
        categoryId="DIC_kwDOQyh2p84C5Jx9"   // 替换：你在 Giscus 官网获取的 category ID
        mapping="pathname"              // 使用文章的 URL 路径作为帖子标题，最准
        strict="0"
        reactionsEnabled="1"            // 开启点赞/表情功能
        emitMetadata="0"
        inputPosition="top"             // 评论框放在上方
        theme={colorMode === 'dark' ? 'transparent_dark' : 'light'} // 自动跟随网站深浅色模式
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}