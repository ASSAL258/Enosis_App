import json
import os
import pika
import logging

logger = logging.getLogger(__name__)


class ForOtherEventPublisher:
    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.port = int(os.getenv("RABBITMQ_PORT", "5672"))
        self.username = os.getenv("RABBITMQ_USER", "guest")
        self.password = os.getenv("RABBITMQ_PASS", "guest")

    def publish_for_service(
        self,
        *,
        for_other_id: str,
        first_name: str,
        last_name: str,
        matricule: str | None,
        target_service: str,
    ):
        """
        Publish for_other creation event to service-specific queue.

        Queue naming: for_others.{service_name}.created
        Example: for_others.attestation.created
        """
        queue_name = f"for_others.{target_service}.created"

        try:
            credentials = pika.PlainCredentials(self.username, self.password)
            parameters = pika.ConnectionParameters(
                host=self.host, port=self.port, credentials=credentials
            )
            connection = pika.BlockingConnection(parameters)

            try:
                channel = connection.channel()
                channel.queue_declare(queue=queue_name, durable=True)

                payload = {
                    "event": f"createforother",
                    "for_other_id": for_other_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "matricule": matricule,
                    "target_service": target_service,
                }

                channel.basic_publish(
                    exchange="",
                    routing_key=queue_name,
                    body=json.dumps(payload),
                    properties=pika.BasicProperties(delivery_mode=2),
                )

                logger.info(
                    f"Published event to {queue_name}: for_other_id={for_other_id}, "
                    f"target_service={target_service}"
                )
            finally:
                connection.close()

        except Exception as e:
            logger.error(
                f"Failed to publish event to {queue_name}: {str(e)}"
            )
            raise
