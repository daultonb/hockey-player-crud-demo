# Database Restoration Guide

This guide explains how to restore the database to fresh NHL player data, both manually and through automated scheduling.

## Overview

The restoration system provides two approaches:
1. **Manual Restoration** - Run on-demand to reset the database
2. **Automated Scheduling** - Periodic automatic restoration (e.g., weekly)

## Manual Restoration

### Quick Start

To manually restore the database to fresh state:

```bash
cd backend
python restore_database.py
```

### What Happens

The restoration script performs the following steps:
1. Drops all existing database tables
2. Recreates the schema from SQLAlchemy models
3. Populates the database with fresh NHL player data from `nhl_team_data/` JSON files

### When to Use

- After testing with modified/corrupted data
- Before demonstrations or deployments
- When you need a clean slate with original NHL data

## Automated Scheduling

### Setup

The scheduler runs as a background service that automatically restores the database on a weekly basis.

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt  # Includes APScheduler
```

#### Start the Scheduler

```bash
python scheduled_restore.py
```

### Default Schedule

By default, the database is restored every **Sunday at 2:00 AM**.

### Custom Schedule

Configure the schedule using environment variables:

```bash
# Restore every Monday at 3:30 AM
export RESTORE_DAY=mon
export RESTORE_HOUR=3
export RESTORE_MINUTE=30
python scheduled_restore.py
```

#### Available Days
- `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`

#### Time Format
- `RESTORE_HOUR`: 0-23 (24-hour format)
- `RESTORE_MINUTE`: 0-59

### Logs

The scheduler creates a log file `database_restore.log` that tracks:
- Scheduled execution times
- Restoration success/failure status
- Any errors encountered

View logs in real-time:
```bash
tail -f database_restore.log
```

## Deployment Configurations

### Production Deployment

For production environments, run the scheduler as a background service.

#### Using systemd (Linux)

Create `/etc/systemd/system/db-restore.service`:

```ini
[Unit]
Description=Hockey Player Database Restoration Scheduler
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/hockey-player-crud-demo/backend
Environment="RESTORE_DAY=sun"
Environment="RESTORE_HOUR=2"
Environment="RESTORE_MINUTE=0"
ExecStart=/path/to/venv/bin/python scheduled_restore.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable db-restore
sudo systemctl start db-restore
sudo systemctl status db-restore
```

#### Using Docker

Add to `docker-compose.yml`:

```yaml
services:
  db-restore-scheduler:
    build: ./backend
    command: python scheduled_restore.py
    environment:
      - RESTORE_DAY=sun
      - RESTORE_HOUR=2
      - RESTORE_MINUTE=0
      - DATABASE_URL=postgresql://user:password@db:5432/hockey_players
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./backend:/app
      - restore-logs:/app/logs
```

#### Using Cron (Alternative)

Add to crontab for weekly Sunday 2 AM restoration:

```bash
0 2 * * 0 cd /path/to/backend && /path/to/venv/bin/python restore_database.py >> /path/to/logs/restore.log 2>&1
```

### Cloud Deployments

#### Heroku

Use Heroku Scheduler add-on:
1. Add Heroku Scheduler to your app
2. Create a daily job: `python restore_database.py`
3. Set to run weekly on Sundays

#### AWS

Use EventBridge (CloudWatch Events):
1. Create Lambda function with restoration script
2. Set cron expression: `cron(0 2 ? * SUN *)`
3. Connect to RDS database

#### Vercel/Netlify

Use Vercel Cron or external services:
1. Deploy restoration script as serverless function
2. Configure cron schedule in `vercel.json`
3. Or use external cron services like EasyCron

## Monitoring and Alerts

### Check Restoration Status

```bash
# View last 20 restoration logs
tail -20 database_restore.log

# Check for errors
grep "ERROR" database_restore.log

# Verify last successful restoration
grep "COMPLETED SUCCESSFULLY" database_restore.log | tail -1
```

### Email Notifications (Optional)

Extend `scheduled_restore_job()` in `scheduled_restore.py` to send email alerts:

```python
import smtplib
from email.message import EmailMessage

def send_notification(success, message):
    msg = EmailMessage()
    msg['Subject'] = f"Database Restoration {'Success' if success else 'Failed'}"
    msg['From'] = 'noreply@yourdomain.com'
    msg['To'] = 'admin@yourdomain.com'
    msg.set_content(message)

    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.starttls()
        smtp.login('your-email', 'your-password')
        smtp.send_message(msg)
```

## Troubleshooting

### Common Issues

**Issue: Permission denied**
```bash
chmod +x restore_database.py scheduled_restore.py
```

**Issue: Database locked**
- Ensure no other processes are using the database
- Stop the FastAPI server before manual restoration

**Issue: Missing NHL data files**
- Verify `nhl_team_data/*.json` files exist
- Re-run `nhl_data_fetcher.py` if needed

**Issue: Scheduler not running**
- Check logs for errors
- Verify Python path and dependencies
- Ensure sufficient permissions

### Recovery

If restoration fails:
1. Check error logs in `database_restore.log`
2. Verify database connection in `.env`
3. Manually inspect database state
4. Re-run `populate_db.py` if needed

## Best Practices

1. **Backup First**: Always backup before manual restoration in production
2. **Off-Peak Hours**: Schedule during low-traffic periods (e.g., 2-4 AM)
3. **Monitor Logs**: Regularly check restoration logs
4. **Test Schedule**: Verify scheduling works in staging before production
5. **Notifications**: Set up alerts for failed restorations
6. **Version Control**: Keep NHL data files in version control

## Support

For issues or questions:
- Check logs in `database_restore.log`
- Review this guide
- Contact the development team
