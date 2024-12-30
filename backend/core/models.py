from django.db import models
from django.contrib.auth.models import User
from telebot import TeleBot
from SERVER.settings import BOTFATHER_HASH

class Project(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')

    def __str__(self):
        return self.name

class ProjectPermission(models.Model):
    ROLE_CHOICES = [
        ('viewer', 'Viewer'),
        ('editor', 'Editor'),
        ('admin', 'Admin'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='permissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role} on {self.project.name}"

class Milestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.project.name})"

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

    def __str__(self):
        return f"{self.title} ({self.milestone.project.name} - {self.milestone.name})"

class ChecklistItem(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='checklist')
    text = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Completed' if self.is_completed else 'Not Completed'})"

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.task.title}"

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

    def __str__(self):
        return f"{self.from_task.title} -> {self.to_task.title} ({self.get_type_display()})"

class Tag(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20)

    def __str__(self):
        return self.name

class TaskTag(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.task.title} - {self.tag.name}"

class Log(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='logs', null=True, blank=True)

    def __str__(self):
        return f"Log entry for {self.project.name} by {self.user.username}"



class GroupTimeChoice(models.IntegerChoices):
    
    HOURLY = 1
    DAILTY = 2
    WEEKLY = 3
    

class GroupModel(models.Model):
    
    verbose = models.CharField(max_length=100, null=True, blank=True)
    groupID = models.CharField(max_length=100)
    systemMainPrompt = models.TextField(max_length=100000)
    repeetHour = models.IntegerField(default=1)
    projects = models.ManyToManyField(Project, blank=True)
    
    
    def __str__(self):
        return self.verbose
    

class ReportModel(models.Model):
    
    text = models.TextField(max_length=100000)
    prompt = models.TextField(max_length=100000)
    created_at = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(GroupModel, null=True, blank=True, on_delete=models.CASCADE)
    
    def __str__(self) -> str:
        return str(self.created_at)

    
    def save(self, *args, force_insert=False, force_update=False, using=None, update_fields=None):
        
        # when report created send message to target group
        if update_fields is None:
            bot = TeleBot(BOTFATHER_HASH)
            bot.send_message(self.group.groupID, self.text)
            
        return super().save(*args, force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)