#!/bin/bash

# Levantar túnel SSH en background
echo "Estableciendo túnel SSH..."
ssh -i ./key-1.key -L 5433:localhost:5432 opc@129.153.221.86

 Esperar 3 seg para que establezca conexión
sleep 3

# Iniciar Gunicorn
echo "Levantando servidor Django..."
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
