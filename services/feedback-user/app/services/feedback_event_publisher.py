import json
import os

import pika


class FeedbackEventPublisher:
    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.username = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASS", "guest")
        self.queue = os.getenv("FEEDBACK_CREATED_QUEUE", "feedback.created")

    def publish_feedback_created(self, *, feedback_id: str, user_role: str, avance_id: str , user_id: str) -> None:
        credentials = pika.PlainCredentials(self.username, self.password)
        parameters = pika.ConnectionParameters(
            host=self.host,
            port=self.port,
            credentials=credentials,
        )

        connection = pika.BlockingConnection(parameters)
        try:
            channel = connection.channel()
            channel.queue_declare(queue=self.queue, durable=True)
            payload = {
                "event": "feedback.created",
                "feedback_id": feedback_id,
                "user_role": user_role,
                "avance_id": avance_id,
                "user_id": user_id,
            }
            channel.basic_publish(
                exchange="",
                routing_key=self.queue,
                body=json.dumps(payload),
                properties=pika.BasicProperties(delivery_mode=2),
            )
        finally:
            connection.close()
