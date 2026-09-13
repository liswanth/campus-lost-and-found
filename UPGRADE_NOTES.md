# Professional Upgrade Notes

This version upgrades the original Campus Lost & Found application with:

- Layered Express backend structure
- Centralized error responses
- Zod request validation
- Environment validation and strong JWT secret requirement
- API versioning under `/api/v1`
- Helmet security headers
- Authentication rate limiting
- Restricted CORS
- Mongo-style input sanitization
- Server-side image size, MIME and file-signature validation
- Levenshtein + token fuzzy matching
- Weighted match breakdown
- Expanded Jest/Supertest coverage
- GitHub Actions CI
- Production-oriented Dockerfile
- Architecture documentation

## Current deliberate scope

JWT access tokens are short-lived (15 minutes), but refresh-token rotation is not included in this upgrade. A future version can add secure refresh-token rotation using HTTP-only cookies.

The image matcher is intentionally not included yet. Perceptual hashing can be added later if image-based matching becomes a project requirement.
