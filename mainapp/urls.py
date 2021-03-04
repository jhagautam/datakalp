from django.urls import path
from django.contrib.auth import views as auth_views
from .views import *

urlpatterns = [
    path('', home, name='index'),
    path('register/', register, name='register'),
    path('register/', register, name='keybindings'),
    path('register/', register, name='labels'),
    path('login/',auth_views.LoginView.as_view(template_name='mainapp/login.html'),name='login'),
    path('logout/',auth_views.LogoutView.as_view(template_name='mainapp/logout.html'),name='logout'),
    path('login_redirect/', login_redirect_view, name='login_redirect_view'),
    path('uploadcsv/', upload_csv, name='upload_csv'),
    ]