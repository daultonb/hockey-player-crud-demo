"""
Scheduled database restoration service.

This script runs a background scheduler that automatically restores
the database to fresh NHL data on a weekly basis.

Usage:
    python scheduled_restore.py

Configuration:
    - Runs every Sunday at 2:00 AM by default
    - Can be customized via environment variables
"""

import logging
import os
import signal
import sys
from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from restore_database import restore_database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('database_restore.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Configuration from environment variables or defaults
RESTORE_DAY = os.getenv('RESTORE_DAY', 'sun')  # Day of week (mon-sun)
RESTORE_HOUR = int(os.getenv('RESTORE_HOUR', '2'))  # Hour (0-23)
RESTORE_MINUTE = int(os.getenv('RESTORE_MINUTE', '0'))  # Minute (0-59)


def scheduled_restore_job():
    """
    Job function that runs the database restoration.
    Logs the execution time and result.
    """
    logger.info("="  * 60)
    logger.info("SCHEDULED DATABASE RESTORATION TRIGGERED")
    logger.info(f"Execution time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)

    try:
        success = restore_database()

        if success:
            logger.info("Scheduled database restoration completed successfully")
        else:
            logger.error("Scheduled database restoration failed")

        return success

    except Exception as e:
        logger.error(f"Error during scheduled restoration: {str(e)}", exc_info=True)
        return False


def signal_handler(signum, frame):
    """
    Handle termination signals gracefully.
    """
    logger.info(f"Received signal {signum}. Shutting down scheduler...")
    sys.exit(0)


def main():
    """
    Main function to set up and run the scheduler.
    """
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    logger.info("="  * 60)
    logger.info("AUTOMATED DATABASE RESTORATION SCHEDULER")
    logger.info("="  * 60)
    logger.info(f"Schedule: Every {RESTORE_DAY.upper()} at {RESTORE_HOUR:02d}:{RESTORE_MINUTE:02d}")
    logger.info("="  * 60)

    # Create scheduler
    scheduler = BlockingScheduler()

    # Add weekly restoration job
    scheduler.add_job(
        scheduled_restore_job,
        trigger=CronTrigger(
            day_of_week=RESTORE_DAY,
            hour=RESTORE_HOUR,
            minute=RESTORE_MINUTE
        ),
        id='weekly_database_restore',
        name='Weekly Database Restoration',
        replace_existing=True
    )

    logger.info("Scheduler started. Waiting for scheduled jobs...")
    logger.info("Press Ctrl+C to stop the scheduler")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped by user")


if __name__ == "__main__":
    main()
