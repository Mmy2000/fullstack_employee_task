from django.urls import path    
from .views import RegisterView , LoginView , current_user,UserUpdateView,ChangePasswordView

urlpatterns = [
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/user/", current_user, name="current-user"),
    path("api/user/update/", UserUpdateView.as_view(), name="update-user"),
    path("api/user/change_password/", ChangePasswordView.as_view(), name="change-password"),
]
