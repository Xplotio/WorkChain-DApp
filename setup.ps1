Write-Host "====================================="
Write-Host " Instalador de WorkChain"
Write-Host "====================================="

Write-Host ""
Write-Host "Instalando dependencias del proyecto Hardhat..."
npm install

Write-Host ""
Write-Host "Entrando al frontend..."
Set-Location frontend

Write-Host ""
Write-Host "Instalando dependencias de Angular..."
npm install

Write-Host ""
Write-Host "Regresando a la carpeta principal..."
Set-Location ..

Write-Host ""
Write-Host "Compilando contratos..."
npx hardhat compile

Write-Host ""
Write-Host "Instalacion finalizada correctamente."
Write-Host ""
Write-Host "Para ejecutar:"
Write-Host "1. Terminal 1: npm run node"
Write-Host "2. Terminal 2: npm run deploy:local"
Write-Host "3. Terminal 3: npm run frontend"