from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework import status
from .serializers import SustentanteRegistroSerializer
from .serializers import SustentanteLoginSerializer
from .serializers import *;
from django.shortcuts import redirect, get_object_or_404
from django.shortcuts import render
from datetime import datetime
from django.core.mail import send_mail, BadHeaderError
from django.shortcuts import render, redirect
from django.utils.crypto import get_random_string
from .models import Sustentante, Documentos, Tramites, OpcionTitulacion
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json



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
    sustentante_id = request.session.get('sustentante_id')
    timestamp = datetime.now().timestamp()

    if not sustentante_id:
        return redirect('login')

    try:
        sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)
        tramite = Tramites.objects.filter(id_sustentante=sustentante).first()
        opcion_titulacion = tramite.id_opcion.nombre_opcion if tramite and tramite.id_opcion else None
        documentos = Documentos.objects.filter(id_sustentante=sustentante)
        opciones_titulacion = OpcionTitulacion.objects.all()
        progreso = tramite.progreso if tramite else 0

        return render(request, 'perfilDeUsuario.html', {
            'timestamp': timestamp,
            'nombre_sustentante': sustentante.nombre,
            'documentos': documentos,
            'opcion_titulacion': opcion_titulacion,
            'opciones_titulacion': opciones_titulacion,
            'progreso': progreso,
            'id_tramite': tramite.id_tramite if tramite else None  # Aquí pasamos el id_tramite

        })
    except Sustentante.DoesNotExist:
        return redirect('login')
        
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
        return redirect('/iniciosesion/')
    
    def post(self, request):
        if 'sustentante_id' in request.session:
            del request.session['sustentante_id']
        #return Response({'mensaje': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)
        return redirect('/iniciosesion/')

def checkSession(request):
    is_authenticated = 'sustentante_id' in request.session
    return JsonResponse({'is_authenticated': is_authenticated})
    
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
    

@csrf_exempt
def uploadDocument(request):
    if request.method == 'POST':
        sustentante_id = request.session.get('sustentante_id')
        if not sustentante_id:
            return JsonResponse({'succes': False, 'error':'No autenticado'})
    
        try:
            sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)
            file = request.FILES['file']
            requisito = request.POST.get('requisito')

            #Guardar el documento en la base de datos
            Documentos.objects.create(
                id_sustentante=sustentante,
                nombre_documento=requisito,
                tipo_documento=file.content_type,
                fecha_subida=timezone.now().date(),
                estado_validacion='pendiente'
            )

            return JsonResponse({'success' : True})
        except Exception as e:
            return JsonResponse({'success' : False, 'error': str(e)})
    return JsonResponse({'success' : False, 'error' : 'Metodo no permitido'})

@csrf_exempt
def seleccionar_opcion_titulacion(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        opcion_id = data.get('opcion_id')
        sustentante_id = request.session.get('sustentante_id')

        if not sustentante_id:
            return JsonResponse({'success': False, 'error': 'No autenticado'})

        try:
            sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)
            opcion_titulacion = OpcionTitulacion.objects.get(id_opcion=opcion_id)

            # Crear o actualizar el trámite
            tramite, created = Tramites.objects.get_or_create(
                id_sustentante=sustentante,
                defaults={
                    'id_opcion': opcion_titulacion,
                    'estado_actual': 'pendiente',
                    'fecha_inicio': timezone.now().date(),
                    'fecha_actualizacion': timezone.now().date()
                }
            )

            if not created:
                tramite.id_opcion = opcion_titulacion
                tramite.estado_actual = 'pendiente'
                tramite.fecha_actualizacion = timezone.now().date()
                tramite.save()

            sustentante.id_opcion = opcion_titulacion
            sustentante.save()


            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

def revisarOpcionesTitulacion(request):
    if request.mehtod == 'POST':
       tramite_id = request.POST.get('tramite_id')
       estado = request.POST.get('estado') #aprobado o rechazado

       tramite = get_object_or_404(Tramites, id_tramite=tramite_id)
       tramite.estado_actual = estado
       tramite.fecha_actualizacion = timezone.now().date()
       tramite.save()

       return JsonResponse({'success': True})
    else:
        tramites_pendientes = Tramites.objects.filter(estado_actual='pendiente')
        return render(request, 'revisarOpcionesTitulacion.html', {'tramites_pendientes': tramites_pendientes})

def actualizarProgreso(request):
    # Obtiene el id del trámite enviado desde el frontend
    if request.method == 'POST':
        data = json.loads(request.body)
        id_tramite = data.get('id_tramite')

        # Obtiene el trámite
        try:
            tramite = Tramites.objects.get(id_tramite=id_tramite)

            # Calcula el progreso basado en documentos aprobados
            documentos_aprobados = Documentos.objects.filter(
                id_sustentante=tramite.id_sustentante,
                estado_validacion='aprobado'
            ).count()
            total_documentos = 17
            progreso = int((documentos_aprobados / total_documentos) * 100)

            # Actualiza el progreso del trámite en la base de datos
            tramite.progreso = progreso
            tramite.save()

            # Retorna el nuevo progreso como respuesta JSON
            return JsonResponse({'success': True, 'progreso': progreso})
        
        except Tramites.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Trámite no encontrado'})

    return JsonResponse({'success': False, 'error': 'Método no permitido'})