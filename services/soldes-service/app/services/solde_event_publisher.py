import json
import os

import pika


class SoldeEventPublisher:
    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.username = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASS", "guest")
        self.queue = os.getenv("SOLDE_CREATED_QUEUE", "solde.created")

    def publish_solde_created(self, solde_id, conge_id):
        credentials = pika.PlainCredentials(self.username, self.password)
        parameters = pika.ConnectionParameters(host=self.host, port=self.port, credentials=credentials)
        connection = pika.BlockingConnection(parameters)
        try:
            channel = connection.channel()
            channel.queue_declare(queue=self.queue, durable=True)
            payload = {
                "event": "solde.created",
                "solde_id": str(solde_id),
                "conge_id": str(conge_id),
            }
            channel.basic_publish(
                exchange="",
                routing_key=self.queue,
                body=json.dumps(payload),
                properties=pika.BasicProperties(delivery_mode=2),
            )
        finally:
            connection.close()
