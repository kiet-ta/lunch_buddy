from core import security

def test_password_hashing():
    password = "secret_password"
    hashed = security.get_password_hash(password)
    assert security.verify_password(password, hashed)
    assert not security.verify_password("wrong_password", hashed)

def test_access_token_creation():
    token = security.create_access_token(subject=123)
    assert isinstance(token, str)
    assert len(token) > 0
