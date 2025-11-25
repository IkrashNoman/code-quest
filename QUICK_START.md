# Smart Resume Evaluator - Quick Start Guide

Get up and running with the Smart Resume Evaluator backend in 10 minutes!

## Prerequisites

- Python 3.10 or higher
- Git
- PowerShell (Windows) or Bash (Linux/Mac)
- Optional: Tesseract OCR (for scanning images/PDFs)

## Step 1: Environment Setup (2 minutes)

### Create and activate virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Install dependencies:

```powershell
pip install -r requirements.txt
```

## Step 2: Database Configuration (1 minute)

Run Django migrations:

```powershell
python manage.py makemigrations
python manage.py migrate
```

## Step 3: Create Admin Account (1 minute)

```powershell
python manage.py createsuperuser
```

Follow the prompts to create an admin user (e.g., username: `admin`, password: `admin123`).

## Step 4: Start Development Server (1 minute)

```powershell
python manage.py runserver
```

Server will be available at: `http://localhost:8000`

## Step 5: Access the Application (1 minute)

1. **Admin Dashboard**: http://localhost:8000/admin
   - Login with your superuser credentials
   - Create job postings under "Job Postings" section
   - View resume submissions under "Resume Submissions" section

2. **API Endpoints**: 
   - Base URL: `http://localhost:8000/main/api/`

## Usage Examples

### Example 1: Create a Job Posting via Admin

1. Go to http://localhost:8000/admin
2. Click "Job Postings" → "Add Job Posting"
3. Fill in:
   - **Title**: "Senior Python Developer"
   - **Description**: "Looking for experienced Python developer with Django experience..."
   - **Location**: "San Francisco, CA"
   - **Required Skills**: "Python, Django, REST API, PostgreSQL"
4. Click "Save"

### Example 2: List Available Jobs (API)

```bash
curl http://localhost:8000/main/api/jobs/
```

**Response:**
```json
{
    "jobs": [
        {
            "id": 1,
            "title": "Senior Python Developer",
            "location": "San Francisco, CA",
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

### Example 3: Apply for a Job (API)

```bash
curl -X POST http://localhost:8000/main/api/jobs/1/apply/ \
  -F "file=@resume.pdf" \
  -F "candidate_name=John Doe" \
  -F "candidate_email=john@example.com"
```

**Response:**
```json
{
    "id": 42,
    "score": 78.5,
    "feedback": "Keyword match: 85% (12 of 14 keywords)\n...",
    "structured_assessment": {
        "heuristic_score": 75,
        "tfidf_similarity": 0.82
    },
    "relevant_skills": ["Python", "Django", "REST API", "PostgreSQL"],
    "missing_skills": [],
    "overall_fit": "excellent"
}
```

### Example 4: Generic Resume Evaluation (API)

```bash
curl -X POST http://localhost:8000/main/api/evaluate_resume/ \
  -F "file=@resume.pdf" \
  -F "candidate_name=Jane Smith" \
  -F "candidate_email=jane@example.com" \
  -F "job_description=We are looking for a Full Stack Developer..."
```

## Supported Resume Formats

✅ **PDF** (text-based and scanned)
✅ **DOCX** (Word documents)
✅ **Images** (PNG, JPG, TIFF with OCR)
✅ **Plain Text**

For scanned PDFs and images, the system automatically extracts text using OCR.

## Admin Interface Features

### Job Postings
- **Create**: Add new job postings with title, description, location, required skills
- **Search**: Find jobs by title, description, or skills
- **View**: See creation date and job details
- **Edit**: Update job requirements

### Resume Submissions
- **List**: View all applications with scores and fit ratings
- **Filter**: By job, overall fit (excellent/good/fair/poor), or date
- **View Details**: 
  - Extracted resume text
  - Skill matching results
  - Evaluation score and feedback
  - Structured assessment data
- **Search**: Find applications by candidate name, email, or job title

## Scoring Explained

### Overall Fit Categories
- 🟢 **Excellent** (80%+): Strong match, most required skills present
- 🟡 **Good** (60-79%): Good match, most key skills present
- 🟠 **Fair** (40-59%): Moderate match, some skills present
- 🔴 **Poor** (<40%): Limited match, few required skills present

### Score Calculation
The system uses a hybrid scoring approach:
- **60%** Heuristic (keyword overlap, contact info, education, experience)
- **40%** TF-IDF semantic similarity (when scikit-learn available)

Result is normalized to 0-100 scale.

## Advanced: Enable Grok API Integration

To use AI-powered evaluation via Grok API:

1. Get your Grok API key from xAI
2. Set environment variables:

```powershell
$env:GROK_API_KEY = "your-api-key-here"
$env:GROK_API_URL = "https://api.x.ai/v1/chat/completions"
```

3. Restart the development server

When configured, Grok API takes priority over local evaluation for more sophisticated analysis.

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'django'"
**Solution**: Ensure virtual environment is activated and dependencies installed
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: Database errors during migration
**Solution**: Reset database
```powershell
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Issue: OCR returns no text from PDF
**Solution**: Install Tesseract OCR on your system
- Windows: https://github.com/UB-Mannheim/tesseract/wiki
- Mac: `brew install tesseract`
- Linux: `sudo apt-get install tesseract-ocr`

### Issue: CORS errors when calling API from frontend
**Solution**: Add CORS headers (see API_DOCUMENTATION.md for production setup)

## Next Steps

1. **Read Full Documentation**: See `API_DOCUMENTATION.md` for complete API reference
2. **Review Implementation**: See `BACKEND_COMPLETE.md` for architecture details
3. **Build Frontend**: Create a React/Vue frontend using the provided API endpoints
4. **Deploy**: Configure production settings and deploy to server

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/main/api/jobs/` | GET | List all job postings |
| `/main/api/jobs/<id>/apply/` | POST | Apply for specific job |
| `/main/api/evaluate_resume/` | POST | Generic resume evaluation |

## File Structure

```
code_quest/
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── README.md             # Project overview
├── API_DOCUMENTATION.md  # Detailed API reference
├── BACKEND_COMPLETE.md   # Implementation details
├── QUICK_START.md        # This file
├── code_quest/           # Django project settings
│   ├── settings.py       # Configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py          # Production deployment
└── main/
    ├── models.py        # Database models
    ├── views.py         # API endpoints and logic
    ├── forms.py         # Django forms
    ├── admin.py         # Admin interface
    ├── urls.py          # App-level URL routing
    └── migrations/      # Database schema versions
```

## Getting Help

- Check `API_DOCUMENTATION.md` for detailed endpoint specifications
- Review `BACKEND_COMPLETE.md` for architectural decisions
- Check inline code comments in `main/views.py` for implementation details
- Review docstrings: `python -c "import main.views; help(main.views.evaluate_resume)"`

---

**Happy Resume Evaluating! 🚀**
