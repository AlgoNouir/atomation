# Generated by Django 5.1.4 on 2024-12-30 13:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_remove_groupmodel_sendtime'),
    ]

    operations = [
        migrations.AddField(
            model_name='groupmodel',
            name='fromTime',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='groupmodel',
            name='toTime',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
