import uuid

from app.exceptions import CongeNotFoundException
from app.repositories import CongeAttachmentRepository, CongeRepository


class CongeAttachmentService:
    def __init__(self):
        self.conge_repository = CongeRepository()
        self.conge_attachment_repository = CongeAttachmentRepository()

    def upload_attachment(self, conge_id, file_name, content_type, content_base64):
        conge = self.conge_repository.get_by_id(conge_id)
        if conge is None:
            raise CongeNotFoundException("Conge not found")

        attachment_id = uuid.uuid4()
        self.conge_attachment_repository.save_attachment(
            attachment_id=attachment_id,
            conge_id=conge_id,
            file_name=file_name,
            content_type=content_type,
            content_base64=content_base64,
        )
        self.conge_repository.set_attachment_url(conge, attachment_id)
        return attachment_id

    def get_attachment(self, conge_id):
        conge = self.conge_repository.get_by_id(conge_id)
        if conge is None:
            raise CongeNotFoundException("Conge not found")
        if conge.attachment_url is None:
            raise CongeNotFoundException("Attachment not found")

        attachment = self.conge_attachment_repository.get_attachment(conge.attachment_url)
        if attachment is None:
            raise CongeNotFoundException("Attachment not found")

        return {
            "attachment_url": attachment["_id"],
            "file_name": attachment["file_name"],
            "content_type": attachment["content_type"],
            "content_base64": attachment["content_base64"],
        }
