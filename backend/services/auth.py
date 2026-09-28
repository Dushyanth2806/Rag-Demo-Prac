import os
from fastapi import Header, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

_request = google_requests.Request()

def get_current_user(authorization: str | None = Header(default=None)) -> str:
    """Verify the Google ID token sent as 'Authorization: Bearer <token>'
    and return the user's stable Google account id (used as the Pinecone
    namespace so each user's documents stay isolated)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token. Please sign in.")

    token = authorization.removeprefix("Bearer ").strip()
    client_id = os.getenv("GOOGLE_CLIENT_ID")

    try:
        claims = id_token.verify_oauth2_token(token, _request, client_id)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired sign-in. Please sign in again.") from exc

    return claims["sub"]  # stable, unique Google user id
