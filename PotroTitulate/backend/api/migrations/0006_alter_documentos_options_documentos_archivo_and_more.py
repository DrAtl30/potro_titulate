# Generated by Django 5.1.4 on 2025-02-14 20:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_documentos_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='documentos',
            options={},
        ),
        migrations.AddField(
            model_name='documentos',
            name='archivo',
            field=models.FileField(blank=True, null=True, upload_to='documentos/'),
        ),
    ]
