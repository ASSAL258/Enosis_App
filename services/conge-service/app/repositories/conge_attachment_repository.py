import os

from pymongo import MongoClient


class CongeAttachmentRepository:
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://attachments-mongo:27017")
        self.mongo_db_name = os.getenv("MONGO_DB_NAME", "conge_attachments_db")
        self.client = MongoClient(self.mongo_uri)
        self.collection = self.client[self.mongo_db_name]["conge_attachments"]

    def save_attachment(self, attachment_id, conge_id, file_name, content_type, content_base64):
        self.collection.replace_one(
            {"_id": str(attachment_id)},
            {
                "_id": str(attachment_id),
                "conge_id": str(conge_id),
                "file_name": file_name,
                "content_type": content_type,
                "content_base64": content_base64,
            },
            upsert=True,
        )

    def get_attachment(self, attachment_id):
        return self.collection.find_one({"_id": str(attachment_id)})
