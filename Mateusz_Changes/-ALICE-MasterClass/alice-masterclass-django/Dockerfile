FROM python:3.9.5
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        python3-dev \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
RUN chmod 777 /usr/src/app/masterclass/migrations
RUN chmod 777 /usr/src/app/strangeness/migrations

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
