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
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.urls import reverse
import jwt
from django.conf import settings
import json
import os



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
        aprobado = tramite.aprobado if tramite else False

        return render(request, 'perfilDeUsuario.html', {
            'timestamp': timestamp,
            'nombre_sustentante': sustentante.nombre,
            'documentos': documentos,
            'opcion_titulacion': opcion_titulacion,
            'opciones_titulacion': opciones_titulacion,
            'progreso': progreso,
            'id_tramite': tramite.id_tramite if tramite else None, # Aquí pasamos el id_tramite
            'id_sustentante': sustentante_id, 
            'aprobado' : aprobado

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

def opcionesTitulacion(request):
    sustentante_id = request.session.get('sustentante_id')
    timestamp = datetime.now().timestamp()
    if not sustentante_id:
        return redirect('login')
    try:
        sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)

        context = {
            'timestamp': timestamp,
            'sustentante': {
                'id_sustentante': sustentante.id_sustentante,
                'nombre': sustentante.nombre,
                'apellido': sustentante.apellido,
                'id_opcion': sustentante.id_opcion.id_opcion if sustentante.id_opcion else None
            }
        }
        return render(request, 'opcionesTitulacion.html', context)
    
    except Sustentante.DoesNotExist:
        return redirect('login')

#Vista para verificar si hay un trámite en progreso
def verificar_tramite_en_progreso(request, id_sustentante):
    # Verificar si el sustentante tiene un trámite en progreso
    tramite = Tramites.objects.filter(id_sustentante=id_sustentante).first()  # Obtener el primer trámite si existe

    if tramite:
        # Obtener el ID de la opción de titulación
        id_opcion = tramite.id_opcion.id_opcion if tramite.id_opcion else None
        
        # Buscar la opción de titulación con el ID obtenido
        opcion_titulacion = OpcionTitulacion.objects.filter(id_opcion=id_opcion).first()
        nombre_opcion = opcion_titulacion.nombre_opcion if opcion_titulacion else None

        # Obtener el estado de 'aprobado' directamente desde el trámite
        aprobado = tramite.aprobado
        
        return JsonResponse({
            'tramiteEnProgreso': True,
            'aprobado': aprobado,  # Pasamos el estado de aprobado
            'opcionTitulacion': nombre_opcion  # Pasamos el nombre de la opción de titulación
        })
    else:
        return JsonResponse({'tramiteEnProgreso': False})

@csrf_exempt
def enviar_solicitud(request):
    if request.method == 'POST':
        try:
            # Print raw request body for debugging
            print("Raw Body:", request.body)
            
            # Parse JSON data from the request body
            data = json.loads(request.body)
            print("Parsed Data:", data)

            # Extract id_sustentante and id_opcion from the request data
            id_sustentante = data.get('id_sustentante')
            id_opcion = data.get('id_opcion')

            # Validate that both fields are present
            if not id_sustentante or not id_opcion:
                return JsonResponse({'error': 'Datos incompletos'}, status=400)

            # Fetch the Sustentante and OpcionTitulacion objects
            print(f"Buscando Sustentante con ID: {id_sustentante}")
            print(f"Buscando Opción de Titulación con ID: {id_opcion}")

            sustentante = get_object_or_404(Sustentante, id_sustentante=id_sustentante)
            opcion_titulacion = get_object_or_404(OpcionTitulacion, id_opcion=id_opcion)

            # Create a new Tramites record
            print("Creando trámite...")
            Tramites.objects.create(
                id_sustentante=sustentante,
                id_opcion=opcion_titulacion,
                estado_actual='Pendiente',
                fecha_inicio=timezone.now(),
                fecha_actualizacion=timezone.now(),
                progreso=0
            )

            sustentante.id_opcion = opcion_titulacion
            sustentante.save()

            # Return success response
            return JsonResponse({'message': 'Solicitud enviada con éxito'}, status=200)

        except json.JSONDecodeError as e:
            print("Error de JSON:", e)
            return JsonResponse({'error': 'Solicitud inválida'}, status=400)
        except Exception as e:
            print("Error inesperado:", e)
            return JsonResponse({'error': str(e)}, status=500)
    
    # Return error for non-POST requests
    return JsonResponse({'error': 'Método no permitido'}, status=405)
            

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
            print('Datos válidos:', data)

            # Verificar si la cuenta ya fue confirmada
            if not data.get('confirmado', False):  
                return Response({
                    'mensaje': 'Debes confirmar tu cuenta antes de iniciar sesión.',
                    'confirmacion_pendiente': True
                }, status=status.HTTP_403_FORBIDDEN)

            # Guardar el ID del Sustentante en la sesión
            request.session['sustentante_id'] = data.get('id_sustentante')

            if data.get('contrasena_temporal'):
                return Response({
                    'mensaje': 'Debes cambiar tu contraseña temporal.',
                    'redirigir_a_cambiar_contrasena': True,
                    'id_sustentante': data.get('id_sustentante')
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'mensaje': 'Inicio de sesión exitoso.',
                    'redirigir_a_cambiar_contrasena': False,
                    'id_sustentante': data.get('id_sustentante'),
                    'nombre': data.get('nombre'),
                    'correo_electronico': data.get('correo_electronico')
                }, status=status.HTTP_200_OK)
        
        # Agregar detalles de error para depuración
        return Response({'mensaje': 'Error en los datos', 'errores': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


    
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
    

def uploadDocument(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

    sustentante_id = request.session.get('sustentante_id')
    if not sustentante_id:
        return JsonResponse({'success': False, 'error': 'No autenticado'}, status=401)

    file = request.FILES.get('file')
    requisito = request.POST.get('requisito')

    if not file or not requisito:
        return JsonResponse({'success': False, 'error': 'Archivo o requisito faltante'}, status=400)

    try:
        sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)

        # Obtener el trámite actual del sustentante
        tramite = Tramites.objects.filter(id_sustentante=sustentante).order_by('-fecha_inicio').first()
        if not tramite:
            return JsonResponse({'success': False, 'error': 'No se encontró un trámite para el sustentante'}, status=404)   
        # Guardar el documento en la base de datos
        documento = Documentos.objects.create(
            id_sustentante=sustentante,
            id_tramite=tramite,
            nombre_documento=requisito,
            tipo_documento=file.content_type,
            fecha_subida=timezone.now().date(),
            estado_validacion='pendiente',
            archivo=file  
        )

        return JsonResponse({'success': True, 'documento_id': documento.id_documento})
    except Sustentante.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Sustentante no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

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

#EndPoint para recuperar el estado de los documentos
def estadoDocumento(request, tramite_id):
    try:
        documentos = Documentos.objects.filter(id_tramite=tramite_id)
        estados = {doc.nombre_documento: doc.estado_validacion for doc in documentos}

        return JsonResponse({'success': True, 'estados': estados})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
class ConfirmarCuentaView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            sustentante = get_object_or_404(Sustentante, id_sustentante=uid)

            if default_token_generator.check_token(sustentante, token):
                sustentante.confirmado = True
                sustentante.save()
                return Response({'mensaje': 'Cuenta confirmada correctamente'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Enlace inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Enlace inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
def descargar_documento(request, documento_id):
    documento = get_object_or_404(Documentos, id_documento=documento_id)
    file_path = os.path.join(settings.MEDIA_ROOT, documento.archivo.name)
    
    if os.path.exists(file_path):
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
    raise Http404("El archivo no existe")

