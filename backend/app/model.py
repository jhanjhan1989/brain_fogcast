import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

feature_names = ["APOE ε4", "PM2.5", "NO2", "ASIR"]


# Generate synthetic data
def generate_training_data():
    X, y = [], []
    for _ in range(200):
        APOE = np.random.randint(0, 3)
        PM25 = np.random.uniform(5, 45)
        NO2 = np.random.uniform(10, 55)
        ASIR = np.random.uniform(3, 9)
        score = (
            0.8 * APOE
            + 0.05 * PM25
            + 0.05 * NO2
            + 0.6 * ASIR
            + np.random.uniform(-0.5, 0.5)
        )
        label = 1 if score > 10 else 0
        X.append([APOE, PM25, NO2, ASIR])
        y.append(label)
    return np.array(X), np.array(y)


# Train models
X, y = generate_training_data()
logreg = LogisticRegression()
logreg.fit(X, y)

rf = RandomForestClassifier(n_estimators=200)
rf.fit(X, y)


def compute_risk(apoe: int, pm25: float, no2: float, asir: float):
    input_data = np.array([[apoe, pm25, no2, asir]])
    bayes_prob = logreg.predict_proba(input_data)[0][1]
    rf_prob = rf.predict_proba(input_data)[0][1]
    importances = rf.feature_importances_
    return {
        "bayesian": float(bayes_prob),
        "randomForest": float(rf_prob),
        "featureImportance": dict(zip(feature_names, importances)),
    }
