@echo off
REM Daily Health Check - Add to Windows Task Scheduler
cd /d "C:\xampp\htdocs\insapp_v3"
node system-health-check.js
if %errorlevel% neq 0 (
    echo HEALTH CHECK FAILED! >> health-check-errors.log
    echo %date% %time% >> health-check-errors.log
)

REM Weekly Backup - Run every Sunday
if %date:~0,3%==Sun (
    node auto-backup.js
)
