from django.contrib import admin
from .models import Project, ProjectPermission, Milestone, Task, ChecklistItem, Comment, Dependency, Tag, TaskTag, Log, GroupModel, ReportModel

@admin.register(GroupModel)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('verbose', 'groupID', 'repeetHour')
    filter_vertical = ["projects"]
    
@admin.register(ReportModel)
class ReportModelAdmin(admin.ModelAdmin):
    list_display = ('pk', 'created_at', 'group')
    

class ProjectPermissionAdmin(admin.TabularInline):
    model = ProjectPermission

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')
    search_fields = ('name', 'owner__username')
    list_filter = ('owner',)
    inlines = [ProjectPermissionAdmin]

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'project')
    search_fields = ('name', 'project__name')
    list_filter = ('project',)

class ChecklistItemInline(admin.TabularInline):
    model = ChecklistItem
    extra = 1

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'milestone', 'status', 'assignee', 'start_date', 'due_date', 'deadline')
    list_filter = ('status', 'milestone__project', 'milestone')
    search_fields = ('title', 'description', 'assignee__username')
    inlines = [ChecklistItemInline, CommentInline]

@admin.register(Dependency)
class DependencyAdmin(admin.ModelAdmin):
    list_display = ('from_task', 'to_task', 'type')
    list_filter = ('type',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color')
    search_fields = ('name',)

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'message', 'timestamp', 'task')
    list_filter = ('project', 'user', 'timestamp')
    search_fields = ('message', 'user__username', 'project__name')
    date_hierarchy = 'timestamp'

# These models have simple structures, so we'll use the default admin
admin.site.register(ChecklistItem)
admin.site.register(Comment)
admin.site.register(TaskTag)
