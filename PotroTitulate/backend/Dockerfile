# Dockerfile

# 1. Usar una imagen base de Python ligera
FROM python:3.11-slim

# 2. Establecer variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Crear un directorio de trabajo
WORKDIR /app

# 4. Copiar e instalar las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar el resto del código de la aplicación
# (Nota: El volumen en docker-compose.yml lo sobreescribirá para desarrollo,
# pero esto es útil para construir una imagen independiente)
COPY . .