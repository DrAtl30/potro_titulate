#!/bin/bash

echo "========== Iniciando script =========="

# Mostrar contenido inicial
echo "Contenido de /root/.ssh:"
ls -la /root/.ssh

# Limpiar known_hosts previo
> /root/.ssh/known_hosts

# Agregar host key de forma controlada
echo "========== Agregando host key =========="
ssh-keyscan -t ed25519 129.153.221.86 >> /root/.ssh/known_hosts

# Verificar que se agregó correctamente
echo "Contenido actualizado de /root/.ssh/known_hosts:"
cat /root/.ssh/known_hosts

# Abrir túnel SSH en background
echo "========== Estableciendo túnel SSH =========="
ssh -i /root/.ssh/key-1.key -o StrictHostKeyChecking=yes -o UserKnownHostsFile=/root/.ssh/known_hosts -fN -L 5433:127.0.0.1:5432 opc@129.153.221.86

# Espera breve para asegurar que el túnel esté arriba
sleep 3

# Arrancar gunicorn/Django
echo "========== Levantando servidor Django =========="
gunicorn --bind 0.0.0.0:8000 ServConfig.wsgi:application
