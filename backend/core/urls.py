from django.urls import path
from .views import (
    UserAPIView,
    UserDetailAPIView,
    ProjectAPIView,
    ProjectDetailAPIView,
    ProjectPermissionAPIView,
    MilestoneAPIView,
    TaskAPIView,
    TaskDetailAPIView,
    ChecklistItemAPIView,
    CommentAPIView,
    TagAPIView,
    LogAPIView,
    MilestoneLogAPIView,
    AllLogsAPIView
)

urlpatterns = [
    # User endpoints
    path('users/', UserAPIView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),

    # Project endpoints
    path('projects/', ProjectAPIView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailAPIView.as_view(), name='project-detail'),
    path('projects/<int:project_pk>/permissions/', ProjectPermissionAPIView.as_view(), name='project-permissions'),
    
    # Milestone endpoints
    path('projects/<int:project_pk>/milestones/', MilestoneAPIView.as_view(), name='milestone-list'),
    path('milestones/<int:milestone_pk>/logs/', MilestoneLogAPIView.as_view(), name='milestone-logs'),
    
    # Task endpoints
    path('milestones/<int:milestone_pk>/tasks/', TaskAPIView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
    
    # Checklist endpoints
    path('tasks/<int:task_pk>/checklist/', ChecklistItemAPIView.as_view(), name='checklist-create'),
    
    # Comment endpoints
    path('tasks/<int:task_pk>/comments/', CommentAPIView.as_view(), name='comment-create'),
    
    # Tag endpoints
    path('tags/', TagAPIView.as_view(), name='tag-list'),
    
    # Log endpoints
    path('projects/<int:project_pk>/logs/', LogAPIView.as_view(), name='log-list'),
    path('logs/', AllLogsAPIView.as_view(), name='all-logs'),
]