from django.urls import path
from .views import *;

urlpatterns = [
    path('api/registro/', RegistroView.as_view(), name='registro'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/login/administrador/', AdministradorLoginView.as_view(), name='login_administrador'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

]
