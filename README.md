# Job Match API

A small Express and MongoDB API for transparent, rule-based job recommendations.

## Run locally

Use Node.js 20+ and a running MongoDB instance.

```bash
copy .env.example .env
npm install
npm run dev
```

The API starts at `http://localhost:3000`. Run the scorer tests with `npm test`.

## Run with Docker

```bash
docker compose up --build
```

This starts the API and MongoDB. The API is available at `http://localhost:3000`.

## API

Create a candidate with `POST /candidates`.

```json
{
  "name": "Asha Rao",
  "skills": ["JavaScript", "React", "MongoDB"],
  "yearsOfExperience": 3,
  "location": "Bengaluru",
  "expectedSalary": 1200000
}
```

Create a job with `POST /jobs`.

```json
{
  "title": "Full Stack Developer",
  "requiredSkills": [
    { "name": "JavaScript", "type": "must-have" },
    { "name": "MongoDB", "type": "nice-to-have" }
  ],
  "minYearsExperience": 3,
  "location": "Bengaluru",
  "salaryRange": { "min": 1000000, "max": 1600000 },
  "remoteAllowed": true
}
```

Get a candidate's ranked jobs with `GET /candidates/:id/recommendations?limit=10`.

Get a job's ranked candidates with `GET /jobs/:id/recommendations?limit=10`.

`limit` defaults to 10 and accepts positive integers through 100. Each recommendation contains the matching record, total `score`, and a category `breakdown`.

## Scoring

The total is 100 points.

| Category | Points | Formula |
| --- | ---: | --- |
| Skills | 50 | Missing any must-have skill removes the job entirely. With must-haves present, meeting them earns 35 points and nice-to-have matches share the remaining 15. A job with no must-haves scores its nice-to-have matches proportionally across all 50 points. A job with no listed skills gets 50. |
| Experience | 20 | At or above the minimum gets 20. Below it receives `20 × candidate years / required years`. |
| Location | 15 | Exact location gets 15; a non-exact location with remote work gets 9; otherwise 0. |
| Salary | 15 | An expected salary at or below the job minimum gets 15. Within the range, the score declines linearly to 0 at the job maximum. |

Skills account for half the score because they are the clearest indicator that someone can do the work. The must-have filter expresses genuinely non-negotiable requirements, while nice-to-haves provide a smaller differentiator. Experience is useful but imperfect, so it is penalized instead of excluding someone who may have equivalent capability. Location and salary meaningfully affect an offer, but should not outweigh suitability for the role. Exact location receives more credit than remote because it generally has fewer collaboration constraints.

## Assumptions

- Salary values are annual amounts in a shared currency.
- `expectedSalary` is one target amount rather than a range.
- Skills and locations match case-insensitively after trimming whitespace.
- Recommendations are ranked in memory after reading the collection. That is appropriate for this small API, but not for a large dataset.

## With more time

- Add pagination, update/read endpoints, database indexes, and integration tests against a disposable MongoDB instance.
- Support candidate salary ranges and configurable weights per request or tenant.
- Filter likely-ineligible jobs in MongoDB before scoring, then add rate limiting and request logging.

## AI usage

AI was used to help with project structure and test-case ideas. The scoring choices, route behavior, validation rules, README wording, and final code were reviewed and edited for this project.
