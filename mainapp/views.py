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
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
# Create your views here.
def home(request):
	context={}
	return render( request, 'mainapp/base1.html', context)

@login_required(login_url='/login/')
def login_redirect_view(request):

	if request.user.is_admin:
		context = {}
		return render(request, 'mainapp/admin.html', context)

	else:
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


def upload_csv(request):
	if request.method == 'POST':
		csv_file = request.FILES["csv_file"]
		if not csv_file.name.endswith('.csv'):
			messages.error(request,'File is not CSV type')
			return redirect("upload_csv")
        #if file is too large, return
		if csv_file.multiple_chunks():
			messages.error(request,"Uploaded file is too big (%.2f MB)." % (csv_file.size/(1000*1000),))
			return redirect("upload_csv")

		file_data = csv_file.read().decode("utf-8")		
		User = get_user_model()
		lines = file_data.split("\n")
		#loop over the lines and save them in db.
		for line in lines:						
			fields = line.split(",")
			data_dict = {}
			data_dict["video_name"] = fields[0]
			
			data_dict["username"] = fields[1]
			data_dict["status"] = 'PENDING'

			# video_assigned=video_assignment.objects.filter(username = fields[1]).filter(video_name = fields[0])
			# if video_assigned:
			# 	message='video '+ fields[0] + ' already assigned to ' +fields[1]
			# 	continue 
			try:
				form = video_assignment_form(data_dict)
				if form.is_valid():
					form.save()		
				else:
					warning= 'Error at line ' + line
					messages.error(request,warning)
					pass
			except:
				pass
	return render(request, "mainapp/admin.html")
	

	