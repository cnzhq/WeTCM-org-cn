# WeTCM MediaWiki Codex connector

This local MCP server exposes read/search/recent-change tools and a guarded page-edit tool for the WeTCM MediaWiki instance.

## Credential setup (Windows)

Run in PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\mediawiki\set-credential.ps1
```

The bot password is encrypted with Windows DPAPI and saved outside the repository under `%LOCALAPPDATA%\WeTCM`. It is bound to the current Windows user and machine.

The default API endpoint is `https://111.229.165.73/api.php` and the default bot login is `CodexBot@codex`. Override them, if needed, with `WETCM_WIKI_API_URL` and `WETCM_WIKI_BOT_USER`.

The connector is registered in the user's Codex configuration with `codex mcp add`. Restart Codex after credential setup so the MCP server is loaded. Every edit requires the current revision ID, so a concurrent page change is rejected rather than overwritten.
