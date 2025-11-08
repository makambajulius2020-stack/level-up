# Smart School Backend - Unified Startup

This directory contains a unified startup system that runs all backend services from a single point.

## Quick Start

### Option 1: Python Script (Recommended)
```bash
cd school/backend
python run.py
```

### Option 2: Windows Batch File
```cmd
cd school/backend
start_all_services.bat
```

### Option 3: PowerShell Script
```powershell
cd school/backend
.\start_all_services.ps1
```

## What This Startup Script Does

The unified `run.py` script automatically:

1. **🔍 Checks Dependencies** - Verifies all required Python packages are installed
2. **🔗 Tests Database Connection** - Ensures MySQL database is accessible
3. **🚀 Starts Main Backend** - Launches the Flask API server
4. **🔧 Starts Additional Services** - Runs schedulers, integrations, etc.
5. **🏥 Performs Health Checks** - Verifies all services are running correctly
6. **📝 Logs Everything** - Creates detailed logs in `backend.log`

## Services Started

- **Main Flask API** (Port 5000/5001)
- **Database Connection** (MySQL)
- **Daily Workflow Scheduler**
- **N8N Integration** (if configured)
- **File Upload Services**
- **Background Task Processors**

## Configuration

### Environment Variables
The script automatically sets:
- `FLASK_ENV=production`
- `FLASK_DEBUG=False`
- `PYTHONPATH` (includes backend directory)

### Port Configuration
- Main API: `http://localhost:5000`
- If port 5000 is busy, automatically tries port 5001
- Health check: `http://localhost:5000/api/health`

## Logging

All startup activities and service status are logged to:
- **Console Output** - Real-time status updates
- **backend.log** - Detailed log file with timestamps

## Troubleshooting

### Common Issues

1. **"Python not found"**
   - Install Python 3.8+ from python.org
   - Add Python to your system PATH

2. **"Database connection failed"**
   - Ensure MySQL server is running
   - Check database credentials in `config.py`
   - Verify database exists

3. **"Port already in use"**
   - Script automatically tries alternative ports
   - Or stop other services using port 5000

4. **"Missing dependencies"**
   - Script automatically installs missing packages
   - Or manually run: `pip install -r requirements.txt`

### Manual Dependency Installation
```bash
pip install -r requirements.txt
```

### Database Setup
```bash
python init_db.py
python create_enhanced_tables.py
```

## API Endpoints

Once running, the following endpoints are available:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users` - Get users
- `GET /api/students` - Get students
- `GET /api/attendance` - Get attendance
- `GET /api/payments` - Get payments
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/teacher/<id>` - Teacher dashboard data
- `GET /api/dashboard/student/<id>` - Student dashboard data

## Stopping Services

- **Ctrl+C** - Gracefully stops all services
- **Close terminal** - All processes are daemon threads and will stop

## Development Mode

For development with auto-reload:
```bash
python run.py --dev
```

## Production Deployment

For production deployment:
```bash
python run.py --production
```

## Support

If you encounter issues:
1. Check the `backend.log` file for detailed error messages
2. Ensure all dependencies are installed
3. Verify database connection
4. Check that no other services are using the required ports

---

**Note**: This unified startup system replaces the need to run multiple backend scripts separately. Everything is now managed from a single point for easier maintenance and deployment.
