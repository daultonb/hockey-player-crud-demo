#!/usr/bin/env python3
"""
Coverage threshold checker for CI/CD pipeline.
Ensures test coverage meets minimum requirements.
"""

import sys
from pathlib import Path


def check_coverage_threshold():
    """Check that test coverage meets the minimum threshold."""
    coverage_file = Path("backend/coverage.xml")

    if not coverage_file.exists():
        print("❌ No coverage.xml file found")
        return False

    try:
        import xml.etree.ElementTree as ET
        tree = ET.parse(coverage_file)
        root = tree.getroot()
        coverage = float(root.attrib['line-rate']) * 100

        threshold = 85.0
        print(f'📊 Total coverage: {coverage:.1f}%')

        if coverage < threshold:
            print(f'❌ Coverage {coverage:.1f}% is below {threshold}% threshold')
            return False
        else:
            print(f'✅ Coverage {coverage:.1f}% meets {threshold}% threshold')
            return True

    except Exception as e:
        print(f'❌ Error checking coverage: {e}')
        return False


def main():
    """Main coverage check function."""
    print("📊 Checking test coverage threshold...")

    if check_coverage_threshold():
        print("✅ Coverage check passed!")
        sys.exit(0)
    else:
        print("❌ Coverage check failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
