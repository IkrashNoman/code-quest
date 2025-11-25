from django.core.management.base import BaseCommand
from main.models import JobPosting
import random

class Command(BaseCommand):
    help = 'Generate random test job postings'

    def handle(self, *args, **options):
        jobs_data = [
            {
                'title': 'Senior Python Developer',
                'location': 'Remote',
                'required_skills': 'Python, Django, REST API, PostgreSQL, Docker, Git',
                'description': '''We are looking for an experienced Python developer to join our team.

Responsibilities:
- Develop and maintain Python/Django applications
- Design and implement REST APIs
- Optimize database queries and performance
- Collaborate with frontend developers
- Write clean, maintainable code
- Participate in code reviews

Requirements:
- 5+ years of Python experience
- Strong knowledge of Django framework
- PostgreSQL database experience
- Docker and containerization knowledge
- Git version control
- REST API design principles
- Excellent communication skills
- Problem-solving mindset

Nice to have:
- AWS or cloud platform experience
- CI/CD pipeline knowledge
- React or frontend framework knowledge
- Machine learning basics'''
            },
            {
                'title': 'Frontend Developer',
                'location': 'New York, NY',
                'required_skills': 'JavaScript, React, CSS, HTML, Redux, Git',
                'description': '''Join our frontend team and build amazing user experiences.

Responsibilities:
- Develop responsive web applications with React
- Create reusable UI components
- Implement state management with Redux
- Optimize performance and user experience
- Write unit and integration tests
- Collaborate with UX/UI designers

Requirements:
- 3+ years of JavaScript experience
- Strong React knowledge
- CSS and HTML expertise
- Redux or similar state management
- Git and GitHub workflow
- Responsive design principles
- Testing libraries (Jest, React Testing Library)
- Browser developer tools proficiency

Nice to have:
- TypeScript experience
- Next.js or similar framework
- Web accessibility (WCAG)
- Performance optimization
- SEO knowledge'''
            },
            {
                'title': 'Full Stack Engineer',
                'location': 'San Francisco, CA',
                'required_skills': 'Python, JavaScript, React, Django, PostgreSQL, Docker',
                'description': '''We seek a talented full-stack engineer to build scalable web applications.

Responsibilities:
- Design and develop full-stack features
- Build robust backend APIs
- Create intuitive frontend interfaces
- Manage databases and optimize queries
- Deploy and maintain applications
- Mentor junior developers

Requirements:
- 4+ years of full-stack development
- Python backend experience (Django/Flask)
- Modern frontend framework (React/Vue)
- Database design and optimization
- Docker and containerization
- RESTful API design
- Agile development experience

Nice to have:
- Cloud platform experience (AWS/GCP/Azure)
- Microservices architecture
- GraphQL knowledge
- DevOps practices
- CI/CD implementation'''
            },
            {
                'title': 'DevOps Engineer',
                'location': 'Remote',
                'required_skills': 'Docker, Kubernetes, AWS, Git, CI/CD, Linux',
                'description': '''Help us build and maintain scalable infrastructure.

Responsibilities:
- Set up and maintain CI/CD pipelines
- Manage containerized applications
- Deploy to cloud platforms
- Monitor system performance
- Implement infrastructure as code
- Troubleshoot infrastructure issues

Requirements:
- 3+ years of DevOps experience
- Docker and Kubernetes expertise
- AWS or similar cloud platform
- Linux system administration
- CI/CD tools (Jenkins, GitLab CI, etc.)
- Infrastructure as Code (Terraform, Ansible)
- Monitoring and logging tools
- Python or Bash scripting

Nice to have:
- Multi-cloud experience
- Kubernetes advanced topics
- Container security
- Cost optimization
- Disaster recovery planning'''
            },
            {
                'title': 'Data Engineer',
                'location': 'Boston, MA',
                'required_skills': 'Python, SQL, Spark, Hadoop, ETL, Git',
                'description': '''Build data pipelines and analytics infrastructure.

Responsibilities:
- Design and implement data pipelines
- Create ETL workflows
- Optimize database queries
- Build data warehouses
- Develop data visualization tools
- Ensure data quality

Requirements:
- 4+ years of data engineering
- Python and SQL expertise
- Apache Spark experience
- ETL pipeline development
- Data warehouse design
- Big Data tools and technologies
- Performance optimization
- Git version control

Nice to have:
- Machine learning knowledge
- Real-time streaming (Kafka)
- Cloud data platforms
- Data modeling
- BI tools experience'''
            },
            {
                'title': 'Machine Learning Engineer',
                'location': 'Remote',
                'required_skills': 'Python, TensorFlow, Scikit-learn, PyTorch, SQL',
                'description': '''Develop intelligent systems and ML models.

Responsibilities:
- Build and train machine learning models
- Implement computer vision solutions
- Natural language processing tasks
- Model optimization and deployment
- Evaluate model performance
- Collaborate with data scientists

Requirements:
- 3+ years of ML experience
- Python programming expertise
- TensorFlow or PyTorch experience
- Scikit-learn and ML libraries
- SQL database knowledge
- Statistics and mathematics
- Model evaluation techniques
- Git and code versioning

Nice to have:
- Deep learning experience
- NLP experience
- Computer vision knowledge
- Model deployment experience
- Cloud ML platforms'''
            },
            {
                'title': 'Junior Software Developer',
                'location': 'Remote',
                'required_skills': 'JavaScript, Python, Git, HTML, CSS',
                'description': '''Start your software development career with us.

Responsibilities:
- Develop features under mentorship
- Write clean and maintainable code
- Participate in code reviews
- Learn best practices
- Fix bugs and issues
- Contribute to team projects

Requirements:
- JavaScript or Python knowledge
- HTML and CSS basics
- Git version control
- Problem-solving skills
- Willingness to learn
- Communication skills
- Team collaboration ability

Nice to have:
- Web development experience
- Computer science degree
- Personal projects or portfolio
- Open source contributions
- Testing knowledge'''
            },
            {
                'title': 'QA Engineer',
                'location': 'Chicago, IL',
                'required_skills': 'Selenium, Python, SQL, Test Management, Git',
                'description': '''Ensure quality and reliability of our products.

Responsibilities:
- Design and execute test plans
- Automate test scenarios
- Report and track bugs
- Performance testing
- Regression testing
- Collaborate with developers

Requirements:
- 2+ years of QA experience
- Selenium or similar automation tools
- Python or JavaScript for automation
- SQL database knowledge
- Test management tools
- Manual and automated testing
- Bug tracking systems
- Git version control

Nice to have:
- CI/CD integration
- Performance testing tools
- API testing knowledge
- Load testing experience
- Test framework development'''
            },
        ]

        created_count = 0
        for job_data in jobs_data:
            job, created = JobPosting.objects.get_or_create(
                title=job_data['title'],
                defaults={
                    'location': job_data['location'],
                    'required_skills': job_data['required_skills'],
                    'description': job_data['description']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {job.title}'))
            else:
                self.stdout.write(f'Already exists: {job.title}')

        self.stdout.write(self.style.SUCCESS(f'\nTotal created: {created_count} jobs'))
