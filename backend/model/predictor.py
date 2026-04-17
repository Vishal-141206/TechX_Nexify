import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "price_model.pkl")

model = joblib.load(model_path)

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

def predict_price(data):
    return int(model.predict(data)[0])