#Requires -Version 5.1
<#
  Downloads and extracts the GitHub Actions self-hosted runner for Windows x64.
  Default install path: C:\actions-runner (avoids long-path issues).

  Does NOT register the runner (no token in this script). After this runs:
  1. Repo: Settings → Actions → Runners → New self-hosted runner → copy token
  2. In an elevated or normal cmd from C:\actions-runner:
       .\config.cmd --url https://github.com/OWNER/REPO --token YOUR_ONE_TIME_TOKEN
  3. Run interactively: .\run.cmd
     Or install as a service: see https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service
#>
param(
  [string]$RunnerRoot = "C:\actions-runner",
  [string]$Version = "2.333.1",
  [string]$ExpectedSha256 = "d0c4fcb91f8f0754d478db5d61db533bba14cad6c4676a9b93c0b7c2a3969aa0"
)

$ErrorActionPreference = "Stop"
$zipName = "actions-runner-win-x64-$Version.zip"
$zipPath = Join-Path $RunnerRoot $zipName
$url = "https://github.com/actions/runner/releases/download/v$Version/$zipName"

if (-not (Test-Path $RunnerRoot)) {
  New-Item -ItemType Directory -Path $RunnerRoot -Force | Out-Null
}

Write-Host "Downloading $url"
Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing

$actual = (Get-FileHash -Path $zipPath -Algorithm SHA256).Hash.ToUpper()
if ($actual -ne $ExpectedSha256.ToUpper()) {
  throw "SHA256 mismatch. Expected $ExpectedSha256 got $actual (update ExpectedSha256 when changing Version)."
}
Write-Host "SHA256 OK."

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $RunnerRoot)
Write-Host "Extracted into $RunnerRoot"
Write-Host "Next: cd $RunnerRoot; .\config.cmd --url <repo-url> --token <token-from-github>"
