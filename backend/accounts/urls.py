from django.urls import path    
from .views import RegisterView , LoginView , current_user

urlpatterns = [
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/user/", current_user, name="current-user"),
]
