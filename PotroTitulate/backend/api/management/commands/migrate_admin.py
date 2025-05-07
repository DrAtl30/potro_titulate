from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Administrativos
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Migra los administrativos existentes al sistema de usuarios de Django'

    def handle(self, *args, **options):
        for admin in Administrativos.objects.all():
            user, created = User.objects.get_or_create(
                username=admin.correo_electronico,
                defaults={
                    'email': admin.correo_electronico,
                    'password': make_password(admin.contrasena),
                    'first_name': admin.nombre.split()[0],
                    'last_name': ' '.join(admin.nombre.split()[1:]),
                    'is_staff': True
                }
            )
            if created:
                admin.user = user
                admin.save()
                self.stdout.write(f'Migrado administrativo: {admin.nombre}')
            else:
                self.stdout.write(f'Usuario ya existente: {admin.nombre}')