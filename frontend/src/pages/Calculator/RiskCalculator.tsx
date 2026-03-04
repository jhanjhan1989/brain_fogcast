import React, { useState, useEffect } from "react";
import DecisionTree from "./DecisionTree";
import { useRiskModel } from "../../hooks/useRiskModel";
import LocationSelector from "../../components/LocationSelector";
import Tree from "react-d3-tree";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Cpu,
  Cloud,
  AirVent,
  CalendarCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Sigma,
  GitBranch,
  MapPin,
  Info,
  X,
  Brain,
  Lightbulb,
} from "lucide-react";

export default function RiskCalculator() {
  const { computeRisk, result } = useRiskModel();
  const [apoe, setApoe] = useState(0);
  const [pm25, setPm25] = useState(10);
  const [no2, setNo2] = useState(20);
  const [asir, setAsir] = useState(5);

  const [startYear, setStartYear] = useState(2025);
  const [endYear, setEndYear] = useState(2030);

  const [activeTab, setActiveTab] = useState("features");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [autoCalculate, setAutoCalculate] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showFullTree, setShowFullTree] = useState(false);

  const featureLabels = [
    { label: "APOE ε4", icon: <Cpu size={14} /> },
    { label: "PM2.5", icon: <Cloud size={14} /> },
    { label: "NO2", icon: <AirVent size={14} /> },
    { label: "ASIR", icon: <CalendarCheck size={14} /> },
  ];

  // Auto-calculate when parameters change
  useEffect(() => {
    if (autoCalculate && apoe >= 0 && apoe <= 2) {
      const timer = setTimeout(() => {
        computeRisk(apoe, pm25, no2, asir, startYear, endYear);
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timer);
    }
  }, [apoe, pm25, no2, asir, startYear, endYear, autoCalculate]);

  const handleCalculate = () => {
    if (apoe < 0 || apoe > 2) {
      alert("APOE ε4 must be 0, 1, or 2");
      return;
    }
    setAutoCalculate(true);
    computeRisk(apoe, pm25, no2, asir, startYear, endYear);
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    if (location.pm25) setPm25(location.pm25);
    if (location.no2) setNo2(location.no2);
    if (location.asir) setAsir(location.asir);
    
    // Auto-calculate when location changes
    if (apoe >= 0 && apoe <= 2) {
      setAutoCalculate(true);
      setTimeout(() => {
        computeRisk(apoe, location.pm25 || pm25, location.no2 || no2, location.asir || asir, startYear, endYear);
      }, 100);
    }
  };

  const getRiskLevel = (prob: number) => {
    if (prob >= 0.7)
      return { level: "High Risk", color: "bg-red-500", icon: <AlertTriangle size={18} /> };
    if (prob >= 0.4)
      return { level: "Moderate Risk", color: "bg-orange-400", icon: <HelpCircle size={18} /> };
    return { level: "Low Risk", color: "bg-yellow-500", icon: <CheckCircle size={18} /> };
  };

  // --------------------------- Clinical Risk ---------------------------
  const renderClinicalRiskCard = () => {
    if (!result) return null;
    const risk = getRiskLevel(result.bayesian ?? 0);
    const confidence = ((result.bayesian ?? 0) * 100).toFixed(2);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-purple-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Clinical Risk Assessment
            </h3>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-white ${risk.color} shadow-lg`}>
              {risk.icon}
              <span className="font-bold">{risk.level}</span>
            </div>
          </div>

          <div className="text-center py-8">
            <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {confidence}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">Predicted Risk Probability</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Feature Importance
          </h4>
          <div className="space-y-4">
            {featureLabels.map((f) => {
              const val =
                f.label === "APOE ε4" ? apoe : f.label === "PM2.5" ? pm25 : f.label === "NO2" ? no2 : asir;
              const importance = ((result.featureImportance?.[f.label] ?? 0) * 100).toFixed(1);

              return (
                <div key={f.label}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-purple-600 dark:text-purple-400">{f.icon}</span>
                      <span className="font-medium">{f.label}</span>
                      <span className="text-sm text-gray-500">({val})</span>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                      {importance}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-500"
                      style={{ width: `${importance}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --------------------------- Bayesian Equation ---------------------------
  const renderEquationCard = () => {
    if (!result?.coefficients) return null;

    const coef = result.coefficients;
    const intercept = coef.Intercept ?? 0;
    const logit =
      intercept +
      (coef["APOE ε4"] ?? 0) * apoe +
      (coef["PM2.5"] ?? 0) * pm25 +
      (coef["NO2"] ?? 0) * no2 +
      (coef["ASIR"] ?? 0) * asir;
    const probability = 1 / (1 + Math.exp(-logit));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
          Bayesian Logistic Regression Formula
        </h3>

        <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4 mb-6 font-mono text-sm overflow-x-auto">
          <div className="text-center text-gray-800 dark:text-gray-200">
            P(Risk) = 1 / [1 + exp(-({intercept.toFixed(2)} + {(coef["APOE ε4"] ?? 0).toFixed(3)}×APOE + {(coef["PM2.5"] ?? 0).toFixed(3)}×PM2.5 + {(coef["NO2"] ?? 0).toFixed(3)}×NO2 + {(coef["ASIR"] ?? 0).toFixed(3)}×ASIR))]
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="p-3 font-semibold">Variable</th>
              <th className="p-3 font-semibold text-right">Input Value</th>
              <th className="p-3 font-semibold text-right">Coefficient</th>
              <th className="p-3 font-semibold text-right">Contribution</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-3 font-semibold text-purple-600 dark:text-purple-400">Intercept</td>
              <td className="p-3 text-right text-gray-500">—</td>
              <td className="p-3 text-right font-mono">{intercept.toFixed(4)}</td>
              <td className="p-3 text-right font-mono font-semibold">{intercept.toFixed(4)}</td>
            </tr>

            {featureLabels.map((f) => {
              const val =
                f.label === "APOE ε4" ? apoe : f.label === "PM2.5" ? pm25 : f.label === "NO2" ? no2 : asir;
              const c = (coef as any)[f.label] ?? 0;
              const contrib = val * c;

              return (
                <tr key={f.label} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 font-medium">{f.label}</td>
                  <td className="p-3 text-right font-mono">{val}</td>
                  <td className="p-3 text-right font-mono">{c.toFixed(4)}</td>
                  <td className="p-3 text-right font-mono font-semibold">{contrib.toFixed(4)}</td>
                </tr>
              );
            })}

            <tr className="bg-purple-100 dark:bg-purple-900 font-bold">
              <td className="p-3">Total Logit</td>
              <td colSpan={3} className="p-3 text-right font-mono text-lg">
                {logit.toFixed(4)}
              </td>
            </tr>

            <tr className="bg-purple-600 text-white font-bold">
              <td className="p-3">Final Probability</td>
              <td colSpan={3} className="p-3 text-right text-xl">
                {(probability * 100).toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // --------------------------- Decision Tree ---------------------------
  const renderDecisionTreeTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <GitBranch size={20} /> Decision Tree Visualization
      </h3>

      <p className="text-sm mb-6 text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
        Interactive decision tree showing risk classification paths. Node color intensity indicates risk level.
        Click nodes to explore decision paths and probabilities.
      </p>

      <DecisionTree treeData={result?.treeData} metrics={result?.validationMetrics} />
    </div>
  );

  // --------------------------- Validation Metrics ---------------------------
  const renderValidationMetrics = () => {
    if (!result?.validationMetrics) return null;

    const m = result.validationMetrics;

    const metrics = [
      { label: "AUC-ROC", value: m.auc, color: "from-purple-500 to-purple-700" },
      { label: "Accuracy", value: m.accuracy, color: "from-blue-500 to-blue-700" },
      { label: "Precision", value: m.precision, color: "from-green-500 to-green-700" },
      { label: "Recall (Sensitivity)", value: m.recall, color: "from-yellow-500 to-yellow-700" },
      { label: "F1 Score", value: m.f1, color: "from-pink-500 to-pink-700" },
      { label: "Out-of-Bag Error", value: m.oobError, color: "from-red-500 to-red-700" },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <BarChart3 size={20} /> Model Performance Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((mItem, idx) => {
              const valPercent = typeof mItem.value === "number" ? mItem.value * 100 : 0;
              return (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{mItem.label}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {typeof mItem.value === "number" ? valPercent.toFixed(1) + "%" : "—"}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-4 bg-gradient-to-r ${mItem.color} transition-all duration-500`}
                      style={{ width: `${valPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Understanding the Metrics
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>AUC-ROC:</strong> Area under the curve - measures model's ability to distinguish between classes (closer to 1.0 is better)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Accuracy:</strong> Overall correctness of predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Precision:</strong> Of all positive predictions, how many were correct</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Recall:</strong> Of all actual positives, how many were identified</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // --------------------------- Projection ---------------------------
  const renderProjectionTab = () => {
    if (!result?.projection) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <BarChart3 size={20} /> Risk Projection Over Time
        </h3>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={result.projection}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                style={{ fontSize: '14px', fontWeight: 600 }}
              />
              <YAxis 
                domain={[0, 1]} 
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                stroke="#6b7280"
                style={{ fontSize: '14px', fontWeight: 600 }}
              />
              <Tooltip 
                formatter={(value: any) => `${(Number(value) * 100).toFixed(2)}%`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '2px solid #7c3aed',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="probability"
                name="Risk Probability"
                stroke="#7c3aed"
                strokeWidth={4}
                dot={{ r: 6, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {result.projection.map((item, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Year {item.year}</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(item.probability * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --------------------------- MAIN UI ---------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Alzheimer's Risk Calculator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                Predictive Bayesian Logistic Regression Model
              </p>
            </div>
            {selectedLocation && (
              <div className="flex items-center gap-2 text-sm bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800">
                <MapPin size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                  {selectedLocation.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* LEFT SIDE - Map and Input Parameters */}
        <div className="flex-1 flex flex-col">
          {/* Input Parameters Bar - Redesigned with Tooltips */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              {/* APOE ε4 Input */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={18} className="text-purple-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">APOE ε4 Alleles</label>
                  <button
                    onMouseEnter={() => setShowTooltip("apoe")}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <input
                  type="number"
                  value={apoe}
                  min={0}
                  max={2}
                  onChange={(e) => setApoe(Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Range: 0-2 (number of alleles)</p>
                {showTooltip === "apoe" && (
                  <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-purple-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <strong>APOE ε4 Alleles:</strong> A genetic risk factor for Alzheimer's disease. Each person inherits two APOE alleles (0, 1, or 2 copies of ε4). Having one ε4 allele increases risk 3-4x, while two copies increase risk 8-12x compared to non-carriers.
                  </div>
                )}
              </div>

              {/* PM2.5 Input */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud size={18} className="text-blue-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">PM2.5 Level</label>
                  <button
                    onMouseEnter={() => setShowTooltip("pm25")}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <input
                  type="number"
                  value={pm25}
                  onChange={(e) => setPm25(Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">µg/m³ (micrograms per cubic meter)</p>
                {showTooltip === "pm25" && (
                  <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-blue-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <strong>PM2.5 (Fine Particulate Matter):</strong> Tiny air pollution particles ≤2.5 micrometers in diameter. Long-term exposure is linked to neuroinflammation and cognitive decline. WHO guideline: &lt;5 µg/m³ annual mean. Values &gt;35 µg/m³ are considered unhealthy.
                  </div>
                )}
              </div>

              {/* NO2 Input */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <AirVent size={18} className="text-green-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">NO2 Level</label>
                  <button
                    onMouseEnter={() => setShowTooltip("no2")}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <input
                  type="number"
                  value={no2}
                  onChange={(e) => setNo2(Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ppb (parts per billion)</p>
                {showTooltip === "no2" && (
                  <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-green-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <strong>NO2 (Nitrogen Dioxide):</strong> A traffic-related air pollutant primarily from vehicle emissions. Associated with oxidative stress and neurodegeneration. EPA standard: &lt;53 ppb annual mean. Higher levels indicate greater exposure to traffic pollution.
                  </div>
                )}
              </div>

              {/* ASIR Input */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarCheck size={18} className="text-orange-600" />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">ASIR</label>
                  <button
                    onMouseEnter={() => setShowTooltip("asir")}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <Info size={16} />
                  </button>
                </div>
                <input
                  type="number"
                  value={asir}
                  onChange={(e) => setAsir(Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per 100,000 population</p>
                {showTooltip === "asir" && (
                  <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-orange-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <strong>ASIR (Age-Standardized Incidence Rate):</strong> The rate of new Alzheimer's cases per 100,000 people in a region, adjusted for age distribution. Reflects regional healthcare access, environmental factors, and population demographics. Typical range: 3-10 per 100k.
                  </div>
                )}
              </div>
            </div>

            {/* Year Range and Calculate Button */}
            <div className="flex items-center gap-4 justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Projection Period:</label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className="w-24 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 outline-none"
                  placeholder="Start"
                />
                <span className="text-gray-400 font-bold">→</span>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  className="w-24 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 outline-none"
                  placeholder="End"
                />
              </div>

              <button
                onClick={handleCalculate}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sigma size={20} />
                Calculate Risk
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full  overflow-hidden">
              <LocationSelector
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Results Panel */}
        {result && (
          <div className="w-[800px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Clinical Risk Assessment - Moved to Top */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-700">
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {((result.bayesian ?? 0) * 100).toFixed(2)}%
                  </div>
                  <div className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Predicted Risk Probability
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${getRiskLevel(result.bayesian ?? 0).color} font-semibold`}>
                    {getRiskLevel(result.bayesian ?? 0).icon}
                    {getRiskLevel(result.bayesian ?? 0).level}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Bayesian Model</div>
                      <div className="relative">
                        <Info 
                          size={14} 
                          className="text-purple-500 cursor-help"
                          onMouseEnter={() => setShowTooltip('bayesian')}
                          onMouseLeave={() => setShowTooltip(null)}
                        />
                        {showTooltip === 'bayesian' && (
                          <div className="absolute z-50 w-96 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl -right-2 top-6">
                            <div className="font-bold mb-2 text-sm">Bayesian Logistic Regression</div>
                            <div className="space-y-2">
                              <div className="bg-gray-800 p-2 rounded">
                                <p className="font-semibold mb-1">Step 1: Linear Combination (z)</p>
                                <p className="font-mono text-[10px] leading-relaxed">
                                  z = -7.20 + (0.120 × {apoe}) + (0.340 × {pm25.toFixed(1)}) + (0.260 × {no2.toFixed(1)}) + (0.520 × {asir.toFixed(1)})
                                </p>
                                <p className="font-mono text-[10px] mt-1">
                                  z = -7.20 + {(0.120 * apoe).toFixed(3)} + {(0.340 * pm25).toFixed(3)} + {(0.260 * no2).toFixed(3)} + {(0.520 * asir).toFixed(3)}
                                </p>
                                <p className="font-mono text-[10px] font-bold mt-1 text-yellow-300">
                                  z = {(result as any).bayesian_logit?.toFixed(4) ?? 'N/A'}
                                </p>
                              </div>
                              
                              <div className="bg-gray-800 p-2 rounded">
                                <p className="font-semibold mb-1">Step 2: Sigmoid Function</p>
                                <p className="font-mono text-[10px]">
                                  P(risk) = 1 / [1 + e^(-z)]
                                </p>
                                <p className="font-mono text-[10px] mt-1">
                                  P(risk) = 1 / [1 + e^({-((result as any).bayesian_logit ?? 0).toFixed(4)})]
                                </p>
                                <p className="font-mono text-[10px] font-bold mt-1 text-green-300">
                                  P(risk) = {((result.bayesian ?? 0) * 100).toFixed(2)}%
                                </p>
                              </div>
                              
                              <p className="text-[10px] text-gray-300 mt-2">
                                <strong>Interpretation:</strong> Each coefficient shows how much that feature contributes to risk. Higher ASIR (0.520) and PM2.5 (0.340) have stronger effects than APOE (0.120).
                              </p>
                            </div>
                            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -top-1 right-3"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {((result.bayesian ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Random Forest</div>
                      <div className="relative">
                        <Info 
                          size={14} 
                          className="text-blue-500 cursor-help"
                          onMouseEnter={() => setShowTooltip('randomforest')}
                          onMouseLeave={() => setShowTooltip(null)}
                        />
                        {showTooltip === 'randomforest' && (
                          <div className="absolute z-50 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -right-2 top-6">
                            <div className="font-bold mb-2">Random Forest Classifier</div>
                            <div className="space-y-2">
                              <p><strong>Algorithm:</strong> Ensemble of 1000 decision trees trained on bootstrap samples</p>
                              <p><strong>How it works:</strong> Each tree votes on risk classification. Final probability = average of all tree predictions.</p>
                              <p><strong>Training:</strong> Trees learn patterns from {result.validationMetrics ? '2000 samples' : 'training data'} with max depth of 12 levels</p>
                              <p><strong>Advantages:</strong> Handles non-linear relationships, robust to outliers, high accuracy (AUC: {((result.validationMetrics?.auc ?? 0) * 100).toFixed(1)}%)</p>
                            </div>
                            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -top-1 right-3"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {((result.randomForest ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
                  <strong>Clinical Interpretation:</strong> Based on Bayesian Logistic Regression combining genetic factors (APOE ε4) and environmental exposures (PM2.5, NO2, ASIR).
                </div>
              </div>

              {/* Tabs for Additional Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setActiveTab("features")}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                      activeTab === "features"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <BarChart3 size={14} />
                    Features
                  </button>
                  <button
                    onClick={() => setActiveTab("brain")}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                      activeTab === "brain"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Brain size={14} />
                    Brain
                  </button>
                  <button
                    onClick={() => setActiveTab("tree")}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                      activeTab === "tree"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <GitBranch size={14} />
                    Tree
                  </button>
                  <button
                    onClick={() => setActiveTab("metrics")}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                      activeTab === "metrics"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <BarChart3 size={14} />
                    Metrics
                  </button>
                  <button
                    onClick={() => setActiveTab("projection")}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                      activeTab === "projection"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <BarChart3 size={14} />
                    Projection
                  </button>
                  <button
                    onClick={() => setActiveTab("bayesian")}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                      activeTab === "bayesian"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Sigma size={14} />
                    Bayesian
                  </button>
                  <button
                    onClick={() => setActiveTab("recommendations")}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                      activeTab === "recommendations"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Lightbulb size={14} />
                    Tips
                  </button>
                </div>

                <div className="p-4">
                  {activeTab === "features" && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Feature Importance</div>
                      {featureLabels.map((f) => {
                        const val =
                          f.label === "APOE ε4" ? apoe : f.label === "PM2.5" ? pm25 : f.label === "NO2" ? no2 : asir;
                        const importance = ((result.featureImportance?.[f.label] ?? 0) * 100).toFixed(1);

                        return (
                          <div key={f.label}>
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                <span className="text-purple-600 dark:text-purple-400">{f.icon}</span>
                                <span className="font-medium">{f.label}</span>
                                <span className="text-gray-500">({val})</span>
                              </div>
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                                {importance}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-500"
                                style={{ width: `${importance}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-xs text-gray-600 dark:text-gray-300 bg-purple-50 dark:bg-gray-700 p-3 rounded-lg mt-3">
                        <strong>About Features:</strong> These bars show how much each factor contributes to the risk prediction. Higher percentages indicate stronger influence on the model's decision.
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "brain" && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium flex items-center gap-2">
                        <Brain size={16} className="text-purple-600 dark:text-purple-400" />
                        Brain Risk Visualization - MRI View
                      </div>
                      
                      {/* Brain SVG Visualization - Light/Dark Mode Compliant */}
                      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
                        <svg width="400" height="300" viewBox="0 0 400 300" className="mb-4">
                          <defs>
                            {/* Brain tissue gradient based on risk */}
                            <radialGradient id={`brainTissue-${result.bayesian}`}>
                              <stop offset="0%" stopColor={
                                result.bayesian >= 0.7 ? "#fca5a5" : 
                                result.bayesian >= 0.4 ? "#fdba74" : 
                                "#fde047"
                              } stopOpacity="0.9" />
                              <stop offset="100%" stopColor={
                                result.bayesian >= 0.7 ? "#dc2626" : 
                                result.bayesian >= 0.4 ? "#ea580c" : 
                                "#ca8a04"
                              } stopOpacity="0.7" />
                            </radialGradient>
                            
                            {/* Darker regions for affected areas */}
                            <radialGradient id={`affectedRegion-${result.bayesian}`}>
                              <stop offset="0%" stopColor={
                                result.bayesian >= 0.7 ? "#991b1b" : 
                                result.bayesian >= 0.4 ? "#9a3412" : 
                                "#854d0e"
                              } stopOpacity="1" />
                              <stop offset="100%" stopColor={
                                result.bayesian >= 0.7 ? "#7f1d1d" : 
                                result.bayesian >= 0.4 ? "#7c2d12" : 
                                "#713f12"
                              } stopOpacity="0.8" />
                            </radialGradient>
                            
                            {/* Glow effect for high risk */}
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                              <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          
                          {/* Brain outline - sagittal view (side view) */}
                          <g transform="translate(200, 150)">
                            {/* Main brain mass */}
                            <path
                              d="M -80,-60 Q -100,-80 -90,-100 Q -70,-110 -50,-105 Q -30,-100 -20,-90 
                                 Q -10,-80 0,-70 Q 10,-60 20,-55 Q 40,-50 60,-50 Q 80,-55 90,-65 
                                 Q 95,-75 95,-85 Q 90,-95 80,-100 Q 60,-105 40,-100 Q 20,-95 10,-85 
                                 Q 0,-75 -10,-70 Q -20,-65 -30,-60 Q -50,-50 -70,-45 Q -85,-40 -90,-30 
                                 Q -95,-15 -90,0 Q -85,15 -75,25 Q -60,35 -40,40 Q -20,42 0,40 
                                 Q 20,38 35,30 Q 50,20 60,5 Q 65,-10 60,-25 Q 55,-35 45,-40 
                                 Q 30,-45 15,-45 Q 0,-43 -15,-38 Q -30,-33 -45,-25 Q -60,-15 -70,0 
                                 Q -75,15 -70,30 Q -60,40 -45,45 Q -25,48 0,45 Q 20,42 35,35 
                                 Q 45,28 50,18 Q 52,8 50,-2 Q 45,-12 35,-18 Q 20,-22 5,-20 
                                 Q -10,-18 -20,-12 Q -30,-5 -35,5 Q -38,15 -35,25 Q -30,32 -20,35 
                                 Q -5,37 10,33 Q 20,28 25,20 Q 28,10 25,0 Q 20,-8 10,-12 
                                 Q 0,-14 -10,-12 Q -18,-8 -22,0 Q -24,8 -20,15 Q -15,20 -8,22 
                                 Q 0,23 8,20 Q 14,16 16,10 Q 17,3 14,-3 Q 10,-8 3,-10 
                                 Q -3,-11 -8,-8 Q -12,-4 -13,2 Q -12,8 -8,12 Q -3,14 3,13 
                                 Q 8,11 10,6 Q 11,1 9,-3 Q 6,-6 1,-7 Q -3,-7 -6,-4 Q -8,0 -7,4 
                                 Q -5,7 -1,8 Q 3,8 6,5 Q 8,2 7,-2 Q 5,-5 1,-6 Q -2,-6 -4,-3 Z"
                              fill={`url(#brainTissue-${result.bayesian})`}
                              stroke="#6b7280"
                              strokeWidth="2"
                              filter={result.bayesian >= 0.7 ? "url(#glow)" : "none"}
                              className="transition-all duration-1000"
                            />
                            
                            {/* Cerebral cortex folds (gyri and sulci) */}
                            <path
                              d="M -60,-70 Q -50,-75 -40,-72 M -30,-68 Q -20,-72 -10,-68 M 0,-65 Q 10,-68 20,-64 
                                 M 30,-60 Q 40,-63 50,-59 M -70,-40 Q -60,-45 -50,-41 M -40,-38 Q -30,-42 -20,-38"
                              stroke="#9ca3af"
                              strokeWidth="1.5"
                              fill="none"
                              opacity="0.6"
                            />
                            
                            {/* Hippocampus (memory center - most affected) */}
                            <ellipse
                              cx="-30"
                              cy="10"
                              rx="18"
                              ry="12"
                              fill={`url(#affectedRegion-${result.bayesian})`}
                              stroke="#fbbf24"
                              strokeWidth="2"
                              opacity="0.95"
                            >
                              {result.bayesian >= 0.7 && (
                                <animate
                                  attributeName="opacity"
                                  values="0.7;1;0.7"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              )}
                            </ellipse>
                            <text x="-30" y="12" textAnchor="middle" className="text-[8px] font-bold fill-gray-900 dark:fill-white">
                              HC
                            </text>
                            
                            {/* Frontal lobe */}
                            <ellipse
                              cx="50"
                              cy="-70"
                              rx="25"
                              ry="20"
                              fill={`url(#brainTissue-${result.bayesian})`}
                              stroke="#9ca3af"
                              strokeWidth="1.5"
                              opacity="0.8"
                            />
                            <text x="50" y="-67" textAnchor="middle" className="text-[8px] font-semibold fill-gray-900 dark:fill-white">
                              Frontal
                            </text>
                            
                            {/* Temporal lobe */}
                            <ellipse
                              cx="-50"
                              cy="20"
                              rx="22"
                              ry="18"
                              fill={`url(#brainTissue-${result.bayesian})`}
                              stroke="#9ca3af"
                              strokeWidth="1.5"
                              opacity="0.8"
                            />
                            <text x="-50" y="23" textAnchor="middle" className="text-[8px] font-semibold fill-gray-900 dark:fill-white">
                              Temporal
                            </text>
                            
                            {/* Parietal lobe */}
                            <ellipse
                              cx="10"
                              cy="-50"
                              rx="20"
                              ry="16"
                              fill={`url(#brainTissue-${result.bayesian})`}
                              stroke="#9ca3af"
                              strokeWidth="1.5"
                              opacity="0.8"
                            />
                            <text x="10" y="-47" textAnchor="middle" className="text-[8px] font-semibold fill-gray-900 dark:fill-white">
                              Parietal
                            </text>
                            
                            {/* Occipital lobe */}
                            <ellipse
                              cx="-70"
                              cy="-20"
                              rx="18"
                              ry="15"
                              fill={`url(#brainTissue-${result.bayesian})`}
                              stroke="#9ca3af"
                              strokeWidth="1.5"
                              opacity="0.8"
                            />
                            <text x="-70" y="-17" textAnchor="middle" className="text-[8px] font-semibold fill-gray-900 dark:fill-white">
                              Occipital
                            </text>
                            
                            {/* Amygdala (emotion/memory) */}
                            <circle
                              cx="-40"
                              cy="25"
                              r="8"
                              fill={`url(#affectedRegion-${result.bayesian})`}
                              stroke="#fbbf24"
                              strokeWidth="1.5"
                              opacity="0.9"
                            />
                            <text x="-40" y="27" textAnchor="middle" className="text-[6px] font-bold fill-gray-900 dark:fill-white">
                              A
                            </text>
                            
                            {/* Entorhinal cortex */}
                            <ellipse
                              cx="-55"
                              cy="5"
                              rx="12"
                              ry="8"
                              fill={`url(#affectedRegion-${result.bayesian})`}
                              stroke="#fbbf24"
                              strokeWidth="1.5"
                              opacity="0.85"
                            />
                            <text x="-55" y="7" textAnchor="middle" className="text-[6px] font-bold fill-gray-900 dark:fill-white">
                              EC
                            </text>
                          </g>
                          
                          {/* Risk level indicator */}
                          <text x="200" y="270" textAnchor="middle" className="text-base font-bold fill-gray-900 dark:fill-white">
                            {result.bayesian >= 0.7 ? "High Risk" : result.bayesian >= 0.4 ? "Moderate Risk" : "Low Risk"}
                          </text>
                          <text x="200" y="290" textAnchor="middle" className="text-sm fill-gray-600 dark:fill-gray-300">
                            {((result.bayesian ?? 0) * 100).toFixed(1)}% Alzheimer's Risk Probability
                          </text>
                        </svg>
                        
                        {/* Legend */}
                        <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
                          <div className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-3">Brain Regions & Risk Indicators</div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-300"></div>
                                <span className="text-gray-700 dark:text-gray-300"><strong>HC:</strong> Hippocampus</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-300"></div>
                                <span className="text-gray-700 dark:text-gray-300"><strong>A:</strong> Amygdala</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-300"></div>
                                <span className="text-gray-700 dark:text-gray-300"><strong>EC:</strong> Entorhinal Cortex</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
                                <span className="text-gray-700 dark:text-gray-300">Low Risk</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-400 to-orange-600"></div>
                                <span className="text-gray-700 dark:text-gray-300">Moderate Risk</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-red-700"></div>
                                <span className="text-gray-700 dark:text-gray-300">High Risk</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Clinical Notes */}
                        <div className="w-full bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mt-3 text-xs text-gray-800 dark:text-gray-200 border border-blue-200 dark:border-blue-800">
                          <div className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Clinical Significance:</div>
                          <ul className="space-y-1.5 list-disc list-inside text-gray-700 dark:text-gray-300">
                            <li><strong>Hippocampus (HC):</strong> First region affected - memory formation and retrieval</li>
                            <li><strong>Entorhinal Cortex (EC):</strong> Gateway to hippocampus - spatial memory and navigation</li>
                            <li><strong>Amygdala (A):</strong> Emotional memory processing</li>
                            <li><strong>Temporal Lobe:</strong> Language and semantic memory</li>
                            <li><strong>Color Intensity:</strong> Darker = higher predicted neurodegeneration risk</li>
                            {result.bayesian >= 0.7 && (
                              <li className="text-red-400 font-semibold mt-2 pt-2 border-t border-red-800">
                                ⚠️ High risk detected - Early intervention and medical consultation recommended
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "tree" && (
                    <div className="space-y-3">
                      {/* Compact Header with Tooltip */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          <GitBranch size={16} className="text-purple-600" />
                          Decision Tree Visualization
                        </div>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setShowTooltip("tree-guide")}
                            onMouseLeave={() => setShowTooltip(null)}
                            className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          >
                            <HelpCircle size={18} className="text-purple-600 dark:text-purple-400" />
                          </button>
                          {showTooltip === "tree-guide" && (
                            <div className="absolute z-50 right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl p-4 text-xs">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                                    <GitBranch size={14} />
                                    About Decision Trees
                                  </h4>
                                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                    <p><strong>What is it?</strong> A flowchart-like structure that makes predictions by asking yes/no questions about your data.</p>
                                    <p><strong>How to read:</strong> Start at the top (root node) and follow branches downward. Each split is a decision based on feature values.</p>
                                    <p><strong>Node colors:</strong> Darker purple = higher risk. Lighter purple = lower risk.</p>
                                    <p><strong>Key features:</strong> The tree prioritizes ASIR, PM2.5, NO2, APOE ε4 at the top.</p>
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                                  <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                    📖 How to Use
                                  </h4>
                                  <ul className="space-y-1 text-gray-700 dark:text-gray-300 list-disc list-inside">
                                    <li><strong>Zoom:</strong> Scroll to zoom in/out</li>
                                    <li><strong>Pan:</strong> Click and drag to move</li>
                                    <li><strong>Nodes:</strong> Show decision rule, risk %, samples</li>
                                    <li><strong>Full View:</strong> Click button below for detailed analysis</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tree Visualization */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: "400px" }}>
                        {result.treeData ? (
                          <div className="w-full h-full tree-container">
                            <style>{`
                              .tree-container .rd3t-link {
                                stroke: #9333ea !important;
                                stroke-width: 2px !important;
                              }
                              .tree-container .rd3t-node circle {
                                display: none !important;
                              }
                            `}</style>
                            <Tree
                              data={(() => {
                                const mapTree = (node: any): any => {
                                  const total = node.values?.reduce((a: number, b: number) => a + b, 0) ?? 0;
                                  const risk = node.risk ?? (node.values && node.values[1] ? node.values[1] / (total || 1) : 0);
                                  const summaryLabel = `${node.name}\n${(risk * 100).toFixed(1)}% • ${node.samples} samples`;
                                  
                                  return {
                                    name: summaryLabel,
                                    __raw: node, // Store raw node data
                                    children: node.children ? node.children.map(mapTree) : undefined,
                                  };
                                };
                                return mapTree(result.treeData);
                              })()}
                              translate={{ x: 400, y: 60 }}
                              orientation="vertical"
                              pathFunc="step"
                              collapsible={false}
                              zoomable={true}
                              scaleExtent={{ min: 0.2, max: 2 }}
                              separation={{ siblings: 1.5, nonSiblings: 2 }}
                              nodeSize={{ x: 180, y: 140 }}
                              renderCustomNodeElement={(rd3tProps) => {
                                const { nodeDatum } = rd3tProps;
                                const total = (nodeDatum as any).__raw?.values?.reduce((a: number, b: number) => a + b, 0) ?? 0;
                                const risk = (nodeDatum as any).__raw?.risk ?? 
                                  ((nodeDatum as any).__raw?.values && (nodeDatum as any).__raw?.values[1] 
                                    ? (nodeDatum as any).__raw?.values[1] / (total || 1) 
                                    : 0);
                                const opacity = 0.3 + 0.65 * risk;
                                const fillColor = `rgba(139, 92, 246, ${opacity})`;
                                
                                // Split text into lines
                                const lines = nodeDatum.name.split('\n');
                                
                                return (
                                  <g>
                                    <rect
                                      width={160}
                                      height={70}
                                      x={-80}
                                      y={-35}
                                      rx={6}
                                      ry={6}
                                      fill={fillColor}
                                      stroke="#7c3aed"
                                      strokeWidth={2}
                                    />
                                    <text
                                      fill="#1f2937"
                                      strokeWidth="0"
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                      style={{ fontSize: '10px', fontWeight: 500 }}
                                    >
                                      {lines.map((line: string, i: number) => (
                                        <tspan key={i} x="0" dy={i === 0 ? -8 : 14}>
                                          {line}
                                        </tspan>
                                      ))}
                                    </text>
                                  </g>
                                );
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <AlertTriangle size={32} className="text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 dark:text-gray-400 text-sm">No tree data available</p>
                              <p className="text-xs text-gray-400 mt-1">Calculate risk to generate the decision tree</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Color Legend */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2">🎨 Color Legend</h5>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-4 rounded" style={{ background: "rgba(139,92,246, 0.25)" }}></div>
                            <span className="text-gray-700 dark:text-gray-300">Low Risk (0-25%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-4 rounded" style={{ background: "rgba(139,92,246, 0.5)" }}></div>
                            <span className="text-gray-700 dark:text-gray-300">Medium Risk (25-50%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-4 rounded" style={{ background: "rgba(139,92,246, 0.85)" }}></div>
                            <span className="text-gray-700 dark:text-gray-300">High Risk (50%+)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "metrics" && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Model Performance Metrics</div>
                      {result.validationMetrics && (
                        <div className="space-y-3">
                          {[
                            { label: "Accuracy", value: result.validationMetrics.accuracy, color: "blue", desc: "Overall correctness of predictions" },
                            { label: "Precision", value: result.validationMetrics.precision, color: "green", desc: "Of positive predictions, how many were correct" },
                            { label: "Recall", value: result.validationMetrics.recall, color: "yellow", desc: "Of actual positives, how many were identified" },
                            { label: "F1 Score", value: result.validationMetrics.f1, color: "purple", desc: "Harmonic mean of precision and recall" },
                            { label: "AUC-ROC", value: result.validationMetrics.auc, color: "pink", desc: "Model's ability to distinguish between classes" },
                          ].map((metric) => (
                            <div key={metric.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {metric.label}
                                  </span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{metric.desc}</p>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                  {typeof metric.value === "number" ? (metric.value * 100).toFixed(1) + "%" : "—"}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className={`h-3 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-700 transition-all`}
                                  style={{ width: `${typeof metric.value === "number" ? metric.value * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-gray-700 p-4 rounded-lg leading-relaxed">
                        <strong>Performance Summary:</strong> These metrics evaluate the model's predictive accuracy on validation data. 
                        Higher values indicate better performance. AUC-ROC closer to 1.0 indicates excellent discrimination ability.
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "projection" && result.projection && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Risk Projection Over Time</div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={result.projection}>
                            <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                            <XAxis 
                              dataKey="year" 
                              stroke="#6b7280"
                              style={{ fontSize: '12px', fontWeight: 600 }}
                            />
                            <YAxis 
                              domain={[0, 1]} 
                              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                              stroke="#6b7280"
                              style={{ fontSize: '12px', fontWeight: 600 }}
                            />
                            <Tooltip 
                              formatter={(value: any) => `${(Number(value) * 100).toFixed(2)}%`}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: '2px solid #7c3aed',
                                borderRadius: '8px',
                                fontSize: '13px',
                                padding: '8px 12px'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="probability"
                              name="Risk Probability"
                              stroke="#7c3aed"
                              strokeWidth={3}
                              dot={{ r: 5, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {result.projection.slice(0, 6).map((item, idx) => (
                          <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Year {item.year}</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {(item.probability * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 bg-orange-50 dark:bg-gray-700 p-4 rounded-lg leading-relaxed">
                        <strong>Projection Note:</strong> This timeline shows how risk probability may evolve over the specified 
                        period based on current parameters. Actual risk can be influenced by lifestyle changes, medical interventions, 
                        and environmental factors not captured in this model.
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "bayesian" && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Bayesian Logistic Regression Formula</div>
                      
                      {result?.coefficients && (() => {
                        const coef = result.coefficients;
                        const intercept = coef.Intercept ?? 0;
                        const logit =
                          intercept +
                          (coef["APOE ε4"] ?? 0) * apoe +
                          (coef["PM2.5"] ?? 0) * pm25 +
                          (coef["NO2"] ?? 0) * no2 +
                          (coef["ASIR"] ?? 0) * asir;
                        const probability = 1 / (1 + Math.exp(-logit));

                        return (
                          <>
                            <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4 mb-4 font-mono text-xs overflow-x-auto">
                              <div className="text-center text-gray-800 dark:text-gray-200">
                                P(Risk) = 1 / [1 + exp(-({intercept.toFixed(2)} + {(coef["APOE ε4"] ?? 0).toFixed(3)}×APOE + {(coef["PM2.5"] ?? 0).toFixed(3)}×PM2.5 + {(coef["NO2"] ?? 0).toFixed(3)}×NO2 + {(coef["ASIR"] ?? 0).toFixed(3)}×ASIR))]
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="bg-gray-100 dark:bg-gray-700">
                                    <th className="p-2 text-left font-semibold border-b border-gray-300 dark:border-gray-600">Variable</th>
                                    <th className="p-2 text-right font-semibold border-b border-gray-300 dark:border-gray-600">Input Value</th>
                                    <th className="p-2 text-right font-semibold border-b border-gray-300 dark:border-gray-600">Coefficient</th>
                                    <th className="p-2 text-right font-semibold border-b border-gray-300 dark:border-gray-600">Contribution</th>
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-2 font-semibold text-purple-600 dark:text-purple-400">Intercept</td>
                                    <td className="p-2 text-right text-gray-500">—</td>
                                    <td className="p-2 text-right font-mono">{intercept.toFixed(4)}</td>
                                    <td className="p-2 text-right font-mono font-semibold">{intercept.toFixed(4)}</td>
                                  </tr>

                                  {featureLabels.map((f) => {
                                    const val =
                                      f.label === "APOE ε4" ? apoe : f.label === "PM2.5" ? pm25 : f.label === "NO2" ? no2 : asir;
                                    const c = (coef as any)[f.label] ?? 0;
                                    const contrib = val * c;

                                    return (
                                      <tr key={f.label} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="p-2 font-medium">{f.label}</td>
                                        <td className="p-2 text-right font-mono">{val}</td>
                                        <td className="p-2 text-right font-mono">{c.toFixed(4)}</td>
                                        <td className="p-2 text-right font-mono font-semibold">{contrib.toFixed(4)}</td>
                                      </tr>
                                    );
                                  })}

                                  <tr className="bg-purple-100 dark:bg-purple-900 font-bold">
                                    <td className="p-2">Total Logit</td>
                                    <td colSpan={3} className="p-2 text-right font-mono text-base">
                                      {logit.toFixed(4)}
                                    </td>
                                  </tr>

                                  <tr className="bg-purple-600 text-white font-bold">
                                    <td className="p-2">Final Probability</td>
                                    <td colSpan={3} className="p-2 text-right text-lg">
                                      {(probability * 100).toFixed(2)}%
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg mt-3">
                              <strong>How to Read:</strong> Each variable's contribution shows how much it adds to the total logit score. The logit is then transformed through the sigmoid function (1 / [1 + e^(-logit)]) to produce the final probability percentage.
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                  {activeTab === "recommendations" && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium flex items-center gap-2">
                        <Lightbulb size={16} className="text-yellow-500" />
                        Personalized Recommendations
                      </div>
                      
                      {/* Risk Level Banner */}
                      <div className={`rounded-xl p-4 border-2 ${
                        result.bayesian >= 0.7 
                          ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800" 
                          : result.bayesian >= 0.4 
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800"
                          : "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {result.bayesian >= 0.7 ? (
                            <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                          ) : result.bayesian >= 0.4 ? (
                            <HelpCircle size={24} className="text-orange-600 dark:text-orange-400" />
                          ) : (
                            <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                          )}
                          <div>
                            <div className={`font-bold text-lg ${
                              result.bayesian >= 0.7 
                                ? "text-red-700 dark:text-red-300" 
                                : result.bayesian >= 0.4 
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-green-700 dark:text-green-300"
                            }`}>
                              {result.bayesian >= 0.7 ? "High Risk Level" : result.bayesian >= 0.4 ? "Moderate Risk Level" : "Low Risk Level"}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {((result.bayesian ?? 0) * 100).toFixed(1)}% Alzheimer's Disease Risk
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Medical Consultation */}
                      {result.bayesian >= 0.4 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-600 rounded-full p-2">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Medical Consultation Recommended</div>
                              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                                <li>Schedule appointment with neurologist or geriatrician</li>
                                <li>Request comprehensive cognitive assessment</li>
                                <li>Discuss family history and genetic testing options</li>
                                {result.bayesian >= 0.7 && <li className="font-semibold">Consider MRI brain scan for baseline imaging</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Lifestyle Modifications */}
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="font-semibold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Lifestyle Modifications
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🧠 Cognitive Health</div>
                            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                              <li>• Engage in mentally stimulating activities</li>
                              <li>• Learn new skills or languages</li>
                              <li>• Play strategy games and puzzles</li>
                              <li>• Read regularly and stay socially active</li>
                            </ul>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🏃 Physical Activity</div>
                            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                              <li>• 150 minutes moderate exercise weekly</li>
                              <li>• Include aerobic and strength training</li>
                              <li>• Walking, swimming, or cycling</li>
                              <li>• Yoga or tai chi for balance</li>
                            </ul>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🥗 Nutrition</div>
                            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                              <li>• Mediterranean or MIND diet</li>
                              <li>• Omega-3 rich foods (fish, nuts)</li>
                              <li>• Antioxidant-rich fruits and vegetables</li>
                              <li>• Limit processed foods and sugar</li>
                            </ul>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">😴 Sleep & Stress</div>
                            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
                              <li>• 7-9 hours quality sleep nightly</li>
                              <li>• Manage stress through meditation</li>
                              <li>• Maintain regular sleep schedule</li>
                              <li>• Address sleep disorders promptly</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Environmental Factors */}
                      {(pm25 > 25 || no2 > 30) && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                          <div className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
                            <Cloud size={18} />
                            Air Quality Concerns
                          </div>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                            {pm25 > 25 && <li>Your PM2.5 exposure ({pm25.toFixed(1)} µg/m³) is elevated - Consider air purifiers at home</li>}
                            {no2 > 30 && <li>Your NO2 exposure ({no2.toFixed(1)} ppb) is elevated - Limit outdoor activities during high pollution</li>}
                            <li>Use N95 masks during poor air quality days</li>
                            <li>Keep windows closed when outdoor pollution is high</li>
                            <li>Consider relocating to areas with better air quality if possible</li>
                          </ul>
                        </div>
                      )}
                      
                      {/* Genetic Factors */}
                      {apoe >= 1 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                            <Cpu size={18} />
                            Genetic Risk Factor (APOE ε4: {apoe})
                          </div>
                          <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1 list-disc list-inside">
                            <li>You carry {apoe} APOE ε4 allele{apoe > 1 ? 's' : ''} - increased genetic risk</li>
                            <li>More aggressive lifestyle interventions recommended</li>
                            <li>Consider genetic counseling for family planning</li>
                            <li>Regular cognitive monitoring starting earlier (age 50+)</li>
                            {apoe === 2 && <li className="font-semibold">Homozygous ε4/ε4 - highest genetic risk, prioritize all preventive measures</li>}
                          </ul>
                        </div>
                      )}
                      
                      {/* Monitoring Schedule */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <CalendarCheck size={18} />
                          Recommended Monitoring Schedule
                        </div>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {result.bayesian >= 0.7 ? (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span><strong>Every 6 months:</strong> Cognitive screening and medical check-up</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span><strong>Annually:</strong> Comprehensive neurological evaluation</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span><strong>As needed:</strong> Brain imaging (MRI) for baseline and comparison</span>
                              </div>
                            </>
                          ) : result.bayesian >= 0.4 ? (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span><strong>Annually:</strong> Cognitive screening and health assessment</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span><strong>Every 2-3 years:</strong> Comprehensive neurological check-up</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span><strong>Every 2-3 years:</strong> Routine cognitive screening</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span><strong>Maintain:</strong> Healthy lifestyle and regular check-ups</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Disclaimer */}
                      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
                        <strong>Important:</strong> These recommendations are based on your risk assessment and should not replace professional medical advice. Always consult with qualified healthcare providers before making significant health decisions.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expand Button for Full View */}
              <button
                onClick={() => setShowFullTree(true)}
                className="w-full py-3 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400"
              >
                <GitBranch size={16} />
                View Full Decision Tree Analysis
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Decision Tree Modal */}
      {showFullTree && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <GitBranch size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Decision Tree Analysis - Full Screen
                  </h2>
                  <p className="text-sm text-white/90">
                    Interactive visualization of risk classification paths
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Help Tooltip */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip("tree-fullscreen-guide")}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <HelpCircle size={24} className="text-white" />
                  </button>
                  {showTooltip === "tree-fullscreen-guide" && (
                    <div className="absolute z-50 right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl p-4 text-xs">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                            <GitBranch size={14} />
                            About Decision Trees
                          </h4>
                          <div className="space-y-2 text-gray-700 dark:text-gray-300">
                            <p><strong>What is it?</strong> A flowchart-like structure that makes predictions by asking yes/no questions about your data.</p>
                            <p><strong>How to read:</strong> Start at the top (root node) and follow branches downward. Each split is a decision based on feature values.</p>
                            <p><strong>Node colors:</strong> Darker purple = higher risk. Lighter purple = lower risk.</p>
                            <p><strong>Key features:</strong> The tree prioritizes ASIR, PM2.5, NO2, APOE ε4 at the top.</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                            📖 How to Use
                          </h4>
                          <ul className="space-y-1 text-gray-700 dark:text-gray-300 list-disc list-inside">
                            <li><strong>Zoom:</strong> Scroll to zoom in/out</li>
                            <li><strong>Pan:</strong> Click and drag to move</li>
                            <li><strong>Click Nodes:</strong> See details in right panel</li>
                            <li><strong>Metrics:</strong> View model performance on the right</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowFullTree(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={28} className="text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content - Single Row Layout */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left Side - Tree Visualization (70%) */}
              <div className="flex-1 overflow-hidden p-6 bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-full">
                  {result.treeData ? (
                    <div className="w-full h-full tree-container">
                      <style>{`
                        .tree-container .rd3t-link {
                          stroke: #9333ea !important;
                          stroke-width: 2px !important;
                        }
                        .tree-container .rd3t-node circle {
                          display: none !important;
                        }
                      `}</style>
                      <Tree
                        data={(() => {
                          const mapTree = (node: any): any => {
                            const total = node.values?.reduce((a: number, b: number) => a + b, 0) ?? 0;
                            const risk = node.risk ?? (node.values && node.values[1] ? node.values[1] / (total || 1) : 0);
                            const summaryLabel = `${node.name}\n${(risk * 100).toFixed(1)}% • ${node.samples} samples`;
                            
                            return {
                              name: summaryLabel,
                              __raw: node,
                              children: node.children ? node.children.map(mapTree) : undefined,
                            };
                          };
                          return mapTree(result.treeData);
                        })()}
                        translate={{ x: 600, y: 80 }}
                        orientation="vertical"
                        pathFunc="step"
                        collapsible={false}
                        zoomable={true}
                        scaleExtent={{ min: 0.2, max: 2 }}
                        separation={{ siblings: 1.5, nonSiblings: 2 }}
                        nodeSize={{ x: 180, y: 140 }}
                        renderCustomNodeElement={(rd3tProps) => {
                          const { nodeDatum } = rd3tProps;
                          const total = (nodeDatum as any).__raw?.values?.reduce((a: number, b: number) => a + b, 0) ?? 0;
                          const risk = (nodeDatum as any).__raw?.risk ?? 
                            ((nodeDatum as any).__raw?.values && (nodeDatum as any).__raw?.values[1] 
                              ? (nodeDatum as any).__raw?.values[1] / (total || 1) 
                              : 0);
                          const opacity = 0.3 + 0.65 * risk;
                          const fillColor = `rgba(139, 92, 246, ${opacity})`;
                          
                          const lines = nodeDatum.name.split('\n');
                          
                          return (
                            <g>
                              <rect
                                width={160}
                                height={70}
                                x={-80}
                                y={-35}
                                rx={6}
                                ry={6}
                                fill={fillColor}
                                stroke="#7c3aed"
                                strokeWidth={2}
                              />
                              <text
                                fill="#1f2937"
                                strokeWidth="0"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: '10px', fontWeight: 500 }}
                              >
                                {lines.map((line: string, i: number) => (
                                  <tspan key={i} x="0" dy={i === 0 ? -8 : 14}>
                                    {line}
                                  </tspan>
                                ))}
                              </text>
                            </g>
                          );
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No tree data available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                          Please calculate risk first to generate the decision tree
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Metrics (30%) */}
              <div className="w-[400px] overflow-y-auto p-6 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
                {/* Model Performance Metrics */}
                {result.validationMetrics && (
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border border-green-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <BarChart3 size={20} className="text-green-600 dark:text-green-400" />
                      Model Performance
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: "Accuracy", value: result.validationMetrics.accuracy, color: "blue", desc: "Overall correctness" },
                        { label: "Precision", value: result.validationMetrics.precision, color: "green", desc: "Positive prediction accuracy" },
                        { label: "Recall", value: result.validationMetrics.recall, color: "yellow", desc: "True positive rate" },
                        { label: "F1 Score", value: result.validationMetrics.f1, color: "purple", desc: "Harmonic mean" },
                        { label: "AUC-ROC", value: result.validationMetrics.auc, color: "pink", desc: "Classification ability" },
                        { label: "OOB Error", value: result.validationMetrics.oobError, color: "red", desc: "Out-of-bag error" },
                      ].map((metric) => (
                        <div key={metric.label} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{metric.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{metric.desc}</div>
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {typeof metric.value === "number" ? (metric.value * 100).toFixed(1) + "%" : "—"}
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-2 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-700 transition-all`}
                              style={{ width: `${typeof metric.value === "number" ? metric.value * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Parameters */}
                <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border border-purple-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Sigma size={20} className="text-purple-600 dark:text-purple-400" />
                    Current Parameters
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">APOE ε4 Alleles</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{apoe}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">PM2.5 Level</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{pm25} µg/m³</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">NO2 Level</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">{no2} ppb</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ASIR</span>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{asir}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Results */}
                <div className="mt-6 space-y-3">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-90 mb-1">Bayesian Risk</div>
                    <div className="text-3xl font-bold">{((result.bayesian ?? 0) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-90 mb-1">Random Forest Risk</div>
                    <div className="text-3xl font-bold">{((result.randomForest ?? 0) * 100).toFixed(1)}%</div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowFullTree(false)}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Close Full Screen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
