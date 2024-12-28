from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import UserViewSet, ProjectViewSet, MilestoneViewSet, TaskViewSet, TagViewSet, LogViewSet, CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'milestones', MilestoneViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'tags', TagViewSet)
router.register(r'logs', LogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

