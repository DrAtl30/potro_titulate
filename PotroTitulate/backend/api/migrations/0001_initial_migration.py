from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Administrativos',
            fields=[
                ('id_administrativo', models.AutoField(primary_key=True, serialize=False, verbose_name='ID Administrativo')),
                ('nombre', models.CharField(max_length=100)),
                ('correo_electronico', models.CharField(max_length=100, unique=True)),
                ('contrasena', models.CharField(max_length=100, null=True, blank=True)),
                ('user', models.OneToOneField(null=True, blank=True, on_delete=django.db.models.deletion.CASCADE, related_name='administrativo_profile', to='auth.user')),
            ],
            options={
                'db_table': 'administrativos',
            },
        ),
    ]