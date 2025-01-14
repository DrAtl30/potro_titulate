from django.shortcuts import render
from django.http import JsonResponse

def saludo(request):
    return JsonResponse({"mensaje": "¡Hola desde el backend!"})
