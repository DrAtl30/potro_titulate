from django.shortcuts import redirect
from django.urls import reverse  

class ForzarCambioContrasenaMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and request.user.contrasena_temporal:
            if request.path != reverse('cambiar_contrasena'):  # Evitar redirección infinita
                return redirect('cambiar_contrasena')

        response = self.get_response(request)
        return response