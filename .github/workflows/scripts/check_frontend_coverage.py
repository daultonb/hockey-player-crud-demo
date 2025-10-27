#!/usr/bin/env python3
"""
Frontend coverage threshold checker for CI/CD pipeline.
Ensures frontend test coverage meets minimum requirements.
"""

import json
import sys
from pathlib import Path


def check_frontend_coverage_threshold():
    """Check that frontend test coverage meets the minimum threshold."""
    coverage_file = Path("frontend/coverage/coverage-summary.json")

    if not coverage_file.exists():
        print("❌ No coverage-summary.json file found")
        return False

    try:
        with open(coverage_file, 'r') as f:
            data = json.load(f)

        # Get overall coverage metrics
        total = data.get('total', {})
        lines = total.get('lines', {})
        coverage = lines.get('pct', 0)

        threshold = 90.0
        print(f'📊 Frontend total line coverage: {coverage:.1f}%')

        if coverage < threshold:
            print(f'❌ Coverage {coverage:.1f}% is below {threshold}% threshold')
            return False
        else:
            print(f'✅ Coverage {coverage:.1f}% meets {threshold}% threshold')
            return True

    except Exception as e:
        print(f'❌ Error checking frontend coverage: {e}')
        return False


def main():
    """Main frontend coverage check function."""
    print("📊 Checking frontend test coverage threshold...")

    if check_frontend_coverage_threshold():
        print("✅ Frontend coverage check passed!")
        sys.exit(0)
    else:
        print("❌ Frontend coverage check failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
