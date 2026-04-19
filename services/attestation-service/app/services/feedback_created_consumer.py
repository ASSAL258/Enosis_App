import json
import os
import uuid

import pika

from app.services.attestation_service import AttestationService


class FeedbackCreatedConsumer:
    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.username = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASS", "guest")
        self.queue = os.getenv("FEEDBACK_CREATED_QUEUE", "feedback.created")
        self.attestation_service = AttestationService()

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
            feedback_id = uuid.UUID(payload["feedback_id"])
            attestation_id = uuid.UUID(payload["attestation_id"])
            user_role = payload["user_role"]

            self.attestation_service.apply_feedback_created_event(
                feedback_id=feedback_id,
                user_role=user_role,
                attestation_id=attestation_id,
            )
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


if __name__ == "__main__":
    FeedbackCreatedConsumer().start()
