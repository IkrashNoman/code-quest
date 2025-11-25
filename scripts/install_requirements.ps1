# installs (or creates) .venv and installs dependencies from requirements.txt
# Usage: from repo root run: .\scripts\install_requirements.ps1

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $RepoRoot

$VenvPath = Join-Path $RepoRoot '.venv'
$ReqFile  = Join-Path $RepoRoot 'requirements.txt'

if (-not (Test-Path $ReqFile)) {
    Write-Error "requirements.txt not found at $ReqFile"
    exit 1
}

if (-not (Test-Path $VenvPath)) {
    Write-Host ".venv not found — creating virtual environment..."
    if (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3 -m venv $VenvPath
    } else {
        & python -m venv $VenvPath
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create virtual environment."
        exit 1
    }
} else {
    Write-Host ".venv already exists — using existing virtual environment."
}

$PythonExe = Join-Path $VenvPath 'Scripts\python.exe'
if (-not (Test-Path $PythonExe)) {
    Write-Error "Python executable not found at $PythonExe"
    exit 1
}

Write-Host "Upgrading pip..."
& $PythonExe -m pip install --upgrade pip

Write-Host "Installing packages from requirements.txt..."
& $PythonExe -m pip install -r $ReqFile

Write-Host "\nInstallation complete. To activate the venv in PowerShell run:\n  .\ .venv\Scripts\Activate.ps1\nOr use the venv's python directly:\n  .\.venv\Scripts\python.exe manage.py runserver"
