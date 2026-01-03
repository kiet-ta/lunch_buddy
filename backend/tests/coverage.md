# Backend Tests

This directory contains the Unit Tests for the Lunch Buddy backend.

## Structure
- `api/`: Tests for API endpoints (Auth, Groups, Expenses).
- `core/`: Tests for core utilities (Security).
- `conftest.py`: Test configuration and fixtures (In-memory DB, TestClient).

## Running Tests

To run the tests with coverage report:

```bash
pytest --cov=api --cov=core --cov=models --cov=schemas tests/
```

## Requirements
- `pytest`
- `pytest-cov`
- `httpx`
