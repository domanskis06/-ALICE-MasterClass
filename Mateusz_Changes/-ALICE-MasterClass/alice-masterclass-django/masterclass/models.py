from django.db import models
from django.core.exceptions import ObjectDoesNotExist, BadRequest
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

def sessionByPassword(request):
    if 'password' not in request.data:
        raise BadRequest

    sessionQuery = Session.objects.filter(password=request.data['password'])

    if sessionQuery:
        return sessionQuery.first()

    raise ObjectDoesNotExist

class Event(models.Model):
    name = models.CharField(max_length=64)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'masterclass'
        constraints = [
            models.UniqueConstraint(fields=['name'], name='e_u_name'),
        ]

class Session(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    password = models.CharField(max_length=64)
    created = models.DateTimeField(auto_now_add=True)
    maxStudents = models.PositiveIntegerField()

    class Meta:
        app_label = 'masterclass'
        constraints = [
            models.UniqueConstraint(fields=['name'], name='s_u_name'),
            models.UniqueConstraint(fields=['password'], name='s_u_password')
        ]
