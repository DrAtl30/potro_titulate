# backend/api/urls.py

from django.urls import path
from .views import *

urlpatterns = [
    # Autenticación y Usuarios
    path('registro/', RegistroView.as_view(), name='api_registro'),
    path('login/', LoginView.as_view(), name='api_login'),
    path('login/administrador/', AdministradorLoginView.as_view(), name='api_login_administrador'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
    path('perfil/', PerfilUsuarioView.as_view(), name='api_perfil_usuario'),
    path('verificarSesion/', verificar_sesion, name='api_verificar_sesion'),
    path('cambiarContrasena/<int:id_sustentante>/', CambiarContrasenaView.as_view(), name='api_cambiar_contrasena'),
    path('recuperarContrasena/', RecuperarContraseñaView.as_view(), name='api_procesar_recuperacion'),
    path('verificarCorreoConfirmado/', verificar_correo_confirmado, name='api_verificar_correo_confirmado'),
    path('sustentante/<int:sustentante_id>/actualizar_oportunidades/', actualizar_oportunidades, name='api_actualizar_oportunidades'),

    # ¡LA RUTA QUE ARREGLA TU PROBLEMA!
    path('escuelas-incorporadas/', EscuelasIncorporadas.as_view(), name='api_escuelas_incorporadas'),
    path('listaSustentantes/', lista_sustentantes, name='api_lista_sustentantes'),


    # Trámites y Documentos
    path('tramites/espera/', tramites_espera, name='api_tramites_espera'),
    path('tramites/progreso/', tramites_progreso, name='api_tramites_progreso'),
    path('tramites/rechazados/', tramites_rechazados, name='api_tramites_rechazados'),
    path('tramites/aprobar/<int:tramite_id>/', aprobar_tramite, name='api_aprobar_tramite'),
    path('tramites/rechazar/<int:tramite_id>/', rechazar_tramite, name='api_rechazar_tramite'),
    path('tramites/documentos/<int:tramite_id>/', documentos_tramite, name='api_documentos_tramite'),
    path('tramites/obtener-motivo/<int:tramite_id>/', obtener_motivo_rechazo, name='api_obtener_motivo'),
    path('validar_documento/<int:documento_id>/', validar_documento, name='api_validar_documento'),
    path('verificarTramiteEnProgreso/<int:id_sustentante>/', verificar_tramite_en_progreso, name='api_verificar_tramite'),
    path('enviarSolicitud/', enviar_solicitud, name='api_enviar_solicitud'),

    # Notificaciones y Mensajería
    path('notificaciones/<int:sustentante_id>/', obtener_notificaciones, name='api_obtener_notificaciones'),
    path('notificaciones/marcar_leida/<int:notificacion_id>/', marcar_leida, name='api_marcar_leida'),
    path('mensajes/sustentante/', obtener_mensajes_sustentante, name='api_obtener_mensajes_sustentante'),
    path('enviarMensajeAdmin/<int:id_sustentante>/', enviar_mensaje_admin, name='api_enviar_mensaje_admin'),

    # Estadísticas y otros
    path('estadisticas/', estadisticas_view, name="api_estadisticas"),
]