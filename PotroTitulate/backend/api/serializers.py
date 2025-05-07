
from rest_framework import serializers 
from django.contrib.auth.hashers import make_password 
from django.contrib.auth.hashers import check_password 
from .models import Administrativos, Sustentante

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import authenticate


from .models import Sustentante, OpcionTitulacion


from .models import Sustentante, Administrativos

import re

class SustentanteRegistroSerializer(serializers.ModelSerializer):
    contrasena = serializers.CharField(write_only=True)
    contrasena_temporal = serializers.BooleanField(required=False, default=False)
    id_opcion = serializers.PrimaryKeyRelatedField(queryset=OpcionTitulacion.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Sustentante
        fields = ['nombre', 'apellido', 'numero_cuenta', 'correo_electronico', 'contrasena', 'licenciatura', 'id_opcion', 'contrasena_temporal'] 

    def validate_contrasena(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        # Aquí no necesitas hacer el hash manualmente, ya que en el método `create` lo hacemos con `set_password`
        return value

    def validate_correo_electronico(self, value):
        if Sustentante.objects.filter(correo_electronico=value).exists():
            raise serializers.ValidationError("El correo electrónico ya está registrado.")
        return value

    def validate_numero_cuenta(self, value):
        if len(value) != 7:
            raise serializers.ValidationError("El número de cuenta debe tener 7 dígitos.")
        if Sustentante.objects.filter(numero_cuenta=value).exists():
            raise serializers.ValidationError("El número de cuenta ya está registrado.")
        return value
    
    def create(self, validated_data):
        contrasena = validated_data.pop('contrasena')  # Extrae la contraseña
        contrasena_temporal = validated_data.pop('contrasena_temporal', False)  # Si existe, la extrae

        # Crear el objeto Sustentante sin la contraseña
        sustentante = Sustentante(**validated_data)
        # Usamos `set_password` para encriptar la contraseña
        sustentante.set_password(contrasena)  
        sustentante.contrasena_temporal = contrasena_temporal  # Asigna el valor de contrasena_temporal si lo tiene
        sustentante.save()  # Guarda el objeto en la base de datos

        # Enviar correo de confirmación (suponiendo que tengas una función para esto)
        self.enviar_correo_confirmacion(sustentante)
        return sustentante
    def enviar_correo_confirmacion(self, sustentante):
        token = default_token_generator.make_token(sustentante)
        uid = urlsafe_base64_encode(force_bytes(sustentante.id_sustentante))
        url_confirmacion = f"{settings.FRONTEND_URL}/confirmar-cuenta/{uid}/{token}/"

        asunto = "Confirma tu cuenta"
        mensaje_html = render_to_string('confirmacion_correo.html', {'url_confirmacion': url_confirmacion})
        mensaje_texto = f"Por favor confirma tu cuenta ingresando al siguiente enlace: {url_confirmacion}"

        email = EmailMultiAlternatives(asunto, mensaje_texto, settings.EMAIL_HOST_USER, [sustentante.correo_electronico])
        email.attach_alternative(mensaje_html, "text/html")
        email.send()

class SustentanteLoginSerializer(serializers.Serializer):
    correo_electronico = serializers.EmailField()
    contrasena = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            sustentante = Sustentante.objects.get(correo_electronico=data['correo_electronico'])
        except Sustentante.DoesNotExist:
            raise serializers.ValidationError("Correo electrónico o contraseña incorrectos.")
        
        # Verifica la contraseña encriptada
        if not check_password(data['contrasena'], sustentante.contrasena):
            raise serializers.ValidationError("Correo electrónico o contraseña incorrectos.")
        
        # Verificar si la contraseña es temporal
        if sustentante.contrasena_temporal:
            data['contrasena_temporal'] = True
        else:
            data['contrasena_temporal'] = False
        
        # Retornar datos adicionales para la respuesta
        return {
            'id_sustentante': sustentante.id_sustentante,
            'nombre': sustentante.nombre,
            'correo_electronico': sustentante.correo_electronico,
            'confirmado': sustentante.confirmado,  # Agregar confirmación de cuenta
            'contrasena_temporal': data['contrasena_temporal']  # Agregar si la contraseña es temporal
        }



class AdministradorLoginSerializer(serializers.Serializer):
    correo_electronico = serializers.EmailField()
    contrasena = serializers.CharField(write_only=True)

    def validate(self, data):
        # Autenticar con el sistema de Django
        user = authenticate(
            username=data['correo_electronico'],
            password=data['contrasena']
        )
        
        if user is None:
            raise serializers.ValidationError("Credenciales incorrectas")
        
        try:
            # Verificar que tenga perfil administrativo
            administrativo = user.administrativo_profile
        except AttributeError:
            raise serializers.ValidationError("El usuario no tiene permisos de administrador")
        
        return {
<<<<<<< HEAD
            'id_administrador': administrador.id_administrativo,            
            'nombre': administrador.nombre,
            'correo_electronico': administrador.correo_electronico
=======
            'id_administrador': administrativo.id_administrativo,
            'nombre': administrativo.nombre,
            'correo_electronico': user.email
>>>>>>> 92718284e088831da31133f87bf5aaa0079c26c4
        }