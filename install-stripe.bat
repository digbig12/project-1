@echo off
echo Installing Stripe and updating Prisma...
call npm install stripe
call npx prisma generate
call npx prisma db push
echo.
echo ===================================================
echo Done! Please restart your Next.js development server.
echo ===================================================
pause
