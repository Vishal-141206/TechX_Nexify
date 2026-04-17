import joblib
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "price_model.pkl")

model = joblib.load(model_path)

FEATURE_COLUMNS = [
    "year",
    "mileage_kmpl",
    "engine_cc",
    "owner_count",
    "fuel_electric",
    "fuel_petrol",
    "transmission_manual",
]

def prepare_input(year, mileage, engine, owners, fuel, transmission):

    fuel_electric = 1 if fuel == "Electric" else 0
    fuel_petrol = 1 if fuel == "Petrol" else 0
    transmission_manual = 1 if transmission == "Manual" else 0

    return [[
        year,
        mileage,
        engine,
        owners,
        fuel_electric,
        fuel_petrol,
        transmission_manual
    ]]


def _to_model_input_frame(data):
    if isinstance(data, pd.DataFrame):
        return data

    model_columns = list(getattr(model, "feature_names_in_", FEATURE_COLUMNS))
    return pd.DataFrame(data, columns=model_columns)


def predict_price(data):
    input_frame = _to_model_input_frame(data)
    return int(model.predict(input_frame)[0])