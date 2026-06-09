$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path $ScriptPath
$SafeDir = $ScriptDir -replace "'", "''"

Write-Host "Starting the backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$SafeDir\backend'; ..\.venv\Scripts\python.exe app.py`""

Write-Host "Starting the admin frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$SafeDir\admin'; npm run dev`""

Write-Host "Starting the user frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$SafeDir\user'; npm run dev`""

Write-Host "All components started in separate windows." -ForegroundColor Cyan
