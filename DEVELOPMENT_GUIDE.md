# Development Guide - Smart Resume Evaluator

This guide is for developers who want to extend, maintain, or contribute to the Smart Resume Evaluator backend.

## Architecture Overview

### Three-Layer Architecture

```
API Layer (views.py)
  ↓
Business Logic Layer (evaluation functions)
  ↓
Data Layer (models.py, database)
```

### Key Components

1. **Text Extraction Layer** (`extract_text_from_*` functions)
   - Handles multiple file formats
   - OCR fallback for scanned documents
   - Returns normalized UTF-8 text

2. **Skill Detection Layer** (`extract_skills_from_text`, `evaluate_skills`)
   - Pattern matching against predefined skills
   - Calculates fit percentage
   - Returns structured skill data

3. **Evaluation Layer** (`simple_evaluate`, `compute_tfidf_similarity`, `call_grok_api`)
   - Multiple scoring strategies
   - Hybrid scoring (local + semantic)
   - Optional AI integration

4. **API Layer** (`evaluate_resume`, `apply_job`, `list_jobs`)
   - REST endpoints
   - Request validation
   - JSON responses

## Code Organization

### Function Groups in `main/views.py`

```python
# Section 1: Text Extraction (Lines ~100-175)
extract_text_from_pdf()      # Native PDF extraction
extract_text_from_docx()     # Native DOCX extraction
ocr_pdf()                    # Scanned PDF OCR
ocr_image()                  # Image OCR
extract_text_from_file()     # Unified dispatcher

# Section 2: Skills (Lines ~180-350)
extract_skills_from_text()   # Skill detection
evaluate_skills()            # Skill matching

# Section 3: Evaluation (Lines ~350-550)
compute_tfidf_similarity()   # TF-IDF scoring
simple_evaluate()            # Heuristic scoring
call_grok_api()             # AI evaluation

# Section 4: API Endpoints (Lines ~550-900)
evaluate_resume()            # Generic endpoint
list_jobs()                  # List jobs
apply_job()                  # Apply endpoint

# Section 5: Legacy (Lines ~900-1009)
test_page()                  # Legacy template
delete_item()                # Legacy deletion
```

## Development Workflow

### Adding a New Evaluation Strategy

1. **Create the evaluation function** in `main/views.py`:
```python
def my_new_evaluator(resume_text, job_text):
    """Evaluate using new strategy.
    
    Args:
        resume_text (str): Resume content
        job_text (str): Job description
        
    Returns:
        tuple: (score, feedback) where score is 0-100
    """
    # Implementation here
    score = 0.0
    feedback = "Analysis results"
    return score, feedback
```

2. **Integrate into scoring pipeline** in `evaluate_resume()` or `apply_job()`:
```python
if score is None:  # If Grok API not available
    h_score, h_feedback = simple_evaluate(text, job_desc)
    my_score, my_feedback = my_new_evaluator(text, job_desc)  # Add this
    
    # Combine scores
    final = (0.5 * h_score) + (0.5 * my_score)  # Update weights
    score = round(max(0.0, min(100.0, final)), 2)
```

3. **Update model** if you need to store new data:
```python
# In main/models.py ResumeSubmission
my_evaluator_score = models.FloatField(null=True, blank=True)
my_evaluator_data = models.JSONField(null=True, blank=True)
```

4. **Run migrations**:
```powershell
python manage.py makemigrations
python manage.py migrate
```

### Adding Support for New File Format

1. **Create extraction function** (e.g., for .ppt):
```python
def extract_text_from_ppt(path_or_file):
    """Extract text from PowerPoint.
    
    Args:
        path_or_file (str or file): PPT file path or file object
        
    Returns:
        str: Extracted text
    """
    try:
        # Use appropriate library (e.g., python-pptx)
        # Implementation here
        return text
    except Exception:
        return ''
```

2. **Update unified extractor**:
```python
def extract_text_from_file(path, name):
    lname = name.lower()
    
    # Add this condition
    elif lname.endswith('.ppt') or lname.endswith('.pptx'):
        text = extract_text_from_ppt(path)
    
    # Rest of function...
```

3. **Update requirements.txt**:
```
python-pptx
```

4. **Add docstring note** about new format in `extract_text_from_file()`

### Enhancing Skill Detection

The skill dictionary is in `extract_skills_from_text()`:

```python
common_skills = {
    # Add new skills here
    'new_skill', 'another_skill',
    # Group related skills
    # ...
}
```

To make it more sophisticated:

1. **Consider regex patterns** for skill variants:
```python
skill_patterns = {
    'python': r'\bpython\b|\bpy\b',
    'c\+\+': r'\bc\+\+\b|\bcpp\b',
    # ...
}
```

2. **Implement semantic similarity** for skill matching:
```python
from difflib import SequenceMatcher

def fuzzy_skill_match(found_skill, required_skill, threshold=0.8):
    ratio = SequenceMatcher(None, found_skill, required_skill).ratio()
    return ratio >= threshold
```

3. **Add skill categories** for better reporting:
```python
SKILL_CATEGORIES = {
    'languages': ['python', 'java', 'javascript', ...],
    'frameworks': ['django', 'flask', 'spring', ...],
    'databases': ['sql', 'mongodb', 'postgresql', ...],
    'devops': ['docker', 'kubernetes', 'aws', ...],
}
```

## Database Operations

### Query Examples

```python
# Get all submissions for a job
submissions = ResumeSubmission.objects.filter(job_id=1)

# Get high-scoring applications
excellent = ResumeSubmission.objects.filter(overall_fit='excellent')

# Get applications from specific date range
from django.utils import timezone
from datetime import timedelta

recent = ResumeSubmission.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=7)
)

# Aggregate average score by job
from django.db.models import Avg

stats = ResumeSubmission.objects.values('job').annotate(
    avg_score=Avg('score')
)

# Get specific submission with all details
submission = ResumeSubmission.objects.get(pk=42)
print(submission.relevant_skills)
print(submission.overall_fit)
```

### Adding Custom Management Command

Create `main/management/commands/my_command.py`:

```python
from django.core.management.base import BaseCommand
from main.models import ResumeSubmission

class Command(BaseCommand):
    help = 'My custom management command'
    
    def add_arguments(self, parser):
        parser.add_argument('--job-id', type=int, help='Job ID to process')
    
    def handle(self, *args, **options):
        job_id = options.get('job_id')
        if job_id:
            submissions = ResumeSubmission.objects.filter(job_id=job_id)
            self.stdout.write(f"Found {submissions.count()} submissions")
```

Run with: `python manage.py my_command --job-id=1`

## Testing

### Unit Testing Example

Create `main/tests.py`:

```python
from django.test import TestCase
from main.models import JobPosting, ResumeSubmission
from main.views import evaluate_skills, simple_evaluate

class EvaluationTestCase(TestCase):
    def setUp(self):
        self.job = JobPosting.objects.create(
            title="Python Developer",
            description="We need a Python developer",
            location="Remote",
            required_skills="Python, Django, REST API"
        )
    
    def test_skill_evaluation(self):
        resume_text = "I have 5 years of Python and Django experience"
        relevant, missing, fit, pct = evaluate_skills(
            self.job.required_skills,
            resume_text
        )
        self.assertEqual(fit, 'good')
        self.assertIn('python', relevant)
    
    def test_heuristic_scoring(self):
        resume = "john@example.com | 555-1234 | BS Computer Science | 3 years experience"
        job = "Senior developer with 5+ years needed"
        score, feedback = simple_evaluate(resume, job)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
```

Run with: `python manage.py test main`

## Performance Optimization

### Text Extraction
- OCR is slow (1-5 seconds per page). Cache results when possible.
- Consider using multiprocessing for batch processing

### TF-IDF Scoring
- Vectorizer creation is expensive. Consider caching for repeated jobs.
- Limit feature count to 2000 (already done in code)

### Skill Matching
- Current implementation: O(n×m) complexity where n=found skills, m=required
- For large skill sets, consider trie-based matching

### Optimization Tips

```python
# Cache expensive computations
from functools import lru_cache

@lru_cache(maxsize=128)
def cached_skill_extraction(text):
    return extract_skills_from_text(text)

# Batch processing
from django.db.models import Prefetch

jobs_with_submissions = JobPosting.objects.prefetch_related(
    Prefetch('resumesubmission_set')
)

# Index frequently queried fields
# In models.py:
class ResumeSubmission(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['job', 'created_at']),
            models.Index(fields=['overall_fit', 'score']),
        ]
```

## Security Considerations

### File Upload Security

```python
# Current: Trusts all uploaded files
# Recommended: Add file type validation

import mimetypes
ALLOWED_TYPES = {'application/pdf', 'application/msword', 
                  'image/jpeg', 'image/png', 'text/plain'}

def validate_file_type(file_obj):
    mime_type = mimetypes.guess_type(file_obj.name)[0]
    if mime_type not in ALLOWED_TYPES:
        raise ValueError("File type not allowed")
```

### Input Validation

```python
# Validate required_skills input
def validate_required_skills(skills_str):
    if not skills_str:
        return True
    
    # Check for SQL injection patterns
    if any(char in skills_str for char in [';', '--', '/*']):
        return False
    
    # Limit length
    if len(skills_str) > 500:
        return False
    
    return True
```

### API Security

- Current: No rate limiting. Add for production:
```python
from django.views.decorators.cache import cache_page

@cache_page(60)  # Cache for 60 seconds
def list_jobs(request):
    # ...
```

- Add authentication for admin operations
- Use HTTPS in production
- Set CSRF tokens properly

## Logging and Debugging

### Add Logging

```python
import logging

logger = logging.getLogger(__name__)

def evaluate_resume(request):
    logger.info(f"Evaluating resume for job {job_id}")
    try:
        # ... code ...
        logger.info("Evaluation successful")
    except Exception as e:
        logger.error(f"Evaluation failed: {e}", exc_info=True)
        raise
```

### Debugging Tips

```python
# Print extracted text during development
print(f"Extracted {len(text)} characters")

# Check TF-IDF computation
sim = compute_tfidf_similarity(job, resume)
print(f"TF-IDF similarity: {sim}")

# Verify skill detection
skills = extract_skills_from_text(text)
print(f"Found skills: {skills}")
```

## Deployment Considerations

### Environment Variables

```python
# In settings.py
import os

GROK_API_KEY = os.environ.get('GROK_API_KEY', '')
GROK_API_URL = os.environ.get('GROK_API_URL', '')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')
```

### Production Checklist

- [ ] DEBUG = False
- [ ] SECRET_KEY from environment
- [ ] Database: PostgreSQL (not SQLite)
- [ ] Static files configured
- [ ] Media files storage configured
- [ ] HTTPS enabled
- [ ] CSRF protection enabled
- [ ] CORS configured for frontend
- [ ] Logging configured
- [ ] Error monitoring (e.g., Sentry)
- [ ] Rate limiting enabled
- [ ] Input validation added
- [ ] File upload scanning

## Contributing

### Code Style

1. Follow PEP 8 conventions
2. Use meaningful variable names
3. Keep functions focused (single responsibility)
4. Add docstrings to all public functions
5. Add type hints where beneficial

### Docstring Template

```python
def my_function(param1, param2):
    """Brief description of function.
    
    Longer description explaining what the function does and
    any important details about behavior.
    
    Args:
        param1 (type): Description of param1
        param2 (type): Description of param2
        
    Returns:
        type: Description of return value
        
    Raises:
        ValueError: When something is invalid
        
    Note:
        Important implementation details or gotchas
        
    Example:
        >>> result = my_function('a', 'b')
        >>> print(result)
        'result'
    """
    pass
```

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [scikit-learn Documentation](https://scikit-learn.org/)
- [Tesseract OCR Documentation](https://github.com/UB-Mannheim/tesseract/wiki)
- [PyMuPDF Documentation](https://pymupdf.readthedocs.io/)
- [python-docx Documentation](https://python-docx.readthedocs.io/)

---

**Happy Coding! 🚀**
