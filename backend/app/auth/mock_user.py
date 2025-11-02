"""
Mock user for basic authentication.
In production, replace with database users.
"""


# Mock user database (in production, use database)
# Passwords: admin123 and maria123
MOCK_USERS = {
    "admin": {
        "username": "admin",
        "email": "admin@restaurantes.com",
        "password": "admin123",  # Plain password for now (will hash on demand)
        "full_name": "Administrator",
        "user_id": 1,
        "is_active": True,
    },
    "maria": {
        "username": "maria",
        "email": "maria@restaurantes.com",
        "password": "maria123",  # Plain password for now (will hash on demand)
        "full_name": "Maria Silva",
        "user_id": 2,
        "is_active": True,
    },
}


def authenticate_user(username: str, password: str) -> dict | None:
    """
    Authenticate user with username and password.

    Args:
        username: Username
        password: Plain text password

    Returns:
        User dict if authenticated, None otherwise
    """
    user = MOCK_USERS.get(username)
    if not user:
        return None

    if not user["is_active"]:
        return None

    # Simple password comparison for mock users
    # In production, use proper password hashing
    if password != user["password"]:
        return None

    # Return user without password
    return {
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "user_id": user["user_id"],
    }
