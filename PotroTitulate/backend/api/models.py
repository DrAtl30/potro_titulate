# api/models.py
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission

# --- User Managers and Custom User Model ---

class SustentanteManager(BaseUserManager):
    def create_user(self, correo_electronico, password=None, **extra_fields):
        if not correo_electronico:
            raise ValueError("El correo electrónico es obligatorio")
        user = self.model(correo_electronico=self.normalize_email(correo_electronico), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo_electronico, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(correo_electronico, password, **extra_fields)

class Sustentante(AbstractBaseUser, PermissionsMixin):
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
    correo_electronico = models.EmailField(unique=True, max_length=100)
    contrasena_temporal = models.BooleanField(default=False)
    licenciatura = models.CharField(max_length=100, choices=LICENCIATURA_OPCIONES)
    confirmado = models.BooleanField(default=False)
    id_opcion = models.ForeignKey('OpcionTitulacion', on_delete=models.PROTECT, db_column='id_opcion', null=True, blank=True)
    oportunidades_restantes = models.IntegerField(default=3)
    periodo_ingreso = models.CharField(max_length=5)
    periodo_egreso = models.CharField(max_length=5)
    es_escuela_incorporada = models.BooleanField(default=False)
    escuela_de_procedencia = models.CharField(max_length=100, blank=True, null=True)
    
    session_key = models.CharField(max_length=40, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = SustentanteManager()

    USERNAME_FIELD = "correo_electronico"
    REQUIRED_FIELDS = ["nombre", "apellido", "numero_cuenta", "licenciatura", "periodo_ingreso", "periodo_egreso"]

    class Meta:
        db_table = 'sustentante'
        verbose_name = 'Sustentante'
        verbose_name_plural = 'Sustentantes'

    def __str__(self):
        return self.correo_electronico
    
    @property
    def id(self):
        return self.id_sustentante

# --- Models related to the application ---

class Administrativos(models.Model):
    id_administrativo = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='administrativo_profile',
        limit_choices_to={'is_staff': True} # Solo los usuarios staff pueden ser admins
    )
    # Puedes añadir campos extra específicos del admin aquí si los necesitas

    class Meta:
        db_table = 'administrativos'
        verbose_name = 'Administrativo'
        verbose_name_plural = 'Administrativos'

    def __str__(self):
        return self.user.nombre

class OpcionTitulacion(models.Model):
    id_opcion = models.AutoField(primary_key=True)
    nombre_opcion = models.CharField(unique=True, max_length=100)

    class Meta:
        db_table = 'opcion_titulacion'
        verbose_name = 'Opción de Titulación'
        verbose_name_plural = 'Opciones de Titulación'
    
    def __str__(self):
        return self.nombre_opcion

class Tramites(models.Model):
    id_tramite = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey(Sustentante, on_delete=models.CASCADE, db_column='id_sustentante', related_name='tramites')
    id_opcion = models.ForeignKey(OpcionTitulacion, on_delete=models.PROTECT, db_column='id_opcion', null=True)
    estado_actual = models.CharField(max_length=50)
    fecha_inicio = models.DateField()
    fecha_actualizacion = models.DateField()
    aprobado = models.BooleanField(default=False)
    motivo_rechazo = models.TextField(null=True, blank=True)
    fecha_rechazo = models.DateTimeField(null=True, blank=True)
    rechazado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tramites_rechazados')
    ultima_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tramites'

class Documentos(models.Model):
    id_documento = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey(Sustentante, on_delete=models.CASCADE, db_column='id_sustentante', related_name='documentos')
    id_tramite = models.ForeignKey(Tramites, on_delete=models.CASCADE, db_column='id_tramite', null=True, blank=True)
    nombre_documento = models.CharField(max_length=100)
    tipo_documento = models.CharField(max_length=50)
    fecha_subida = models.DateField(default=timezone.now)
    estado_validacion = models.CharField(max_length=50)
    comentarios_validacion = models.TextField(blank=True, null=True)
    archivo = models.FileField(upload_to='documentos/', null=True, blank=True)
    motivo_rechazo = models.TextField(null=True, blank=True)
    revisado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='documentos_revisados')

    class Meta:
        db_table = 'documentos'

class Notificaciones(models.Model):
    id_notificacion = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey(Sustentante, on_delete=models.CASCADE, db_column='id_sustentante', related_name='notificaciones')
    id_administrativo = models.ForeignKey(Administrativos, on_delete=models.CASCADE, db_column='id_administrativo')
    mensaje = models.TextField()
    fecha_envio = models.DateField(default=timezone.now)
    estado_lectura = models.BooleanField(default=False)
    es_de_administrador = models.BooleanField(default=False)

    class Meta:
        db_table = 'notificaciones'

class HistorialTramite(models.Model):
    id_historial = models.AutoField(primary_key=True)
    id_tramite = models.ForeignKey(Tramites, on_delete=models.CASCADE, related_name='historial')
    accion = models.CharField(max_length=50)
    detalles = models.TextField()
    fecha_accion = models.DateTimeField(default=timezone.now)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'historial_tramites'
        ordering = ['-fecha_accion']

class Formatos(models.Model):
    nombre = models.CharField(max_length=200)
    archivo = models.FileField(upload_to="formatos/")
    codigo = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class PreguntasFrecuentes(models.Model):
    pregunta = models.CharField(max_length=500)
    respuesta = models.TextField() # Cambiado a TextField para respuestas más largas

    def __str__(self):
        return self.pregunta

# Modelos que parecen ser para sistemas legacy/externos, si no es así, borra el Meta
class SistemaAlmacenamiento(models.Model):
    id_documento = models.OneToOneField(Documentos, models.CASCADE, db_column='id_documento', primary_key=True)
    ruta_archivo = models.CharField(max_length=255)

    class Meta:
        managed = False # Dejé este como ejemplo, si Django debe crearlo, bórralo
        db_table = 'sistema_almacenamiento'

class SistemaSeguridad(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    tipo_usuario = models.CharField(max_length=50)
    id_sustentante = models.ForeignKey(Sustentante, on_delete=models.SET_NULL, db_column='id_sustentante', blank=True, null=True)
    id_administrativo = models.ForeignKey(Administrativos, on_delete=models.SET_NULL, db_column='id_administrativo', blank=True, null=True)
    ultimo_acceso = models.DateField()
    ip_acceso = models.CharField(max_length=50)

    class Meta:
        managed = False # Dejé este como ejemplo, si Django debe crearlo, bórralo
        db_table = 'sistema_seguridad'