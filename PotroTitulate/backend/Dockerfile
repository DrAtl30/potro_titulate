FROM python:3.11-slim

# Instalar dependencias del sistema (incluyendo openssh-client)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    net-tools \
    openssh-client \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /PotroTitulate

# Copiar script de arranque
COPY ssh/start_server.sh /start_server.sh
COPY ssh/known_hosts /root/.ssh/known_hosts
RUN chmod +x /start_server.sh

# Copiar todo el proyecto backend
COPY . /PotroTitulate

# Copiar requirements antes (desde contexto backend)
COPY requirements.txt /PotroTitulate/requirements.txt

# Instalar dependencias de Python
RUN pip install --upgrade pip
RUN pip install -r /PotroTitulate/requirements.txt

# Configurar SSH
RUN mkdir -p /root/.ssh
COPY ssh/key-1.key /root/.ssh/key-1.key
RUN chmod 600 /root/.ssh/key-1.key
RUN touch /root/.ssh/known_hosts

# **Elimina el collectstatic del build porque usarás los archivos estáticos montados localmente**
# RUN rm -rf /PotroTitulate/staticfiles && python manage.py collectstatic --noinput

# Comando de inicio
CMD ["/start_server.sh"]
