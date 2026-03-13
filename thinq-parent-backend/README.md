
# thinq-parent-backend

Spring Boot REST API scaffold for the `parent_mode` MySQL schema.

## Run

```bash
./gradlew bootRun
```

Default DB connection:

- Database: `parent_mode`
- Username: `LGDX_user`
- Password: `12345`

## API

- `GET /api/v1/health`
- `GET /api/v1/health/db`
- `POST /api/v1/parents`
- `GET /api/v1/parents`
- `GET /api/v1/parents/{id}`
- `PUT /api/v1/parents/{id}`
- `DELETE /api/v1/parents/{id}`
