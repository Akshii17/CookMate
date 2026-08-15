import base64
import os
import re
import uuid

import httpx

DATA_URL_PATTERN = re.compile(
    r"^data:(?P<mime>[\w/+.-]+);base64,(?P<data>.+)$",
    re.DOTALL,
)

# returns the Supabase project URL
def get_supabase_url() -> str | None:
    configured = os.getenv("SUPABASE_URL")
    if configured:
        return configured.rstrip("/")

    database_url = os.getenv("DATABASE_URL", "")
    match = re.search(r"@db\.([a-z0-9]+)\.supabase\.co", database_url)
    if match:
        return f"https://{match.group(1)}.supabase.co"

    return None

# returns the bucket name, default is avatars
def get_avatar_bucket() -> str:
    return os.getenv("SUPABASE_AVATAR_BUCKET", "avatars")

#Builds the HTTP headers needed to authenticate an upload to Supabase Storage, handling old vs. new key formats.
def _storage_headers(service_key: str, content_type: str) -> dict[str, str]:
    headers = {
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    # New Supabase secret keys (sb_secret_...) must use the apikey header.
    # Sending them as Authorization: Bearer causes "Invalid Compact JWS".
    if service_key.startswith("sb_secret_") or service_key.startswith("sb_publishable_"):
        headers["apikey"] = service_key
    else:
        headers["Authorization"] = f"Bearer {service_key}"
        headers["apikey"] = service_key

    return headers

# Converts a stored avatar path into a full public Supabase Storage URL, or returns an existing URL unchanged
def resolve_profile_picture_url(stored_value: str | None) -> str | None:
    if not stored_value:
        return None

    trimmed = stored_value.strip()
    if not trimmed:
        return None

    if trimmed.startswith("http://") or trimmed.startswith("https://"):
        return trimmed

    supabase_url = get_supabase_url()
    if not supabase_url:
        return None

    bucket = get_avatar_bucket()
    object_path = trimmed.lstrip("/")
    return f"{supabase_url}/storage/v1/object/public/{bucket}/{object_path}"

# Decodes a base64 data URL, uploads the image to the user's Supabase Storage folder with a unique filename, and returns the stored object path
def upload_avatar_to_supabase(user_id: int, data_url: str) -> str | None:
    supabase_url = get_supabase_url()
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    bucket = get_avatar_bucket()

    if not supabase_url or not service_key:
        return None

    match = DATA_URL_PATTERN.match(data_url.strip())
    if not match:
        return None

    mime_type = match.group("mime")
    extension = mime_type.split("/")[-1].replace("jpeg", "jpg")
    file_bytes = base64.b64decode(match.group("data"))
    object_path = f"{user_id}/{uuid.uuid4()}.{extension}"

    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{object_path}"
    response = httpx.post(
        upload_url,
        headers=_storage_headers(service_key, mime_type),
        content=file_bytes,
        timeout=30.0,
    )

    if response.status_code not in (200, 201):
        return None

    return object_path
