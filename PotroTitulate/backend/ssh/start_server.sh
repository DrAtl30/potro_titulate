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

# Espera y verifica que el túnel esté disponible antes de continuar
echo "========== Verificando disponibilidad del túnel SSH =========="
until nc -z localhost 5433; do
  echo "Esperando a que el puerto 5433 esté disponible..."
  sleep 1
done
echo "Puerto 5433 disponible, túnel SSH activo."

# Mostrar servicios escuchando para verificar
echo "Puertos activos:"
netstat -tulnp

# Arrancar Gunicorn / Django
echo "========== Levantando servidor Django =========="
gunicorn --bind 0.0.0.0:8000 ServConfig.wsgi:application
