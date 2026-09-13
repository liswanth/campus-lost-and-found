# Campus Lost & Found — Architecture

## Overview

```text
React + Vite
    |
    | REST / JSON + multipart image upload
    v
Express API (/api/v1)
    |
    +--> Middleware
    |     - Helmet
    |     - Restricted CORS
    |     - Mongo sanitization
    |     - Authentication
    |     - Zod validation
    |     - Multer upload limits
    |
    +--> Routes
    |     |
    |     +--> Controllers
    |             |
    |             +--> Services
    |             |      +--> Cloudinary
    |             |      +--> Matching engine
    |             |
    |             +--> Mongoose Models
    |
    +--> Central Error Handler
    |
    +--> MongoDB Atlas
```

## Backend layers

- `routes/`: maps HTTP endpoints to middleware and controllers.
- `controllers/`: handles HTTP request/response behavior.
- `services/`: reusable business operations such as image upload.
- `validators/`: Zod schemas for request validation.
- `models/`: MongoDB/Mongoose schemas and indexes.
- `middleware/`: authentication, validation and centralized errors.
- `utils/`: matching algorithm, async wrapper and application errors.

## Matching pipeline

The matching engine combines:

- Levenshtein character similarity
- Token/Jaccard similarity
- Exact category matching
- Date proximity

Weights:

| Signal | Weight |
|---|---:|
| Name | 40% |
| Category | 20% |
| Location | 15% |
| Description | 15% |
| Date | 10% |

The API returns both the overall score and a per-signal breakdown.

## Security boundaries

Authentication is enforced server-side. Ownership filters use both the resource id and authenticated `userId`, preventing users from editing or deleting another user's report.

Images are limited to 5 MB, restricted to image MIME types, and checked against common image file signatures before Cloudinary upload.

Environment secrets are validated at startup and are never committed to Git.
