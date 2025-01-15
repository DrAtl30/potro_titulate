from django.db import models

class Sustentante(models.Model):
    id_sustentante = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    numero_cuenta = models.CharField(max_length=15, unique=True)
    correo_electronico = models.EmailField(max_length=100, unique=True)
    contrasena = models.CharField(max_length=100)
    opcion_titulacion = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
