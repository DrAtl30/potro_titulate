"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from api.views import *;
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Ruta para las APIs
    path('', index),  # Esto redirige la raíz a la vista 'index'
    path('index/', index, name='index'),  # Ruta para "index"
    path('registro/', registro, name='registro'),  # Ruta para el formulario de registro
    path('iniciosesion/', inicio_sesion, name='inicio_sesion'),  # Ruta para "iniciar sesión"
    path('administrador/', perfilAdministrador, name='administrador'),  # Ruta para "administrador"
    path('perfilUsuario/', perfilUsuario, name='perfilUsuario'),  # Ruta para "perfil de
    path('recuperarContrasena/', recuperarContrasena, name='recuperarContrasena'),  # Ruta para "recuperar contraseña"
    path('inicioSesionAdmin/', loginAdmin, name='inicioSesionAdmin'),  # Ruta para "loginAdmin"
    path('cambiarContrasena/', cambiarContrasena, name='cambiarContrasena'),  # Ruta para "cambiar contraseña"
    path('pre_fre/', preguntas_frecuentes, name='pre_fre'),  #Ruta para Preguntas Frecuentes

    path('recuperarContrasena/recuperarContra', RecuperarContraseñaView.as_view(), name='procesar_recuperacion'),
    path('cambiarContrasena/<int:id_sustentante>/', CambiarContrasenaView.as_view(), name='cambiar_contrasena'),  # Ruta para "cambiar contraseña"

    path('administradorLogin/', AdministradorLoginView.as_view(), name='adminstradorLogin'),

    path('recuperarContrasenaExito/', recuperarContrasenaExito, name='recuperarContrasenaExito'),  # Ruta para "recuperar contraseña exito"
    path('administradorLogin/', AdministradorLoginView.as_view(), name='adminstradorLogin'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('checkSession/', checkSession, name='checkSession'),
    path('uploadDocument/', uploadDocument, name='subirDocumento'),
    path('seleccionarOpcionTitulacion/', seleccionar_opcion_titulacion, name='SeleccionarOpcionTitulacion'),
    path('revisarOpcionesTitulacion/', revisarOpcionesTitulacion, name='RevisarOpcionesTitulacion'),
    path('actualizarProgreso/', actualizarProgreso, name='actualizarProgreso'),
    path('obtenerEstados/<int:tramite_id>/', estadoDocumento, name='obtenerEstados'),
    path('opcionesTitulacion/', opcionesTitulacion, name='opcionesTitulacion'),
    path('verificarTramiteEnProgreso/<int:id_sustentante>/', verificar_tramite_en_progreso, name='verificarTramiteEnProgreso'),
    path('enviarSolicitud/', enviar_solicitud, name='enviarSolicitud'),
    
    path('api/escuelas-incorporadas/', EscuelasIncorporadas.as_view(), name='escuelas_incorporadas'),


    # mensajeria 
    # 1) GET /obtenerMensajes/7/ => ver mensajes de ID=7
    path('obtenerMensajes/<int:id_sustentante>/', obtener_mensajes, name='obtenerMensajes'),

    # 2) POST /enviarMensajeAdmin/7/ => enviar mensaje admin a ID=7
    path('enviarMensajeAdmin/<int:id_sustentante>/', enviar_mensaje_admin, name='enviarMensajeAdmin'),

    # 3) POST /enviarMensajeSustentante/7/ => si el sustentante manda mensaje
    path('enviarMensajeSustentante/<int:id_sustentante>/', enviar_mensaje_sustentante, name='enviarMensajeSustentante'),

    # 4) confirmación de cuenta (tal cual lo tienes)
    path('confirmar-cuenta/<str:uidb64>/<str:token>/', ConfirmarCuentaView.as_view(), name='confirmar-cuenta'),
    path('verificarCorreoConfirmado/', verificar_correo_confirmado, name='verificar_correo_confirmado'),
    path('specialLogout/', SpecialLogoutView.as_view(), name='special_logout'),
    

    # 5) GET /perfilAdministrador/ => vista de administrador
    path('perfilAdministrador/', perfilAdministrador, name='perfilAdministrador'),
    
     path('listaSustentantes/', lista_sustentantes, name='listaSustentantes'),


    # Ruta para la API de registro
    path('api/registro/', RegistroView.as_view(), name='api_registro'),  # API para registro
    path('api/login/', LoginView.as_view(), name='login'),  # Ruta para login


    path('api/logout/', LogoutView.as_view(), name='logout'),  # Ruta para logout
                                                                        
    path('api/login/administrador/', AdministradorLoginView.as_view(), name='login_administrador'),  # Ruta para login de administrador
    path('api/perfil/', PerfilUsuarioView.as_view(), name='perfil_usuario'),
    path('api/verificarSesion/', verificar_sesion, name='verificar_sesion'),

    # URLs para trámites
    path('api/tramites/espera/', tramites_espera, name='tramites_espera'),
    path('api/tramites/progreso/', tramites_progreso, name='tramites_progreso'),
    path('api/tramites/rechazados/', tramites_rechazados, name='api_tramites_rechazados'),
    path('api/tramites/aprobar/<int:tramite_id>/', aprobar_tramite, name='aprobar_tramite'),
    path('api/tramites/documentos/<int:tramite_id>/', documentos_tramite, name='documentos_tramite'),
    path('api/tramites/rechazar/<int:tramite_id>/', rechazar_tramite, name='rechazar_tramite'),
    path('api/tramites/obtener-motivo/<int:tramite_id>/', obtener_motivo_rechazo, name='obtener_motivo'),
    path('api/validar_documento/<int:documento_id>/', validar_documento, name='validar_documento'),
    path('api/sustentante/<int:sustentante_id>/actualizar_oportunidades/', actualizar_oportunidades, name='actualizar_oportunidades'),


    #URLs para notificaciones
    path('api/notificaciones/<int:sustentante_id>/', obtener_notificaciones, name='obtener_notificaciones'),
    path('api/notificaciones/marcar_leida/<int:notificacion_id>/', marcar_leida, name='marcar_leida'),
    

      # mensajeria 
    # 1) GET /obtenerMensajes/7/ => ver mensajes de ID=7
    path('obtener_mensajes/<int:sustentante_id>/', obtener_mensajes, name='obtener_mensajes'),
    
    # 2) POST /enviarMensajeAdmin/7/ => enviar mensaje admin a ID=7
    path('enviarMensajeAdmin/<int:id_sustentante>/', enviar_mensaje_admin, name='enviar_mensaje_admin'),

    # 3) POST /enviarMensajeSustentante/7/ => si el sustentante manda mensaje
    path('enviarMensajeSustentante/<int:id_sustentante>/', enviar_mensaje_sustentante, name='enviarMensajeSustentante'),

    path('confirmar-cuenta/<str:uidb64>/<str:token>/', ConfirmarCuentaView.as_view(), name='confirmar-cuenta'),

    # 5) GET /perfilAdministrador/ => vista de administrador
    path('perfilAdministrador/', perfilAdministrador, name='perfilAdministrador'),
    
    path('listaSustentantes/', lista_sustentantes, name='listaSustentantes'),

    path('api/mensajes/sustentante/', obtener_mensajes_sustentante, name='obtener_mensajes_sustentante'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)