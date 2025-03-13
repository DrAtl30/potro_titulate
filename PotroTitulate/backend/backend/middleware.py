from django.shortcuts import redirect
from django.urls import reverse  
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import logout
from django.contrib.sessions.models import Session


class ForzarCambioContrasenaMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and request.user.contrasena_temporal:
            if request.path != reverse('cambiar_contrasena'):  # Evitar redirección infinita
                return redirect('cambiar_contrasena')

        response = self.get_response(request)
        return response
    
class NoCacheMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if request.user.is_authenticated:
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate', 'max-age=0'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        return response
    
class OneSessionPerUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            sustentante = request.user
            if sustentante.session_key and sustentante.session_key != request.session.session_key:
                try:
                    session = Session.objects.get(session_key=sustentante.session_key)
                    session.delete()
                    logout(request)
                except Session.DoesNotExist:
                    pass

        response = self.get_response(request)
        return response
    
class SingleSessionPerBrowserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        session_key = request.COOKIES.get('session_key')

        if session_key and request.user.is_authenticated:
            try:
                session = Session.objects.get(session_key=session_key)
                if session.get_decoded().get('_auth_user_id') != str(request.user.id):
                    # Si el usuario es diferente, cerrar la sesión anterior
                    session.delete()
                    logout(request)
            except Session.DoesNotExist:
                pass

        response = self.get_response(request)
        return response