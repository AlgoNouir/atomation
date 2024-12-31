from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Project, ProjectPermission, Milestone, Task, ChecklistItem, Comment, Dependency, Tag, TaskTag, Log
from .serializers import (
    UserSerializer, 
    ProjectSerializer, 
    MilestoneSerializer, 
    TaskSerializer, 
    ChecklistItemSerializer, 
    CommentSerializer, 
    DependencySerializer, 
    TagSerializer, 
    LogSerializer
)
from django.db.models import Q
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



class ProjectUsersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProjectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(permissions__user=request.user).prefetch_related(
            'milestones',
            'milestones__tasks',
            'milestones__tasks__checklist',
            'milestones__tasks__comments',
            'milestones__tasks__dependencies_from',
            'milestones__tasks__tags',
            'permissions'
        )
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        print(request.data)
        serializer = ProjectSerializer(data={**request.data, "owner":request.user.pk})
        try:
            serializer.is_valid(raise_exception=True)
            project = serializer.save()
            ProjectPermission.objects.create(
                project=project,
                user=request.user,
                role='admin'
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk, permissions__user=request.user)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, pk):
        project = get_object_or_404(Project, pk=pk, permissions__user=request.user)
        permission = project.permissions.get(user=request.user)
        if permission.role not in ['admin', 'editor']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = get_object_or_404(Project, pk=pk, permissions__user=request.user)
        permission = project.permissions.get(user=request.user)
        if permission.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProjectPermissionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_pk):
        project = get_object_or_404(Project, pk=project_pk, permissions__user=request.user)
        permission = project.permissions.get(user=request.user)
        if permission.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        role = request.data.get('role')
        
        if not user_id or not role:
            return Response({'error': 'User ID and role are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        project_permission, created = ProjectPermission.objects.get_or_create(
            project=project,
            user=user,
            defaults={'role': role}
        )
        
        if not created:
            project_permission.role = role
            project_permission.save()

        return Response({'message': 'Permission updated successfully'})

class MilestoneAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_pk):
        project = get_object_or_404(Project, pk=project_pk, permissions__user=request.user)
        milestones = project.milestones.all()
        serializer = MilestoneSerializer(milestones, many=True)
        return Response(serializer.data)

    def post(self, request, project_pk):
        project = get_object_or_404(Project, pk=project_pk, permissions__user=request.user)
        permission = project.permissions.get(user=request.user)
        if permission.role not in ['admin', 'editor']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MilestoneSerializer(data={**request.data, "project": project.pk})
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, milestone_pk):
        milestone = get_object_or_404(Milestone, pk=milestone_pk, project__permissions__user=request.user)
        tasks = milestone.tasks.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, milestone_pk):
        milestone = get_object_or_404(Milestone, pk=milestone_pk, project__permissions__user=request.user)
        permission = milestone.project.permissions.get(user=request.user)
        if permission.role not in ['admin', 'editor']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            task = serializer.save(milestone=milestone)
            
            # Handle tags
            tag_ids = request.data.get('tags', [])
            for tag_id in tag_ids:
                tag = get_object_or_404(Tag, id=tag_id)
                TaskTag.objects.create(task=task, tag=tag)

            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        task = get_object_or_404(Task, pk=pk, milestone__project__permissions__user=request.user)
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, pk):
        task = get_object_or_404(Task, pk=pk, milestone__project__permissions__user=request.user)
        permission = task.milestone.project.permissions.get(user=request.user)
        if permission.role not in ['admin', 'editor']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            old_task_data = TaskSerializer(task).data
            task = serializer.save()

            # Update checklist items
            checklist_data = request.data.get('checklist', [])
            task.checklist.all().delete()  # Delete existing checklist items
            for item_data in checklist_data:
                ChecklistItem.objects.create(task=task, **item_data)

            # Log the task update
            log_message = f"{task} change status to {task.status}"
            if old_task_data['description'] != task.description:
                log_message = task.description
                if request.user != task.assignee:
                    log_message += f"\nUser {request.user.get_full_name()} assigned the task to user {task.assignee.get_full_name()}"
            
            Log.objects.create(
                project=task.milestone.project,
                user=request.user,
                message=log_message,
                task=task,
            )

            return Response(TaskSerializer(task).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = get_object_or_404(Task, pk=pk, milestone__project__permissions__user=request.user)
        permission = task.milestone.project.permissions.get(user=request.user)
        if permission.role not in ['admin', 'editor']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ChecklistItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk, milestone__project__permissions__user=request.user)
        permission = task.milestone.project.permissions.get(user=request.user)
        if permission.role not in ['admin', 'editor']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChecklistItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_pk):
        task = get_object_or_404(Task, pk=task_pk, milestone__project__permissions__user=request.user)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TagAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_pk=None):
        print(request.data)
        project = get_object_or_404(Project, pk=project_pk)
        serializer = LogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, project_pk=None):
        logs = Log.objects.filter(project_id=project_pk)
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
from rest_framework_simplejwt.tokens import RefreshToken

class MilestoneLogAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, milestone_pk):
        milestone = get_object_or_404(Milestone, pk=milestone_pk, project__permissions__user=request.user)
        logs = Log.objects.filter(project=milestone.project).order_by('-timestamp')
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)

class AllLogsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_superuser:
            logs = Log.objects.all().order_by('-timestamp')
        else:
            logs = Log.objects.filter(
                Q(project__permissions__user=user) | Q(user=user)
            ).distinct().order_by('-timestamp')
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data = UserSerializer(self.user).data
        data['role'] = 'owner' if self.user.is_superuser else 'admin' if self.user.is_staff else 'user'
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

