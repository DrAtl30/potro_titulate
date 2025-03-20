from django.contrib.sessions.models import Session
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User  # Cambia a Sustentante si usas ese modelo
from django.conf import settings

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def close_old_sessions(sender, instance, created, **kwargs):
    if created:
        # Aquí puedes buscar las sesiones anteriores del mismo usuario (si es necesario)
        for session in Session.objects.all():
            data = session.get_decoded()
            if data.get('_auth_user_id') == str(instance.id):
                session.delete()
