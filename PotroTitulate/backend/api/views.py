from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import login
from django.views import View
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils.decorators import method_decorator
from django.http import JsonResponse, Http404, HttpResponse
from rest_framework import status
from .serializers import *;
from django.shortcuts import redirect, get_object_or_404, render
from datetime import datetime
from django.core.mail import send_mail, BadHeaderError
from django.utils.crypto import get_random_string
from .models import *;
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.db import transaction
import logging
logger = logging.getLogger(__name__)  # Esto obtiene un logger con el nombre del módulo actual
import json
import os

def index(request):
    timestamp = datetime.now().timestamp
    return render(request, 'index(2).html', {'timestamp': timestamp})

def registro(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'registro.html', {'timestamp': timestamp})

def inicio_sesion(request):
    timestamp = datetime.now().timestamp() # Genera una marca de tiempo
    return render(request, 'iniciosesion.html', {'timestamp': timestamp})

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
        aprobado = tramite.aprobado if tramite else False

        return render(request, 'perfilDeUsuario.html', {
            'timestamp': timestamp,
            'nombre_sustentante': sustentante.nombre,
            'documentos': documentos,
            'opcion_titulacion': opcion_titulacion,
            'opciones_titulacion': opciones_titulacion,
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
            try:
                sustentante = Sustentante.objects.get(id_sustentante=data.get('id_sustentante'))

                # Si la cuenta no está confirmada
                if not sustentante.confirmado:
                    return Response({
                        'mensaje': 'Debes confirmar tu cuenta antes de iniciar sesión.',
                        'confirmacion_pendiente': True
                    }, status=status.HTTP_403_FORBIDDEN)

                # Iniciar nueva sesión
                login(request, sustentante)

                # Guardar la sesión para generar un session_key
                request.session.save()

                # Almacenar el ID del Sustentante en la sesión
                request.session['sustentante_id'] = sustentante.id_sustentante

                # Almacenar el session_key en el modelo Sustentante
                sustentante.session_key = request.session.session_key
                sustentante.save()

                # Configurar la cookie session_key
                response = Response({
                    'mensaje': 'Inicio de sesión exitoso.',
                    'redirigir_a_cambiar_contrasena': sustentante.contrasena_temporal,
                    'id_sustentante': sustentante.id_sustentante,
                    'nombre': sustentante.nombre,
                    'correo_electronico': sustentante.correo_electronico
                }, status=status.HTTP_200_OK)
                
                response.set_cookie('session_key', request.session.session_key, httponly=False, samesite='Lax')

                return response
            except Sustentante.DoesNotExist:
                return Response({'mensaje': 'Sustentante no encontrado'}, status=status.HTTP_404_NOT_FOUND)

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
        
        # Limpiar la cookie de session_key
        response = redirect('/iniciosesion/')
        response.delete_cookie('session_key')
        return response
    
def checkSession(request):
    is_authenticated = 'sustentante_id' in request.session
    return JsonResponse({'is_authenticated': is_authenticated})
    
class AdministradorLoginView(APIView):
    
    def post(self, request):
        serializer = AdministradorLoginSerializer(data=request.data)
        if serializer.is_valid():
            # Guardar el ID del administrador en la sesión
            request.session['admin_id'] = serializer.validated_data['id_administrador']

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

def verificar_correo_confirmado(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        correo = data.get('correo_electronico')

        try:
            sustentante = Sustentante.objects.get(correo_electronico=correo)
            return JsonResponse({'confirmado': sustentante.confirmado})
        except Sustentante.DoesNotExist:
            return JsonResponse({'error': 'Correo no registrado'}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def obtener_mensajes(request, sustentante_id):
    """
    Regresa todos los mensajes asociados a un sustentante (tanto enviados
    por el administrador como por el sustentante).
    """
    if request.method == 'GET':
        # Filtramos las notificaciones de este sustentante y ordenamos por fecha
        mensajes = Notificaciones.objects.filter(id_sustentante=sustentante_id).order_by('fecha_envio')
        
        # Convertimos a una lista de diccionarios para enviar como JSON
        lista_mensajes = []
        for msg in mensajes:
            lista_mensajes.append({
                'id_notificacion': msg.id_notificacion,
                'mensaje': msg.mensaje,
                'fecha_envio': msg.fecha_envio.strftime('%Y-%m-%d %H:%M:%S'),
                'es_de_administrador': msg.es_de_administrador,
                'estado_lectura': msg.estado_lectura,
            })

        return JsonResponse({'success': True, 'mensajes': lista_mensajes}, status=200)
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)


@csrf_exempt
def enviar_mensaje_admin(request, id_sustentante):
    """
    Endpoint para que el ADMINISTRADOR envíe un mensaje a un sustentante.
    Espera un JSON con: {"mensaje": "texto"}
    """
    if request.method == 'POST':
        try:
            # Obtener el ID del admin desde la sesión
            id_administrativo = request.session.get('admin_id')
            if not id_administrativo:
                return JsonResponse({'success': False, 'error': 'Administrador no autenticado'}, status=401)

            data = json.loads(request.body)
            print(f"Datos recibidos: {data}")
            mensaje_texto = data.get('mensaje')

            if not mensaje_texto:
                return JsonResponse({'success': False, 'error': 'Datos incompletos'}, status=400)

            # Recuperar objetos Sustentante y Administrativos
            sustentante = get_object_or_404(Sustentante, id_sustentante=id_sustentante)
            administrativo = get_object_or_404(Administrativos, id_administrativo=id_administrativo)

            # Crear el mensaje en la tabla Notificaciones
            Notificaciones.objects.create(
                id_sustentante=sustentante,
                mensaje=mensaje_texto,
                fecha_envio=timezone.now(),
                estado_lectura=False,  # False para "No leído", True para "Leído"
                es_de_administrador=True,  # Indica que lo manda el admin
                id_administrativo=administrativo
            )

            return JsonResponse({'success': True, 'message': 'Mensaje enviado correctamente'}, status=200)
        
        except Exception as e:
            print(f"Error: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    print("Error: Método no permitido")
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

@csrf_exempt
def enviar_mensaje_sustentante(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        mensaje_texto = data.get('mensaje')
        # Identifica al sustentante. Ejemplo, si guardaste su ID en la sesión:
        sustentante_id = request.session.get('sustentante_id')

        if not sustentante_id or not mensaje_texto:
            return JsonResponse({'success': False, 'error': 'Datos incompletos'}, status=400)

        sustentante = get_object_or_404(Sustentante, id_sustentante=sustentante_id)

        Notificaciones.objects.create(
            id_sustentante=sustentante,
            mensaje=mensaje_texto,
            fecha_envio=timezone.now(),
            estado_lectura='No leído',
            es_de_administrador=False  # Se marca como enviado por el sustentante
        )

        return JsonResponse({'success': True, 'message': 'Mensaje enviado por el sustentante'}, status=200)

    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)


def perfilAdministrador(request):
    timestamp = datetime.now().timestamp()

    print(f"Session data: {request.session.items()}")  # <-- Depuración

    # 1) Verificar si hay un administrador loggeado en la sesión
    admin_id = request.session.get('admin_id')
    if not admin_id:
        return redirect('inicioSesionAdmin')  # o la ruta de tu login de administrador
    
    try:
        # 2) Obtener el objeto del Admin
        admin_obj = Administrativos.objects.get(id_administrativo=admin_id)

        # 3) Consultar la tabla de notificaciones
        #    Si quieres TODAS las notificaciones, haces:
        #    notificaciones = Notificaciones.objects.all()

        #    Si solo quieres las que correspondan a cierto criterio, por ejemplo:
        #    - Notificaciones vinculadas a este admin
        #    - Notificaciones más recientes, etc.
        #    Aquí un ejemplo de TODAS, ordenadas por fecha_envio desc:
        notificaciones = Notificaciones.objects.select_related('id_sustentante', 'id_administrativo').order_by('-fecha_envio')

        # 4) Preparar el contexto para la plantilla
        context = {
            'admin_obj': admin_obj,
            'notificaciones': notificaciones,
            'timestamp': datetime.now().timestamp()
        }

        # 5) Renderizar la plantilla de administrador (por ejemplo, "administrador.html")
        return render(request, 'administrador.html', context)

    except Administrativos.DoesNotExist:
        return redirect('inicioSesionAdmin')
    
def lista_sustentantes(request):
    if request.method == 'GET':
        sustentantes = Sustentante.objects.all()
        lista = []
        for s in sustentantes:
            lista.append({
                'id_sustentante': s.id_sustentante,
                'nombre': s.nombre
            })
        return JsonResponse({'success': True, 'sustentantes': lista})
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

def verificar_sesion(request):
    session_key = request.COOKIES.get('session_key')
    sustentante_id = request.session.get('sustentante_id')

    print(f"Session key from cookies: {session_key}")  # Depuración
    print(f"Sustentante ID from session: {sustentante_id}")  # Depuración

    # Si no hay session_key, devolver un 200 con un mensaje indicando que no hay sesión
    if not session_key:
        return JsonResponse({'mensaje': 'No hay sesión activa'}, status=200)

    # Si la sesión no es válida, devolver un 401
    if not Session.objects.filter(session_key=session_key).exists():
        return JsonResponse({'mensaje': 'Sesión no válida'}, status=401)

    # Si no hay sustentante_id, devolver un 200 con un mensaje indicando que no hay sesión
    if not sustentante_id:
        return JsonResponse({'mensaje': 'No hay sesión activa'}, status=200)

    # Si el sustentante no existe, devolver un 404
    try:
        sustentante = Sustentante.objects.get(id_sustentante=sustentante_id)
        return JsonResponse({
            'mensaje': 'Sesión válida',
            'current_session_key': session_key  # Devolver la session_key actual
        }, status=200)
    except Sustentante.DoesNotExist:
        return JsonResponse({'mensaje': 'Sustentante no encontrado'}, status=404)
    
@method_decorator(csrf_exempt, name='dispatch')
@login_required
def obtener_mensajes_sustentante(request):
    if request.method == 'GET':
        sustentante_id = request.session.get('sustentante_id')
        if not sustentante_id:
            return JsonResponse({'success': False, 'error': 'No se encontró al sustentante'}, status=400)

        mensajes = Notificaciones.objects.filter(id_sustentante=sustentante_id).order_by('-fecha_envio')

        mensajes_data = [
            {
                'id_notificacion': mensaje.id_notificacion,
                'mensaje': mensaje.mensaje,
                'fecha_envio': mensaje.fecha_envio.strftime('%d/%m/%Y'),
                'estado_lectura': mensaje.estado_lectura,
                'es_de_administrador': mensaje.es_de_administrador
            } for mensaje in mensajes
        ]

        return JsonResponse({'success': True, 'mensajes': mensajes_data}, status=200)
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

class SpecialLogoutView(View):
    """
    Vista especial para cerrar sesión sin eliminar el sustentante_id.
    """
    def post(self, request, *args, **kwargs):
        # No eliminar el sustentante_id de la sesión
        # Solo limpiar la cookie de session_key
        response = redirect('/iniciosesion/')
        response.delete_cookie('session_key')
        return response
    

@require_GET
def tramites_espera(request):
    """
    Vista para obtener trámites en estado de espera
    """
    try:
        # Filtrar trámites con estado "Pendiente" y no aprobados
        tramites = Tramites.objects.filter(
            estado_actual='Pendiente',
            aprobado=False
        ).select_related('id_sustentante', 'id_opcion')  # Agregado select_related para id_opcion

        resultados = []
        for tramite in tramites:
            sustentante = tramite.id_sustentante
            nombre_opcion = tramite.id_opcion.nombre_opcion if tramite.id_opcion else "Sin opción especificada"
            
            resultados.append({
                'id_tramite': tramite.id_tramite,
                'sustentante': f"{sustentante.nombre} {sustentante.apellido}",
                'nombre': f"Trámite {tramite.id_tramite} - {tramite.estado_actual}",
                'fecha_inicio': tramite.fecha_inicio.strftime('%Y-%m-%d'),
                'id_opcion': tramite.id_opcion.id_opcion if tramite.id_opcion else None,  # Agregado id_opcion
                'nombre_opcion': nombre_opcion  # Agregado nombre_opcion
            })

        return JsonResponse({
            'success': True,
            'tramites': resultados
        })
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Esto imprimirá detalles del error en la terminal
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_GET
def tramites_progreso(request):
    """
    Vista para obtener trámites en proceso (aprobados y en progreso)
    """
    try:
        tramites = Tramites.objects.filter(
            aprobado=True,
            estado_actual='En Progreso'
        ).select_related('id_sustentante', 'id_opcion')  # Agregado select_related para id_opcion

        resultados = []
        for tramite in tramites:
            sustentante = tramite.id_sustentante
            # Obtener el nombre de la opción de titulación si existe la relación
            nombre_opcion = tramite.id_opcion.nombre_opcion if tramite.id_opcion else "Sin opción especificada"
            
            resultados.append({
                'id_tramite': tramite.id_tramite,
                'sustentante': f"{sustentante.nombre} {sustentante.apellido}",
                'nombre': f"Trámite {tramite.id_tramite} - En Progreso",
                'fecha_actualizacion': tramite.fecha_actualizacion.strftime('%Y-%m-%d') if tramite.fecha_actualizacion else None,
                'id_opcion': tramite.id_opcion.id_opcion if tramite.id_opcion else None,  # Agregado id_opcion
                'nombre_opcion': nombre_opcion  # Agregado nombre_opcion
            })

        return JsonResponse({
            'success': True,
            'tramites': resultados
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Depuración en consola
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def aprobar_tramite(request, tramite_id):
    """
    Vista para aprobar un trámite específico
    """
    try:
        tramite = Tramites.objects.get(id_tramite=tramite_id)

        if tramite.aprobado:
            return JsonResponse({'success': False, 'error': 'El trámite ya está aprobado'}, status=400)

        tramite.aprobado = True
        tramite.estado_actual = 'en progreso'  # Cambia a 'en progreso' al aprobar
        tramite.save()

        # Opcional: Actualizar documentos asociados
        Documentos.objects.filter(id_tramite=tramite_id).update(
            estado_validacion='aceptado'
        )

        return JsonResponse({
            'success': True,
            'message': 'Trámite aprobado correctamente',
            'nuevo_estado': tramite.estado_actual,
        })

    except Tramites.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Trámite no encontrado'}, status=404)
    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Depuración en consola
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
@csrf_exempt
@require_POST
def rechazar_tramite(request, tramite_id):
    try:
        with transaction.atomic():
            tramite = Tramites.objects.select_for_update().get(id_tramite=tramite_id)
            
            if tramite.estado_actual == 'Rechazado':
                return JsonResponse({
                    'success': False, 
                    'error': 'El trámite ya fue rechazado anteriormente'
                }, status=400)

            motivo = request.POST.get('motivo_rechazo', 'Rechazado por el administrador')
            
            # Actualizar trámite
            tramite.aprobado = False
            tramite.estado_actual = 'Rechazado'
            tramite.motivo_rechazo = motivo
            tramite.fecha_rechazo = timezone.now()
            tramite.rechazado_por = request.user if request.user.is_authenticated else None
            tramite.save()

            # Registrar en historial
            HistorialTramite.objects.create(
                id_tramite=tramite,
                accion='Rechazado',
                detalles=f"Motivo: {motivo}",
                usuario=request.user if request.user.is_authenticated else None
            )

            # Actualizar documentos relacionados (opcional)
            Documentos.objects.filter(id_tramite=tramite).update(
                estado_validacion='rechazado',
                motivo_rechazo=motivo,
                revisado_por=request.user if request.user.is_authenticated else None
            )

            return JsonResponse({
                'success': True,
                'message': 'Trámite rechazado con registro completo',
                'data': {
                    'id_tramite': tramite.id_tramite,
                    'estado': tramite.estado_actual,
                    'fecha_rechazo': tramite.fecha_rechazo.isoformat(),
                    'motivo': motivo[:200],  # Versión resumida para respuesta
                    'usuario': request.user.username if request.user.is_authenticated else 'Sistema'
                }
            })

    except Tramites.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Trámite no encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Error al rechazar trámite {tramite_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno al procesar el rechazo'
        }, status=500)
    
@require_GET
def documentos_tramite(request, tramite_id):
    """
    Vista para obtener documentos asociados a un trámite
    """
    try:
        documentos = Documentos.objects.filter(id_tramite=tramite_id)

        resultados = []
        for doc in documentos:
            resultados.append({
                'id': doc.id_documento,
                'nombre': doc.nombre_documento,
                'tipo': doc.tipo_documento,
                'estado': doc.estado_validacion,
                'fecha_subida': doc.fecha_subida.strftime('%Y-%m-%d') if doc.fecha_subida else None,
                'comentarios': doc.comentarios_validacion or '',
                'archivo_url': doc.archivo.url if doc.archivo and hasattr(doc.archivo, 'url') else None
            })

        return JsonResponse({
            'success': True,
            'documentos': resultados
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Depuración en consola
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
