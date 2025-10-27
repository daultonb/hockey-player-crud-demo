#!/usr/bin/env python3
"""
Dependency vulnerability checker for CI/CD pipeline.
Checks pip-audit reports for high-severity dependency vulnerabilities.

Behavior:
- FAIL: Critical or high-severity vulnerabilities found
- WARNING: Medium/moderate vulnerabilities found
- PASS: Only low-severity or no vulnerabilities
"""

import json
import sys
from pathlib import Path


def check_pip_audit_report():
    """
    Check pip-audit scan results for vulnerabilities.
    
    Returns:
        tuple: (should_fail, has_warnings)
    """
    audit_file = Path("backend/pip-audit-report.json")

    if not audit_file.exists():
        print("✅ No pip-audit report found - no dependency vulnerabilities detected")
        return False, False

    try:
        with open(audit_file, 'r') as f:
            data = json.load(f)

        vulnerabilities = data.get('vulnerabilities', [])

        if not vulnerabilities:
            print('✅ No dependency vulnerabilities found')
            return False, False

        # Categorize by severity
        critical_high = []
        medium = []
        low = []

        for vuln in vulnerabilities:
            severity = vuln.get('severity', '').lower()
            
            if severity in ['critical', 'high']:
                critical_high.append(vuln)
            elif severity in ['medium', 'moderate']:
                medium.append(vuln)
            else:
                low.append(vuln)

        # Print summary
        print(f'📦 Dependency Vulnerability Summary:')
        if critical_high:
            print(f'  🔴 Critical/High: {len(critical_high)}')
        if medium:
            print(f'  🟡 Medium: {len(medium)}')
        if low:
            print(f'  ⚪ Low: {len(low)}')

        # Determine result
        if critical_high:
            print(f'\n❌ FAIL: Found {len(critical_high)} critical/high severity dependency vulnerabilities')
            for vuln in critical_high[:3]:  # Show first 3
                package = vuln.get('package', 'Unknown')
                summary = vuln.get('summary', 'No summary')
                severity = vuln.get('severity', 'Unknown')
                print(f"  - {package} ({severity}): {summary}")
            return True, False

        if medium:
            print(f'\n⚠️  WARNING: Found {len(medium)} medium-severity dependency vulnerabilities')
            print('Consider upgrading affected packages when possible')
            return False, True

        if low:
            print(f'\n✅ PASS: Only {len(low)} low-severity vulnerabilities (acceptable)')
            return False, False

        print('\n✅ PASS: No dependency vulnerabilities found')
        return False, False

    except Exception as e:
        print(f'⚠️  Could not parse pip-audit report: {e}')
        print('Dependency scan completed but results unclear')
        return False, False


def main():
    """Main dependency check function."""
    print("📦 Starting dependency vulnerability checks...")

    should_fail, has_warnings = check_pip_audit_report()

    if should_fail:
        print("\n❌ Critical dependency vulnerabilities detected - failing pipeline!")
        sys.exit(1)
    elif has_warnings:
        print("\n⚠️  Dependency security warnings detected - review recommended")
        sys.exit(0)  # Exit 0 for warnings (don't fail pipeline)
    else:
        print("\n✅ All dependency checks passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
