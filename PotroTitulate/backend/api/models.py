from django.db import models


class Administrativos(models.Model):
    id_administrativo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    correo_electronico = models.CharField(unique=True, max_length=100)
    contrasena = models.CharField(max_length=100)
    rol = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'administrativos'


class Documentos(models.Model):
    id_documento = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey('Sustentante', models.DO_NOTHING, db_column='id_sustentante')
    nombre_documento = models.CharField(max_length=100)
    tipo_documento = models.CharField(max_length=50)
    fecha_subida = models.DateField()
    estado_validacion = models.CharField(max_length=50)
    comentarios_validacion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'documentos'


class Notificaciones(models.Model):
    id_notificacion = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey('Sustentante', models.DO_NOTHING, db_column='id_sustentante')
    mensaje = models.TextField()
    fecha_envio = models.DateField()
    estado_lectura = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'notificaciones'


class OpcionTitulacion(models.Model):
    id_opcion = models.AutoField(primary_key=True)
    nombre_opcion = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'opcion_titulacion'


class SistemaAlmacenamiento(models.Model):
    id_documento = models.OneToOneField(Documentos, models.DO_NOTHING, db_column='id_documento', primary_key=True)
    ruta_archivo = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'sistema_almacenamiento'


class SistemaSeguridad(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    tipo_usuario = models.CharField(max_length=50)
    id_sustentante = models.ForeignKey('Sustentante', models.DO_NOTHING, db_column='id_sustentante', blank=True, null=True)
    id_administrativo = models.ForeignKey(Administrativos, models.DO_NOTHING, db_column='id_administrativo', blank=True, null=True)
    ultimo_acceso = models.DateField()
    ip_acceso = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'sistema_seguridad'


class Sustentante(models.Model):
    LICENCIATURA_OPCIONES = [
        ('Administracion', 'Administración'),
        ('Contaduria', 'Contaduría'),
        ('Mercadotecnia', 'Mercadotecnia'),
        ('Informatica_Administrativa', 'Informática Administrativa'),
    ]

    id_sustentante = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    numero_cuenta = models.CharField(unique=True, max_length=15)
    correo_electronico = models.CharField(unique=True, max_length=100)
    contrasena = models.CharField(max_length=100)
    id_opcion = models.ForeignKey(OpcionTitulacion, models.DO_NOTHING, db_column='id_opcion', blank=True, null=True)
    licenciatura = models.CharField(max_length=100, choices=LICENCIATURA_OPCIONES, default='Administracion')

    class Meta:
        managed = False
        db_table = 'sustentante'



class Tramites(models.Model):
    id_tramite = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey(Sustentante, models.DO_NOTHING, db_column='id_sustentante')
    ruta_titulacion = models.TextField()
    estado_actual = models.CharField(max_length=50)
    fecha_inicio = models.DateField()
    fecha_actualizacion = models.DateField()

    class Meta:
        managed = False
        db_table = 'tramites'