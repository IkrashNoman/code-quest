// API Configuration
const API_BASE = '/api';

// State Management
let allJobs = [];
let currentJob = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadJobs();
    setupFormHandlers();
});

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const tabId = tabName === 'jobs' ? 'jobs-tab' : 'evaluate-tab';
    document.getElementById(tabId).classList.add('active');
}

// Load Jobs from API
async function loadJobs() {
    try {
        const response = await fetch(`${API_BASE}/jobs/`);
        if (!response.ok) throw new Error('Failed to load jobs');
        
        const data = await response.json();
        allJobs = data.jobs || [];
        
        renderJobsList();
        populateJobSelect();
    } catch (error) {
        console.error('Error loading jobs:', error);
        showAlert('Failed to load jobs', 'error');
    }
}

// Render Jobs List
function renderJobsList() {
    const container = document.getElementById('jobs-list');
    
    if (allJobs.length === 0) {
        container.innerHTML = '<p class="loading">No job postings available</p>';
        return;
    }
    
    container.innerHTML = allJobs.map(job => `
        <div class="job-card" onclick="openJobModal(${job.id})">
            <h3>${escapeHtml(job.title)}</h3>
            <div class="location">📍 ${escapeHtml(job.location || 'Remote')}</div>
            ${job.required_skills ? `<div class="skills"><strong>Required Skills:</strong> ${escapeHtml(job.required_skills)}</div>` : ''}
            <div class="description">${escapeHtml((job.description || '').substring(0, 150))}...</div>
            <button class="btn btn-primary" onclick="event.stopPropagation(); selectJobForApply(${job.id})">View Details</button>
        </div>
    `).join('');
}

// Populate Job Select Dropdown
function populateJobSelect() {
    const select = document.getElementById('job-select');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Generic Evaluation --</option>' + 
        allJobs.map(job => `<option value="${job.id}">${escapeHtml(job.title)}</option>`).join('');
    
    select.value = currentValue;
    
    // Update job description when job is selected
    select.addEventListener('change', function() {
        const jobId = this.value;
        const jobDesc = document.getElementById('job-description');
        
        if (jobId) {
            const job = allJobs.find(j => j.id == jobId);
            if (job) {
                jobDesc.value = job.description;
            }
        } else {
            jobDesc.value = '';
        }
    });
}

// Job Modal Functions
function openJobModal(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;
    
    currentJob = job;
    document.getElementById('modal-job-title').textContent = job.title;
    document.getElementById('modal-job-location').textContent = job.location || 'Remote';
    document.getElementById('modal-job-skills').textContent = job.required_skills || 'Not specified';
    document.getElementById('modal-job-description').innerHTML = `<p>${escapeHtml(job.description).replace(/\n/g, '<br>')}</p>`;
    
    // Update apply button
    const applyBtn = document.getElementById('apply-btn');
    applyBtn.onclick = function() {
        selectJobForApply(job.id);
    };
    
    document.getElementById('job-modal').classList.remove('hidden');
}

function closeJobModal() {
    document.getElementById('job-modal').classList.add('hidden');
    currentJob = null;
}

function selectJobForApply(jobId) {
    closeJobModal();
    showTab('evaluate');
    document.getElementById('job-select').value = jobId;
    
    // Update job description
    const job = allJobs.find(j => j.id === jobId);
    if (job) {
        document.getElementById('job-description').value = job.description;
    }
    
    // Scroll to form
    document.querySelector('.eval-form').scrollIntoView({ behavior: 'smooth' });
}

// Setup Form Handlers
function setupFormHandlers() {
    const form = document.getElementById('eval-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await evaluateResume();
    });
}

// Evaluate Resume
async function evaluateResume() {
    const name = document.getElementById('candidate-name').value;
    const email = document.getElementById('candidate-email').value;
    const jobId = document.getElementById('job-select').value || null;
    const jobDesc = document.getElementById('job-description').value;
    const resumeFile = document.getElementById('resume-file').files[0];
    
    if (!resumeFile) {
        showAlert('Please select a resume file', 'error');
        return;
    }
    
    if (!jobId && !jobDesc) {
        showAlert('Please select a job or provide a job description', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('candidate_name', name);
        formData.append('candidate_email', email);
        formData.append('resume', resumeFile);
        
        if (jobId) {
            formData.append('job_id', jobId);
        } else {
            formData.append('job_description', jobDesc);
        }
        
        // Show loading state (preserve results DOM and add overlay)
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('hidden');
        // add overlay if not present
        let overlay = resultsSection.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div><p class="loading">Evaluating your resume...</p>';
            resultsSection.prepend(overlay);
        }
        
        const response = await fetch(`${API_BASE}/evaluate_resume/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const result = await response.json();
        displayEvaluationResults(result);
        
    } catch (error) {
        console.error('Error evaluating resume:', error);
        showAlert('Failed to evaluate resume: ' + error.message, 'error');
        document.getElementById('results-section').classList.add('hidden');
    }
}

// Display Evaluation Results
function displayEvaluationResults(result) {
    const resultsSection = document.getElementById('results-section');
    // remove loading overlay if present
    const loadingOverlay = resultsSection.querySelector('.loading-overlay');
    if (loadingOverlay) loadingOverlay.remove();
    
    // Update score
    const score = result.score ? Math.round(result.score) : '--';
    document.getElementById('score-value').textContent = score;
    
    // Determine fit color and update badge
    const fit = result.overall_fit || 'fair';
    const fitBadge = document.getElementById('fit-badge');
    const fitText = document.getElementById('fit-text');
    
    fitBadge.textContent = fit.toUpperCase();
    fitBadge.className = `fit-badge fit-${fit}`;
    fitText.textContent = capitalizeFirst(fit) + ' Match';
    fitText.className = `fit-label fit-${fit}`;
    
    // Update relevant skills
    const relevantContainer = document.getElementById('relevant-skills');
    if (result.relevant_skills && result.relevant_skills.length > 0) {
        relevantContainer.innerHTML = result.relevant_skills
            .map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
            .join('');
    } else {
        relevantContainer.innerHTML = '<p class="no-data">No matching skills found</p>';
    }
    
    // Update missing skills
    const missingContainer = document.getElementById('missing-skills');
    if (result.missing_skills && result.missing_skills.length > 0) {
        missingContainer.innerHTML = result.missing_skills
            .map(skill => `<span class="skill-tag missing">${escapeHtml(skill)}</span>`)
            .join('');
    } else {
        missingContainer.innerHTML = '<p class="no-data">All required skills found</p>';
    }
    
    // Update feedback
    const feedbackBox = document.getElementById('feedback-text');
    feedbackBox.textContent = result.feedback || 'No detailed feedback available';
    
    // Update breakdown
    const breakdownBox = document.getElementById('breakdown-details');
    let breakdownHtml = '';
    
    if (result.structured_assessment) {
        breakdownHtml += `<strong>Method:</strong> ${capitalizeFirst(result.structured_assessment.method || 'unknown')}\n`;
        
        if (result.structured_assessment.heuristic_score !== undefined) {
            breakdownHtml += `<strong>Heuristic Score:</strong> ${Math.round(result.structured_assessment.heuristic_score)}\n`;
        }
        
        if (result.structured_assessment.tfidf_similarity !== undefined) {
            breakdownHtml += `<strong>TF-IDF Similarity:</strong> ${(result.structured_assessment.tfidf_similarity * 100).toFixed(1)}%\n`;
        }
        
        if (result.structured_assessment.breakdown) {
            breakdownHtml += `\n<strong>Detailed Breakdown:</strong>\n${JSON.stringify(result.structured_assessment.breakdown, null, 2)}`;
        }
    } else {
        breakdownHtml = 'No detailed breakdown available';
    }
    
    breakdownBox.innerHTML = `<pre>${escapeHtml(breakdownHtml)}</pre>`;
    
    // Show results section
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Reset Evaluation Form
function resetEval() {
    document.getElementById('eval-form').reset();
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('job-select').value = '';
    document.getElementById('job-description').value = '';
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at top of container
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('job-modal');
    if (event.target == modal) {
        closeJobModal();
    }
});
