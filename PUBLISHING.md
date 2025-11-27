# Publishing Guide

## ✅ Pre-flight Checklist

The package is ready for npm publishing! All files have been prepared:

### Created Files
- ✅ `LICENSE` - MIT license
- ✅ `CHANGELOG.md` - Version history and changelog
- ✅ `.npmignore` - Excludes development files from package
- ✅ `README.md` - Comprehensive end-to-end documentation (updated)
- ✅ `package.json` - Updated with publishing metadata

### Package Configuration

**Package name**: `@kubiya/control-plane-mcp-server`
**Version**: `1.0.0`
**Binary**: `kubiya-mcp`
**License**: MIT
**Scope**: `@kubiya` (public)

### Package Contents

The package includes:
- `build/` - Compiled TypeScript (JS + declaration files)
- `config/` - Environment profiles (dev, staging, prod)
- `README.md` - Documentation
- `LICENSE` - MIT license
- `CHANGELOG.md` - Version history

**Package size**: ~200KB (gzipped: ~50KB)

### Excluded from Package

The following files are excluded via `.npmignore`:
- Source TypeScript files (`src/`)
- Test files (`tests/`, `*.test.ts`, `*.spec.ts`)
- Development scripts (`test-*.mjs`)
- Configuration files (`.eslintrc`, `tsconfig.json`, etc.)
- IDE and environment files (`.vscode/`, `.env`, etc.)

## 📦 Publishing Steps

### 1. Prerequisites

```bash
# Ensure you're logged into npm
npm whoami

# If not logged in
npm login
```

### 2. Pre-publish Validation

```bash
# Clean build
rm -rf build/
npm run build

# Type check
npm run type-check

# Verify package contents
npm publish --dry-run

# Test installation locally
npm pack
npm install -g kubiya-control-plane-mcp-server-1.0.0.tgz
kubiya-mcp --help
npm uninstall -g @kubiya/control-plane-mcp-server
```

### 3. Publish to npm

```bash
# Dry run first (see what will be published)
npm publish --dry-run

# Actual publish
npm publish

# Verify published package
npm view @kubiya/control-plane-mcp-server
```

### 4. Post-publish

```bash
# Test installation from npm
npm install -g @kubiya/control-plane-mcp-server
kubiya-mcp --help

# Verify npx works
npx @kubiya/control-plane-mcp-server --help
```

### 5. Create GitHub Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0: Initial production release"
git push origin v1.0.0

# Create GitHub release
# Go to: https://github.com/kubiyabot/agent-control-plane/releases/new
# - Tag: v1.0.0
# - Title: v1.0.0 - Initial Production Release
# - Description: Copy from CHANGELOG.md
```

## 🔄 Version Updates (Future Releases)

### Patch Release (1.0.1)

For bug fixes:

```bash
# Update version
npm version patch

# Update CHANGELOG.md with changes

# Publish
npm publish
```

### Minor Release (1.1.0)

For new features (backwards compatible):

```bash
# Update version
npm version minor

# Update CHANGELOG.md with changes

# Publish
npm publish
```

### Major Release (2.0.0)

For breaking changes:

```bash
# Update version
npm version major

# Update CHANGELOG.md with breaking changes

# Publish
npm publish
```

## 📊 Package Verification

After publishing, verify these work:

### Installation Methods
```bash
# Global install
npm install -g @kubiya/control-plane-mcp-server
kubiya-mcp --help

# npx (no install)
npx @kubiya/control-plane-mcp-server --help

# Local install
npm install @kubiya/control-plane-mcp-server
```

### Integration Tests
```bash
# Claude Desktop
# Add to claude_desktop_config.json and restart Claude

# MCP Inspector
npx @modelcontextprotocol/inspector npx @kubiya/control-plane-mcp-server
```

### Documentation Links
- npm page: https://www.npmjs.com/package/@kubiya/control-plane-mcp-server
- GitHub: https://github.com/kubiyabot/agent-control-plane/tree/main/mcp-server
- Issues: https://github.com/kubiyabot/agent-control-plane/issues

## 🚨 Troubleshooting

### "Package not found" after publishing

Wait 5-10 minutes for npm's CDN to propagate the package globally.

### "Permission denied" during publish

Ensure you have publish access to the `@kubiya` scope:
```bash
npm access list packages @kubiya
```

Contact npm org admin if needed.

### Binary not working after install

Ensure the shebang is correct in `build/index.js`:
```bash
head -1 build/index.js
# Should show: #!/usr/bin/env node
```

### Package size too large

Current package size is ~200KB which is reasonable. If it grows:
1. Check `.npmignore` excludes source files
2. Verify only `build/` and essential files are included
3. Use `npm pack` to inspect tarball contents

## 📝 Release Checklist

Before each release:

- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version updated in `package.json`
- [ ] `CHANGELOG.md` updated with changes
- [ ] README reflects new features
- [ ] Dry run succeeds (`npm publish --dry-run`)
- [ ] Local install test passes
- [ ] Git committed and pushed
- [ ] Git tag created
- [ ] Published to npm
- [ ] GitHub release created
- [ ] Installation verified from npm
- [ ] Documentation updated

## 🎯 Success Criteria

The package is ready when:

1. ✅ `npm publish --dry-run` succeeds without errors
2. ✅ All required files are included (README, LICENSE, CHANGELOG, build/)
3. ✅ Development files are excluded (src/, tests/, etc.)
4. ✅ Binary command works: `npx @kubiya/control-plane-mcp-server`
5. ✅ Package metadata is correct (name, version, description, keywords)
6. ✅ Documentation is comprehensive and accurate
7. ✅ Tests pass
8. ✅ Type checking passes

**Current Status**: ✅ All criteria met - ready to publish!

## 📞 Support

If you encounter issues during publishing:

1. Check npm status: https://status.npmjs.org/
2. Review npm docs: https://docs.npmjs.com/cli/v10/commands/npm-publish
3. Contact npm support: https://www.npmjs.com/support
4. Internal: Reach out to DevOps team

---

**Last Updated**: 2025-01-26
**Package Version**: 1.0.0
**Maintainer**: Kubiya Team
