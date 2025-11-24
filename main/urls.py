from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_page, name='test'),
    path('delete/<int:pk>/', views.delete_item, name='delete_item'),
]
