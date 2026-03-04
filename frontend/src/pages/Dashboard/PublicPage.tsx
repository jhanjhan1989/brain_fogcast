import React from "react";
import Hero4 from "../../assets/logo_circle.png";
import Hero5 from "../../assets/logo_circle_dark.png";

export default function PublicPage() {
  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 scroll-smooth">

      {/* HERO SECTION */}
      <header className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-20 py-24 relative overflow-hidden">
        <div className="text-center md:text-left max-w-2xl z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight text-purple-700 dark:text-purple-300 animate-fade-in">
            Brain Fogcast
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-xl">
            A predictive intelligence system designed to forecast Alzheimer’s risk based on genetics, environment, and epidemiological data — powered by Bayesian Logistic Regression and Random Forest.
          </p>

          <div className="flex justify-center md:justify-start gap-4">
            <a
              href="#features"
              className="px-6 py-3 bg-purple-700 text-white font-semibold rounded-xl shadow hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              Explore Features
            </a>
            <a
              href="#about"
              className="px-6 py-3 border border-purple-700 text-purple-700 font-semibold rounded-xl hover:bg-purple-700 hover:text-white transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Light / Dark Hero Images */}

        <div className="mb-12 md:mb-0 z-10  dark:hidden">
          <img src={Hero4} alt="Hero Illustration" className="w-full max-w-xl" />
        </div>
        <div className="mb-12 md:mb-0 z-10 hidden dark:block ">
          <img src={Hero5} alt="Hero Illustration" className="w-full max-w-xl" />
        </div>
      </header>

      {/* ABOUT SECTION */}
      <section id="about" className="px-6 md:px-20 py-24">
        <h2 className="text-4xl font-bold text-center mb-10">
          About Brain Fogcast
        </h2>

        <p className="max-w-4xl mx-auto text-center text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Brain Fogcast is a neurologist-validated predictive system that analyzes Alzheimer's disease risk across locations. It uses
          <span className="font-semibold text-purple-600 dark:text-purple-300">
            {" "}Bayesian Logistic Regression{" "}
          </span>
          and
          <span className="font-semibold text-purple-600 dark:text-purple-300">
            {" "}Random Forest{" "}
          </span>
          to evaluate risk using four major predictors: APOE ε4, PM2.5, NO₂ levels, and Age-Standardized Incidence Rates. With interactive maps and color-coded classifications, the system provides clear, science-driven insights.
        </p>

        <div className="text-center mt-12">
          <p className="text-purple-600 dark:text-purple-300 font-semibold">
            ✓ Validated by a Licensed Adult Neurologist
          </p>
          <p className="text-purple-600 dark:text-purple-300 font-semibold">
            ✓ Reviewed by a Senior Web Developer
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 md:px-20 py-24 bg-purple-50 dark:bg-gray-800 rounded-t-3xl">
        <h2 className="text-4xl font-bold text-center mb-16">
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "AI-Based Risk Prediction",
              text: "Forecast Alzheimer’s risk using Bayesian Logistic Regression and Random Forest algorithms."
            },
            {
              title: "Interactive Risk Map",
              text: "Visualize risk levels across locations, color-coded from low (green) to high (red)."
            },
            {
              title: "Neurologist-Validated Model",
              text: "Reviewed by a licensed adult neurologist to ensure clinical reliability."
            },
            {
              title: "Statistical Insights",
              text: "Accuracy, AUC-ROC, sensitivity, specificity, confidence intervals, and more."
            },
            {
              title: "Genetic & Environmental Inputs",
              text: "Includes APOE ε4 presence, PM2.5 concentration, NO₂ levels, and ASIR values."
            },
            {
              title: "Nearest Hospital Finder",
              text: "Automatically detect the closest medical facility based on your location."
            }
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-8 rounded-3xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 hover:scale-[1.03] bg-white dark:bg-gray-900"
            >
              <h3 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-300">
                {feature.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODEL OUTPUTS SECTION */}
      <section className="px-6 md:px-20 py-24">
        <h2 className="text-4xl font-bold text-center mb-12">
          Prediction Models & Outputs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Bayesian */}
          <div className="p-8 rounded-3xl shadow-xl bg-purple-100 dark:bg-gray-800">
            <h3 className="text-3xl font-semibold mb-4 text-purple-700 dark:text-purple-300">
              Bayesian Logistic Regression
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Probability Equation</li>
              <li>95% Confidence Interval</li>
              <li>Model Accuracy</li>
              <li>Sensitivity & Specificity</li>
              <li>AUC-ROC Score</li>
              <li>Standard Error</li>
              <li>Bayes Factor</li>
            </ul>
          </div>

          {/* Random Forest */}
          <div className="p-8 rounded-3xl shadow-xl bg-purple-100 dark:bg-gray-800">
            <h3 className="text-3xl font-semibold mb-4 text-purple-700 dark:text-purple-300">
              Random Forest Classifier
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Decision Nodes & Tree Paths</li>
              <li>Risk Probability Output</li>
              <li>AUC-ROC Curve</li>
              <li>Precision, Recall, F1 Score</li>
              <li>Model Accuracy</li>
              <li>Out-of-Bag Error</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-24 px-6 md:px-20 text-center bg-gray-50 dark:bg-gray-800 rounded-t-3xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Contact Us
        </h2>
        <p className="text-lg md:text-xl mb-8">
          Have questions or feedback? We’d love to hear from you.
        </p>

        <p className="text-xl font-semibold">
          ✉️ <span className="text-purple-600 dark:text-purple-300">brainfogcast@gmail.com</span>
        </p>
        <p className="text-xl font-semibold mt-2">
          📱 <span className="text-purple-600 dark:text-purple-300">(+63) 945 827 9492</span>
        </p>
      </section>

    </div>
  );
}
