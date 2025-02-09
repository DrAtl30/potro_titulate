from django.core.management.base import BaseCommand
from api.models import Administrativos  # Ajusta 'myapp' según tu aplicación
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Actualiza las contraseñas de texto plano a contraseñas encriptadas'

    def handle(self, *args, **kwargs):
        administrativos = Administrativos.objects.all()
        for admin in administrativos:
            if not admin.contrasena.startswith('pbkdf2_'):  # Verifica si la contraseña ya está encriptada
                admin.contrasena = make_password(admin.contrasena)
                admin.save()
        self.stdout.write(self.style.SUCCESS('Contraseñas actualizadas correctamente'))
