@echo off
REM VERIFY_STACK.bat - Docker Stack Verification Script for Windows

echo.
echo === EPIDEMIC SYSTEM STACK VERIFICATION ===
echo Checking all 7 services running in Docker Desktop...
echo.

REM Display running containers
echo Services Status:
docker compose ps

echo.
echo === HEALTH CHECKS ===
echo.

echo Testing Gateway Service (http://localhost:5000/health)...
curl -s http://localhost:5000/health | findstr status >nul && echo.  [OK] Gateway Service && goto:Region || echo.  [FAILED] Gateway Service
:Region

echo Testing Region Service (http://localhost:5001/api/regions)...
curl -s http://localhost:5001/api/regions | findstr success >nul && echo.  [OK] Region Service && goto:Sim || echo.  [FAILED] Region Service
:Sim

echo Testing Simulation Service (http://localhost:5002/api/health)...
curl -s http://localhost:5002/api/health >nul && echo.  [OK] Simulation Service && goto:Res || echo.  [FAILED] Simulation Service
:Res

echo Testing Resource Service (http://localhost:5003/api/health)...
curl -s http://localhost:5003/api/health >nul && echo.  [OK] Resource Service && goto:Fault || echo.  [FAILED] Resource Service
:Fault

echo Testing Fault Service (http://localhost:5004/api/health/services)...
curl -s http://localhost:5004/api/health/services >nul && echo.  [OK] Fault Service && goto:Events || echo.  [FAILED] Fault Service
:Events

echo Testing Event Bus (http://localhost:5005/health)...
curl -s http://localhost:5005/health | findstr healthy >nul && echo.  [OK] Event Bus && goto:Frontend || echo.  [FAILED] Event Bus
:Frontend

echo Testing Frontend (http://localhost:3000)...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 | findstr 200 >nul && echo.  [OK] Frontend || echo.  [FAILED] Frontend

echo.
echo === ACCESS POINTS ===
echo.
echo Frontend Dashboard : http://localhost:3000
echo API Gateway        : http://localhost:5000
echo Region Service     : http://localhost:5001
echo Simulation Service : http://localhost:5002
echo Resource Service   : http://localhost:5003
echo Fault Service      : http://localhost:5004
echo Event Bus          : http://localhost:5005
echo.
echo === END ===
echo.
