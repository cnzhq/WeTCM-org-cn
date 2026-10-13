import { execFileSync } from 'node:child_process';
import path from 'node:path';

const DEFAULT_API_URL = 'https://111.229.165.73/api.php';
const DEFAULT_BOT_USERNAME = 'CodexBot@codex';

function readDpapiSecret() {
  const credentialPath = path.join(
    process.env.LOCALAPPDATA ?? '',
    'WeTCM',
    'mediawiki-bot-password.dpapi',
  );

  const command = [
    `$value = Get-Content -Raw -LiteralPath '${credentialPath.replaceAll("'", "''")}'`,
    '$secure = ConvertTo-SecureString $value',
    '$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)',
    'try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }',
  ].join('; ');

  try {
    return execFileSync(
      'powershell.exe',
      ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command],
      { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch {
    throw new Error(
      `无法读取机器人密码。请先运行 scripts\\mediawiki\\set-credential.ps1（预期位置：${credentialPath}）。`,
    );
  }
}

function pageFromQuery(data, title) {
  const page = data?.query?.pages?.[0];
  if (!page || page.missing) {
    return {
      title: page?.title ?? title,
      exists: false,
      revisionId: 0,
      timestamp: null,
      content: '',
    };
  }

  const revision = page.revisions?.[0];
  return {
    title: page.title,
    exists: true,
    revisionId: revision?.revid ?? 0,
    timestamp: revision?.timestamp ?? null,
    content: revision?.slots?.main?.content ?? '',
  };
}

export class MediaWikiClient {
  constructor({
    apiUrl = process.env.WETCM_WIKI_API_URL ?? DEFAULT_API_URL,
    username = process.env.WETCM_WIKI_BOT_USER ?? DEFAULT_BOT_USERNAME,
  } = {}) {
    this.apiUrl = apiUrl;
    this.username = username;
    this.cookie = '';
    this.csrfToken = null;
  }

  async request(parameters, { method = 'GET', authenticated = false } = {}) {
    const params = new URLSearchParams({
      format: 'json',
      formatversion: '2',
      errorformat: 'plaintext',
      ...parameters,
    });
    const headers = {
      'User-Agent': 'WeTCM-CodexBot/1.0 (private wiki maintenance tool)',
    };

    if (authenticated && this.cookie) {
      headers.Cookie = this.cookie;
    }

    let url = this.apiUrl;
    const options = { method, headers };
    if (method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
      options.body = params;
    } else {
      url += `?${params}`;
    }

    const response = await fetch(url, options);
    const setCookies = response.headers.getSetCookie?.() ?? [];
    if (setCookies.length > 0) {
      const current = new Map(
        this.cookie
          .split('; ')
          .filter(Boolean)
          .map((item) => item.split(/=(.*)/s).slice(0, 2)),
      );
      for (const header of setCookies) {
        const [pair] = header.split(';', 1);
        const [name, value] = pair.split(/=(.*)/s).slice(0, 2);
        current.set(name, value);
      }
      this.cookie = [...current].map(([name, value]) => `${name}=${value}`).join('; ');
    }

    if (!response.ok) {
      throw new Error(`MediaWiki HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`MediaWiki API ${data.error.code}: ${data.error.info}`);
    }
    return data;
  }

  async login() {
    if (this.csrfToken) {
      return;
    }

    const password = readDpapiSecret();
    const loginTokenResponse = await this.request({
      action: 'query',
      meta: 'tokens',
      type: 'login',
    });
    const loginToken = loginTokenResponse.query.tokens.logintoken;

    const loginResponse = await this.request(
      {
        action: 'login',
        lgname: this.username,
        lgpassword: password,
        lgtoken: loginToken,
      },
      { method: 'POST', authenticated: true },
    );

    if (loginResponse.login?.result !== 'Success') {
      const reason = loginResponse.login?.reason;
      throw new Error(
        `机器人登录失败：${typeof reason === 'string' ? reason : JSON.stringify(reason ?? loginResponse.login?.result ?? '未知原因')}`,
      );
    }

    const csrfResponse = await this.request(
      { action: 'query', meta: 'tokens', type: 'csrf' },
      { authenticated: true },
    );
    this.csrfToken = csrfResponse.query.tokens.csrftoken;
  }

  async getPage(title) {
    const data = await this.request({
      action: 'query',
      prop: 'revisions',
      titles: title,
      rvprop: 'ids|timestamp|content',
      rvslots: 'main',
      redirects: '1',
    });
    return pageFromQuery(data, title);
  }

  async searchPages(query, limit = 10) {
    const data = await this.request({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: String(limit),
      srprop: 'snippet|timestamp|wordcount',
    });
    return data.query.search.map((item) => ({
      title: item.title,
      pageId: item.pageid,
      wordCount: item.wordcount,
      timestamp: item.timestamp,
      snippet: item.snippet.replace(/<[^>]+>/g, ''),
    }));
  }

  async recentChanges(limit = 10) {
    const data = await this.request({
      action: 'query',
      list: 'recentchanges',
      rclimit: String(limit),
      rcprop: 'title|ids|sizes|flags|user|timestamp|comment',
      rcshow: '!bot',
    });
    return data.query.recentchanges;
  }

  async editPage({ title, text, summary, expectedRevisionId, minor = false }) {
    const current = await this.getPage(title);
    if (current.revisionId !== expectedRevisionId) {
      throw new Error(
        `页面版本冲突：期望修订 ${expectedRevisionId}，当前修订 ${current.revisionId}。请重新读取页面并检查差异。`,
      );
    }

    await this.login();
    const parameters = {
      action: 'edit',
      title,
      text,
      summary: `Codex：${summary}`,
      token: this.csrfToken,
      assert: 'user',
      starttimestamp: new Date().toISOString(),
      watchlist: 'nochange',
    };

    if (current.exists) {
      parameters.basetimestamp = current.timestamp;
    } else {
      parameters.createonly = '1';
    }
    if (minor) {
      parameters.minor = '1';
    } else {
      parameters.notminor = '1';
    }

    const data = await this.request(parameters, {
      method: 'POST',
      authenticated: true,
    });

    if (data.edit?.result !== 'Success') {
      throw new Error(`编辑失败：${JSON.stringify(data.edit ?? data)}`);
    }

    return {
      title: data.edit.title,
      pageId: data.edit.pageid,
      oldRevisionId: data.edit.oldrevid,
      newRevisionId: data.edit.newrevid,
      created: Boolean(data.edit.new),
      noChange: Boolean(data.edit.nochange),
    };
  }
}
