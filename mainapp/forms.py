from django.forms import ModelForm
from .models import *
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.forms.widgets import SplitDateTimeWidget
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.db import transaction


class RegistrationForm(UserCreationForm):
	name=forms.CharField(max_length=80)
	email=forms.EmailField(max_length = 254)

	class Meta(UserCreationForm.Meta):
		model =User

	@transaction.atomic
	def save(self):
		user= super().save(commit=False)
		user.is_annotator= True
		user.name=self.cleaned_data.get('name')
		user.email=self.cleaned_data.get('email')
		user.save()
		a = annotator.objects.create(user=user)
		
		a.save()
		return user

class video_assignment_form(ModelForm):
	class Meta:
		model = video_assignment
		fields= '__all__'