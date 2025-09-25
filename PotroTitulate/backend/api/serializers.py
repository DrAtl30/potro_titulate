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
    # Campo para recibir la contraseña (solo para escritura)
    contrasena = serializers.CharField(
        write_only=True, 
        required=True, 
        min_length=8,
        style={'input_type': 'password'}
    )

    class Meta:
        model = Sustentante
        # 1. Lista explícita de todos los campos que el serializador manejará
        fields = [
            'id_sustentante',  # Se incluye para que DRF lo conozca
            'nombre', 
            'apellido', 
            'numero_cuenta', 
            'correo_electronico', 
            'contrasena',      # El campo de entrada de la contraseña
            'licenciatura', 
            'id_opcion', 
            'contrasena_temporal',
            'es_escuela_incorporada', 
            'escuela_de_procedencia',
            'periodo_ingreso', 
            'periodo_egreso'
        ]
        # 2. Se especifica que la llave primaria es solo de lectura
        read_only_fields = ['id_sustentante']

    def validate_numero_cuenta(self, value):
        if len(value) != 7:
            raise serializers.ValidationError("El número de cuenta debe tener 7 dígitos.")
        if Sustentante.objects.filter(numero_cuenta=value).exists():
            raise serializers.ValidationError("El número de cuenta ya está registrado.")
        return value
    
    def create(self, validated_data):
        # 3. Se extrae 'contrasena' y se pasa como 'password' al método create_user
        password_data = validated_data.pop('contrasena')
        
        # Se llama al manager del modelo, que es la forma correcta de crear usuarios
        sustentante = Sustentante.objects.create_user(
            password=password_data, 
            **validated_data
        )
        
        # Se envía el correo de confirmación
        self.enviar_correo_confirmacion(sustentante)
        return sustentante

    def enviar_correo_confirmacion(self, sustentante):
        token = default_token_generator.make_token(sustentante)
        # Se usa .pk que siempre apunta a la llave primaria, sin importar el nombre
        uid = urlsafe_base64_encode(force_bytes(sustentante.pk)) 
        
        url_confirmacion = f"{settings.FRONTEND_URL}/confirmar-cuenta/{uid}/{token}/"

        asunto = "Confirma tu cuenta para PotroTitúlate"
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
        if not check_password(data['contrasena'], sustentante.password):
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
        user = authenticate(
            username=data['correo_electronico'],
            password=data['contrasena']
        )
        
        if user is None:
            raise serializers.ValidationError("Credenciales incorrectas")
        
        try:
            administrativo = user.administrativo_profile
        except AttributeError:
            raise serializers.ValidationError("El usuario no tiene permisos de administrador")
        
        self.context['user'] = user
        
        return {
            'id_administrador': administrativo.id_administrativo,
            'nombre': administrativo.user.nombre,
            'correo_electronico': user.correo_electronico,
        }