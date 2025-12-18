from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission for Admin users only"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrManager(permissions.BasePermission):
    """Permission for Admin and Manager users"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager']


class IsAuthenticated(permissions.BasePermission):
    """Permission for any authenticated user"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class RoleBasedPermission(permissions.BasePermission):
    """
    Custom permission based on HTTP method and user role
    - GET: All authenticated users
    - POST, PATCH, DELETE: Admin and Manager only
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # All authenticated users can read (GET)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only Admin and Manager can create, update, delete
        return request.user.role in ['admin', 'manager']


class CompanyPermission(permissions.BasePermission):
    """Custom permission for Company operations"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # GET: All authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # POST, PATCH, DELETE: Admin only
        return request.user.role == 'admin'


class DepartmentPermission(permissions.BasePermission):
    """Custom permission for Department operations"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # GET: All authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # POST, PATCH, DELETE: Admin and Manager
        return request.user.role in ['admin', 'manager']


class EmployeePermission(permissions.BasePermission):
    """Custom permission for Employee operations"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # GET: All authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # POST, PATCH, DELETE: Admin and Manager
        return request.user.role in ['admin', 'manager']