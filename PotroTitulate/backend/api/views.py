from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SustentanteRegistroSerializer
from .serializers import SustentanteLoginSerializer
from django.shortcuts import redirect
from django.shortcuts import render
from datetime import datetime
from django.core.mail import send_mail, BadHeaderError
from django.shortcuts import render, redirect
from django.utils.crypto import get_random_string
from .models import Sustentante
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password



def index(request):
    return render(request, 'index(2).html')

def registro(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'registro.html', {'timestamp': timestamp})

def inicio_sesion(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'iniciosesion.html', {'timestamp': timestamp})

def administrador(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'administrador.html', {'timestamp': timestamp})

def perfilUsuario(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'perfilDeUsuario.html', {'timestamp': timestamp})

def recuperarContrasena(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'recuperarContrasena.html', {'timestamp': timestamp})

def loginAdmin(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'inicioSesionAdmin.html', {'timestamp': timestamp})


class RegistroView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = SustentanteRegistroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Registro exitoso'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = SustentanteLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def recuperar_contrasena(request):
    if request.method == 'POST':
        correo = request.POST.get('correoInstitucional')

        # Verificar que el correo no esté vacío
        if not correo:
            return render(request, 'recuperarContrasena.html', {
                'error': 'Por favor, proporciona un correo electrónico válido.',
            })

        # Buscar al sustentante por correo electrónico
        sustentante = Sustentante.objects.filter(correo_electronico__iexact=correo).first()
        if not sustentante:
            return render(request, 'recuperarContrasena.html', {
                'error': 'No existe una cuenta asociada a ese correo.',
            })

        # Generar una contraseña temporal y encriptarla
        token = get_random_string(32)  # Contraseña temporal en texto plano
        contraseña_encriptada = make_password(token)
        sustentante.contrasena = contraseña_encriptada
        sustentante.save()

        # Enviar correo con la contraseña temporal
        try:
            send_mail(
                'Recuperación de contraseña',
                f'Hola {sustentante.nombre},\n\nTu nueva contraseña temporal es: {token}\nPor favor, cámbiala al iniciar sesión.',
                'potrotitulate@gmail.com',  # Cambiar al email configurado
                [correo],
                fail_silently=False,
            )
        except BadHeaderError:
            return render(request, 'recuperarContrasena.html', {
                'error': 'Se produjo un error al enviar el correo. Inténtalo nuevamente.',
            })

        # Renderizar página de éxito
        return render(request, 'recuperarContrasenaExito.html')

    # Si el método no es POST, renderizar la página de recuperación
    return render(request, 'recuperarContrasena.html')


@login_required
def cambiar_contrasena(request):
    if request.method == 'POST':
        nueva_contrasena = request.POST.get('nueva_contrasena')
        confirmar_contrasena = request.POST.get('confirmar_contrasena')

        if not nueva_contrasena or not confirmar_contrasena:
            return render(request, 'cambiar_contrasena.html', {
                'error': 'Ambos campos son obligatorios.',
            })

        if nueva_contrasena == confirmar_contrasena:
            request.user.set_password(nueva_contrasena)
            request.user.save()
            return redirect('inicio_sesion')  # Redirige al login después de cambiar la contraseña
        else:
            return render(request, 'cambiar_contrasena.html', {
                'error': 'Las contraseñas no coinciden.',
            })

    return render(request, 'cambiar_contrasena.html')