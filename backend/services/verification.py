import hashlib
import json
import os
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse
from urllib.request import Request, urlopen

FUEL_OPTIONS = ("Petrol", "Diesel", "Electric", "CNG")
ACCIDENT_HISTORY_OPTIONS = ("Available", "Not Available")
CURRENT_YEAR = datetime.utcnow().year


def _normalize_vehicle_number(vehicle_number):
    return "".join(char for char in str(vehicle_number).upper() if char.isalnum())


def _to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _normalize_fuel_type(value):
    if value is None:
        return None

    text = str(value).strip()
    if not text:
        return None

    fuel_map = {
        "petrol": "Petrol",
        "diesel": "Diesel",
        "electric": "Electric",
        "ev": "Electric",
        "cng": "CNG",
    }
    return fuel_map.get(text.lower(), text.title())


def _normalize_accident_history(value):
    if value is None:
        return "Not Available"

    text = str(value).strip().lower()
    if not text:
        return "Not Available"

    if text in {"yes", "available", "true", "present", "reported", "history_available"}:
        return "Available"

    return "Not Available"


def _first_available(record, keys):
    for key in keys:
        if key in record and record[key] not in (None, ""):
            return record[key]
    return None


def _normalize_external_payload(payload):
    root = payload
    if isinstance(payload, dict):
        for candidate in ("data", "result", "vehicle"):
            if isinstance(payload.get(candidate), dict):
                root = payload[candidate]
                break
    elif isinstance(payload, list) and payload and isinstance(payload[0], dict):
        root = payload[0]

    if not isinstance(root, dict):
        return None

    owner_count = _to_int(
        _first_available(root, ("owner_count", "ownerCount", "owners", "owner"))
    )
    if owner_count is not None and owner_count < 1:
        owner_count = None

    registration_year = _to_int(
        _first_available(
            root,
            (
                "registration_year",
                "registrationYear",
                "year_of_registration",
                "reg_year",
                "year",
            ),
        )
    )
    if registration_year is not None and (
        registration_year < 1980 or registration_year > CURRENT_YEAR + 1
    ):
        registration_year = None

    fuel_type = _normalize_fuel_type(
        _first_available(root, ("fuel_type", "fuelType", "fuel"))
    )

    challan_count = _to_int(
        _first_available(root, ("challan_count", "challanCount", "challans", "pending_challans"))
    )
    if challan_count is None or challan_count < 0:
        challan_count = 0

    accident_history = _normalize_accident_history(
        _first_available(root, ("accident_history", "accidentHistory", "accident_record", "accident"))
    )

    if owner_count is None and registration_year is None and fuel_type is None:
        return None

    return {
        "owner_count": owner_count,
        "registration_year": registration_year,
        "fuel_type": fuel_type,
        "challan_count": challan_count,
        "accident_history": accident_history,
        "source": "api",
        "available": True,
    }


def _fetch_from_external_api(vehicle_number):
    api_url = os.getenv("VEHICLE_VERIFICATION_API_URL", "").strip()
    if not api_url:
        return None

    parsed = urlparse(api_url)
    query = parse_qs(parsed.query)
    query_param = os.getenv("VEHICLE_VERIFICATION_QUERY_PARAM", "vehicle_number").strip()
    query[query_param] = [vehicle_number]
    request_url = urlunparse(parsed._replace(query=urlencode(query, doseq=True)))

    api_key = os.getenv("VEHICLE_VERIFICATION_API_KEY", "").strip()
    api_key_header = os.getenv("VEHICLE_VERIFICATION_API_KEY_HEADER", "x-api-key").strip()
    timeout = float(os.getenv("VEHICLE_VERIFICATION_TIMEOUT", "4"))

    headers = {"Accept": "application/json"}
    if api_key:
        headers[api_key_header or "x-api-key"] = api_key

    request = Request(request_url, headers=headers)

    try:
        with urlopen(request, timeout=timeout) as response:
            raw_payload = response.read().decode("utf-8")
    except (HTTPError, URLError, OSError, TimeoutError, ValueError):
        return None

    try:
        decoded_payload = json.loads(raw_payload)
    except json.JSONDecodeError:
        return None

    return _normalize_external_payload(decoded_payload)


def _build_mock_record(vehicle_number):
    seed = int(hashlib.sha256(vehicle_number.encode("utf-8")).hexdigest(), 16)
    owner_count = (seed % 4) + 1
    registration_year = max(1998, CURRENT_YEAR - ((seed % 16) + 1))
    fuel_type = FUEL_OPTIONS[seed % len(FUEL_OPTIONS)]
    challan_count = seed % 6
    accident_history = ACCIDENT_HISTORY_OPTIONS[(seed // 3) % len(ACCIDENT_HISTORY_OPTIONS)]

    return {
        "owner_count": owner_count,
        "registration_year": registration_year,
        "fuel_type": fuel_type,
        "challan_count": challan_count,
        "accident_history": accident_history,
        "source": "mock",
        "available": True,
    }


def _not_available_record(vehicle_number, reason):
    return {
        "owner_count": None,
        "registration_year": None,
        "fuel_type": None,
        "challan_count": None,
        "accident_history": "Not Available",
        "vehicle_number": vehicle_number,
        "source": "unavailable",
        "available": False,
        "reason": reason,
    }


def fetch_vehicle_data(vehicle_number):
    normalized_vehicle_number = _normalize_vehicle_number(vehicle_number)
    if not normalized_vehicle_number:
        return {
            "owner_count": None,
            "registration_year": None,
            "fuel_type": None,
            "challan_count": None,
            "accident_history": "Not Available",
            "source": "not_provided",
            "available": False,
            "vehicle_number": None,
            "reason": "Vehicle number not provided",
        }

    api_url = os.getenv("VEHICLE_VERIFICATION_API_URL", "").strip()
    if api_url:
        api_record = _fetch_from_external_api(normalized_vehicle_number)
        if api_record:
            api_record["vehicle_number"] = normalized_vehicle_number
            return api_record
        return _not_available_record(normalized_vehicle_number, "Verification API unavailable")

    mock_record = _build_mock_record(normalized_vehicle_number)
    mock_record["vehicle_number"] = normalized_vehicle_number
    return mock_record