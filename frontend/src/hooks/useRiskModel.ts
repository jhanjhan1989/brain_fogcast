import { useState } from "react";

interface RiskResult {
    bayesian: number;
    bayesian_class: number;
    bayesian_logit?: number;
    randomForest: number;
    randomForest_class: number;
    featureImportance?: Record<string, number>;
    treeData?: any;
    decisionPath?: any[];
    coefficients?: {
        Intercept: number;
        "APOE ε4": number;
        "PM2.5": number;
        "NO2": number;
        ASIR: number;
    };
    logit?: number;
    odds?: number;
    calculatedProbability?: number;
    validationMetrics?: {
        accuracy?: number;
        precision?: number;
        recall?: number;
        f1?: number;
        auc?: number;
        oobError?: number;
        roc?: { fpr: number; tpr: number }[];
    };
    projection?: { year: number; probability: number }[];
}

export function useRiskModel() {
    const [result, setResult] = useState<RiskResult | null>(null);

    const computeRisk = async (
        apoe: number,
        pm25: number,
        no2: number,
        asir: number,
        startYear?: number,
        endYear?: number
    ) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/compute-risk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apoe, pm25, no2, asir, startYear, endYear }),
            });

            if (!res.ok) throw new Error("Failed to fetch risk data");

            const data: RiskResult = await res.json();

            // Generate projection if API did not return it
            if (startYear && endYear && !data.projection) {
                const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
                data.projection = years.map((year, idx) => {
                    const increment = ((idx + 1) / years.length) * 0.2; // max +20%
                    const projProb = Math.min(data.bayesian + increment, 1);
                    return { year, probability: projProb };
                });
            }

            setResult(data);
            return data;
        } catch (err) {
            console.error("Error computing risk:", err);
            setResult(null);
            return null;
        }
    };

    return { computeRisk, result };
}
