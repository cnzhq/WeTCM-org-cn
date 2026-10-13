[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$credentialDirectory = Join-Path $env:LOCALAPPDATA 'WeTCM'
$credentialPath = Join-Path $credentialDirectory 'mediawiki-bot-password.dpapi'

New-Item -ItemType Directory -Force -Path $credentialDirectory | Out-Null

Write-Host 'Enter the new bot password for CodexBot@codex. Input will be hidden.'
$securePassword = Read-Host -AsSecureString

if ($securePassword.Length -eq 0) {
    throw 'Password cannot be empty.'
}

$encryptedPassword = ConvertFrom-SecureString -SecureString $securePassword
Set-Content -LiteralPath $credentialPath -Value $encryptedPassword -Encoding ASCII -NoNewline

Write-Host "The bot password was encrypted with Windows DPAPI and saved to: $credentialPath"
Write-Host 'It is bound to the current Windows user and machine, and was not written to the repository.'
