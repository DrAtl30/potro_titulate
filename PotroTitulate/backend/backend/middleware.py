from django.shortcuts import redirect
from django.urls import reverse  
from django.utils.deprecation import MiddlewareMixin


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