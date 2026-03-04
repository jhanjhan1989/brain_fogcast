from pydantic import BaseModel

class RiskInput(BaseModel):
    apoe: int
    pm25: float
    no2: float
    asir: float

class RiskOutput(BaseModel):
    bayesian: float
    randomForest: float
    featureImportance: dict
