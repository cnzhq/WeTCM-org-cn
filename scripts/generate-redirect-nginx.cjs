const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const input = path.join(root, 'config', 'redirects.json');
const output = path.join(root, '.redirect-build');
const statuses = new Set([301, 302, 307, 308]);
const domainRe = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const pathRe = /^\/[A-Za-z0-9._~!$&'()*+,=:@%/-]*$/;

function invalid(message) {
  throw new Error(`Invalid redirect configuration: ${message}`);
}

function domain(value, label) {
  if (typeof value !== 'string' || !domainRe.test(value)) {
    invalid(`${label} must be a lowercase DNS name`);
  }
  return value;
}

function target(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    invalid(`${label} must be an absolute URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) invalid(`${label} must use http or https`);
  if (url.username || url.password || url.search || url.hash) {
    invalid(`${label} cannot contain credentials, a query string, or a fragment`);
  }
  return url.toString();
}

function status(value, label) {
  if (!statuses.has(value)) invalid(`${label} must be 301, 302, 307, or 308`);
  return value;
}

function bool(value, label) {
  if (typeof value !== 'boolean') invalid(`${label} must be true or false`);
  return value;
}

function redirectUrl(rule, preservePath) {
  let url = rule.target;
  if (preservePath) url = url.replace(/\/$/, '') + '$uri';
  if (rule.preserveQuery) url += '$is_args$args';
  return url;
}

function locations(site) {
  const lines = [];
  for (const route of site.routes) {
    lines.push(`    location = ${route.path} {`);
    lines.push(`        return ${route.status} ${redirectUrl(route, false)};`);
    lines.push('    }', '');
  }
  lines.push('    location / {');
  lines.push(
    `        return ${site.default.status} ${redirectUrl(site.default, site.default.preservePath)};`,
  );
  lines.push('    }');
  return lines;
}

function httpServer(site) {
  return [
    'server {',
    '    listen 80;',
    '    listen [::]:80;',
    `    server_name ${[site.domain, ...site.aliases].join(' ')};`,
    '',
    '    location ^~ /.well-known/acme-challenge/ {',
    '        root /var/www/certbot;',
    '        default_type text/plain;',
    '    }',
    '',
    ...locations(site),
    '}',
  ].join('\n');
}

function httpsServer(site) {
  return [
    'server {',
    '    listen 443 ssl;',
    '    listen [::]:443 ssl;',
    `    server_name ${[site.domain, ...site.aliases].join(' ')};`,
    '',
    `    ssl_certificate /etc/letsencrypt/live/${site.domain}/fullchain.pem;`,
    `    ssl_certificate_key /etc/letsencrypt/live/${site.domain}/privkey.pem;`,
    '    include /etc/letsencrypt/options-ssl-nginx.conf;',
    '    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;',
    '',
    ...locations(site),
    '}',
  ].join('\n');
}

const config = JSON.parse(fs.readFileSync(input, 'utf8'));
if (!Array.isArray(config.sites) || config.sites.length === 0) {
  invalid('sites must be a non-empty array');
}

const allDomains = new Set();
const sites = config.sites.map((item, index) => {
  const label = `sites[${index}]`;
  const primary = domain(item.domain, `${label}.domain`);
  if (!Array.isArray(item.aliases)) invalid(`${label}.aliases must be an array`);
  const aliases = item.aliases.map((value, i) => domain(value, `${label}.aliases[${i}]`));
  for (const name of [primary, ...aliases]) {
    if (allDomains.has(name)) invalid(`${name} is configured more than once`);
    allDomains.add(name);
  }

  if (!item.default || typeof item.default !== 'object') invalid(`${label}.default is required`);
  const fallback = {
    target: target(item.default.target, `${label}.default.target`),
    status: status(item.default.status, `${label}.default.status`),
    preservePath: bool(item.default.preservePath, `${label}.default.preservePath`),
    preserveQuery: bool(item.default.preserveQuery, `${label}.default.preserveQuery`),
  };

  if (!Array.isArray(item.routes)) invalid(`${label}.routes must be an array`);
  const seenPaths = new Set();
  const routes = item.routes.map((route, routeIndex) => {
    const routeLabel = `${label}.routes[${routeIndex}]`;
    if (typeof route.path !== 'string' || !pathRe.test(route.path) || route.path === '/') {
      invalid(`${routeLabel}.path must be a non-root absolute path without a query string`);
    }
    if (seenPaths.has(route.path)) invalid(`${label} contains duplicate path ${route.path}`);
    seenPaths.add(route.path);
    return {
      path: route.path,
      target: target(route.target, `${routeLabel}.target`),
      status: status(route.status, `${routeLabel}.status`),
      preserveQuery: bool(route.preserveQuery, `${routeLabel}.preserveQuery`),
    };
  });
  return {domain: primary, aliases, default: fallback, routes};
});

fs.rmSync(output, {recursive: true, force: true});
fs.mkdirSync(output, {recursive: true});
const header = '# Generated from config/redirects.json. Do not edit on the server.\n\n';
fs.writeFileSync(path.join(output, 'bootstrap.conf'), header + sites.map(httpServer).join('\n\n') + '\n');
fs.writeFileSync(
  path.join(output, 'final.conf'),
  header + sites.flatMap((site) => [httpServer(site), httpsServer(site)]).join('\n\n') + '\n',
);
fs.writeFileSync(
  path.join(output, 'certificates.tsv'),
  sites.map((site) => `${site.domain}\t${[site.domain, ...site.aliases].join(' ')}`).join('\n') + '\n',
);
console.log(`Generated redirects for ${sites.length} site(s) and ${allDomains.size} domain(s).`);
