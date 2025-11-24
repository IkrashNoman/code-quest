from django.shortcuts import render, redirect, get_object_or_404
from .models import TestItem
from .forms import TestItemForm

def test_page(request):
    items = TestItem.objects.all()
    form = TestItemForm()

    if request.method == 'POST':
        form = TestItemForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('test')

    return render(request, 'test.html', {'form': form, 'items': items})

def delete_item(request, pk):
    item = get_object_or_404(TestItem, pk=pk)
    item.delete()
    return redirect('test')
