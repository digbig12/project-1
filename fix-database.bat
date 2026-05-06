@echo off
echo ======================================================
echo   BizAnalytics: AI Database Repair Tool
echo ======================================================
echo.
echo This script will synchronize your Prisma Client with 
echo the latest schema changes (AI Training fields).
echo.
echo Running 'npx prisma generate'...
call npx prisma generate
echo.
echo Running 'npx prisma db push'...
call npx prisma db push
echo.
echo ======================================================
echo   SUCCESS: Your database is now synchronized!
echo   You can now use the "Train My AI" features.
echo ======================================================
pause
