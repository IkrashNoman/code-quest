from django import forms
from .models import TestItem

class TestItemForm(forms.ModelForm):
    class Meta:
        model = TestItem
        fields = ['description', 'image']
