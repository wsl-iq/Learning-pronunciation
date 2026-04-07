@echo off
REM This script is used to set up the environment for the project.
REM It should be run from the root directory of the project.
REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python and try again.
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo pip is not installed. Please install pip and try again.
    exit /b 1
)
REM Install required Python packages
echo Installing required Python packages...
pip install -r requirements.txt
echo Setup completed successfully.
pause
exit /b 0