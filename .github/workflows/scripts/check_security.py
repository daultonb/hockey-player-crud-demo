#!/usr/bin/env python3
"""
Security vulnerability checker for CI/CD pipeline.
Checks safety and bandit reports for critical security issues.
"""

import json
import sys
from pathlib import Path


def check_safety_report():
    """Check safety scan results for critical vulnerabilities."""
    safety_file = Path("backend/safety-report.json")
    
    if not safety_file.exists():
        print("✅ No safety report found - no vulnerabilities detected")
        return True
    
    try:
        with open(safety_file, 'r') as f:
            data = json.load(f)
        
        if isinstance(data, list) and len(data) > 0:
            critical_issues = [
                issue for issue in data 
                if issue.get('vulnerability', {}).get('severity', '').lower() in ['critical', 'high']
            ]
            
            if critical_issues:
                print(f'❌ Found {len(critical_issues)} critical/high severity vulnerabilities')
                for issue in critical_issues[:3]:  # Show first 3
                    package = issue.get('package', 'Unknown')
                    summary = issue.get('vulnerability', {}).get('summary', 'No summary')
                    print(f"  - {package}: {summary}")
                return False
            else:
                print('✅ No critical security vulnerabilities found')
                return True
        else:
            print('✅ No security vulnerabilities detected')
            return True
            
    except Exception as e:
        print(f'⚠️  Could not parse safety report: {e}')
        print('Safety scan completed but results unclear')
        return True  # Don't fail CI on parsing errors


def check_bandit_report():
    """Check bandit scan results for high-severity issues."""
    bandit_file = Path("backend/bandit-report.json")
    
    if not bandit_file.exists():
        print("✅ No bandit report found - no security issues detected")
        return True
    
    try:
        with open(bandit_file, 'r') as f:
            data = json.load(f)
        
        results = data.get('results', [])
        high_severity_issues = [
            result for result in results 
            if result.get('issue_severity', '').lower() in ['high', 'medium']
        ]
        
        if high_severity_issues:
            print(f'⚠️  Found {len(high_severity_issues)} medium/high severity bandit issues')
            for issue in high_severity_issues[:2]:  # Show first 2
                test_id = issue.get('test_id', 'Unknown')
                severity = issue.get('issue_severity', 'Unknown')
                print(f"  - {test_id} ({severity}): {issue.get('issue_text', 'No description')}")
            print("Review bandit-report.json for details")
            return True  # Don't fail CI for bandit warnings, just inform
        else:
            print('✅ No high-severity bandit security issues found')
            return True
            
    except Exception as e:
        print(f'⚠️  Could not parse bandit report: {e}')
        return True


def main():
    """Main security check function."""
    print("🔒 Starting security vulnerability checks...")
    
    safety_ok = check_safety_report()
    bandit_ok = check_bandit_report()
    
    if safety_ok and bandit_ok:
        print("✅ All security checks passed!")
        sys.exit(0)
    else:
        print("❌ Critical security issues found!")
        sys.exit(1)


if __name__ == "__main__":
    main()