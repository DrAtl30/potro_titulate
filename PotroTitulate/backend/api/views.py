from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import login, authenticate
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
logger = logging.getLogger(__name__)  
import json
import os
from django.http import FileResponse
from django.core.exceptions import ObjectDoesNotExist


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
            # Parse JSON data from the request body
            data = json.loads(request.body)

            # Extract id_sustentante and id_opcion from the request data
            id_sustentante = data.get('id_sustentante')
            id_opcion = data.get('id_opcion')

            # Validate that both fields are present
            if not id_sustentante or not id_opcion:
                return JsonResponse({'error': 'Datos incompletos'}, status=400)

            sustentante = get_object_or_404(Sustentante, id_sustentante=id_sustentante)
            opcion_titulacion = get_object_or_404(OpcionTitulacion, id_opcion=id_opcion)

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
        serializer = AdministradorLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.context.get('user') or User.objects.get(
                email=serializer.validated_data['correo_electronico']
            )
            login(request, user)
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
        # Obtener el ID del admin desde el perfil administrativo
        try:
            # verificar que se un usuario, es decir, validación general. 
            if not request.user.is_authenticated:
                return JsonResponse({'success': False, 'error': 'Usuario no autenticado'}, status=401)
            # validación del perfil administrativo
            try:
                admin_profile = request.user.administrativo_profile
            except AttributeError:
                return JsonResponse({'success': False, 'error': 'Lo siento, el usuario no tiene un perfil de administrativo'}, status=403)

            data = json.loads(request.body)
            mensaje_texto = data.get('mensaje')

            if not mensaje_texto:
                return JsonResponse({'success': False, 'error': 'Datos incompletos, sin mensaje'}, status=400)

            # Recuperar objetos Sustentante
            sustentante = get_object_or_404(Sustentante, id_sustentante=id_sustentante)

            # Crear el mensaje en la tabla Notificaciones
            Notificaciones.objects.create(
                id_sustentante=sustentante,
                mensaje=mensaje_texto,
                fecha_envio=timezone.now(),
                estado_lectura=False,  # False para "No leído", True para "Leído"
                es_de_administrador=True,  # Indica que lo manda el admin
                id_administrativo=admin_profile
            )

            return JsonResponse({'success': True, 'message': 'Mensaje enviado correctamente'}, status=200)
        
        except Exception as e:
            print(f"Error: {str(e)}")
            return JsonResponse({'success': False, 'error interno': str(e)}, status=500)
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


@login_required  # Este decorador asegura que solo usuarios logueados accedan
def perfilAdministrador(request):
    try:
        # Accedemos al perfil administrativo a través de la relación inversa
        admin = request.user.administrativo_profile
        
        # Obtenemos las notificaciones más recientes (últimas 10)
        notificaciones = Notificaciones.objects.select_related(
            'id_sustentante', 
            'id_administrativo'
        ).order_by('-fecha_envio')[:10]

        return render(request, 'administrador.html', {
            'admin': admin,
            'notificaciones': notificaciones,
            'timestamp': timezone.now().timestamp()
        })

    except Administrativos.DoesNotExist:
        # Si el usuario no tiene perfil administrativo, lo redirigimos al login
        return redirect('inicioSesionAdmin')

    except Administrativos.DoesNotExist:
        return redirect('inicioSesionAdmin')
    
def lista_sustentantes(request):
    if request.method == 'GET':
        sustentantes = Sustentante.objects.all()
        lista = []
        for s in sustentantes:
            lista.append({
                'id_sustentante': s.id_sustentante,
                'nombre': s.nombre,
                'numero_cuenta': s.numero_cuenta,  # Agregar número de cuenta
                'correo': s.correo_electronico     # Agregar correo electrónico
            })
        return JsonResponse({'success': True, 'sustentantes': lista})
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

def verificar_sesion(request):
    session_key = request.COOKIES.get('session_key')
    sustentante_id = request.session.get('sustentante_id')

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
        ).select_related('id_sustentante', 'id_opcion')

        resultados = []
        for tramite in tramites:
            sustentante = tramite.id_sustentante
            nombre_opcion = tramite.id_opcion.nombre_opcion if tramite.id_opcion else "Sin opción especificada"
            
            resultados.append({
                'id_tramite': tramite.id_tramite,
                'sustentante': f"{sustentante.nombre} {sustentante.apellido}",
                'nombre_completo': f"{sustentante.nombre} {sustentante.apellido}",  # Nombre completo
                'numero_cuenta': sustentante.numero_cuenta,  # Número de cuenta
                'correo': sustentante.correo_electronico,    # Correo electrónico
                'nombre': f"Trámite {tramite.id_tramite} - {tramite.estado_actual}",
                'fecha_inicio': tramite.fecha_inicio.strftime('%Y-%m-%d'),
                'id_opcion': tramite.id_opcion.id_opcion if tramite.id_opcion else None,
                'nombre_opcion': nombre_opcion
            })

        return JsonResponse({
            'success': True,
            'tramites': resultados
        })
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
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
            estado_actual='en progreso'
        ).select_related('id_sustentante', 'id_opcion')

        resultados = []
        for tramite in tramites:
            sustentante = tramite.id_sustentante
            nombre_opcion = tramite.id_opcion.nombre_opcion if tramite.id_opcion else "Sin opción especificada"
            
            resultados.append({
                'id_tramite': tramite.id_tramite,
                'sustentante': f"{sustentante.nombre} {sustentante.apellido}",
                'nombre_completo': f"{sustentante.nombre} {sustentante.apellido}",  # Nombre completo
                'numero_cuenta': sustentante.numero_cuenta,  # Número de cuenta
                'correo': sustentante.correo_electronico,    # Correo electrónico
                'nombre': f"Trámite {tramite.id_tramite} - En Progreso",
                'fecha_actualizacion': tramite.fecha_actualizacion.strftime('%Y-%m-%d') if tramite.fecha_actualizacion else None,
                'id_opcion': tramite.id_opcion.id_opcion if tramite.id_opcion else None,
                'nombre_opcion': nombre_opcion,
                'estado_actual': tramite.estado_actual  # Agregar estado actual
            })

        return JsonResponse({
            'success': True,
            'tramites': resultados
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


logger = logging.getLogger(__name__)

@csrf_exempt
@login_required
def aprobar_tramite(request, tramite_id):
    if request.method == 'POST':
        try:
            administrativo = Administrativos.objects.get(user=request.user)
        except Administrativos.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuario no autorizado'}, status=403)

        try:
            tramite = Tramites.objects.get(id_tramite=tramite_id)

            tramite.estado_actual = 'en progreso'
            tramite.aprobado = True
            tramite.fecha_actualizacion = timezone.now().date()
            tramite.ultima_actualizacion = timezone.now()
            tramite.save()

            return JsonResponse({'success': True})
        except Tramites.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Trámite no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': 'Error interno al procesar la aprobación'}, status=500)

@csrf_exempt
@login_required
def rechazar_tramite(request, tramite_id):
    if request.method == 'POST':
        try:
            administrativo = Administrativos.objects.get(user=request.user)
        except Administrativos.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuario no autorizado'}, status=403)

        try:
            tramite = Tramites.objects.get(id_tramite=tramite_id)
            data = json.loads(request.body)
            motivo_rechazo = data.get('motivo_rechazo', '')

            tramite.estado_actual = 'Rechazado'
            tramite.aprobado = False
            tramite.motivo_rechazo = motivo_rechazo
            tramite.fecha_rechazo = timezone.now()
            tramite.rechazado_por = request.user
            tramite.fecha_actualizacion = timezone.now().date()
            tramite.ultima_actualizacion = timezone.now()
            tramite.save()

            return JsonResponse({'success': True})
        except Tramites.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Trámite no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': 'Error interno al procesar el rechazo'}, status=500)

@csrf_exempt
@require_POST
def validar_documento(request, documento_id):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Autenticación requerida'}, status=401)

    try:
        admin_profile = request.user.administrativo_profile
    except AttributeError:
        return JsonResponse({'success': False, 'error': 'No tienes permisos de administrador'}, status=403)

    try:
        with transaction.atomic():
            documento = Documentos.objects.select_related('id_tramite', 'id_tramite__id_sustentante').get(id_documento=documento_id)

            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'error': 'Datos JSON inválidos'}, status=400)

            accion = data.get('accion')
            if accion not in ['aceptado', 'rechazado']:
                return JsonResponse({'success': False, 'error': 'Acción no válida'}, status=400)

            comentario = data.get('comentario', '').strip()
            if accion == 'rechazado' and not comentario:
                return JsonResponse({'success': False, 'error': 'Se requiere un motivo para el rechazo'}, status=400)

            documento.estado_validacion = accion
            documento.comentarios_validacion = comentario
            documento.fecha_validacion = timezone.now()
            documento.revisado_por = request.user
            documento.validado_por = request.user
            documento.save()

            mensaje = (
                f"Su documento '{documento.nombre_documento}' del trámite {documento.id_tramite.id_tramite} "
                f"ha sido {'aceptado' if accion == 'aceptado' else 'rechazado'}"
            )
            if accion == 'rechazado':
                mensaje += f". Motivo: {comentario}"

            enviar_notificacion(
                sustentante_id=documento.id_tramite.id_sustentante.id_sustentante,
                administrativo_id=admin_profile.id_administrativo,
                mensaje=mensaje,
                es_de_administrador=True
            )

            return JsonResponse({
                'success': True,
                'message': f'Documento {accion} correctamente',
                'tramite_id': documento.id_tramite.id_tramite,
                'documento_id': documento.id_documento,
                'nuevo_estado': documento.estado_validacion
            })

    except Documentos.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Documento no encontrado'}, status=404)
    except Exception as e:
        logger.exception(f"Error al validar documento {documento_id}")
        return JsonResponse({'success': False, 'error': 'Error interno del servidor'}, status=500)

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

@require_GET
def obtener_motivo_rechazo(request, tramite_id):
    try:
        tramite = Tramites.objects.get(id_tramite=tramite_id)
        return JsonResponse({
            'success': True,
            'motivo': tramite.motivo_rechazo if tramite.motivo_rechazo else ""
        })
    except Tramites.DoesNotExist:
        return JsonResponse({'success': False}, status=404)

    
def actualizar_estado_tramite(tramite):
    """
    Función auxiliar para actualizar estado del trámite
    según sus documentos
    """
    documentos = tramite.documentos_set.all()
    
    if all(doc.estado_validacion == 'aceptado' for doc in documentos):
        tramite.estado_actual = 'Documentación completa'
    elif any(doc.estado_validacion == 'rechazado' for doc in documentos):
        tramite.estado_actual = 'Documentación incompleta'
    
    tramite.save()



FORMATOS_PERMITIDOS = {
    'formato_8_1.docx' : '8.1 Solicitud y Registro',
    'formato_8_3.docx' : '8.3 Dictamen',
    'formato_8_5.docx' : '8.5 Voto Aprobatorio',
    'formato_8_7.docx' : '8.7 Evaluación Profesional',
    'formato_8_10.docx' : '8.10 Revocación',
    'formato_8_11.docx' : '8.11 Cesión de Derechos',
}
def descargar_formato(request, nombre_archivo):
    """Vista para descargar formatos oficiales"""

    formatos_dir = os.path.join(settings.STATICFILES_DIRS[0], 'formatos')
    archivos_disponibles = os.listdir(formatos_dir)
    print(f"Archivos en 'formatos': {archivos_disponibles}")  

    if nombre_archivo not in FORMATOS_PERMITIDOS:
        raise Http404("Formato no válido")
    # Construye la ruta relativa a tu carpeta 'formatos'
    file_path = os.path.join(settings.STATICFILES_DIRS[0], 'formatos', nombre_archivo)
    
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=nombre_archivo)
    raise Http404("El archivo no existe")


def preguntas_frecuentes(request):
    """Vista para renderizar página de Preguntas Frecuentes"""
    pre_freS = PreguntasFrecuentes.objects.all()
    return render(request, "preguntasFrecuentesIndex.html", {'pre_freS' : pre_freS})


def enviar_notificacion(sustentante_id, administrativo_id=None, mensaje="", es_de_administrador=False):
    """
    Versión mejorada para enviar notificaciones
    """
    try:
        # Validación básica
        if not mensaje or not sustentante_id:
            raise ValueError("Datos incompletos para la notificación")
        
        # Crear la notificación
        Notificaciones.objects.create(
            id_sustentante_id=sustentante_id,
            id_administrativo_id=administrativo_id,  # Puede ser None (notificaciones del sistema)
            mensaje=mensaje,
            fecha_envio=timezone.now(),
            estado_lectura=False,
            es_de_administrador=es_de_administrador
        )
        return True
    
    except Exception as e:
        # Loggear el error adecuadamente en producción
        print(f"[Error] Notificación no enviada: {str(e)}")
        return False
    
@require_GET
def obtener_notificaciones(request, sustentante_id):
    """
    Obtiene las notificaciones de un sustentante
    """
    try:
        # Verificar que el sustentante existe
        Sustentante.objects.get(id_sustentante=sustentante_id)
        
        # Obtener notificaciones no leídas
        notificaciones = Notificaciones.objects.filter(
            id_sustentante_id=sustentante_id,
            estado_lectura=False
        ).select_related('id_administrativo').order_by('-fecha_envio')[:10]

        resultados = []
        for n in notificaciones:
            resultado = {
                'id': n.id_notificacion,
                'mensaje': n.mensaje,
                'fecha': n.fecha_envio.strftime('%Y-%m-%d %H:%M'),
                'es_de_administrador': n.es_de_administrador,
            }
            
            # Manejar caso cuando no hay administrativo (notificaciones del sistema)
            if n.id_administrativo:
                resultado['administrativo'] = n.id_administrativo.nombre
            else:
                resultado['administrativo'] = 'Sistema'
                
            resultados.append(resultado)

        return JsonResponse({
            'success': True,
            'notificaciones': resultados,
            'total': len(resultados)
        })

    except Sustentante.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Sustentante no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener notificaciones: {str(e)}'
        }, status=500)
    
@require_POST
@csrf_exempt
def marcar_leida(request, notificacion_id):
    """
    Marca una notificación como leída
    """
    try:
        # Obtener sustentante_id de la sesión
        sustentante_id = request.session.get('sustentante_id')
        if not sustentante_id:
            return JsonResponse({
                'success': False,
                'error': 'No autenticado'
            }, status=401)

        # Obtener y actualizar la notificación
        notificacion = Notificaciones.objects.get(
            id_notificacion=notificacion_id,
            id_sustentante_id=sustentante_id  # Solo el dueño puede marcarla
        )
        
        notificacion.estado_lectura = True
        notificacion.fecha_lectura = timezone.now()
        notificacion.save()
        
        return JsonResponse({'success': True})

    except Notificaciones.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Notificación no encontrada o no tienes permiso'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al marcar como leída: {str(e)}'
        }, status=500)