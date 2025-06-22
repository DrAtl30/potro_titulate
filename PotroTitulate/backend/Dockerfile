FROM python:3.11-slim

# Instalar dependencias del sistema (incluyendo openssh-client)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios
WORKDIR /PotroTitulate
COPY . /PotroTitulate

# Instalar dependencias Python
RUN pip install --upgrade pip
RUN pip install -r /PotroTitulate/FrontEnd/requirements.txt

# Dar permisos a la clave ssh
RUN mkdir -p /root/.ssh
COPY ssh/id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa

# Opcional: configurar hosts conocidos
RUN touch /root/.ssh/known_hosts

# Script de arranque que primero levanta el túnel y luego ejecuta gunicorn
COPY ssh/start_server.sh /start_server.sh
RUN chmod +x /start_server.sh

CMD ["/start_server.sh"]
