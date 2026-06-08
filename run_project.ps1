$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path $ScriptPath

Write-Host "Starting the backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ScriptDir\backend'; ..\.venv\Scripts\python.exe app.py`""

Write-Host "Starting the admin frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ScriptDir\admin'; npm run dev`""

Write-Host "Starting the user frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$ScriptDir\user'; npm run dev`""

Write-Host "All components started in separate windows." -ForegroundColor Cyan
