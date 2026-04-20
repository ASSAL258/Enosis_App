import json
import os
import sys
import django

import pika

# Setup Django FIRST before any model imports
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "attestation_service.settings")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
django.setup()

# Import service AFTER django.setup()
from app.services.attestation_service import AttestationService


class FeedbackCreatedConsumer:
    """Consumer for feedback_rh publisher messages via RabbitMQ"""

    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.username = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASS", "guest")
        self.queue = os.getenv("FEEDBACK_CREATED_QUEUE", "feedback.created")
        self.attestation_service = AttestationService()

    def start(self):
        """Start consuming messages"""
        try:
            credentials = pika.PlainCredentials(self.username, self.password)
            parameters = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials,
                connection_attempts=3,
                retry_delay=2,
            )
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            
            # Declare queue
            channel.queue_declare(queue=self.queue, durable=True)
            channel.basic_qos(prefetch_count=1)
            
            print(f"[*] Waiting for messages on queue: {self.queue}")
            channel.basic_consume(
                queue=self.queue, on_message_callback=self._on_message
            )
            channel.start_consuming()
        except Exception as e:
            print(f"[!] Consumer error: {e}")
            raise

    def _on_message(self, channel, method, properties, body):
        """Handle incoming message"""
        try:
            payload = json.loads(body)
            print(f"[+] Received message: {payload}")
            
            attestation_id = payload.get("attestation_id")
            feedback_data = {
                "feedback_rh_id": payload.get("feedback_rh_id"),
                "status": payload.get("status"),
                "motif": payload.get("motif"),
            }

            result = self.attestation_service.consume_feedback_rh(
                attestation_id, feedback_data
            )
            
            if result:
                print(f"[✓] Successfully processed feedback for attestation {attestation_id}")
                channel.basic_ack(delivery_tag=method.delivery_tag)
            else:
                print(f"[!] Failed to process feedback for attestation {attestation_id}")
                channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
                
        except Exception as e:
            print(f"[!] Error processing message: {e}")
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


if __name__ == "__main__":
    print("[*] Starting Feedback Created Consumer...")
    consumer = FeedbackCreatedConsumer()
    consumer.start()


    FeedbackCreatedConsumer().start()
