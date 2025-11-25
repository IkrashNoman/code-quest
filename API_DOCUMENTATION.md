# Smart Resume Evaluator - API Documentation

## Overview

The Smart Resume Evaluator is a Django-based backend system that automates resume evaluation and matching against job postings. It extracts text from resumes (PDF/DOCX/images), analyzes skills, computes match scores, and provides detailed feedback for both admin and candidates.

## Table of Contents

1. [Setup and Installation](#setup-and-installation)
2. [System Architecture](#system-architecture)
3. [API Endpoints](#api-endpoints)
4. [Admin Interface](#admin-interface)
5. [Evaluation Methodology](#evaluation-methodology)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

---

## Setup and Installation

### Prerequisites

- **Python 3.10+** (or 3.8+)
- **Django 5.0+**
- **pip** (Python package manager)
- **Windows 10+** (for this project setup)
- **Tesseract OCR** (optional, for scanned resume handling)
- **Poppler** (optional, for PDF rasterization)

### Step 1: Install Python Packages

Activate your virtual environment and install dependencies:

```powershell
# Activate venv (Windows)
.\.venv\Scripts\Activate.ps1

# If execution policy blocks scripts, allow them:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install all dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Step 2: Install System Dependencies (Optional but Recommended)

For OCR support (scanned PDFs and images):

**Tesseract OCR (Windows):**
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Install using the Windows installer
- Add Tesseract to PATH or set in Django settings

**Poppler (Windows):**
- Download from: https://github.com/oschwartz10612/poppler-windows/releases
- Extract and add `bin` folder to PATH

### Step 3: Configure Django Settings

Edit `code_quest/settings.py` and set:

```python
# For Grok API integration (optional)
GROK_API_KEY = os.environ.get('GROK_API_KEY', '')
GROK_API_URL = os.environ.get('GROK_API_URL', 'https://api.grok.ai/v1/analyze')
```

Set environment variable in PowerShell:
```powershell
$env:GROK_API_KEY = 'your_grok_api_key_here'
```

### Step 4: Apply Database Migrations

```powershell
python manage.py makemigrations main
python manage.py migrate
```

### Step 5: Create Admin User

```powershell
python manage.py createsuperuser
# Follow prompts to create username and password
```

### Step 6: Start Development Server

```powershell
python manage.py runserver
```

Access the application at: `http://127.0.0.1:8000/`

---

## System Architecture

### Data Models

#### JobPosting
- **title**: Job title
- **description**: Full job description
- **location**: Job location
- **required_skills**: Comma-separated list of required skills
- **created_at**: Creation timestamp

#### ResumeSubmission
- **job**: Foreign key to JobPosting (nullable)
- **candidate_name**: Applicant's name
- **candidate_email**: Applicant's email
- **file**: Uploaded resume file (PDF/DOCX/image)
- **extracted_text**: Full text extracted from resume
- **score**: Match score (0-100)
- **feedback**: Text feedback
- **relevant_skills**: List of matched skills (JSON)
- **missing_skills**: List of unmatched required skills (JSON)
- **overall_fit**: Categorical fit (excellent/good/fair/poor)
- **structured_assessment**: Detailed assessment from evaluator (JSON)
- **created_at**: Submission timestamp

### Processing Pipeline

```
Resume Upload
    ↓
Text Extraction (Native or OCR)
    ↓
Skill Extraction & Matching
    ↓
TF-IDF Similarity Computation
    ↓
Grok API Call (if configured) OR Local Evaluation
    ↓
Combined Scoring (60% heuristic + 40% TF-IDF if local)
    ↓
Store Results & Return Response
```

### Evaluation Components

1. **Text Extraction**
   - PDF: PyMuPDF for native text, pdf2image + pytesseract for OCR fallback
   - DOCX: python-docx for native extraction
   - Images: PIL + pytesseract for OCR

2. **Skill Extraction**
   - Detects 60+ common technical and soft skills
   - Matches resume text against predefined skill dictionary

3. **Similarity Computation**
   - TF-IDF vectorization of job description and resume
   - Cosine similarity (0-1 range, scaled to 0-100 for score)

4. **Scoring**
   - **Heuristic (60%)**: Keyword overlap, contact info, education, years of experience
   - **TF-IDF (40%)**: Semantic similarity between resume and job description

---

## API Endpoints

### 1. List All Jobs

**Endpoint:** `GET /main/api/jobs/`

**Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "title": "Senior Python Developer",
      "location": "Remote",
      "created_at": "2025-11-24T10:00:00Z"
    }
  ]
}
```

### 2. Apply for a Job (Candidate)

**Endpoint:** `POST /main/api/jobs/<job_id>/apply/`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `file` (required): Resume file (PDF, DOCX)
- `candidate_name` (optional): Candidate's full name
- `candidate_email` (optional): Candidate's email address

**Example:**
```powershell
curl -X POST `
  -F "candidate_name=John Doe" `
  -F "candidate_email=john@example.com" `
  -F "file=@C:\path\to\resume.pdf" `
  http://127.0.0.1:8000/main/api/jobs/1/apply/
```

**Response:**
```json
{
  "id": 5,
  "score": 78.5,
  "feedback": "Keyword match: 85% (17 of 20 keywords)...",
  "structured_assessment": {
    "heuristic_score": 75.0,
    "tfidf_similarity": 0.82
  },
  "relevant_skills": ["python", "django", "rest api", "postgresql", "git"],
  "missing_skills": ["kubernetes", "aws"],
  "overall_fit": "good"
}
```

### 3. Generic Resume Evaluation

**Endpoint:** `POST /main/api/evaluate_resume/`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `resume` (required): Resume file
- `job_id` OR `job_description` (required): Job context for evaluation
- `candidate_name` (optional)
- `candidate_email` (optional)

**Example (with job description):**
```powershell
curl -X POST `
  -F "job_description=We need a Python developer with Django and REST API experience, 5+ years" `
  -F "candidate_name=Jane Smith" `
  -F "candidate_email=jane@example.com" `
  -F "resume=@C:\resume.docx" `
  http://127.0.0.1:8000/main/api/evaluate_resume/
```

**Example (with job ID):**
```powershell
curl -X POST `
  -F "job_id=1" `
  -F "candidate_name=Jane Smith" `
  -F "candidate_email=jane@example.com" `
  -F "resume=@C:\resume.docx" `
  http://127.0.0.1:8000/main/api/evaluate_resume/
```

**Response:** (same format as apply_job endpoint)

---

## Admin Interface

### Accessing Admin Panel

1. Visit: `http://127.0.0.1:8000/admin/`
2. Log in with the superuser credentials created during setup

### Managing Job Postings

1. Click "Job Postings" in the admin sidebar
2. Click "Add Job Posting" to create a new job
3. Fill in:
   - **Title**: e.g., "Senior Python Developer"
   - **Description**: Full job description with responsibilities
   - **Location**: e.g., "Remote" or "New York, NY"
   - **Required Skills**: Comma-separated list (e.g., "Python, Django, REST API, PostgreSQL, Git")
4. Click "Save"

### Viewing Resume Submissions

1. Click "Resume Submissions" in the admin sidebar
2. View all submissions with:
   - Candidate name and email
   - Applied job
   - Match score (0-100)
   - Overall fit (Excellent/Good/Fair/Poor)
   - Relevant and missing skills
   - Detailed feedback and assessment
3. Filter by:
   - Job posting
   - Overall fit level
   - Date created

### Key Admin Features

- **Search**: Search submissions by candidate name, email, or job title
- **Filtering**: Filter by job and fit level
- **Read-only Fields**: View extracted resume text, feedback, and structured assessment
- **Hierarchical Organization**: Candidate info → Evaluation → Analysis

---

## Evaluation Methodology

### Match Score Calculation

**When Grok API is configured:**
- Score comes from Grok API response
- All evaluation delegated to external AI

**When using Local Evaluator:**
- **Keyword Overlap (60%)**: Percentage of job keywords found in resume
- **Contact Info (10%)**: +5 for email, +5 for phone
- **Education (10%)**: +10 if bachelor's, master's, phd mentioned
- **Experience (20%)**: Based on years mentioned (capped at 20 points)
- **Combined Score**: 60% heuristic + 40% TF-IDF similarity

### Overall Fit Determination

Fit is determined based on relevant skills percentage:
- **Excellent (80%+)**: Most required skills present
- **Good (60-79%)**: Good coverage of required skills
- **Fair (40-59%)**: Some skills present, some missing
- **Poor (<40%)**: Limited skill match

### Skill Detection

The system detects 60+ common skills including:
- **Languages**: Python, Java, JavaScript, C#, C++, Ruby, PHP, Swift, Kotlin, Rust
- **Frameworks**: Django, Flask, FastAPI, Spring, Node.js, Express, React, Angular, Vue
- **Databases**: SQL, MongoDB, PostgreSQL, MySQL, Redis, Elasticsearch
- **DevOps**: Docker, Kubernetes, AWS, Azure, GCP, Git, CI/CD, Jenkins, GitLab
- **Soft Skills**: Communication, Leadership, Problem Solving, Teamwork, Project Management

---

## Configuration

### Environment Variables

```powershell
# Grok API Configuration (optional)
$env:GROK_API_KEY = 'your_api_key'
$env:GROK_API_URL = 'https://api.grok.ai/v1/analyze'
```

### Django Settings (code_quest/settings.py)

```python
# API Configuration
GROK_API_KEY = os.environ.get('GROK_API_KEY', '')
GROK_API_URL = os.environ.get('GROK_API_URL', 'https://api.grok.ai/v1/analyze')

# Tesseract Configuration (if needed)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

---

## Troubleshooting

### Common Issues

#### 1. Execution Policy Error

**Error:** `File cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Missing Dependencies

**Error:** `ModuleNotFoundError: No module named 'pytesseract'`

**Solution:**
```powershell
python -m pip install -r requirements.txt
```

#### 3. OCR Not Working

**Issue:** Scanned PDFs not being converted to text

**Solution:**
- Install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
- Install Poppler: https://github.com/oschwartz10612/poppler-windows/releases
- Add both to PATH or configure in Django settings

#### 4. Database Migration Issues

**Error:** `django.db.utils.OperationalError`

**Solution:**
```powershell
python manage.py makemigrations main
python manage.py migrate
```

#### 5. Grok API Connection Error

**Solution:**
- Verify API key is correct: `$env:GROK_API_KEY`
- Check API endpoint URL is accessible
- Verify request payload format matches Grok API spec

### Debugging

Enable debug mode and check logs:

```python
# code_quest/settings.py
DEBUG = True  # Only for development!
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

---

## Project Structure

```
code-quest/
├── manage.py
├── requirements.txt
├── code_quest/
│   ├── settings.py          # Django configuration
│   ├── urls.py              # Project URL routing
│   ├── wsgi.py              # WSGI configuration
│   └── asgi.py              # ASGI configuration
├── main/
│   ├── models.py            # Data models (JobPosting, ResumeSubmission)
│   ├── views.py             # API endpoints and evaluation logic
│   ├── urls.py              # App URL routing
│   ├── forms.py             # Django forms
│   ├── admin.py             # Admin interface configuration
│   ├── apps.py              # App configuration
│   └── migrations/          # Database migrations
├── templates/               # HTML templates
├── media/                   # Uploaded files (resumes, media)
├── static/                  # Static files (CSS, JS, images)
└── scripts/                 # Utility scripts
    └── install_requirements.ps1
```

---

## Next Steps & Future Enhancements

1. **OCR Improvements**: Add more languages support, improve accuracy
2. **ML-Based Scoring**: Train custom ML model for better matching
3. **Embeddings**: Use sentence-transformers for semantic matching
4. **Async Processing**: Use Celery for background evaluation tasks
5. **Frontend**: Build React/Vue dashboard for candidates and admins
6. **Authentication**: Implement JWT or OAuth2 for API security
7. **Rate Limiting**: Add throttling to prevent abuse
8. **Bulk Operations**: Support batch resume evaluation
9. **Export Reports**: Generate PDF/Excel evaluation reports

---

## Support & Contact

For issues, questions, or feature requests, refer to the GitHub repository or contact the development team.

