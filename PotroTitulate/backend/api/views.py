from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SustentanteRegistroSerializer
from .serializers import SustentanteLoginSerializer
from django.shortcuts import redirect
from django.shortcuts import render

def index(request):
    return render(request, 'index(2).html')


def redirect_to_index(request):
    return redirect('/static/index(2).html')  # Redirige al archivo 'index.html'

def registro(request):
    return render(request, 'registro.html')

class RegistroView(APIView):
    def post(self, request):
        serializer = SustentanteRegistroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Registro exitoso'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = SustentanteLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
