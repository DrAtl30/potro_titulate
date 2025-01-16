from django.urls import path
from .views import RegistroView, LoginView

urlpatterns = [
    path('api/registro/', RegistroView.as_view(), name='registro'),
    path('api/login/', LoginView.as_view(), name='login'),

]
