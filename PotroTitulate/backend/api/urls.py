from django.urls import path

from .views import AdministradorLoginView, RegistroView, LoginView

from .views import *;


urlpatterns = [
    path('api/registro/', RegistroView.as_view(), name='registro'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/login/administrador/', AdministradorLoginView.as_view(), name='login_administrador'),
    
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('descargar/<int:documento_id>/', descargar_documento, name='descargar_documento'),
    path('api/verificarSesion/', verificar_sesion, name='verificar_sesion'),
<<<<<<< HEAD



=======
    path('descargar_formato/<str:nombre_archivo>/', descargar_formato, name='descargar_formato' ),
>>>>>>> 92718284e088831da31133f87bf5aaa0079c26c4
]
