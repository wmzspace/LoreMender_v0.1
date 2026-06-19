@echo off
cd /d "%~dp0..\dist"
"C:\Users\86150\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m http.server 4173 --bind 127.0.0.1
