
# thinq-parent-backend

Spring Boot REST API scaffold for the `parent_mode` MySQL schema.

## Run

```bash
./gradlew bootRun
```

Swagger UI:

- `http://localhost:8080/swagger-ui.html`
- `http://localhost:8080/v3/api-docs`

Default DB connection:

- Database: `parent_mode`
- Username: `LGDX_user`
- Password: `12345`

## API

- `GET /api/v1/health`
- `GET /api/v1/health/db`
- `POST /api/v1/users`
- `GET /api/v1/users`
- `GET /api/v1/users/{userId}`
- `GET /api/v1/users/{userId}/pregnancy-summary`
- `PUT /api/v1/users/{userId}`
- `DELETE /api/v1/users/{userId}`
- `POST /api/v1/family-groups`
- `GET /api/v1/family-groups`
- `GET /api/v1/family-groups/{groupId}`
- `POST /api/v1/family-groups/join`
- `POST /api/v1/cheer-messages`
- `GET /api/v1/cheer-messages/groups/{groupId}/latest`
- `POST /api/v1/schedules`
- `GET /api/v1/schedules`
- `GET /api/v1/schedules/{scheduleId}`
- `GET /api/v1/schedules/users/{userId}/latest`
- `PUT /api/v1/schedules/{scheduleId}`
- `DELETE /api/v1/schedules/{scheduleId}`
