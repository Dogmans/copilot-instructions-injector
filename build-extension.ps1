# PowerShell script to compile TypeScript and build the VSIX file

# Step 0: Delete existing VSIX files
Write-Host "Deleting existing VSIX files..."
Get-ChildItem -Path . -Filter "*.vsix" | Remove-Item -Force
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to delete existing VSIX files."
    exit $LASTEXITCODE
}

# Step 1: Compile TypeScript
Write-Host "Compiling TypeScript..."
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript compilation failed."
    exit $LASTEXITCODE
}

# Step 2: Install vsce if not already installed
Write-Host "Ensuring vsce is installed..."
npm install -g vsce
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install vsce."
    exit $LASTEXITCODE
}

# Step 3: Package the extension
Write-Host "Packaging the VSIX file..."
vsce package
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to package the VSIX file."
    exit $LASTEXITCODE
}

Write-Host "Build completed successfully."
