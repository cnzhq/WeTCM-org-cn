// 仅读取公开 TLS 证书用于诊断，不请求网站内容或修改证书。
// 允许握手取证，但仍要求 authorized 为 true；无效证书导致非零退出码。
const tls = require('node:tls');

const domains = ['wetcm.org.cn', 'www.wetcm.org.cn', 'wiki.wetcm.org.cn', 'cal.wetcm.org.cn'];
const origin = process.argv.includes('--origin') ? '47.116.214.51' : null;
const warningDays = 14;

function check(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: origin || domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false,
    }, () => {
      const certificate = socket.getPeerCertificate();
      const expires = new Date(certificate.valid_to);
      const days = Math.floor((expires.getTime() - Date.now()) / 86400000);
      const hostnameError = tls.checkServerIdentity(domain, certificate);
      const valid = socket.authorized && !hostnameError && Number.isFinite(days) && days >= warningDays;
      const result = {
        domain,
        mode: origin ? 'origin' : 'public DNS',
        address: socket.remoteAddress,
        issuer: certificate.issuer?.CN,
        expiresUTC: Number.isFinite(expires.getTime()) ? expires.toISOString() : null,
        daysRemaining: Number.isFinite(days) ? days : null,
        trusted: socket.authorized && !hostnameError,
        error: socket.authorizationError || hostnameError?.message || null,
        result: valid ? 'PASS' : 'FAIL',
      };
      console.log(JSON.stringify(result));
      socket.end();
      resolve(valid);
    });
    socket.setTimeout(10000, () => socket.destroy(new Error('TLS connection timed out')));
    socket.on('error', (error) => {
      console.log(JSON.stringify({domain, mode: origin ? 'origin' : 'public DNS', result: 'FAIL', error: error.message}));
      resolve(false);
    });
  });
}

Promise.all(domains.map(check)).then((results) => {
  if (results.some((valid) => !valid)) process.exitCode = 1;
  console.log('Checks sample the reached endpoints; CDN nodes and IPv4/IPv6 paths may differ.');
});
