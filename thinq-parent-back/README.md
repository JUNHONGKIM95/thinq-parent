# thinq-parent-back

FastAPI backend starter for the `thinq-parent` project.

## Run

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

## Local Oracle 11g

The local defaults are stored in `.env`.

- host: `localhost`
- port: `1521`
- service name: `XE`
- username: `lghr`
- password: `12345`

If your Oracle 11g instance uses a SID instead of a service name, set `ORACLE_SID` and clear `ORACLE_SERVICE_NAME`.

`python-oracledb` connects to Oracle 11g through thick mode, so set `ORACLE_CLIENT_LIB_DIR` when Oracle Instant Client is not already available on the system `PATH`.

App settings use the `APP_` prefix to avoid collisions with machine-wide environment variables.

## Test

```powershell
pytest
```
