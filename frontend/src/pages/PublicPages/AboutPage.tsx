import React from "react";
import LogoCircle from "../../assets/logo_circle.png"; 

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 scroll-smooth">

            {/* HERO */}
            <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-20 py-24">
                <div className="max-w-2xl text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-purple-700 dark:text-purple-300 mb-4">
                        About Brain Fogcast
                    </h1>
                    <p className="text-lg md:text-xl mb-6 leading-relaxed">
                        A predictive intelligence system that combines genetics, environment,
                        and epidemiology to forecast Alzheimer’s disease risk — built with
                        advanced machine learning and validated by neurological experts.
                    </p>
                </div>

                <div className="mb-12 md:mb-0  ">
                    <img src={LogoCircle} className="w-full max-w-xs" alt="About Hero" />
                </div>
              
            </section>

            {/* OVERVIEW */}
            <section className="px-6 md:px-20 py-20 bg-purple-50 dark:bg-gray-800 rounded-t-3xl">
                <h2 className="text-4xl font-bold text-center mb-10">What is Brain Fogcast?</h2>

                <p className="max-w-4xl mx-auto text-lg text-center text-gray-700 dark:text-gray-300 leading-relaxed">
                    Brain Fogcast is a predictive system that utilizes
                    <span className="font-semibold text-purple-700 dark:text-purple-300"> Bayesian Logistic Regression </span>
                    and
                    <span className="font-semibold text-purple-700 dark:text-purple-300"> Random Forest </span>
                    to forecast Alzheimer’s risk in selected locations.

                    It analyzes four critical predictors:
                    <br />
                    <span className="font-semibold">APOE ε4</span>,
                    <span className="font-semibold"> NO₂ levels</span>,
                    <span className="font-semibold"> PM2.5 concentration</span>, and
                    <span className="font-semibold"> ASIR</span>.

                    Through color-coded geospatial mapping and transparent statistical metrics,
                    Brain Fogcast presents a vivid and science-based illustration of Alzheimer’s risk.
                </p>
            </section>

            {/* VISION */}
            <section className="px-6 md:px-20 py-24">
                <h2 className="text-4xl font-bold text-center mb-10">Our Vision</h2>

                <div className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                    <p>
                        Our vision is to empower individuals, clinicians, and communities with early,
                        data-driven awareness of Alzheimer’s disease risk.
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>Make predictive analytics accessible for public health awareness.</li>
                        <li>Help neurologists gain environmental and geographical context.</li>
                        <li>Support researchers with interpretable, transparent models.</li>
                        <li>Assist health agencies in identifying high-risk zones.</li>
                        <li>Increase awareness of genetic and environmental impacts on cognitive decline.</li>
                    </ul>
                </div>
            </section>

            {/* MISSION */}
            <section className="px-6 md:px-20 py-24 bg-gray-50 dark:bg-gray-800 rounded-t-3xl">
                <h2 className="text-4xl font-bold text-center mb-12">Our Mission</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    <div className="p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-300">
                            Scientifically Accurate
                        </h3>
                        <p>
                            Backed by medical research, reviewed by licensed neurologists, and refined
                            using validated epidemiological datasets.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-300">
                            Technically Reliable
                        </h3>
                        <p>
                            Powered by machine learning models optimized for precision, interpretability,
                            and stable real-world performance.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-300">
                            People-Centered
                        </h3>
                        <p>
                            Designed to help individuals understand neurological risk in a way that is
                            accessible, intuitive, and action-able.
                        </p>
                    </div>
                </div>
            </section>

         
        </div>
    );
}
