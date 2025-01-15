@echo off
ssh -i .\ssh-key-2025-01-14.key -L 5433:localhost:5432 opc@129.146.247.154
pause
