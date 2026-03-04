import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import { MapPin, Info, Layers, TrendingUp } from "lucide-react";

interface MunicipalityAttributes {
  OBJECTID: number;
  city_name: string;
  prov_name: string;
  reg_name: string;
  munpop2020: number;
  munarea_sqkm: number;
  income_class: string;
  urban_rural2015: string;
}

export default function HeatMapPage() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [mapView, setMapView] = useState<any>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityAttributes | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [loading, setLoading] = useState(true);

  // Calculate risk score based on Alzheimer's risk factors
  const calculateRiskScore = (attributes: any): number => {
    // Using the Bayesian Logistic Regression model factors:
    // APOE ε4: Genetic risk (estimated from population genetics)
    // PM2.5: Air pollution - fine particulate matter
    // NO2: Air pollution - nitrogen dioxide
    // ASIR: Age-Standardized Incidence Rate
    
    // Estimate APOE ε4 prevalence (average ~0.3 alleles per person in general population)
    const apoe = 0.3;
    
    // Estimate PM2.5 based on urbanization and population density (more conservative)
    const popDensity = attributes.munpop2020 / attributes.munarea_sqkm;
    let pm25 = 8; // Base rural level
    if (attributes.urban_rural2015 === "Urban") {
      pm25 = popDensity > 2000 ? 25 : popDensity > 1000 ? 20 : popDensity > 500 ? 16 : 12;
    } else if (attributes.urban_rural2015 === "Mixed") {
      pm25 = 12;
    }
    
    // Estimate NO2 based on urbanization (correlated with traffic) - more conservative
    let no2 = 12; // Base rural level
    if (attributes.urban_rural2015 === "Urban") {
      no2 = popDensity > 2000 ? 30 : popDensity > 1000 ? 24 : popDensity > 500 ? 20 : 16;
    } else if (attributes.urban_rural2015 === "Mixed") {
      no2 = 16;
    }
    
    // Estimate ASIR based on population and healthcare access (more conservative)
    let asir = 4; // Base rate
    const incomeClass = attributes.income_class;
    if (incomeClass?.includes("5th") || incomeClass?.includes("6th")) {
      asir = 6; // Higher incidence in lower income areas
    } else if (incomeClass?.includes("4th")) {
      asir = 5.5;
    } else if (incomeClass?.includes("3rd")) {
      asir = 5;
    } else if (incomeClass?.includes("2nd")) {
      asir = 4.5;
    }
    
    // Apply Bayesian Logistic Regression formula
    // P(Risk) = 1 / [1 + exp(-(-7.20 + 0.120*APOE + 0.340*PM2.5 + 0.260*NO2 + 0.520*ASIR))]
    const logit = -7.20 + (0.120 * apoe) + (0.340 * pm25) + (0.260 * no2) + (0.520 * asir);
    const probability = 1 / (1 + Math.exp(-logit));
    
    // Convert probability to 0-100 risk score
    return probability * 100;
  };

  // Get color based on risk score
  const getRiskColor = (riskScore: number): [number, number, number, number] => {
    if (riskScore >= 70) return [220, 38, 38, 0.7]; // High risk - red
    if (riskScore >= 40) return [249, 115, 22, 0.7]; // Moderate risk - orange
    return [234, 179, 8, 0.7]; // Low risk - yellow
  };

  const getRiskLevel = (riskScore: number): string => {
    if (riskScore >= 15) return "High Risk";
    if (riskScore >= 5) return "Moderate Risk";
    return "Low Risk";
  };

  const getEstimatedValues = (attributes: any) => {
    const popDensity = attributes.munpop2020 / attributes.munarea_sqkm;
    const apoe = 0.3;
    
    let pm25 = 8;
    if (attributes.urban_rural2015 === "Urban") {
      pm25 = popDensity > 2000 ? 25 : popDensity > 1000 ? 20 : popDensity > 500 ? 16 : 12;
    } else if (attributes.urban_rural2015 === "Mixed") {
      pm25 = 12;
    }
    
    let no2 = 12;
    if (attributes.urban_rural2015 === "Urban") {
      no2 = popDensity > 2000 ? 30 : popDensity > 1000 ? 24 : popDensity > 500 ? 20 : 16;
    } else if (attributes.urban_rural2015 === "Mixed") {
      no2 = 16;
    }
    
    let asir = 4;
    const incomeClass = attributes.income_class;
    if (incomeClass?.includes("5th") || incomeClass?.includes("6th")) {
      asir = 6;
    } else if (incomeClass?.includes("4th")) {
      asir = 5.5;
    } else if (incomeClass?.includes("3rd")) {
      asir = 5;
    } else if (incomeClass?.includes("2nd")) {
      asir = 4.5;
    }
    
    return { apoe, pm25, no2, asir };
  };

  useEffect(() => {
    let view: any;

    loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/renderers/SimpleRenderer",
      "esri/symbols/SimpleFillSymbol",
      "esri/widgets/Legend",
      "esri/widgets/Expand",
      "esri/widgets/Home",
      "esri/widgets/Search",
      "esri/core/reactiveUtils"
    ], { css: true })
      .then(([
        Map, 
        MapView, 
        FeatureLayer, 
        SimpleRenderer, 
        SimpleFillSymbol,
        Legend,
        Expand,
        Home,
        Search,
        reactiveUtils
      ]) => {
        // Create the map
        const map = new Map({
          basemap: "gray-vector"
        });

        // Create the MapView
        view = new MapView({
          container: mapDiv.current,
          map: map,
          center: [121.0, 14.5], // Philippines center
          zoom: 6,
          popup: {
            dockEnabled: true,
            dockOptions: {
              buttonEnabled: false,
              breakpoint: false
            }
          }
        });

        // Create municipality layer with risk-based renderer
        const municipalityLayer = new FeatureLayer({
          url: "https://ulap-nga.georisk.gov.ph/arcgis/rest/services/PSA/Municipal/MapServer/0",
          outFields: ["*"],
          popupTemplate: {
            title: "{city_name}, {prov_name}",
            content: (feature: any) => {
              const attrs = feature.graphic.attributes;
              const riskScore = calculateRiskScore(attrs);
              const riskLevel = getRiskLevel(riskScore);
              const riskColor = riskScore >= 15 ? "text-red-600" : riskScore >= 5 ? "text-orange-600" : "text-yellow-600";
              const estimates = getEstimatedValues(attrs);
              
              return `
                <div class="p-4">
                  <div class="mb-4 p-3 bg-gradient-to-r ${riskScore >= 15 ? 'from-red-50 to-red-100' : riskScore >= 5 ? 'from-orange-50 to-orange-100' : 'from-yellow-50 to-yellow-100'} rounded-lg border-2 ${riskScore >= 15 ? 'border-red-300' : riskScore >= 5 ? 'border-orange-300' : 'border-yellow-300'}">
                    <div class="text-lg font-bold ${riskColor}">${riskLevel}</div>
                    <div class="text-2xl font-bold text-gray-800">${riskScore.toFixed(1)}%</div>
                    <div class="text-xs text-gray-600 mt-1">Alzheimer's Risk Probability</div>
                  </div>
                  
                  <div class="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div class="text-xs font-semibold text-purple-800 mb-2">Estimated Risk Factors:</div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div class="flex items-center gap-1">
                        <span class="font-semibold text-purple-700">APOE ε4:</span>
                        <span class="text-gray-900">${estimates.apoe.toFixed(1)}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="font-semibold text-purple-700">PM2.5:</span>
                        <span class="text-gray-900">${estimates.pm25.toFixed(1)} µg/m³</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="font-semibold text-purple-700">NO2:</span>
                        <span class="text-gray-900">${estimates.no2.toFixed(1)} ppb</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="font-semibold text-purple-700">ASIR:</span>
                        <span class="text-gray-900">${estimates.asir.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between border-b pb-1">
                      <span class="font-semibold text-gray-700">Region:</span>
                      <span class="text-gray-900">${attrs.reg_name || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                      <span class="font-semibold text-gray-700">Province:</span>
                      <span class="text-gray-900">${attrs.prov_name || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                      <span class="font-semibold text-gray-700">Population (2020):</span>
                      <span class="text-gray-900">${(attrs.munpop2020 || 0).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                      <span class="font-semibold text-gray-700">Area:</span>
                      <span class="text-gray-900">${(attrs.munarea_sqkm || 0).toFixed(2)} km²</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                      <span class="font-semibold text-gray-700">Population Density:</span>
                      <span class="text-gray-900">${((attrs.munpop2020 || 0) / (attrs.munarea_sqkm || 1)).toFixed(0)} per km²</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                      <span class="font-semibold text-gray-700">Classification:</span>
                      <span class="text-gray-900">${attrs.urban_rural2015 || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                      <span class="font-semibold text-gray-700">Income Class:</span>
                      <span class="text-gray-900">${attrs.income_class || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="text-xs font-semibold text-blue-800 mb-2">Risk Factor Analysis:</div>
                    <ul class="text-xs text-blue-900 space-y-1">
                      ${estimates.pm25 > 18 ? '<li>• Elevated PM2.5 levels increase neuroinflammation risk</li>' : ''}
                      ${estimates.no2 > 22 ? '<li>• High NO2 exposure from traffic pollution</li>' : ''}
                      ${estimates.asir > 5.5 ? '<li>• Higher age-standardized incidence rate in this area</li>' : ''}
                      ${attrs.urban_rural2015 === 'Urban' ? '<li>• Urban environment with higher pollution exposure</li>' : ''}
                      ${riskScore < 5 ? '<li>• Lower overall risk due to better environmental conditions</li>' : ''}
                    </ul>
                  </div>
                  
                  <div class="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
                    <strong>Note:</strong> Values are estimated based on urbanization, population density, and socioeconomic factors. Actual measurements may vary.
                  </div>
                </div>
              `;
            }
          },
          renderer: new SimpleRenderer({
            symbol: new SimpleFillSymbol({
              style: "solid",
              outline: {
                color: [128, 128, 128, 0.5],
                width: 0.5
              }
            }),
            visualVariables: [{
              type: "color",
              valueExpression: `
                // Estimate APOE ε4 (population average - conservative)
                var apoe = 0.3;
                
                // Estimate PM2.5 based on urbanization and density (more conservative)
                var popDensity = $feature.munpop2020 / $feature.munarea_sqkm;
                var pm25 = 8;
                if ($feature.urban_rural2015 == 'Urban') {
                  if (popDensity > 2000) { pm25 = 25; }
                  else if (popDensity > 1000) { pm25 = 20; }
                  else if (popDensity > 500) { pm25 = 16; }
                  else { pm25 = 12; }
                } else if ($feature.urban_rural2015 == 'Mixed') {
                  pm25 = 12;
                }
                
                // Estimate NO2 based on urbanization (more conservative)
                var no2 = 12;
                if ($feature.urban_rural2015 == 'Urban') {
                  if (popDensity > 2000) { no2 = 30; }
                  else if (popDensity > 1000) { no2 = 24; }
                  else if (popDensity > 500) { no2 = 20; }
                  else { no2 = 16; }
                } else if ($feature.urban_rural2015 == 'Mixed') {
                  no2 = 16;
                }
                
                // Estimate ASIR based on income class (more conservative)
                var asir = 4;
                var incomeClass = $feature.income_class;
                if (Find('5th', incomeClass) > -1 || Find('6th', incomeClass) > -1) { asir = 6; }
                else if (Find('4th', incomeClass) > -1) { asir = 5.5; }
                else if (Find('3rd', incomeClass) > -1) { asir = 5; }
                else if (Find('2nd', incomeClass) > -1) { asir = 4.5; }
                
                // Bayesian Logistic Regression: P = 1 / (1 + exp(-logit))
                var logit = -7.20 + (0.120 * apoe) + (0.340 * pm25) + (0.260 * no2) + (0.520 * asir);
                var probability = 1 / (1 + Exp(-logit));
                
                return probability * 100;
              `,
              stops: [
                { value: 0, color: [254, 240, 138, 0.7], label: "Low Risk (0-5%)" },
                { value: 5, color: [251, 191, 36, 0.7], label: "Moderate Risk (5-15%)" },
                { value: 15, color: [239, 68, 68, 0.7], label: "High Risk (15%+)" }
              ]
            }]
          })
        });

        map.add(municipalityLayer);

        // Add Home widget
        const homeWidget = new Home({
          view: view
        });
        view.ui.add(homeWidget, "top-left");

        // Add Search widget
        const searchWidget = new Search({
          view: view,
          sources: [{
            layer: municipalityLayer,
            searchFields: ["city_name", "prov_name", "reg_name"],
            displayField: "city_name",
            exactMatch: false,
            outFields: ["*"],
            name: "Municipalities",
            placeholder: "Search municipality...",
            resultSymbol: {
              type: "simple-fill",
              color: [147, 51, 234, 0.5],
              outline: {
                color: [147, 51, 234, 1],
                width: 3
              }
            }
          }]
        });
        
        const searchExpand = new Expand({
          view: view,
          content: searchWidget,
          expandIconClass: "esri-icon-search",
          expanded: false
        });
        view.ui.add(searchExpand, "top-right");

        // Add Legend
        const legend = new Legend({
          view: view,
          layerInfos: [{
            layer: municipalityLayer,
            title: "Alzheimer's Risk Level"
          }]
        });
        
        const legendExpand = new Expand({
          view: view,
          content: legend,
          expanded: true,
          expandIconClass: "esri-icon-layer-list"
        });
        view.ui.add(legendExpand, "bottom-left");

        // Handle click events
        view.on("click", (event: any) => {
          view.hitTest(event).then((response: any) => {
            if (response.results.length) {
              const graphic = response.results[0].graphic;
              if (graphic.layer === municipalityLayer) {
                const attrs = graphic.attributes;
                setSelectedMunicipality({
                  OBJECTID: attrs.OBJECTID,
                  city_name: attrs.city_name,
                  prov_name: attrs.prov_name,
                  reg_name: attrs.reg_name,
                  munpop2020: attrs.munpop2020,
                  munarea_sqkm: attrs.munarea_sqkm,
                  income_class: attrs.income_class,
                  urban_rural2015: attrs.urban_rural2015
                });
              }
            }
          });
        });

        setMapView(view);
        setLoading(false);

        return () => {
          if (view) {
            view.destroy();
          }
        };
      })
      .catch((err) => {
        console.error("Error loading ArcGIS modules:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MapPin size={32} />
            <h1 className="text-4xl font-bold">Alzheimer's Risk Heat Map</h1>
          </div>
          <p className="text-center text-purple-100 max-w-3xl mx-auto">
            Interactive visualization of Alzheimer's disease risk across Philippine municipalities based on population density, urbanization, and socioeconomic factors
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3 max-w-5xl mx-auto">
            <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <strong>How Risk is Calculated:</strong> Risk probabilities are computed using the Bayesian Logistic Regression model with four key factors: APOE ε4 (genetic risk), PM2.5 (fine particulate matter), NO2 (nitrogen dioxide), and ASIR (age-standardized incidence rate). Values are estimated based on urbanization, population density, and socioeconomic indicators.
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">Loading map data...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={mapDiv} 
            className="w-full h-[calc(100vh-300px)] min-h-[600px]"
            style={{ position: 'relative' }}
          />
        </div>

        {/* Legend Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 border-2 border-yellow-300 dark:border-yellow-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center">
                <TrendingUp size={24} className="text-yellow-900" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">Low Risk</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">0-5%</div>
              </div>
            </div>
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Lower pollution levels (PM2.5 &lt; 15, NO2 &lt; 20), rural environment, lower ASIR (4-5)
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border-2 border-orange-300 dark:border-orange-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-orange-400 flex items-center justify-center">
                <TrendingUp size={24} className="text-orange-900" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">Moderate Risk</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">5-15%</div>
              </div>
            </div>
            <p className="text-xs text-orange-800 dark:text-orange-200">
              Moderate pollution (PM2.5 15-20, NO2 20-25), mixed urban-rural, moderate ASIR (5-5.5)
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border-2 border-red-300 dark:border-red-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-200">High Risk</div>
                <div className="text-sm text-red-700 dark:text-red-300">15%+</div>
              </div>
            </div>
            <p className="text-xs text-red-800 dark:text-red-200">
              High pollution (PM2.5 &gt; 20, NO2 &gt; 25), dense urban areas, higher ASIR (6+)
            </p>
          </div>
        </div>

        {/* Data Source */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Layers size={16} />
            <span>
              <strong>Data Source:</strong> Philippine Statistics Authority (PSA) Municipal Boundaries via ULAP-NGA GeoRisk Portal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
