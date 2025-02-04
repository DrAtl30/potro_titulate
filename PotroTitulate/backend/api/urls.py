from django.urls import path
from .views import RegistroView, LoginView, AdministradorLoginView

urlpatterns = [
    path('api/registro/', RegistroView.as_view(), name='registro'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/login/administrador/', AdministradorLoginView.as_view(), name='login_administrador'),

]
