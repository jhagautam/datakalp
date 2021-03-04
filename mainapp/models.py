from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
	is_annotator= models.BooleanField(default=False)
	is_admin= models.BooleanField(default=False)
	name=models.CharField(max_length=80)
	email=models.EmailField(max_length = 254, default=False)

class annotator(models.Model):
	user = models.OneToOneField(User,on_delete=models.CASCADE, primary_key=True)
	# name=models.CharField(max_length=80)

	def __str__(self):
		return self.user.name