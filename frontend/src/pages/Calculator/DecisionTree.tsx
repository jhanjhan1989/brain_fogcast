// src/components/DecisionTreeD3.tsx
import React, { useRef, useEffect, useState } from "react";
import Tree from "react-d3-tree";

interface TreeNode {
    name: string;
    gini: number;
    samples: number;
    values: number[];
    risk?: number;
    children?: TreeNode[];
    [k: string]: any;
}

interface ROCPoint {
    fpr: number;
    tpr: number;
}

interface Metrics {
    auc?: number;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1?: number;
    oob_error?: number;
    roc?: ROCPoint[];
}

interface DecisionTreeProps {
    treeData?: TreeNode;
    metrics?: Metrics;
}

// Helper: convert node values to risk percentage
const nodeRisk = (node: TreeNode) => {
    const total = (node.values || []).reduce((a, b) => a + b, 0) || 1;
    const pos = (node.values && node.values[1]) ?? 0;
    return pos / total;
};

// Helper: find path from root to node by name
const findPathToNode = (root: TreeNode, targetName: string): TreeNode[] | null => {
    const path: TreeNode[] = [];
    const dfs = (node: TreeNode): boolean => {
        path.push(node);
        if (node.name === targetName) return true;
        if (node.children) for (const c of node.children) if (dfs(c)) return true;
        path.pop();
        return false;
    };
    return dfs(root) ? path : null;
};

export default function DecisionTreeD3({ treeData, metrics: externalMetrics }: DecisionTreeProps) {
    const treeContainer = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [pathToNode, setPathToNode] = useState<TreeNode[] | null>(null);

    useEffect(() => {
        const onResize = () => {
            if (treeContainer.current) {
                setDimensions({
                    width: treeContainer.current.offsetWidth,
                    height: Math.max(400, treeContainer.current.offsetHeight),
                });
            }
        };
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    if (!treeData) {
        return <p className="text-gray-500 dark:text-gray-400">Compute risk to see the decision tree.</p>;
    }

    const metrics: Metrics = (treeData as any).validationMetrics ?? externalMetrics ?? {};

    const mapTree = (node: TreeNode): any => {
        const total = node.values?.reduce((a, b) => a + b, 0) ?? 0;
        const probs = node.values ? node.values.map((v) => ((v / (total || 1)) * 100).toFixed(2)) : [];
        const risk = node.risk ?? nodeRisk(node);
        const summaryLabel = `${node.name}\n${(risk * 100).toFixed(1)}% • Samples ${node.samples}`;
        return {
            name: summaryLabel,
            rawName: node.name,
            __raw: node,
            attributes: {
                Gini: node.gini?.toFixed?.(5) ?? "N/A",
                Samples: node.samples ?? "N/A",
                Values: node.values ? `[${node.values.join(", ")}]` : "N/A",
                "Probs (%)": probs.length ? `[${probs.join(", ")}]` : "N/A",
            },
            nodeSvgShape: {
                shape: "rect",
                shapeProps: {
                    width: 280,
                    height: 110,
                    x: -140,
                    y: -55,
                    rx: 12,
                    ry: 12,
                    fill: `rgba(139,92,246, ${0.25 + 0.6 * (risk ?? 0)})`,
                    stroke: "#6b21a8",
                    strokeWidth: 2,
                },
            },
            children: node.children ? node.children.map(mapTree) : undefined,
        };
    };

    const formattedData = mapTree(treeData);

    const handleNodeClick = (nodeDatum: any) => {
        const rawNode: TreeNode | undefined = nodeDatum?.__raw;
        const name = nodeDatum?.rawName ?? nodeDatum?.name;
        const realNode = rawNode ?? findNodeByName(treeData, name);
        setSelectedNode(realNode ?? null);
        setPathToNode(realNode ? findPathToNode(treeData, realNode.name) : null);
    };

    const findNodeByName = (root: TreeNode, name: string): TreeNode | null => {
        let found: TreeNode | null = null;
        const dfs = (n: TreeNode) => {
            if (n.name === name) {
                found = n;
                return;
            }
            if (n.children) n.children.forEach(dfs);
        };
        dfs(root);
        return found;
    };

    const ROCPlot = ({ roc, auc }: { roc?: ROCPoint[]; auc?: number }) => {
        const w = 220;
        const h = 220;
        const pad = 30;

        if (!roc || roc.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-2 p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-300">AUC</div>
                    <div className="text-xl font-semibold">{typeof auc === "number" ? auc.toFixed(3) : "N/A"}</div>
                    <div className="text-[11px] text-gray-500">ROC curve not available</div>
                </div>
            );
        }

        const points = roc.map((pt) => {
            const x = pad + pt.fpr * (w - 2 * pad);
            const y = h - pad - pt.tpr * (h - 2 * pad);
            return `${x},${y}`;
        });

        const diag = `${pad},${h - pad} ${w - pad},${pad}`;

        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
                <rect x={0} y={0} width={w} height={h} rx={6} fill="transparent" />
                <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="rgba(0,0,0,0.1)" />
                <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(0,0,0,0.1)" />
                <polyline points={diag} fill="none" stroke="#cbd5e1" strokeDasharray="4 4" />
                <polyline points={points.join(" ")} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {roc.map((pt, i) => {
                    const x = pad + pt.fpr * (w - 2 * pad);
                    const y = h - pad - pt.tpr * (h - 2 * pad);
                    return <circle key={i} cx={x} cy={y} r={2.2} fill="#7c3aed" />;
                })}
                <text x={pad} y={pad - 6} fontSize={10} fill="#4b5563">TPR</text>
                <text x={w - pad - 20} y={h - pad + 18} fontSize={10} fill="#4b5563">FPR</text>
                <text x={w - pad - 8} y={pad + 10} fontSize={12} fill="#111827" textAnchor="end">
                    AUC: {typeof auc === "number" ? auc.toFixed(3) : "N/A"}
                </text>
            </svg>
        );
    };

    const renderDecisionPath = () => {
        if (!pathToNode || !pathToNode.length) return <div className="text-sm text-gray-500">No path found.</div>;
        return (
            <ol className="flex flex-col gap-2 text-sm">
                {pathToNode.map((n, idx) => {
                    const parsed = n.name;
                    const riskPct = (nodeRisk(n) * 100).toFixed(1);
                    const isLeaf = !n.children || n.children.length === 0;
                    return (
                        <li key={idx} className="flex items-start gap-3">
                            <div className={`min-w-[8px] h-8 rounded-full ${isLeaf ? "bg-green-400" : "bg-purple-500"} mt-1`} />
                            <div>
                                <div className="font-medium text-gray-800 dark:text-gray-100">{parsed}</div>
                                <div className="text-[12px] text-gray-500 dark:text-gray-300">
                                    Samples: {n.samples ?? "N/A"} • Risk: {riskPct}% • Gini: {n.gini?.toFixed?.(4) ?? "N/A"}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        );
    };

    const renderSelectedNodePanel = () => {
        if (!selectedNode) return <div className="p-4 text-sm text-gray-500">Click a node on the tree to see details.</div>;

        const node = selectedNode;
        const total = (node.values || []).reduce((a, b) => a + b, 0) || 0;
        const probs = node.values ? node.values.map((v) => (total ? v / total : 0)) : [];
        const riskProb = node.risk ?? nodeRisk(node);
        const predictedIdx = node.values?.reduce((bestIdx, v, i, arr) => (v > arr[bestIdx] ? i : bestIdx), 0) ?? 0;
        const predictedClass = predictedIdx === 1 ? "Positive" : "Negative";

        return (
            <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">Selected Node</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.name}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Predicted</div>
                        <div className="text-sm font-semibold">{predictedClass}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <div className="text-[11px] text-gray-500">Risk Probability</div>
                        <div className="font-medium">{(riskProb * 100).toFixed(2)}%</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <div className="text-[11px] text-gray-500">Samples</div>
                        <div className="font-medium">{node.samples ?? "N/A"}</div>
                    </div>
                    <div className="col-span-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <div className="text-[11px] text-gray-500">Values (class counts)</div>
                        <div className="font-medium">{node.values ? `[${node.values.join(", ")}]` : "N/A"}</div>
                    </div>
                </div>

                <div>
                    <div className="text-xs text-gray-500 mb-1">Probability Distribution</div>
                    <div className="flex gap-2 items-center">
                        {probs.length
                            ? probs.map((p, i) => (
                                <div key={i} className="flex-1 text-xs">
                                    <div className="flex justify-between mb-1">
                                        <div className="text-[11px] text-gray-600">Class {i}</div>
                                        <div className="text-[11px] font-semibold">{(p * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                        <div style={{ width: `${(p * 100).toFixed(1)}%` }} className="h-2 bg-purple-500" />
                                    </div>
                                </div>
                            ))
                            : <div className="text-[12px] text-gray-500">N/A</div>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div ref={treeContainer} style={{ height: "72vh" }} className="flex-1 bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                <Tree
                    data={formattedData}
                    translate={{ x: dimensions.width / 2, y: 40 }}
                    orientation="vertical"
                    pathFunc="elbow"
                    collapsible
                    zoomable
                    scaleExtent={{ min: 0.4, max: 2 }}
                    separation={{ siblings: 1, nonSiblings: 1.8 }}
                    allowForeignObjects
                    nodeSize={{ x: 320, y: 160 }}
                    onNodeClick={handleNodeClick}
                />
            </div>

            <aside className="w-full lg:w-[420px] flex flex-col gap-4">
                {/* Node Details */}
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Node Details</h4>
                        <div className="text-xs text-gray-500">Click node for details</div>
                    </div>
                    {renderSelectedNodePanel()}
                    <div className="mt-3">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Decision Path</div>
                        <div className="max-h-40 overflow-auto pr-2">{renderDecisionPath()}</div>
                    </div>
                </div>

                {/* Metrics / Validation */}
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Model Validation</h4>
                        <div className="text-xs text-gray-500">Performance</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <div className="text-[11px] text-gray-500">Accuracy</div>
                            <div className="font-semibold">{typeof metrics.accuracy === "number" ? (metrics.accuracy * 100).toFixed(2) + "%" : "N/A"}</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <div className="text-[11px] text-gray-500">Precision</div>
                            <div className="font-semibold">{typeof metrics.precision === "number" ? (metrics.precision * 100).toFixed(2) + "%" : "N/A"}</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <div className="text-[11px] text-gray-500">Recall</div>
                            <div className="font-semibold">{typeof metrics.recall === "number" ? (metrics.recall * 100).toFixed(2) + "%" : "N/A"}</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <div className="text-[11px] text-gray-500">F1 Score</div>
                            <div className="font-semibold">{typeof metrics.f1 === "number" ? (metrics.f1 * 100).toFixed(2) + "%" : "N/A"}</div>
                        </div>

                        <div className="col-span-2 grid grid-cols-2 gap-3">
                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                <div className="text-[11px] text-gray-500">OOB Error</div>
                                <div className="font-semibold">{typeof metrics.oob_error === "number" ? metrics.oob_error.toFixed(4) : "N/A"}</div>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                <div className="text-[11px] text-gray-500">AUC</div>
                                {typeof metrics.auc === "number" ? metrics.auc.toFixed(3) : "N/A"}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                        <div>
                            <div className="text-[11px] text-gray-500 mb-1">ROC Curve</div>
                            <ROCPlot roc={metrics.roc} auc={metrics.auc} />
                        </div>

                        <div className="flex-1 text-xs text-gray-600 dark:text-gray-300">
                            <div className="mb-2">Notes:</div>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>AUC close to 1.0 indicates strong classifier separation.</li>
                                <li>Precision / Recall depend on chosen threshold.</li>
                                <li>OOB (Out-of-Bag) error estimates performance for ensembles.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
