@echo off
:: AddonWeb Local Backup Script
:: Commits and pushes any local changes to GitHub
:: Run via Windows Task Scheduler at 11:00 PM IST daily

cd /d "C:\Users\Lenovo\Downloads\AWS_90days"

:: Check if there are any local changes
git status --porcelain > %TEMP%\gitstatus.txt 2>&1
for %%A in (%TEMP%\gitstatus.txt) do if %%~zA==0 (
    echo [%date% %time%] No local changes to backup. >> operations\daily-log\backup.log
    goto :done
)

:: Stage everything (respects .gitignore)
git add -A

:: Commit with timestamp
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set DATE=%%c-%%b-%%a
git commit -m "chore: local backup %DATE%"

:: Push to main
git push origin main >> operations\daily-log\backup.log 2>&1

echo [%date% %time%] Backup pushed to GitHub. >> operations\daily-log\backup.log

:done
