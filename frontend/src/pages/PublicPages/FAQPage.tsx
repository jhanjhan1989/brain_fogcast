"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "What is Bayesian Logistic Regression and Random Forest?",
        answer:
            "Bayesian Logistic Regression is a statistical method that predicts the probability of binary outcomes while incorporating prior beliefs and uncertainty. Random Forest is a machine learning algorithm that builds multiple decision trees and combines their outputs to produce more accurate and stable predictions. In this system, Bayesian Logistic Regression offers interpretable probability scores, while Random Forest enhances predictive accuracy and highlights the most influential variables such as APOE ε4, PM2.5, NO₂, and ASIR."
    },
    {
        question: "What is Apolipoprotein epsilon 4 (APOE ε4)?",
        answer:
            "Apolipoprotein epsilon 4 (APOE ε4) is a gene variant involved in lipid transport and brain metabolism. It is strongly linked to increased Alzheimer’s risk, as carriers tend to develop more amyloid plaques and experience earlier cognitive decline. The system uses allele values (0, 1, or 2) as a key risk input."
    },
    {
        question: "What are the roles of Nitrogen Dioxide (NO₂) and PM2.5 concentration?",
        answer:
            "NO₂ is a harmful air pollutant tied to inflammation and oxidative stress in the brain. PM2.5 refers to tiny particulate matter capable of entering the bloodstream and reaching the brain, carrying harmful toxins. These pollutants contribute to neurodegenerative pathways. PM2.5 is entered in µg/m³, while NO₂ is entered in ppb—values obtainable from weather platforms such as WeaWow."
    },
    {
        question: "What is ASIR and its connection to Alzheimer's risk?",
        answer:
            "ASIR (Age-Standardized Incidence Rate) adjusts Alzheimer’s case counts to reflect differences in age distribution across populations. It represents the baseline burden of Alzheimer’s in a region, regardless of whether its population is older or younger on average."
    },
    {
        question: "How accurate are the system’s predictions?",
        answer:
            "The prediction reliability depends on the availability and quality of input variables. Bayesian Logistic Regression provides transparent uncertainty levels, while Random Forest offers robust classification even with noisy data. Together, they ensure balanced interpretability and accuracy."
    },
    {
        question: "Does this system diagnose Alzheimer's?",
        answer:
            "No. The system provides a risk estimation model intended for research, awareness, and environmental-health monitoring. It is not a clinical diagnostic tool."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <div className="min-h-screen py-16 px-6 md:px-20 bg-gradient-to-br from-purple-50 to-white dark:from-[#1a0f2e] dark:to-[#0d0718] transition-all">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-6">
                    Frequently Asked Questions
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-10">
                    Learn more about the science, methods, and features behind Brain Fogcast.
                </p>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-purple-200 dark:border-purple-900"
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex justify-between items-center p-5 text-left"
                            >
                                <span className="font-semibold text-gray-800 dark:text-gray-100">
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-purple-600 dark:text-purple-300" />
                                ) : (
                                    <ChevronDown className="text-purple-600 dark:text-purple-300" />
                                )}
                            </button>

                            {openIndex === index && (
                                <div className="px-5 pb-5 text-gray-600 dark:text-gray-300">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
