import os

from django.core.management.base import BaseCommand

from masterclass.models import Event, Session

EVENT_NAME = 'PlaywrightE2EEvent'
SESSION_NAME = 'PlaywrightE2ESession'


class Command(BaseCommand):
    help = 'Create or update event/session for Playwright E2E (idempotent).'

    def handle(self, *args, **options):
        password = os.environ.get('E2E_SESSION_PASSWORD', 'playwright-e2e')
        event, _ = Event.objects.get_or_create(name=EVENT_NAME)
        Session.objects.update_or_create(
            name=SESSION_NAME,
            defaults={
                'event': event,
                'password': password,
                'maxStudents': 15,
            },
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded session "{SESSION_NAME}" on event "{EVENT_NAME}" '
                f'(password from E2E_SESSION_PASSWORD or default).'
            )
        )
