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
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), required=False)
    checklist = ChecklistItemSerializer(many=True, required=False)
    comments = CommentSerializer(many=True, read_only=True)
    dependencies_from = DependencySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'assignee', 'start_date', 'due_date', 'deadline', 'checklist', 'comments', 'dependencies_from', 'tags']

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        checklist_data = validated_data.pop('checklist', [])
        task = Task.objects.create(**validated_data)
        task.tags.set(tags)
        for item_data in checklist_data:
            ChecklistItem.objects.create(task=task, **item_data)
        return task

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        checklist_data = validated_data.pop('checklist', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags is not None:
            instance.tags.set(tags)

        if checklist_data is not None:
            instance.checklist.all().delete()
            for item_data in checklist_data:
                ChecklistItem.objects.create(task=instance, **item_data)

        return instance

class MilestoneSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Milestone
        fields = ['id', 'name', 'tasks']

class ProjectSerializer(serializers.ModelSerializer):
    permissions = ProjectPermissionSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'owner', 'permissions', 'milestones']

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['id', 'project', 'user', 'message', 'timestamp', 'task']

