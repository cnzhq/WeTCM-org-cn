import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { MediaWikiClient } from './client.mjs';

const wiki = new MediaWikiClient();
const server = new McpServer(
  { name: 'wetcm-mediawiki', version: '1.0.0' },
  {
    instructions: [
      '这是 WeTCM MediaWiki 的受控编辑工具。',
      '修改页面前必须先调用 get_page，向用户展示拟修改内容或差异，并取得明确发布指令。',
      'edit_page 必须传入 get_page 返回的 revisionId；版本变化时禁止覆盖。',
      '不得把机器人凭据写入页面、响应、日志或项目文件。',
    ].join(' '),
  },
);

function result(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  };
}

server.registerTool(
  'get_page',
  {
    title: '读取百科页面',
    description: '按标题读取页面的当前源代码、修订号和时间。编辑前必须先调用。',
    inputSchema: { title: z.string().min(1).max(255) },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ title }) => result(await wiki.getPage(title)),
);

server.registerTool(
  'search_pages',
  {
    title: '搜索百科页面',
    description: '使用 MediaWiki 全文搜索查找页面。',
    inputSchema: {
      query: z.string().min(1).max(500),
      limit: z.number().int().min(1).max(50).default(10),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ query, limit }) => result({ results: await wiki.searchPages(query, limit) }),
);

server.registerTool(
  'recent_changes',
  {
    title: '查看最近修改',
    description: '列出百科最近的非机器人修改。',
    inputSchema: {
      limit: z.number().int().min(1).max(50).default(10),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ limit }) => result({ changes: await wiki.recentChanges(limit) }),
);

server.registerTool(
  'edit_page',
  {
    title: '发布百科页面',
    description: '创建或替换页面全文。必须使用刚刚读取到的修订号，并在用户明确要求发布后调用。',
    inputSchema: {
      title: z.string().min(1).max(255),
      text: z.string(),
      summary: z.string().min(1).max(240),
      expectedRevisionId: z.number().int().nonnegative(),
      minor: z.boolean().default(false),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async ({ title, text, summary, expectedRevisionId, minor }) =>
    result(await wiki.editPage({ title, text, summary, expectedRevisionId, minor })),
);

const transport = new StdioServerTransport();
await server.connect(transport);
