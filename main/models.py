from django.db import models

class TestItem(models.Model):
    description = models.CharField(max_length=255)
    image = models.ImageField(upload_to='uploads/')  # uploaded images go to media/uploads/

    def __str__(self):
        return self.description
