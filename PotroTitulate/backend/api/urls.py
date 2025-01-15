from django.urls import path
from .views import RegistroView, LoginView, redirect_to_index

urlpatterns = [
    path('registro/', RegistroView.as_view(), name='registro'),
    path('login/', LoginView.as_view(), name='login'),
    path('', redirect_to_index, name='home'),
    
]
