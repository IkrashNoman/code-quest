# Smart Resume Evaluator - UI Guide

## Overview

A complete web interface for the Smart Resume Evaluator application with:
- **Browse Jobs**: View all available job postings
- **Evaluate Resume**: Upload and evaluate your resume against job requirements
- **Real-time Feedback**: Get instant evaluation scores and detailed analysis
- **Skill Matching**: See which skills match and which are missing

## File Structure

```
templates/
  └── index.html          # Main UI page

static/
  ├── css/
  │   └── style.css       # Minimal but complete styling
  └── js/
      └── app.js          # All application logic
```

## Features

### 1. Browse Jobs
- View all available job postings in a grid layout
- Click any job card to see full details in a modal
- View job title, location, and required skills
- Quickly apply for a job

### 2. Evaluate Resume
- **Candidate Info**: Enter your name and email
- **Select Job**: Choose from available jobs or paste custom job description
- **Upload Resume**: Supports PDF, DOCX, TXT, PNG, JPG, TIFF formats
- **Automatic Evaluation**: System evaluates skills and overall fit

### 3. Results Display
Shows comprehensive evaluation including:
- **Overall Score**: 0-100 match percentage
- **Fit Category**: Excellent/Good/Fair/Poor
- **Relevant Skills**: Skills from your resume matching the job
- **Missing Skills**: Required skills not found in your resume
- **Detailed Feedback**: Text analysis and recommendations
- **Evaluation Method**: Shows which evaluation method was used (AI, Heuristic, or Semantic)

## User Interface Components

### Navigation Bar
- Logo with branding
- Quick tabs to switch between "Browse Jobs" and "Evaluate Resume"

### Jobs Tab
- Grid layout of all available positions
- Hover effects for better interactivity
- Quick preview of job description
- "View Details" button for full information

### Evaluation Tab
- Two-column layout (form + results)
- Simple form with validation
- Real-time results display
- Responsive design for mobile

### Score Card
- Large visual display of the score
- Color-coded fit category (Green for excellent, Red for poor)
- Quick visual summary

### Skills Section
- Displays found skills as tags
- Displays missing skills with different styling
- Easy to scan and understand

### Feedback Section
- Multiline text feedback from evaluation engine
- Includes keyword matching percentage
- Contact information suggestions
- Education and experience notes

## API Integration

The UI communicates with these endpoints:

### Get All Jobs
```
GET /api/jobs/
Response: { "jobs": [{ id, title, description, location, required_skills }, ...] }
```

### Evaluate Resume
```
POST /api/evaluate_resume/
Body: FormData with:
  - candidate_name: string
  - candidate_email: string
  - resume: file
  - job_id: integer (optional)
  - job_description: string (optional)

Response: {
  id: integer,
  score: float,
  feedback: string,
  structured_assessment: object,
  relevant_skills: [string],
  missing_skills: [string],
  overall_fit: string
}
```

### Apply for Job
```
POST /api/jobs/<id>/apply/
Body: FormData with resume and candidate info
```

## Running the UI

### 1. Start Django Development Server
```bash
python manage.py runserver
```

### 2. Open in Browser
```
http://localhost:8000/
```

### 3. Navigate the Application
- **Browse**: Click "Browse Jobs" to see available positions
- **Evaluate**: Click "Evaluate Resume" to test your skills
- **Select Job**: Choose a job or paste a custom description
- **Upload**: Select your resume file
- **Evaluate**: Click "Evaluate Resume" button

## CSS Features

### Styling Approach
- **Minimal but complete**: Only essential CSS, no framework dependencies
- **Responsive**: Works on desktop and mobile devices
- **Modern**: Uses CSS Grid and Flexbox for layout
- **Accessible**: Proper contrast and readable fonts

### Key CSS Elements
- Color scheme: Blue (#3498db) and Dark Gray (#2c3e50)
- Gradient backgrounds for score cards
- Smooth animations and transitions
- Clean card-based layout

### Breakpoints
- Responsive at 768px breakpoint
- Mobile-optimized grid layouts
- Full-width forms on small screens

## JavaScript Features

### State Management
- `allJobs`: Array of all available jobs
- `currentJob`: Currently selected job

### Key Functions

#### Tab Navigation
```javascript
showTab(tabName)  // Switch between 'jobs' and 'evaluate'
```

#### Job Management
```javascript
loadJobs()                    // Fetch all jobs from API
renderJobsList()              // Display jobs in grid
openJobModal(jobId)          // Show job details
selectJobForApply(jobId)     // Select job for evaluation
```

#### Resume Evaluation
```javascript
evaluateResume()             // Submit resume for evaluation
displayEvaluationResults()   // Show results
resetEval()                  // Clear form and results
```

#### Utilities
```javascript
escapeHtml(text)             // Prevent XSS
capitalizeFirst(str)         // Format strings
showAlert(message, type)     // Show notifications
```

## Error Handling

- **Network Errors**: Shows user-friendly error messages
- **Validation**: Client-side validation for required fields
- **File Upload**: File type validation before upload
- **API Errors**: Catches and displays API errors

## Performance Optimizations

- **Single Page App**: No page reloads
- **Lazy Loading**: Jobs loaded on demand
- **Event Delegation**: Efficient event handling
- **No External Dependencies**: Only vanilla JavaScript

## Accessibility

- Semantic HTML
- Proper form labels
- Keyboard navigation support
- Color contrast compliance
- Loading indicators for users

## Browser Compatibility

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Change Colors
Edit `static/css/style.css`:
```css
/* Primary color */
--primary: #3498db;

/* Dark color */
--dark: #2c3e50;
```

### Add More Features
Edit `static/js/app.js`:
```javascript
// Add new functions following existing patterns
async function newFeature() {
    // Your code here
}
```

### Modify Styling
Edit `static/css/style.css`:
```css
/* Update existing selectors */
.card {
    /* Your styles */
}
```

## Troubleshooting

### Jobs Not Loading
1. Check if Django development server is running
2. Verify API endpoint: `GET /api/jobs/`
3. Check browser console for errors

### Resume Upload Failing
1. Ensure file format is supported (PDF, DOCX, TXT, PNG, JPG, TIFF)
2. Check file size limit (if configured)
3. Verify job selection or job description is provided

### Styles Not Loading
1. Run `python manage.py collectstatic` if in production
2. Check STATIC_URL and STATICFILES_DIRS in settings.py
3. Clear browser cache (Ctrl+Shift+Delete)

### API Errors
1. Check Django development server logs
2. Verify all dependencies are installed
3. Ensure environment variables are set (GROK_API_KEY, etc.)

## Development Tips

### Debug Mode
Open browser DevTools (F12) to:
- View network requests
- Check console for JavaScript errors
- Inspect element styles
- Test API calls

### Test with Sample Data
```bash
# Create some test jobs in Django admin
python manage.py createsuperuser
# Visit http://localhost:8000/admin/
```

### Monitor API
```javascript
// Add to app.js to log all API calls
console.log('API Call:', method, endpoint, response);
```

## Future Enhancements

Potential features to add:
- [ ] Job search/filter
- [ ] Save evaluations
- [ ] Export results as PDF
- [ ] Comparison between multiple resumes
- [ ] Interview prep recommendations
- [ ] Salary information
- [ ] Company reviews
- [ ] Application tracking
- [ ] Resume templates
- [ ] Skill recommendations

## License

Part of the Smart Resume Evaluator project.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Django and browser console logs
3. Verify all dependencies are installed
4. Check API endpoint responses in DevTools
