# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The Kubiya team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@kubiya.ai**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

After you submit a report:

1. We will acknowledge receipt of your vulnerability report
2. We will investigate and validate the vulnerability
3. We will work on a fix and coordinate a release timeline with you
4. Once the vulnerability is fixed, we will publicly disclose it (with credit to you, if desired)

## Security Best Practices

When using the Kubiya MCP Server:

### API Keys

- **Never commit API keys** to version control
- Store API keys in environment variables or secure secret management systems
- Rotate API keys regularly
- Use separate keys for different environments (dev, staging, prod)
- Revoke unused or compromised keys immediately

### Network Security

- Use HTTPS for all API communications
- Configure firewall rules to allow only necessary outbound connections
- Monitor for unusual API traffic patterns
- Implement rate limiting where appropriate

### Access Control

- Follow the principle of least privilege
- Use tool whitelisting via `MCP_ALLOWED_TOOLS` environment variable
- Regularly audit tool access and permissions
- Restrict access to production environments

### Configuration

- Review and validate all configuration before deployment
- Use profile-specific configurations (dev, staging, prod)
- Enable appropriate logging levels
- Monitor logs for suspicious activity

### Dependencies

- Keep dependencies up to date
- Regularly check for security vulnerabilities: `npm audit`
- Use `npm audit fix` to apply patches automatically
- Review dependency changes before updating

### Deployment

- Use secure deployment practices
- Implement CI/CD security scanning
- Perform security testing before releases
- Have an incident response plan ready

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed and a fix is available. Users will be notified through:

- GitHub Security Advisories
- Release notes
- Email notifications (for registered users)

## Bug Bounty Program

At this time, we do not have a formal bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities to us.

## Third-Party Security

This project relies on several third-party dependencies. We monitor security advisories for these dependencies and will update them promptly when security issues are identified.

Key dependencies:
- `@modelcontextprotocol/sdk` - Official MCP SDK
- `axios` - HTTP client
- `eventsource` - Server-sent events client
- `zod` - Schema validation

## Additional Resources

- [Kubiya Security Documentation](https://docs.kubiya.ai/security)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

## Contact

For any security-related questions or concerns:
- **Email**: security@kubiya.ai
- **General Support**: support@kubiya.ai
- **Website**: https://kubiya.ai

Thank you for helping keep Kubiya MCP Server and our users safe!
