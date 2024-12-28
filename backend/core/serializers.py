from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, ProjectPermission, Milestone, Task, ChecklistItem, Comment, Dependency, Tag, TaskTag, Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ProjectPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPermission
        fields = ['id', 'user', 'role']

class ProjectSerializer(serializers.ModelSerializer):
    permissions = ProjectPermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'owner', 'permissions']

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['id', 'project', 'name']

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'text', 'is_completed']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'timestamp']

class DependencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependency
        fields = ['id', 'from_task', 'to_task', 'type']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']

class TaskTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)

    class Meta:
        model = TaskTag
        fields = ['id', 'tag']

class TaskSerializer(serializers.ModelSerializer):
    checklist = ChecklistItemSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    dependencies_from = DependencySerializer(many=True, read_only=True)
    tags = TaskTagSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'milestone', 'title', 'description', 'status', 'assignee', 'start_date', 'due_date', 'deadline', 'checklist', 'comments', 'dependencies_from', 'tags']

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['id', 'project', 'user', 'message', 'timestamp']

