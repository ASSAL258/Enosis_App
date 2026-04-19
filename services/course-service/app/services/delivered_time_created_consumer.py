import json
import os
import uuid

import django
import pika

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "course_service.settings")
django.setup()

from app.services.course_service import CourseService


class DeliveredTimeCreatedConsumer:
    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.username = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASS", "guest")
        self.queue = os.getenv("DELIVERED_TIME_CREATED_QUEUE", "delivered_time.created")
        self.course_service = CourseService()

    def start(self):
        credentials = pika.PlainCredentials(self.username, self.password)
        parameters = pika.ConnectionParameters(
            host=self.host,
            port=self.port,
            credentials=credentials,
        )
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue=self.queue, durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=self.queue, on_message_callback=self._on_message)
        channel.start_consuming()

    def _on_message(self, channel, method, _properties, body):
        try:
            payload = json.loads(body)
            course_id = uuid.UUID(payload["course_id"])
            delivered_time_id = uuid.UUID(payload["delivered_time_id"])

            self.course_service.attach_delivered_time(
                course_id=course_id,
                delivered_time_id=delivered_time_id,
            )
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


if __name__ == "__main__":
    DeliveredTimeCreatedConsumer().start()
