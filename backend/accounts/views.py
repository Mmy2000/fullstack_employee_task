import logging
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    ChangePasswordSerializer,
    UserSerializer,
    UserRegistrationSerializer,
    LoginSerializer,
    UserUpdateSerializer,
)
from config.response import CustomResponse
from django.contrib.auth import update_session_auth_hash


logger = logging.getLogger(__name__)

# Create your views here.
class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            logger.info(f"New user registered: {user.email}")

            return CustomResponse(
                {
                    "message": "User registered successfully",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return CustomResponse(message= str(e), status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.GenericAPIView):
    """User login endpoint with JWT token generation"""

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            logger.info(f"User logged in: {user.email}")

            return CustomResponse(
                {
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                },
                status=status.HTTP_200_OK,
                message= "Login successful",
            )
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return CustomResponse(message= str(e), status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return CustomResponse(
        serializer.data,
        status=status.HTTP_200_OK,
    )


class UserUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)

        serializer = self.get_serializer(
            self.get_object(), data=request.data, partial=partial
        )

        if serializer.is_valid():
            user = serializer.save()

            return CustomResponse(
                data=UserSerializer(user).data,  # ✅ FULL USER
                status=status.HTTP_200_OK,
                message="User updated successfully",
            )

        return CustomResponse(
            data=serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class ChangePasswordView(generics.UpdateAPIView):
    """Change password endpoint"""

    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = self.get_object()

            # Check old password
            if not user.check_password(serializer.validated_data["old_password"]):
                return CustomResponse(
                    message="Old password is incorrect",
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Set new password
            user.set_password(serializer.validated_data["new_password"])
            user.save()

            # Keep the user logged in after password change
            update_session_auth_hash(request, user)

            logger.info(f"Password changed for user: {user.email}")

            return CustomResponse(
                message="Password changed successfully",
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            return CustomResponse(
                message=str(e),
                status=status.HTTP_400_BAD_REQUEST,
            )
