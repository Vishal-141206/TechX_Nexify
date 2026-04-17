import json
import os
from typing import Any
from urllib import parse, request


_MOCK_RECORDS = {
    "MH12AB1234": {"owner_count": 1, "registration_year": 2019, "fuel_type": "Petrol"},
    "DL8CAF5031": {"owner_count": 2, "registration_year": 2017, "fuel_type": "Diesel"},
    "KA05MN7788": {"owner_count": 1, "registration_year": 2021, "fuel_type": "Electric"},
}


def fetch_vehicle_data(vehicle_number: str) -> dict[str, Any]:
    normalized_number = (vehicle_number or "").strip().upper()
    if not normalized_number:
        return {"owner_count": None, "registration_year": None, "fuel_type": None, "source": "none"}

    api_url = os.getenv("VEHICLE_VERIFICATION_API_URL")
    if api_url:
        try:
            query = parse.urlencode({"vehicle_number": normalized_number})
            url = f"{api_url}?{query}"
            with request.urlopen(url, timeout=4) as response:
                payload = json.loads(response.read().decode("utf-8"))
            return {
                "owner_count": payload.get("owner_count"),
                "registration_year": payload.get("registration_year"),
                "fuel_type": payload.get("fuel_type"),
                "source": "api",
            }
        except Exception:
            # fall back to mock record
            pass

    record = _MOCK_RECORDS.get(normalized_number)
    if record:
        return {**record, "source": "mock"}

    return {"owner_count": None, "registration_year": None, "fuel_type": None, "source": "mock"}
