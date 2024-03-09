from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_simulation_data/', views.get_simulation_data, name='get_simulation_data'),
]

