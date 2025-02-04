from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework import status
from .serializers import SustentanteRegistroSerializer
from .serializers import SustentanteLoginSerializer
from .serializers import *;
from django.shortcuts import redirect
from django.shortcuts import render
from datetime import datetime
from django.core.mail import send_mail, BadHeaderError
from django.shortcuts import render, redirect
from django.utils.crypto import get_random_string
from .models import Sustentante, Documentos
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
    # Obtén el ID del Sustentante desde la sesión
    sustentante_id = request.session.get('sustentante_id')
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo

    if not sustentante_id:
        # Si no hay un Sustentante autenticado, redirige al login
        return redirect('login')

    try:
        sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)
        documentos = Documentos.objects.filter(id_sustentante=sustentante)
        return render(request, 'perfilDeUsuario.html', {
            'timestamp': timestamp,
            'nombre_sustentante': sustentante.nombre,
            'documentos': documentos
        })
    except Sustentante.DoesNotExist:
        return redirect('login')
    

#class PerfilUsuarioView(APIView):
    def get(self, request):
        # Obtén el ID del Sustentante desde la sesión
        sustentante_id = request.session.get('sustentante_id')

        if not sustentante_id:
            # Si no hay un Sustentante autenticado, devuelve un error 401 (No autorizado)
            return Response(
                {'mensaje': 'No autenticado'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Obtén el objeto Sustentante
            sustentante = Sustentante.objects.get(id=sustentante_id)
            # Devuelve los datos del Sustentante en formato JSON
            return Response({
                'id_sustentante': sustentante.id_sustentante,
                'nombre': sustentante.nombre,
                'correo_electronico': sustentante.correo_electronico
            }, status=status.HTTP_200_OK)
        except Sustentante.DoesNotExist:
            # Si el Sustentante no existe, devuelve un error 404 (No encontrado)
            return Response(
                {'mensaje': 'Sustentante no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
def recuperarContrasena(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'recuperarContrasena.html', {'timestamp': timestamp})

def cambiarContrasena(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'cambiar_contrasena.html', {'timestamp': timestamp})

def loginAdmin(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'inicioSesionAdmin.html', {'timestamp': timestamp})

def recuperarContrasenaExito(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'recuperarContrasenaExito.html', {'timestamp': timestamp})


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
            data = serializer.validated_data
            print('Datos validos:', data)
            
            # Guardar el ID del Sustentante en la sesión
            request.session['sustentante_id'] = data['id_sustentante']

            if data['contrasena_temporal']:
                return Response({
                    'mensaje': 'Debes cambiar tu contraseña temporal.',
                    'redirigir_a_cambiar_contrasena': True,
                    'id_sustentante': data['id_sustentante']
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'mensaje': 'Inicio de sesión exitoso.',
                    'redirigir_a_cambiar_contrasena': False,
                    'id_sustentante': data['id_sustentante'],
                    'nombre': data['nombre'],
                    'correo_electronico': data['correo_electronico']
                }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PerfilUsuarioView(APIView):
   def get(self, request):
        # Obtén el ID del Sustentante desde la sesión
        sustentante_id = request.session.get('sustentante_id')

        if not sustentante_id:
            return Response({'mensaje': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Obtén el objeto Sustentante
            sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)
            return Response({
                'id_sustentante': sustentante.id_sustentante,
                'nombre': sustentante.nombre,
                'correo_electronico': sustentante.correo_electronico
            }, status=status.HTTP_200_OK)
        except Sustentante.DoesNotExist:
            return Response({'mensaje': 'Sustentante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
class LogoutView(APIView):
    def get(self, request):
        return redirect('login')
    
    def post(self, request):
        if 'sustentante_id' in request.session:
            del request.session['sustentante_id']
        #return Response({'mensaje': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)
        return redirect('login')
    
class AdministradorLoginView(APIView):
    
    def post(self, request):
        serializer = AdministradorLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecuperarContraseñaView(APIView):
    def post(self, request, format=None):
        correo = request.data.get('correo_electronico')

        if not correo:
            return Response({'error': 'Por favor, proporciona un correo electrónico válido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            sustentante = Sustentante.objects.get(correo_electronico=correo)
        except Sustentante.DoesNotExist:
            return Response({'error': 'No se encontró un sustentante con el correo electrónico proporcionado'}, status=status.HTTP_200_OK)
        
        token = get_random_string(32)
        sustentante.contrasena = make_password(token)
        sustentante.contrasena_temporal = True #Marcar la contrasena como temporal

        sustentante.save()

        try:
            send_mail(
                'Recuperación de contraseña',
                f'Hola {sustentante.nombre},\n\nTu nueva contraseña temporal es: {token}\n\nPor favor, cambia tu contraseña al iniciar sesión.',
                'potrotitulate@gmail.com',
                [correo],
                fail_silently=False,
            )
        except BadHeaderError:
            return render(request, 'recuperarContrasena.html', {
                'error': 'Se produjo un eror al enviar el correo. Inténtalo de nuevo.'})
        
        return JsonResponse({'redirect': '/recuperarContrasenaExito'}, status=status.HTTP_200_OK)
        #return render(request,'recuperarContrasenaExito.html')
        #return Response({'mensaje': 'Se ha enviado un correo con tu nueva contraseña temporal'}, status=status.HTTP_200_OK)
    
class CambiarContrasenaView(APIView):
    def get(self, request, id_sustentante):
        return render(request, "cambiar_contrasena.html", {"id_sustentante": id_sustentante})

    def post(self, request, *args, **kwargs):
        id_sustentante = kwargs.get('id_sustentante')
        nueva_contrasena = request.data.get('nueva_contrasena')
        confirmar_contrasena = request.data.get('confirmar_contrasena')

        if not nueva_contrasena or not confirmar_contrasena:
            return Response({'error': 'Ambos campos son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)
        
        if nueva_contrasena != confirmar_contrasena:
            return Response({'error': 'Las contraseñas no coinciden'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            sustentante = Sustentante.objects.get(id_sustentante=id_sustentante)
        except Sustentante.DoesNotExist:
            return Response({'error': 'Sustentante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        sustentante.contrasena = make_password(nueva_contrasena)
        sustentante.contrasena_temporal = False #Marcar contrase cono no temporal

        sustentante.save()

        #return Response({'mensaje': 'Contraseña actualizada correctamente'}, status=status.HTTP_200_OK)
        return JsonResponse({'redirect': '/iniciosesion'}, status=status.HTTP_200_OK)
    
def subir_documento(request):
    if request.method == 'POST':
        sustentante_id = request.session.get('sustentante_id')
        if not sustentante_id:
            return redirect('login')
        
        try:
            sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)
            documento = request.FILES['documento']
            nombre_documento = request.POST['nombre_documento']
            tipo_documento = request.POST['tipo_documento'] 

            # Guardar el documento en la base de datos
            Documentos.objects.create(
                id_sustentante=sustentante,
                nombre_documento=nombre_documento,
                tipo_documento=tipo_documento,
                fecha_subida=datetime.now().date(),
                estado_validacion='pendiente',
            )
            return redirect('perfilUsuario')
        except Sustentante.DoesNotExist:
            return redirect('login')
        
    return render(request, 'subir_documento.html') #Queda por ajustar la plantilla

