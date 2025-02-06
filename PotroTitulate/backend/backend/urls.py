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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Ruta para las APIs
    path('', index),  # Esto redirige la raíz a la vista 'index'
    path('index/', index, name='index'),  # Ruta para "index"
    path('registro/', registro, name='registro'),  # Ruta para el formulario de registro
    path('iniciosesion/', inicio_sesion, name='inicio_sesion'),  # Ruta para "iniciar sesión"
    path('administrador/', administrador, name='administrador'),  # Ruta para "administrador"
    path('perfilUsuario/', perfilUsuario, name='perfilUsuario'),  # Ruta para "perfil de
    path('recuperarContrasena/', recuperarContrasena, name='recuperarContrasena'),  # Ruta para "recuperar contraseña"
    path('inicioSesionAdmin/', loginAdmin, name='inicioSesionAdmin'),  # Ruta para "loginAdmin"
    path('cambiarContrasena/', cambiarContrasena, name='cambiarContrasena'),  # Ruta para "cambiar contraseña"

    path('recuperarContrasena/recuperarContra', RecuperarContraseñaView.as_view(), name='procesar_recuperacion'),
    path('cambiarContrasena/<int:id_sustentante>/', CambiarContrasenaView.as_view(), name='cambiar_contrasena'),  # Ruta para "cambiar contraseña"
    path('recuperarContrasenaExito/', recuperarContrasenaExito, name='recuperarContrasenaExito'),  # Ruta para "recuperar contraseña exito"
    path('administradorLogin/', AdministradorLoginView.as_view(), name='adminstradorLogin'),
    #path('perfilUsuario/', PerfilUsuarioView.as_view(), name='perfilUsuario'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('checkSession/', checkSession, name='checkSession'),
    path('uploadDocument/', uploadDocument, name='subirDocumento'),

    # Ruta para la API de registro
    path('api/registro/', RegistroView.as_view(), name='api_registro'),  # API para registro
    path('api/login/', LoginView.as_view(), name='login'),  # Ruta para login
    path('api/logout/', LogoutView.as_view(), name='logout'),  # Ruta para logout
    path('api/login/administrador/', AdministradorLoginView.as_view(), name='login_administrador'),  # Ruta para login de administrador
]

