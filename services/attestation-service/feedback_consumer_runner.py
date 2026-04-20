#!/usr/bin/env python
"""
Entry point for the Attestation Service Feedback Consumer
Run with: python manage.py shell < feedback_consumer_runner.py
Or directly: python feedback_consumer_runner.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "attestation_service.settings")

# Add the app directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Initialize Django
django.setup()

# Now import after Django is set up
from app.services.feedback_created_consumer import FeedbackCreatedConsumer

if __name__ == "__main__":
    print("[*] Starting Attestation Service Feedback Consumer...")
    try:
        consumer = FeedbackCreatedConsumer()
        consumer.start()
    except KeyboardInterrupt:
        print("\n[*] Consumer stopped by user")
    except Exception as e:
        print(f"[!] Fatal error: {e}")
        sys.exit(1)
