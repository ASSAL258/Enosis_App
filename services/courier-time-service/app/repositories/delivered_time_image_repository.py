import os

from pymongo import MongoClient


class DeliveredTimeImageRepository:
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://attachments-mongo:27017")
        self.mongo_db_name = os.getenv("MONGO_DB_NAME", "courier_time_images_db")
        self.client = MongoClient(self.mongo_uri)
        self.collection = self.client[self.mongo_db_name]["delivered_time_images"]

    def save_image(self, image_id, delivered_time_id, file_name, content_type, content_base64):
        self.collection.replace_one(
            {"_id": str(image_id)},
            {
                "_id": str(image_id),
                "delivered_time_id": str(delivered_time_id),
                "file_name": file_name,
                "content_type": content_type,
                "content_base64": content_base64,
            },
            upsert=True,
        )

    def get_image(self, image_id):
        return self.collection.find_one({"_id": str(image_id)})
