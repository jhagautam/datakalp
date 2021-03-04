from django.shortcuts import render, redirect, HttpResponseRedirect, get_object_or_404,reverse
from django.conf import settings
from mainapp.models import *
from mainapp.forms import *
from django.db.models import Count, Sum , Avg, Max, Min
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.decorators import login_required
from django.forms import inlineformset_factory, modelformset_factory
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse
from django.core.mail import send_mail, BadHeaderError
import cv2

# Create your views here.
def home(request):
	context={}
	return render( request, 'mainapp/base1.html', context)

@login_required(login_url='/login/')
def login_redirect_view(request):
	video_src='/static/vid/my-video.mp4'
	
	cap = cv2.VideoCapture(r"D:\video_annotator\mainapp\static\vid\my-video.mp4")
	property_id = int(cv2.CAP_PROP_FRAME_COUNT) 
	length = int(cv2.VideoCapture.get(cap, property_id))
	context={'video_src':video_src,'length':length}
	return render(request, 'mainapp/index.html', context)

def register(request):
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect('login')
	else:
		form = RegistrationForm()
	return render(request,'mainapp/register.html',{'form':form,'title':'Sign Up'})