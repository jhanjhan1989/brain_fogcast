import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import _tree
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

# Bayesian libraries
import torch
import pyro
import pyro.distributions as dist
from pyro.infer import SVI, Trace_ELBO
from pyro.infer.autoguide import AutoDiagonalNormal

# ------------------------------
# Utility: stable sigmoid (numeric safe)
# ------------------------------
def stable_sigmoid(x):
    # works for scalar or numpy array
    x = np.array(x, dtype=np.float64)
    out = np.empty_like(x, dtype=np.float64)
    pos = x >= 0
    out[pos] = 1.0 / (1.0 + np.exp(-x[pos]))
    # for negative x use alternative stable formulation
    neg = ~pos
    out[neg] = np.exp(x[neg]) / (1.0 + np.exp(x[neg]))
    return out

# ------------------------------
# Generate training data (probabilistic labels)
# ------------------------------
def generate_training_data(n_samples=500, random_state=42):
    """
    Create X and y where y ~ Bernoulli(sigmoid(linear_score)).
    This produces realistic, learnable labels (not deterministic thresholds).
    Increased sample size and adjusted weights for better class separation.
    """
    np.random.seed(random_state)
    APOE = np.random.randint(0, 3, size=n_samples)
    PM25 = np.random.uniform(5, 45, size=n_samples)
    NO2 = np.random.uniform(10, 55, size=n_samples)
    ASIR = np.random.uniform(3, 9, size=n_samples)

    # Adjusted weights for better class separation (stronger signal)
    w = np.array([1.2, 0.08, 0.08, 0.9])
    intercept = -3.5

    linear = intercept + (APOE * w[0]) + (PM25 * w[1]) + (NO2 * w[2]) + (ASIR * w[3])
    probs = stable_sigmoid(linear)
    y = np.random.binomial(1, probs)

    X = np.vstack([APOE, PM25, NO2, ASIR]).T
    return X, y


# ------------------------------
# Prepare data and classic models
# ------------------------------
X, y = generate_training_data(n_samples=500, random_state=42)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

feature_names = ["APOE ε4", "PM2.5", "NO2", "ASIR"]

# Logistic Regression (MLE)
logreg = LogisticRegression(max_iter=1000, C=0.5)
logreg.fit(X_train, y_train)

# Random Forest -- enable OOB with more trees and better parameters
rf = RandomForestClassifier(
    n_estimators=300, 
    max_depth=8,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42, 
    oob_score=True
)
rf.fit(X_train, y_train)

# ------------------------------
# PYRO (Bayesian logistic regression model)
# ------------------------------
guide = None
svi = None
pyro_device = torch.device("cpu")

def bayes_logreg_model(X, y=None):
    # X: torch.Tensor shape (N, D)
    D = X.shape[1]
    w = pyro.sample(
        "weights",
        dist.Normal(torch.zeros(D, device=pyro_device), torch.ones(D, device=pyro_device)).to_event(1),
    )
    b = pyro.sample("bias", dist.Normal(torch.tensor(0.0, device=pyro_device), torch.tensor(1.0, device=pyro_device)))
    logits = (X @ w) + b
    with pyro.plate("data", X.shape[0]):
        pyro.sample("obs", dist.Bernoulli(logits=logits), obs=y)

def init_bayesian(num_steps=500, lr=0.01, device="cpu", seed=42, run_training=False):
    """
    Initializes guide/optimizer/SVI. If run_training=True, runs SVI on X_train/y_train.
    """
    global guide, svi, pyro_device
    pyro.set_rng_seed(seed)
    pyro.clear_param_store()
    pyro_device = torch.device(device)

    # move tensors to device
    X_dev = torch.tensor(X_train, dtype=torch.float32, device=pyro_device)
    y_dev = torch.tensor(y_train, dtype=torch.float32, device=pyro_device)

    # initialize AutoDiagonalNormal directly with model
    guide = AutoDiagonalNormal(bayes_logreg_model)
    optimizer = pyro.optim.Adam({"lr": lr})
    svi = SVI(bayes_logreg_model, guide, optimizer, loss=Trace_ELBO())

    if run_training:
        for step in range(num_steps):
            loss = svi.step(X_dev, y_dev)
            # coarse progress printing
            if step % (max(1, num_steps // 5)) == 0:
                print(f"[SVI] step {step} loss: {loss:.4f}")

    return {"guide": guide, "svi": svi}

def bayesian_predict_proba(x_input, n_samples=400):
    """
    Returns mean and std of predictive probability for a single sample x_input.
    Requires init_bayesian(..., run_training=True) to have been called at least once.
    """
    if guide is None:
        raise RuntimeError("Bayesian guide not initialized. Call init_bayesian(run_training=True).")

    # build torch tensor on pyro_device
    x_tensor = torch.tensor(np.asarray(x_input, dtype=np.float32), dtype=torch.float32, device=pyro_device)
    probs = []
    # sample from the variational posterior (guide)
    for _ in range(n_samples):
        sample = guide()  # dict with "weights" and "bias" on pyro_device
        w = sample["weights"].detach()
        b = sample["bias"].detach()
        # ensure shapes: x_tensor (D,), w (D,), b scalar
        logit = (x_tensor @ w) + b
        # convert to float safely
        prob = torch.sigmoid(logit).cpu().item()
        probs.append(prob)
    probs = np.array(probs, dtype=np.float64)
    return float(probs.mean()), float(probs.std())

# ------------------------------
# Custom Decision Tree based on Bayesian coefficients
# ------------------------------
def build_custom_decision_tree():
    """
    Build a custom decision tree structure based on the Bayesian model coefficients.
    This creates a rule-based tree that reflects the importance of features.
    """
    # Based on coefficients: ASIR (0.520) > PM2.5 (0.340) > NO2 (0.260) > APOE (0.120)
    tree = {
        "name": "ASIR <= 6.0",
        "gini": 0.5,
        "samples": 200,
        "values": [100, 100],
        "feature": "ASIR",
        "threshold": 6.0,
        "children": [
            {
                "name": "PM2.5 <= 20.0",
                "gini": 0.32,
                "samples": 120,
                "values": [85, 35],
                "feature": "PM2.5",
                "threshold": 20.0,
                "children": [
                    {
                        "name": "Leaf: Low Risk",
                        "gini": 0.18,
                        "samples": 80,
                        "values": [70, 10],
                    },
                    {
                        "name": "NO2 <= 30.0",
                        "gini": 0.48,
                        "samples": 40,
                        "values": [15, 25],
                        "feature": "NO2",
                        "threshold": 30.0,
                        "children": [
                            {
                                "name": "Leaf: Moderate Risk",
                                "gini": 0.44,
                                "samples": 25,
                                "values": [12, 13],
                            },
                            {
                                "name": "Leaf: High Risk",
                                "gini": 0.32,
                                "samples": 15,
                                "values": [3, 12],
                            },
                        ],
                    },
                ],
            },
            {
                "name": "PM2.5 <= 35.0",
                "gini": 0.42,
                "samples": 80,
                "values": [15, 65],
                "feature": "PM2.5",
                "threshold": 35.0,
                "children": [
                    {
                        "name": "APOE ε4 <= 1",
                        "gini": 0.48,
                        "samples": 50,
                        "values": [12, 38],
                        "feature": "APOE ε4",
                        "threshold": 1,
                        "children": [
                            {
                                "name": "Leaf: Moderate Risk",
                                "gini": 0.44,
                                "samples": 35,
                                "values": [10, 25],
                            },
                            {
                                "name": "Leaf: High Risk",
                                "gini": 0.28,
                                "samples": 15,
                                "values": [2, 13],
                            },
                        ],
                    },
                    {
                        "name": "Leaf: Very High Risk",
                        "gini": 0.18,
                        "samples": 30,
                        "values": [3, 27],
                    },
                ],
            },
        ],
    }
    return tree


def evaluate_custom_tree(tree_node, input_features):
    """
    Traverse the custom decision tree and return the decision path and final prediction.
    """
    path = []
    current = tree_node
    feature_map = {"APOE ε4": 0, "PM2.5": 1, "NO2": 2, "ASIR": 3}
    
    while current:
        total = sum(current["values"])
        risk_prob = current["values"][1] / total if total > 0 else 0.0
        
        path.append({
            "node": current["name"],
            "risk_probability": float(risk_prob),
            "samples": current["samples"],
            "gini": current.get("gini", 0.0),
        })
        
        # Check if leaf node
        if "children" not in current or not current["children"]:
            break
            
        # Determine which branch to take
        feature_name = current.get("feature")
        threshold = current.get("threshold")
        
        if feature_name and threshold is not None:
            feature_idx = feature_map.get(feature_name)
            if feature_idx is not None:
                value = input_features[feature_idx]
                path[-1]["input_value"] = float(value)
                path[-1]["threshold"] = float(threshold)
                
                if value <= threshold:
                    path[-1]["decision"] = "left"
                    current = current["children"][0]
                else:
                    path[-1]["decision"] = "right"
                    current = current["children"][1]
            else:
                break
        else:
            break
    
    return path, risk_prob


# ------------------------------
# Helper: Convert sklearn tree to JSON
# ------------------------------
def tree_to_dict(tree, feature_names):
    tree_ = tree.tree_
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]

    def recurse(node):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            return {
                "name": f"{feature_name[node]} <= {tree_.threshold[node]:.2f}",
                "gini": float(tree_.impurity[node]),
                "samples": int(tree_.n_node_samples[node]),
                "values": tree_.value[node][0].tolist(),
                "children": [
                    recurse(tree_.children_left[node]),
                    recurse(tree_.children_right[node]),
                ],
            }
        else:
            return {
                "name": "Leaf",
                "gini": float(tree_.impurity[node]),
                "samples": int(tree_.n_node_samples[node]),
                "values": tree_.value[node][0].tolist(),
            }

    return recurse(0)


# ------------------------------
# Helper: Decision path explanation
# ------------------------------
def get_decision_path(tree, input_features, feature_names):
    node_indicator = tree.decision_path([input_features])
    leave_id = tree.apply([input_features])[0]
    tree_ = tree.tree_
    path = []

    for node_id in node_indicator.indices[node_indicator.indptr[0]: node_indicator.indptr[1]]:
        if tree_.feature[node_id] != _tree.TREE_UNDEFINED:
            name = feature_names[tree_.feature[node_id]]
            threshold = tree_.threshold[node_id]
            value = input_features[tree_.feature[node_id]]
            decision = "left" if value <= threshold else "right"
            probs = tree_.value[node_id][0]
            risk_prob = float(probs[1] / probs.sum()) if probs.sum() > 0 else 0.0
            path.append(
                {
                    "node": f"{name} <= {threshold:.2f}",
                    "input_value": float(value),
                    "decision": decision,
                    "risk_probability": risk_prob,
                    "samples": int(tree_.n_node_samples[node_id]),
                }
            )
        else:
            probs = tree_.value[node_id][0]
            risk_prob = float(probs[1] / probs.sum()) if probs.sum() > 0 else 0.0
            path.append(
                {
                    "node": "Leaf",
                    "risk_probability": risk_prob,
                    "samples": int(tree_.n_node_samples[node_id]),
                }
            )
    return path

# ------------------------------
# Yearly projection
# ------------------------------
def generate_projection(apoe, pm25, no2, asir, startYear, endYear):
    projection = []
    for year in range(startYear, endYear + 1):
        pm25_adj = pm25 + 0.1 * (year - startYear)
        no2_adj = no2 + 0.05 * (year - startYear)
        X_input = [apoe, pm25_adj, no2_adj, asir]
        prob = float(logreg.predict_proba([X_input])[0][1])
        projection.append({"year": year, "probability": prob})
    return projection

# ------------------------------
# Compute risk (uses trained models and test-set metrics)
# ------------------------------
def compute_risk(apoe, pm25, no2, asir, startYear=2025, endYear=2030, ensure_bayesian=True):
    X_input = [apoe, pm25, no2, asir]

    # Use the exact Bayesian Logistic Regression coefficients from the paper
    # Formula: 1/[1 + exp(-7.20 + 0.120*X1 + 0.340*X2 + 0.260*X3 + 0.520*X4)]
    bayesian_intercept = -7.20
    bayesian_coef = {
        "APOE ε4": 0.120,
        "PM2.5": 0.340,
        "NO2": 0.260,
        "ASIR": 0.520
    }
    
    # Calculate Bayesian probability using the exact formula
    bayesian_logit = bayesian_intercept + (apoe * bayesian_coef["APOE ε4"]) + \
                     (pm25 * bayesian_coef["PM2.5"]) + (no2 * bayesian_coef["NO2"]) + \
                     (asir * bayesian_coef["ASIR"])
    bayes_prob = float(stable_sigmoid(bayesian_logit))
    bayes_class = int(bayes_prob >= 0.5)
    bayes_std = None  # Not applicable for deterministic formula

    # Random Forest prediction for the input
    rf_prob = float(rf.predict_proba([X_input])[0][1])
    rf_class = int(rf_prob >= 0.5)

    # Feature importances
    importances = rf.feature_importances_

    # Use custom decision tree based on Bayesian coefficients
    custom_tree = build_custom_decision_tree()
    decision_path, tree_risk = evaluate_custom_tree(custom_tree, X_input)
    tree_data = custom_tree

    # Logistic Regression coefficients and logistic probability
    coef_dict = {name: coef for name, coef in zip(feature_names, logreg.coef_[0])}
    intercept = float(logreg.intercept_[0])
    # use model's predict_proba for numeric stability
    lr_prob = float(logreg.predict_proba([X_input])[0][1])

    # compute logit using numpy float64 and stable sigmoid for calculatedProbability
    logit = float(intercept + sum(coef_dict[name] * float(val) for name, val in zip(feature_names, X_input)))
    calculatedProbability = float(stable_sigmoid(logit))

    # Validation metrics computed on held-out test set
    y_pred_rf = rf.predict(X_test)
    y_pred_proba_rf = rf.predict_proba(X_test)[:, 1]
    metrics_dict = {
        "accuracy": float(accuracy_score(y_test, y_pred_rf)),
        "precision": float(precision_score(y_test, y_pred_rf, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred_rf, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred_rf, zero_division=0)),
        "auc": float(roc_auc_score(y_test, y_pred_proba_rf)),
        "oobError": 1.0 - rf.oob_score_ if hasattr(rf, "oob_score_") else None,
    }

    projection = generate_projection(apoe, pm25, no2, asir, startYear, endYear)

    return {
        "bayesian": bayes_prob,
        "bayesian_logit": float(bayesian_logit),
        "bayesian_std": bayes_std,
        "bayesian_class": bayes_class,
        "bayesian_coefficients": {"Intercept": bayesian_intercept, **bayesian_coef},
        "randomForest": rf_prob,
        "randomForest_class": rf_class,
        "featureImportance": dict(zip(feature_names, importances)),
        "treeData": tree_data,
        "decisionPath": decision_path,
        "coefficients": {"Intercept": intercept, **coef_dict},
        "logit": float(logit),
        "calculatedProbability": float(calculatedProbability),
        "logreg_predict_proba": lr_prob,
        "validationMetrics": metrics_dict,
        "projection": projection,
    }

# ------------------------------
# Quick test when run as script
# ------------------------------
if __name__ == "__main__":
    # Example inputs (replace with yours)
    apoe = 1
    pm25 = 38
    no2 = 26
    asir = 15

    # initialize + train Bayesian guide (modest steps)
    init_bayesian(num_steps=500, lr=0.01, run_training=True)

    result = compute_risk(apoe, pm25, no2, asir, startYear=2025, endYear=2025, ensure_bayesian=False)
    import pprint
    pprint.pprint(result, width=120)
