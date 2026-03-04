# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.risk_model import compute_risk  # your existing function
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import plot_tree
import matplotlib
matplotlib.use("Agg")  # <-- Add this line at the very top

import matplotlib.pyplot as plt
 
import io
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.api.health_facilities import router as health_facilities_router

app = FastAPI()

# Include routers
app.include_router(health_facilities_router)

# Allow React frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Input schema
class RiskInput(BaseModel):
    apoe: int
    pm25: float
    no2: float
    asir: float
    startYear: int
    endYear:int


# Risk calculation endpoint
@app.post("/compute-risk")
def compute_risk_endpoint(data: RiskInput):
    return compute_risk(data.apoe, data.pm25, data.no2, data.asir, data.startYear, data.endYear)


# Tree visualization endpoint
@app.get("/tree/{tree_index}")
def get_tree(tree_index: int):
    # Assuming compute_risk() trains rf globally, you may want to expose rf
    from app.risk_model import rf, feature_names  # import RF model

    if tree_index >= len(rf.estimators_):
        return {"error": "Tree index out of range"}

    tree = rf.estimators_[tree_index]

    # Plot tree to PNG buffer
    plt.figure(figsize=(12, 6))
    plot_tree(tree, feature_names=feature_names, filled=True, rounded=True)
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode("utf-8")
    return {"tree": img_base64}
