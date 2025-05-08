from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.contrib.auth.models import User




class Administrativos(models.Model):
    id_administrativo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    correo_electronico = models.CharField(unique=True, max_length=100)
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='administrativo_profile'
    )

    class Meta:
        db_table = 'administrativos'

class Documentos(models.Model):
    id_documento = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey('Sustentante', models.DO_NOTHING, db_column='id_sustentante')
    id_tramite = models.ForeignKey('Tramites', models.DO_NOTHING, db_column='id_tramite', null=True, blank=True)
    nombre_documento = models.CharField(max_length=100)
    tipo_documento = models.CharField(max_length=50)
    fecha_subida = models.DateField()
    estado_validacion = models.CharField(max_length=50)
    comentarios_validacion = models.TextField(blank=True, null=True)
    archivo = models.FileField(upload_to='documentos/', null=True, blank=True)
    # Campos nuevos para rechazo de documentos
    motivo_rechazo = models.TextField(
        null=True,
        blank=True,
        verbose_name="Motivo de rechazo del documento"
    )
    revisado_por = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_revisados'
    )


    class Meta:
        managed = False
        db_table = 'documentos'


class Notificaciones(models.Model):
    id_notificacion = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey(
        'Sustentante', 
        on_delete=models.CASCADE, 
        db_column='id_sustentante'
    )
    id_administrativo = models.ForeignKey(
        'Administrativos', 
        on_delete=models.CASCADE, 
        db_column='id_administrativo'
    )
    mensaje = models.TextField()
    fecha_envio = models.DateField()
    estado_lectura = models.BooleanField()
    es_de_administrador = models.BooleanField(default=False)  # DEFAULT = false en la BD

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

class SustentanteManager(BaseUserManager):
    def create_user(self, correo_electronico, contrasena=None, **extra_fields):
        if not correo_electronico:
            raise ValueError("El correo electrónico es obligatorio")
        user = self.model(correo_electronico=self.normalize_email(correo_electronico), **extra_fields)
        user.set_password(contrasena)  # Encripta la contraseña
        user.save(using=self._db)
        return user

    def create_superuser(self, correo_electronico, contrasena=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(correo_electronico, contrasena, **extra_fields)

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
    licenciatura = models.CharField(max_length=100, choices=LICENCIATURA_OPCIONES, default='Administracion')
    confirmado = models.BooleanField(default=False)
    last_login = models.DateTimeField(blank=True, null=True)
    id_opcion = models.ForeignKey(OpcionTitulacion, on_delete=models.CASCADE, db_column='id_opcion', null=True)  # Relaciona con OpciónTitulación
    oportunidades_restantes = models.IntegerField(default=3)


    session_key = models.CharField(max_length=40, blank=True, null=True)


    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    groups = models.ManyToManyField(Group, related_name="sustentantes_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="sustentantes_permissions", blank=True)

    objects = SustentanteManager()

    USERNAME_FIELD = "correo_electronico"
    REQUIRED_FIELDS = ["nombre", "apellido", "numero_cuenta", "licenciatura"]

    @property
    def contrasena(self):
        return self.password

    @contrasena.setter
    def contrasena(self, value):
        self.password = value

    # Métodos para comprobar contraseñas
    def check_contrasena(self, raw_password):
        return check_password(raw_password, self.password)

    def get_email_field_name(self):
        return "correo_electronico"

    class Meta:
        db_table = 'sustentante'



class Tramites(models.Model):
    id_tramite = models.AutoField(primary_key=True)
    id_sustentante = models.ForeignKey(Sustentante, models.DO_NOTHING, db_column='id_sustentante')
    id_opcion = models.ForeignKey(OpcionTitulacion, on_delete=models.CASCADE, db_column='id_opcion', null=True)  # Relaciona con OpciónTitulación
    estado_actual = models.CharField(max_length=50)
    fecha_inicio = models.DateField()
    fecha_actualizacion = models.DateField()
    aprobado = models.BooleanField(default=False)
    # Campos nuevos para rechazo
    motivo_rechazo = models.TextField(
        null=True,
        blank=True,
        verbose_name="Motivo de rechazo"
    )
    fecha_rechazo = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de rechazo"
    )
    rechazado_por = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tramites_rechazados'
    )
    
    # Campos para seguimiento
    ultima_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Última actualización"
    )

    class Meta:
        managed = False
        db_table = 'tramites'
        indexes = [
            models.Index(fields=['estado_actual']),
            models.Index(fields=['aprobado']),
            models.Index(fields=['fecha_rechazo']),
        ]

class HistorialTramite(models.Model):
    """
    Registro detallado de todas las acciones importantes realizadas sobre un trámite
    """
    id_historial = models.AutoField(primary_key=True)
    id_tramite = models.ForeignKey(
        'Tramites', 
        on_delete=models.CASCADE,
        related_name='historial'
    )
    accion = models.CharField(max_length=50)  # Ej: "Aprobado", "Rechazado", "Corrección"
    detalles = models.TextField()
    fecha_accion = models.DateTimeField(default=timezone.now)
    usuario = models.ForeignKey(
        'auth.User',  # Asume que usas el modelo User de Django
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        managed = False
        db_table = 'historial_tramites'
        ordering = ['-fecha_accion']
        verbose_name = 'Historial de Trámite'
        verbose_name_plural = 'Historial de Trámites'

    def __str__(self):
        return f"{self.id_tramite} - {self.accion} ({self.fecha_accion.strftime('%Y-%m-%d')})"
    


class Formatos(models.Model):
    nombre = models.CharField(max_length=200)
    archivo = models.FileField(upload_to="formatos/")
    codigo = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class PreguntasFrecuentes(models.Model):
    """Registro de la preguntas y respuestas"""
    pregunta = models.CharField(max_length=500)
    respuesta  = models.CharField(max_length=2000)

    def __str__(self):
        return self.pregunta

