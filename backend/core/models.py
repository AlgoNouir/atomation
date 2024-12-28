from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')

class ProjectPermission(models.Model):
    ROLE_CHOICES = [
        ('viewer', 'Viewer'),
        ('editor', 'Editor'),
        ('admin', 'Admin'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='permissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

class Milestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    name = models.CharField(max_length=255)

class Task(models.Model):
    STATUS_CHOICES = [
        ('To Do', 'To Do'),
        ('In Progress', 'In Progress'),
        ('Debt', 'Debt'),
        ('Done', 'Done'),
    ]
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To Do')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    start_date = models.DateTimeField()
    due_date = models.DateTimeField()
    deadline = models.DateTimeField()

class ChecklistItem(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='checklist')
    text = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Dependency(models.Model):
    TYPE_CHOICES = [
        ('FS', 'Finish to Start'),
        ('FF', 'Finish to Finish'),
        ('SS', 'Start to Start'),
        ('SF', 'Start to Finish'),
    ]
    from_task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='dependencies_from')
    to_task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='dependencies_to')
    type = models.CharField(max_length=2, choices=TYPE_CHOICES)

class Tag(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20)

class TaskTag(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

class Log(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

