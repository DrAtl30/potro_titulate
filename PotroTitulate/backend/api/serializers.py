from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import Sustentante, Administrativos
import re

class SustentanteRegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sustentante
        fields = ['nombre', 'apellido', 'numero_cuenta', 'correo_electronico', 'contrasena', 'licenciatura',  'id_opcion']

    def validate_contrasena(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return make_password(value)

    def validate_correo_electronico(self, value):
        # Validar el formato del correo electrónico
        #if not re.match(r'[a-zA-Z0-9_.+-]+@alumno+\.uaemex+\.mx$', value):
         #   raise serializers.ValidationError("El correo electrónico debe ser un correo institucional válido (ejemplo: usuario@alumno.uaemex.mx).")

        if Sustentante.objects.filter(correo_electronico=value).exists():
            raise serializers.ValidationError("El correo electrónico ya está registrado.")
        
        return value

    def validate_numero_cuenta(self, value):
        # Validar la longitud del número de cuenta
        if len(value) != 7:
            raise serializers.ValidationError("El número de cuenta debe tener 7 dígitos.")
        
        # Validar si el número de cuenta ya existe
        if Sustentante.objects.filter(numero_cuenta=value).exists():
            raise serializers.ValidationError("El número de cuenta ya está registrado.")
        
        return value

class SustentanteLoginSerializer(serializers.Serializer):
    correo_electronico = serializers.EmailField()
    contrasena = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            sustentante = Sustentante.objects.get(correo_electronico=data['correo_electronico'])
        except Sustentante.DoesNotExist:
            raise serializers.ValidationError("Correo electrónico o contraseña incorrectos.")
        
        if not check_password(data['contrasena'], sustentante.contrasena):
            raise serializers.ValidationError("Correo electrónico o contraseña incorrectos.")
        
        #Verificar si la contraseña es temporal
        if sustentante.contrasena_temporal:
            data['contrasena_temporal'] = True
        else:
            data['contrasena_temporal'] = False
        return {
            'id_sustentante': sustentante.id_sustentante,
            'nombre': sustentante.nombre,
            'correo_electronico': sustentante.correo_electronico,
            'contrasena_temporal': data['contrasena_temporal']  # Agregar si la contraseña es temporal
        }

class AdministradorLoginSerializer(serializers.Serializer):
    correo_electronico = serializers.EmailField()
    contrasena = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            administrador = Administrativos.objects.get(correo_electronico=data['correo_electronico'])
        except Administrativos.DoesNotExist:
            raise serializers.ValidationError("Correo electrónico o contraseña incorrectos.")
        
        # Verifica si la contraseña es correcta
        if not check_password(data['contrasena'], administrador.contrasena):
            raise serializers.ValidationError("Correo electrónico o contraseña incorrectos.")
        
        # Devuelve datos del administrador, pero sin la contraseña
        return {
            'id_administrador': administrador.id_administrativo,
            'nombre': administrador.nombre,
            'correo_electronico': administrador.correo_electronico
        }