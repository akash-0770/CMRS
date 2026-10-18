from django.db import models
from django.contrib.auth.models import AbstractUser 

# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        COLLECTION_AGENT = "COLLECTION_AGENT", "Collection Agent"
        BRANCH_MANAGER = "BRANCH_MANAGER", "Branch Manager"
        BRANCH_USER = "BRANCH_USER", "Branch User"


    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.COLLECTION_AGENT,
    )