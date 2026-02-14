import secrets
import string

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authentication import TokenAuthentication
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
from django.utils import timezone
from rest_framework.authtoken.models import Token
from . import settings

alphabet = string.ascii_letters + string.digits + string.punctuation

class TemporaryTokenAuthentication(TokenAuthentication):
	@staticmethod
	def isExpired(token):
		if (timezone.now() - token.created) >= settings.TOKEN_EXPIRATION_TIME:
			return True
		return False

	@staticmethod
	def createOrRefreshToken(username, email):
		try:
			user = User.objects.get(username=username)
		except ObjectDoesNotExist:
			# Generate a random, 64-character password. The created user will never be able to access the dummy account, anyway
			password = ''.join(secrets.choice(alphabet) for i in range(64))

			user = User.objects.create_user(username=username, email=email, password=password)
			user.save()

		token, _ = Token.objects.get_or_create(user=user)

		if TemporaryTokenAuthentication.isExpired(token):
			# Generate a new token
			token.delete()
			token = Token.objects.create(user=user)

		return token

	def authenticate_credentials(self, key):
		if settings.DJANGO_DUMMY_AUTH:
			token = TemporaryTokenAuthentication.createOrRefreshToken('testuser', 'test@test.com')
			key = token.key

		model = self.get_model()

		try:
			token = model.objects.get(key=key)
		except model.DoesNotExist:
			raise exceptions.AuthenticationFailed(_('Invalid token.'))

		if TemporaryTokenAuthentication.isExpired(token):
			raise exceptions.AuthenticationFailed(_('Token expired.'))

		return super().authenticate_credentials(key)
