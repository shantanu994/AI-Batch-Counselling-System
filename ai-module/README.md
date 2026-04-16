# AI Module (Python Flask)

This service exposes AI-driven batch categorization logic used by the backend.

## Run

1. Create virtual environment and activate it.
2. Install requirements:

```bash
pip install -r requirements.txt
```

3. Start service:

```bash
python app.py
```

The service runs at `http://localhost:5001`.

## Endpoints

- `GET /health`
- `POST /predict`
