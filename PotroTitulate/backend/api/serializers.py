from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import Sustentante

class SustentanteRegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sustentante
        fields = ['nombre', 'apellidos', 'numero_cuenta', 'correo_electronico', 'contrasena']

    def validate_contrasena(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return make_password(value)

    def validate_correo_electronico(self, value):
        if Sustentante.objects.filter(correo_electronico=value).exists():
            raise serializers.ValidationError("El correo electrónico ya está registrado.")
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
        
        return {
            'id_sustentante': sustentante.id_sustentante,
            'nombre': sustentante.nombre,
            'correo_electronico': sustentante.correo_electronico
        }
