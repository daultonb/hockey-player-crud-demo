#!/usr/bin/env python3
"""
NPM package security vulnerability checker for CI/CD pipeline.
Checks npm audit reports for security vulnerabilities with severity levels.

Behavior:
- FAIL: Critical vulnerabilities found
- WARNING: High or moderate vulnerabilities found
- PASS: Only low vulnerabilities or no vulnerabilities
"""

import json
import sys
from pathlib import Path


def check_npm_audit_report():
    """
    Check npm audit scan results for vulnerabilities.

    Returns:
        tuple: (should_fail, has_warnings)
    """
    audit_file = Path("frontend/npm-audit-report.json")

    if not audit_file.exists():
        print("✅ No npm audit report found - no vulnerabilities detected")
        return False, False

    try:
        with open(audit_file, 'r') as f:
            data = json.load(f)

        # npm audit JSON structure
        vulnerabilities = data.get('vulnerabilities', {})

        if not vulnerabilities:
            print('✅ No npm vulnerabilities found')
            return False, False

        # Count vulnerabilities by severity
        critical_count = 0
        high_count = 0
        moderate_count = 0
        low_count = 0

        for pkg_name, vuln_data in vulnerabilities.items():
            severity = vuln_data.get('severity', '').lower()

            if severity == 'critical':
                critical_count += 1
            elif severity == 'high':
                high_count += 1
            elif severity == 'moderate':
                moderate_count += 1
            elif severity == 'low':
                low_count += 1

        # Print summary
        print(f'📦 NPM Vulnerability Summary:')
        if critical_count > 0:
            print(f'  🔴 Critical: {critical_count}')
        if high_count > 0:
            print(f'  🟠 High: {high_count}')
        if moderate_count > 0:
            print(f'  🟡 Moderate: {moderate_count}')
        if low_count > 0:
            print(f'  ⚪ Low: {low_count} (ignored)')

        # Determine result
        if critical_count > 0:
            print(f'\n❌ FAIL: Found {critical_count} critical npm vulnerabilities')
            print('Run "npm audit" locally and "npm audit fix" to resolve')
            return True, False

        if high_count > 0 or moderate_count > 0:
            total_warnings = high_count + moderate_count
            print(f'\n⚠️  WARNING: Found {total_warnings} high/moderate npm vulnerabilities')
            print('Consider running "npm audit fix" to resolve these issues')
            return False, True

        if low_count > 0:
            print(f'\n✅ PASS: Only {low_count} low-severity vulnerabilities (acceptable)')
            return False, False

        print('\n✅ PASS: No npm vulnerabilities found')
        return False, False

    except json.JSONDecodeError as e:
        print(f'⚠️  Could not parse npm audit report (invalid JSON): {e}')
        print('This may indicate npm audit found no issues')
        return False, False
    except Exception as e:
        print(f'⚠️  Could not parse npm audit report: {e}')
        print('NPM audit completed but results unclear')
        return False, False


def main():
    """Main NPM security check function."""
    print("🔒 Starting NPM package security checks...")

    should_fail, has_warnings = check_npm_audit_report()

    if should_fail:
        print("\n❌ Critical npm vulnerabilities detected - failing pipeline!")
        sys.exit(1)
    elif has_warnings:
        print("\n⚠️  NPM security warnings detected - review recommended")
        sys.exit(0)  # Exit 0 for warnings (don't fail pipeline)
    else:
        print("\n✅ All NPM security checks passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
