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
from api.views import index, registro, inicio_sesion

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Ruta para las APIs
    path('', index),  # Esto redirige la raíz a la vista 'index'
    path('index/', index, name='index'),  # Ruta para "index"
    path('registro/', registro, name='registro'),  # Ruta para el formulario de registro
    path('iniciosesion/', inicio_sesion, name='inicio_sesion'),  # Ruta para "iniciar sesión"
]

