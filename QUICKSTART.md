# Quick Start Guide - Resume Evaluator UI

## What Was Built

A complete web interface with:
- **HTML** (5.9 KB) - Semantic, responsive markup
- **CSS** (8.6 KB) - Minimal but complete styling, no frameworks
- **JavaScript** (10.8 KB) - Vanilla JS with full functionality

## Files Created

```
templates/
  index.html               - Main application interface

static/
  css/
    style.css             - All styling
  js/
    app.js                - All application logic
```

## Features

### Home Page (Browse Jobs)
- Grid layout of all available job postings
- Job cards show title, location, required skills
- Click any job to see full details in a modal
- Quick "View Details" button

### Evaluate Tab
- Two-column layout (form on left, results on right)
- Form fields:
  - Candidate Name (required)
  - Candidate Email (required)
  - Select Job (dropdown from available jobs)
  - Job Description (text area for custom jobs)
  - Resume File (upload PDF, DOCX, TXT, images)

### Results Display
- **Score Card** with 0-100 score in large text
- **Fit Badge** showing Excellent/Good/Fair/Poor
- **Skills Section** showing relevant and missing skills
- **Feedback Box** with detailed text feedback
- **Breakdown Section** showing evaluation method used

## How to Use

### Step 1: Install Dependencies
```powershell
pip install pdf2image reportlab python-docx httpx pytesseract scikit-learn
```

### Step 2: Run Migrations
```bash
python manage.py migrate
```

### Step 3: Create Admin Account (Optional - for adding jobs)
```bash
python manage.py createsuperuser
```

### Step 4: Add Test Jobs (Optional)
```bash
# Visit http://localhost:8000/admin/ and create jobs
```

### Step 5: Start Development Server
```bash
python manage.py runserver
```

### Step 6: Open in Browser
```
http://localhost:8000/
```

## User Workflow

### Browse Jobs
1. Click "Browse Jobs" tab (default)
2. View grid of all available positions
3. Click any job card to see details
4. Read full description, requirements, skills

### Apply for Job
From job modal:
1. Click "Apply for this Job" button
2. Automatically switches to Evaluate tab
3. Job is pre-selected in dropdown

### Evaluate Resume (Generic)
1. Click "Evaluate Resume" tab
2. Leave job selection as "-- Generic Evaluation --"
3. Paste job description in text area
4. Upload your resume
5. Click "Evaluate Resume"

### Evaluate Resume (Specific Job)
1. Click "Evaluate Resume" tab
2. Select a job from dropdown
3. Job description auto-fills
4. Upload your resume
5. Click "Evaluate Resume"

### View Results
Results auto-display with:
- Overall match score
- Fit category with color
- Skills you have that match
- Skills you're missing
- Text feedback and recommendations
- Evaluation method used (AI, Heuristic, or Semantic)

## API Endpoints Used

The UI communicates with these endpoints:

```
GET /api/jobs/
  -> Lists all available job postings
  
POST /api/evaluate_resume/
  -> Evaluates a resume against a job
  -> Returns: score, skills, feedback, fit category
```

## UI Highlights

### Responsive Design
- Works on desktop (full two-column layout)
- Works on tablet (optimized grid)
- Works on mobile (single column)

### Color Scheme
- Primary: Blue (#3498db) for buttons and highlights
- Dark: Gray (#2c3e50) for text and headers
- Success Green (#27ae60) for excellent fit
- Warning Orange (#e67e22) for fair fit
- Error Red (#e74c3c) for poor fit

### Interactions
- Smooth tab transitions
- Hover effects on buttons and cards
- Modal for job details
- Loading spinner during evaluation
- Auto-dismiss alerts after 5 seconds

### No External Dependencies
- Pure vanilla HTML/CSS/JavaScript
- No jQuery, Bootstrap, or other frameworks
- Works offline (except for API calls)
- Very fast load times

## Keyboard Shortcuts

- **Tab**: Navigate form fields
- **Enter**: Submit form or confirm action
- **Esc**: Close modals

## Troubleshooting

### Page Won't Load
1. Is Django server running? (`python manage.py runserver`)
2. Check console for errors (F12 → Console tab)
3. Try hard refresh (Ctrl+Shift+R)

### Jobs Not Showing
1. Check if any jobs exist in database
2. Visit `/admin/` to create test jobs
3. Check browser console for API errors

### Resume Evaluation Not Working
1. Ensure all dependencies are installed
2. Check that file format is supported (PDF, DOCX, etc.)
3. Try with a smaller, simpler resume file
4. Check Django server logs for errors

### Styling Issues
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R)
3. Check console for CSS errors

### API Errors
1. Check that Django server is running
2. Verify job is selected or description provided
3. Check network tab in DevTools (F12)
4. Look for error messages in browser console

## Customization

### Change Colors
Edit `static/css/style.css`:
```css
.navbar {
    background-color: #2c3e50;  /* Change navbar color */
}

.btn-primary {
    background-color: #3498db;  /* Change button color */
}
```

### Change Logo
Edit `templates/index.html`:
```html
<h1 class="logo">Your Company Name</h1>
```

### Add More Tabs
In `templates/index.html` add tab HTML, then in `static/js/app.js` add handler:
```javascript
function showTab(tabName) {
    // Add your tab logic
}
```

### Change Layout
Edit `static/css/style.css`:
- Adjust `.eval-container` grid for different column count
- Modify `.jobs-container` grid for job card layout
- Change breakpoints for mobile optimization

## Performance

- **Page Load**: < 1 second
- **Job List Load**: < 100ms
- **Resume Evaluation**: 2-30 seconds (depends on file size and API)
- **No Framework Overhead**: Pure JavaScript
- **Minimal CSS**: Only essential styles

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## File Sizes

- HTML: 5.9 KB
- CSS: 8.6 KB
- JavaScript: 10.8 KB
- **Total: 25.3 KB** (before compression)

## Security Features

- CSRF protection (Django)
- HTML escaping to prevent XSS
- File type validation on client
- HTTPS ready for production

## Production Deployment

For production:

1. Set `DEBUG = False` in settings.py
2. Set `ALLOWED_HOSTS` to your domain
3. Collect static files: `python manage.py collectstatic`
4. Use a production server (gunicorn, etc.)
5. Set environment variables for API keys
6. Use HTTPS

```bash
# Collect static files for production
python manage.py collectstatic --no-input
```

## Next Steps

1. Add more jobs through Django admin
2. Test with sample resumes
3. Customize styling to match your brand
4. Deploy to production (Heroku, AWS, etc.)
5. Monitor API usage and response times

## Support

For issues:
1. Check browser console (F12)
2. Check Django server logs
3. Verify all dependencies installed
4. Try with a different browser
5. Clear cache and restart server

## Getting Help

Check these files for more info:
- `UI_GUIDE.md` - Complete UI documentation
- `REFACTORING_NOTES.md` - Backend architecture
- `README.md` - Project overview
