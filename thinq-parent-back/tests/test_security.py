from app.core.security import create_session_token, hash_password, verify_password


def test_hash_and_verify_password() -> None:
    encoded_password = hash_password("secret123")

    assert encoded_password != "secret123"
    assert verify_password("secret123", encoded_password) is True
    assert verify_password("wrong-password", encoded_password) is False


def test_create_session_token_returns_unique_value() -> None:
    first_token = create_session_token()
    second_token = create_session_token()

    assert first_token
    assert second_token
    assert first_token != second_token
