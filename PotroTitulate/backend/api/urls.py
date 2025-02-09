from django.urls import path
<<<<<<< HEAD
from .views import AdministradorLoginView, RegistroView, LoginView
=======
from .views import *;
>>>>>>> 091560d98b420a81ae219a43470c379fb9683b15

urlpatterns = [
    path('api/registro/', RegistroView.as_view(), name='registro'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/login/administrador/', AdministradorLoginView.as_view(), name='login_administrador'),
<<<<<<< HEAD
=======
    path('api/logout/', LogoutView.as_view(), name='logout'),

>>>>>>> 091560d98b420a81ae219a43470c379fb9683b15
]
