@echo off
ssh -i .\key-1.key -L 5433:localhost:5432 opc@129.153.221.86
pause
