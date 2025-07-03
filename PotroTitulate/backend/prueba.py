# -*- coding: utf-8 -*-
"""
Carga OPEN (~200 usuarios)
  1) POST /api/login/            – inicia sesión
  2) POST /uploadDocument/       – sube sample.pdf marcado con [LOADTEST]
Al terminar Locust borra esos documentos (BD + archivo).
"""
import os, django, re
from pathlib import Path
from locust import HttpUser, task, SequentialTaskSet, LoadTestShape, events
from locust.exception import StopUser
from django.apps import apps
from django.db import connections, close_old_connections

# ─────── Bootstrap de Django ───────────────────────────────────
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ServConfig.settings")
django.setup()
# ────────────────────────────────────────────────────────────────

# ─── Configuración de la prueba ────────────────────────────────
PDF            = Path(r"C:\Users\USER\Downloads\Ajuste de la ecuación del diodo.pdf")   # ← ajustar si es necesario
TAG            = "[LOADTEST]"

LOGIN_URL      = "/api/login/"
UPLOAD_URL     = "/uploadDocument/"

EMAIL          = "jesuslinpr@outlook.com"   # usuario *de prueba* ya creado
PASSWORD       = "jesus19798"               # su contraseña

DJANGO_MODEL   = ("api", "Documentos")      # app, NombreModelo
DJANGO_FIELD   = "nombre_documento"         # campo para filtrar
# ────────────────────────────────────────────────────────────────


# ─── Flujo de usuario ──────────────────────────────────────────
class Flujo(SequentialTaskSet):
    def on_start(self):
        # 1) Login (sin CSRF porque la vista ahora está @csrf_exempt)
        self.client.post(
            LOGIN_URL,
            json={"correo_electronico": EMAIL, "contrasena": PASSWORD},
            name="login",
        )

    @task
    def subir(self):
        # 2) Subir PDF marcado
        with PDF.open("rb") as f:
            self.client.post(
                UPLOAD_URL,
                files={"file": (f"{TAG}sample.pdf", f, "application/pdf")},
                data={"requisito": f"{TAG}sample.pdf"},
                name="subir_documento",
            )

    @task
    def salir(self):
        raise StopUser()


# ─── Usuario y forma de carga ──────────────────────────────────
class Usuario(HttpUser):
    host      = "http://127.0.0.1:8000"  
    tasks     = [Flujo]
    wait_time = lambda self: 0            


class Forma200(LoadTestShape):
    rate, duration, user_cap = 3.5, 60, 200           # ≈210 usuarios/min, máx 200 vivos
    def tick(self):
        return None if self.get_run_time() > self.duration else (self.user_cap, self.rate)


# ─── Hook de limpieza ──────────────────────────────────────────
@events.quitting.add_listener
def limpieza(environment, **kw):
    """
    • Cierra conexiones que pudieran seguir abiertas
    • Borra documentos cuyo nombre empiece por [LOADTEST]
      tanto en la base como en el sistema de archivos.
    """
    close_old_connections()                 # libera conexiones sobrantes

    modelo = apps.get_model(*DJANGO_MODEL)
    qs = modelo.objects.filter(**{f"{DJANGO_FIELD}__startswith": TAG})

    total = qs.count()
    borrados = 0
    for doc in qs:
        archivo = getattr(doc, "archivo", None)
        if archivo and archivo.name:
            archivo.delete(save=False)      # elimina el archivo físico
        doc.delete()
        borrados += 1

    print(f"🧹  Documentos de prueba borrados: {borrados}/{total}")
