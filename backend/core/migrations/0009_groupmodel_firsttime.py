# Generated by Django 5.1.4 on 2024-12-30 08:37

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_groupmodel_reportmodel_sendgroup'),
    ]

    operations = [
        migrations.AddField(
            model_name='groupmodel',
            name='firstTime',
            field=models.TimeField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
