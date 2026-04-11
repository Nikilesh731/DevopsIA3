<#
Download and install a portable Terraform binary into the repository at
  .tools\terraform

Usage (PowerShell):
  Set-Location <repo-root>
  PowerShell -ExecutionPolicy Bypass -File .\scripts\install-terraform.ps1 -Version 1.5.10

This script does NOT modify system PATH permanently; it prints the path to the
binary and optionally can add it to the user's PATH using `setx` (uncomment the
setx line to enable persistent addition).
#>
param(
  [string[]]$PreferredVersions = @('1.5.11','1.5.10','1.5.9','1.5.8','1.5.7','1.5.6','1.5.5','1.5.4','1.5.3','1.5.2','1.5.1','1.5.0')
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent
$toolsDir = Join-Path $repoRoot '.tools\terraform'
if (!(Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null }


# Try preferred versions in order by checking the release URL first (HEAD request)
$found = $false
$zipPath = ''
foreach ($Version in $PreferredVersions) {
  $zip = "terraform_${Version}_windows_amd64.zip"
  $uri = "https://releases.hashicorp.com/terraform/${Version}/${zip}"
  Write-Host "Checking Terraform URL: $uri"
  try {
    $resp = Invoke-WebRequest -Uri $uri -Method Head -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
      $zipPath = Join-Path $repoRoot $zip
      Write-Host "Found Terraform $Version at $uri; downloading to $zipPath"
      Invoke-WebRequest -Uri $uri -OutFile $zipPath -UseBasicParsing -ErrorAction Stop
      $found = $true
      break
    }
  } catch {
    Write-Host "Not available: $uri"
    continue
  }
}

if (-not $found) {
  Write-Error "None of the preferred Terraform versions were available. Check network/access or update \$PreferredVersions."
  exit 1
}

Write-Host "Extracting to $toolsDir"
try {
  Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
  Remove-Item $zipPath -Force
} catch {
  Write-Error "Extract failed: $($_.Exception.Message)"
  exit 1
}

$tfBinary = Join-Path $toolsDir 'terraform.exe'
if (!(Test-Path $tfBinary)) {
  Write-Error "terraform.exe not found after extract"
  exit 1
}

Write-Host "Terraform installed at: $tfBinary"
Write-Host "You can run it with: & `"$tfBinary`" -version"

# Optionally add to current session PATH (temporary):
$env:PATH = "$toolsDir;" + $env:PATH
Write-Host "Added $toolsDir to PATH for this session. Run `$env:PATH` to verify."

# Uncomment the following to add to user PATH permanently (setx affects future sessions):
# Write-Host "Adding $toolsDir to user PATH (persistent)."
# $current = [Environment]::GetEnvironmentVariable('Path', 'User')
# if ($current -notlike "*${toolsDir}*") {
#   [Environment]::SetEnvironmentVariable('Path', $current + ';' + $toolsDir, 'User')
#   Write-Host "Persistent PATH updated. Open a new terminal to use the new PATH."
# }

# Run basic checks (in infra/terraform)
Push-Location (Join-Path $repoRoot 'infra\terraform')
try {
  Write-Host "Running: terraform -version"
  & $tfBinary -version
  Write-Host "Running: terraform fmt -check"
  & $tfBinary fmt -check
  Write-Host "Running: terraform init -input=false"
  & $tfBinary init -input=false
  Write-Host "Running: terraform validate"
  & $tfBinary validate
} catch {
  Write-Error "One or more terraform checks failed: $($_.Exception.Message)"
  Pop-Location
  exit 1
}
Pop-Location

Write-Host "Terraform installation and checks completed successfully."
