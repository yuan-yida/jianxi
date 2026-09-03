# =============================================================
# 一键安装 Node.js 22 LTS + npm (Windows)
# 下载源: 淘宝 npmmirror 镜像（国内加速）
# 安装目录: %LOCALAPPDATA%\nodejs
# 用法: powershell -ExecutionPolicy Bypass -File scripts\install-node.ps1
# =============================================================
$ErrorActionPreference = "Stop"

$NodeVersion   = "v22.12.0"
$InstallDir    = Join-Path $env:LOCALAPPDATA "nodejs"
$ZipPath       = Join-Path $env:TEMP "node-$NodeVersion-win-x64.zip"
$MirrorBase    = "https://registry.npmmirror.com/-/binary/node"
$ZipUrl        = "$MirrorBase/$NodeVersion/node-$NodeVersion-win-x64.zip"
$ExtractDir    = Join-Path $env:TEMP "node-extract"

Write-Host "==> 1/5 Downloading Node.js $NodeVersion from npmmirror ..." -ForegroundColor Cyan
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
& curl.exe -L --retry 3 --connect-timeout 20 -o $ZipPath $ZipUrl
if ($LASTEXITCODE -ne 0) { throw "curl download failed with exit code $LASTEXITCODE" }
Write-Host "    Downloaded: $((Get-Item $ZipPath).Length) bytes"

Write-Host "==> 2/5 Extracting to $InstallDir ..." -ForegroundColor Cyan
if (Test-Path $ExtractDir) { Remove-Item $ExtractDir -Recurse -Force }
if (Test-Path $InstallDir) { Remove-Item $InstallDir -Recurse -Force }
Expand-Archive -Path $ZipPath -DestinationPath $ExtractDir -Force
Move-Item (Join-Path $ExtractDir "node-$NodeVersion-win-x64") $InstallDir
Remove-Item $ExtractDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "==> 3/5 Configuring PATH ..." -ForegroundColor Cyan
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$InstallDir*") {
    $newPath = if ($userPath) { "$InstallDir;$userPath" } else { $InstallDir }
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "    Added $InstallDir to user PATH"
} else {
    Write-Host "    PATH already contains install dir, skipped"
}
$env:Path = "$InstallDir;$env:Path"

Write-Host "==> 4/5 Verifying node / npm ..." -ForegroundColor Cyan
$nodeBin = Join-Path $InstallDir "node.exe"
$npmBin  = Join-Path $InstallDir "npm.cmd"
$nodeVer = & $nodeBin --version
$npmVer  = & $npmBin --version
Write-Host "    node : $nodeVer"
Write-Host "    npm  : $npmVer"

Write-Host "==> 5/5 Setting npm registry to npmmirror ..." -ForegroundColor Cyan
& $npmBin config set registry https://registry.npmmirror.com
Write-Host "    npm registry: $(& $npmBin config get registry)"

Write-Host ""
Write-Host "INSTALL OK. node=$nodeVer npm=$npmVer" -ForegroundColor Green
Write-Host "New terminals will pick up PATH automatically." -ForegroundColor Yellow
