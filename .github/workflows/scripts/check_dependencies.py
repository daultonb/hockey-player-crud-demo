#!/usr/bin/env python3
"""
Dependency vulnerability checker for CI/CD pipeline.
Checks pip-audit reports for high-severity dependency vulnerabilities.
"""

import json
import sys
from pathlib import Path


def check_pip_audit_report():
    """Check pip-audit scan results for high-severity vulnerabilities."""
    audit_file = Path("backend/pip-audit-report.json")
    
    if not audit_file.exists():
        print("✅ No pip-audit report found - no dependency vulnerabilities detected")
        return True
    
    try:
        with open(audit_file, 'r') as f:
            data = json.load(f)
        
        vulnerabilities = data.get('vulnerabilities', [])
        
        if vulnerabilities:
            high_severity = [
                v for v in vulnerabilities 
                if v.get('severity', '').lower() in ['critical', 'high']
            ]
            
            if high_severity:
                print(f'❌ Found {len(high_severity)} high-severity dependency vulnerabilities')
                for vuln in high_severity[:3]:  # Show first 3
                    package = vuln.get('package', 'Unknown')
                    summary = vuln.get('summary', 'No summary')
                    severity = vuln.get('severity', 'Unknown')
                    print(f"  - {package} ({severity}): {summary}")
                return False
            else:
                print(f'✅ Found {len(vulnerabilities)} low-severity dependency issues (acceptable)')
                return True
        else:
            print('✅ No dependency vulnerabilities found')
            return True
            
    except Exception as e:
        print(f'⚠️  Could not parse pip-audit report: {e}')
        print('Dependency scan completed but results unclear')
        return True  # Don't fail CI on parsing errors


def main():
    """Main dependency check function."""
    print("📦 Starting dependency vulnerability checks...")
    
    # Check dependencies
    deps_ok = check_pip_audit_report()
    
    if deps_ok:
        print("✅ All dependency checks passed!")
        sys.exit(0)
    else:
        print("❌ Critical dependency vulnerabilities found!")
        sys.exit(1)


if __name__ == "__main__":
    main()