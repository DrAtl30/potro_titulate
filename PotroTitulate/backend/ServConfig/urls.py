# backend/ServConfig/urls.py

from django.contrib import admin
from django.urls import path, include
from api import views  # Importamos las vistas directamente
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 1. Rutas de Administración y API
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # <-- ÚNICA LÍNEA QUE MANEJA TODAS LAS RUTAS /api/

    # 2. Rutas que renderizan las páginas HTML principales
    path('', views.index, name='index'),
    path('registro/', views.registro, name='registro'),
    path('iniciosesion/', views.inicio_sesion, name='inicio_sesion'),
    path('administrador/', views.perfilAdministrador, name='administrador'),
    path('perfilUsuario/', views.perfilUsuario, name='perfilUsuario'),
    path('recuperarContrasena/', views.recuperarContrasena, name='recuperarContrasena'),
    path('recuperarContrasenaExito/', views.recuperarContrasenaExito, name='recuperarContrasenaExito'),
    path('inicioSesionAdmin/', views.loginAdmin, name='inicioSesionAdmin'),
    path('cambiarContrasena/', views.cambiarContrasena, name='cambiarContrasena'),
    path('opcionesTitulacion/', views.opcionesTitulacion, name='opcionesTitulacion'),
    path('pre_fre/', views.preguntas_frecuentes, name='pre_fre'),

    # 3. Ruta para la confirmación de cuenta
    path('descargar_formato/<str:nombre_archivo>/', views.descargar_formato, name='descargar_formato'),
    path('confirmar-cuenta/<str:uidb64>/<str:token>/', views.ConfirmarCuentaView.as_view(), name='confirmar-cuenta'),
]

# Configuración para servir archivos estáticos y de medios en modo DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)