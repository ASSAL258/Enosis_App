import uuid

from django.db import models


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matricule = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role_id = models.UUIDField(null=True, blank=True)
    manager_id = models.UUIDField(null=True, blank=True)
    rh_id = models.UUIDField(null=True, blank=True)
    departement_id = models.UUIDField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"

    def __str__(self) -> str:
        return f"{self.matricule} - {self.first_name} {self.last_name} <{self.email}>"
