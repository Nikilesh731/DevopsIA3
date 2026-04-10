@echo off
REM Production Epidemic Simulation - Quick Validation Script
REM Checks all services and APIs are working

echo.
echo ============================================================
echo   PRODUCTION EPIDEMIC SIMULATION - VALIDATION
echo ============================================================
echo.

REM Color codes (Windows 10+)
setlocal enabledelayedexpansion

echo [1/7] Checking Docker services...
docker-compose ps
if errorlevel 1 (
    echo ❌ Docker services not running
    exit /b 1
)
echo ✅ Docker services running

echo.
echo [2/7] Checking gateway health...
powershell -Command "try { $resp = Invoke-WebRequest -Uri 'http://localhost:5000/health' -UseBasicParsing; if ($resp.StatusCode -eq 200) { Write-Host '✅ Gateway: UP' -ForegroundColor Green } else { Write-Host '❌ Gateway: DOWN' -ForegroundColor Red } } catch { Write-Host '❌ Gateway: DOWN - ' $_.Exception.Message -ForegroundColor Red }"

echo.
echo [3/7] Checking database connection...
docker-compose exec -T postgres psql -U epidemic_user -d epidemic_simulation -c "SELECT COUNT(*) as region_count FROM regions;" >nul 2>&1
if errorlevel 1 (
    echo ❌ Database connection failed
) else (
    echo ✅ Database connected
)

echo.
echo [4/7] Checking simulation tables...
docker-compose exec -T postgres psql -U epidemic_user -d epidemic_simulation -c "\dt simulations simulation_daily_data" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Tables might not exist - run init-db first
) else (
    echo ✅ Simulation tables exist
)

echo.
echo [5/7] Creating test simulation...
powershell -Command "try { $payload = @{ sourceRegionId=1; infectionRate=0.15; recoveryRate=0.10; mortalityRate=0.02; totalDays=30; mobilityFactor=1.0 } | ConvertTo-Json; $resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/simulation/create' -Method POST -ContentType 'application/json' -Body $payload -UseBasicParsing; if ($resp.StatusCode -eq 200) { Write-Host '✅ Simulation created' -ForegroundColor Green; $data = $resp.Content | ConvertFrom-Json; Write-Host 'Simulation ID:' $data.data.id } else { Write-Host '❌ Failed to create simulation' -ForegroundColor Red } } catch { Write-Host '❌ Error:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo [6/7] Checking regions...
powershell -Command "try { $resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/regions' -UseBasicParsing; if ($resp.StatusCode -eq 200) { $data = $resp.Content | ConvertFrom-Json; Write-Host '✅ Regions available: ' $data.data.Length -ForegroundColor Green } else { Write-Host '❌ Failed to fetch regions' -ForegroundColor Red } } catch { Write-Host '❌ Error:' $_.Exception.Message -ForegroundColor Red }"

echo.
echo [7/7] Checking frontend...
powershell -Command "try { $resp = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing; if ($resp.StatusCode -eq 200) { Write-Host '✅ Frontend: READY at http://localhost:3000' -ForegroundColor Green } else { Write-Host '⚠️  Frontend: Check status' -ForegroundColor Yellow } } catch { Write-Host '⚠️  Frontend: Not responding (may still be building)' -ForegroundColor Yellow }"

echo.
echo ============================================================
echo   VALIDATION COMPLETE
echo ============================================================
echo.
echo API Endpoints:
echo   POST   /api/simulation/create        - Create new simulation
echo   POST   /api/simulation/:id/run       - Start simulation
echo   GET    /api/simulation/:id/results   - Get results
echo   GET    /api/simulations              - List all simulations
echo   GET    /api/regions                  - List regions
echo.
echo Web Interface:
echo   http://localhost:3000                - Dashboard
echo.
echo Next steps:
echo   1. Visit http://localhost:3000/simulation
echo   2. Select a region (e.g., Delhi)
echo   3. Adjust parameters if needed
echo   4. Click "Start Simulation"
echo   5. View results in Summary/Timeline/Graph tabs
echo.
pause
