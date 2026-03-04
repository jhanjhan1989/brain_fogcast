import React, { useState } from "react";
import { BookOpen, Calendar, Clock, User, Search, Filter, ArrowRight, Brain, Heart, Activity, Lightbulb } from "lucide-react";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  url: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Long term exposure to ambient air pollution and incidence of dementia: cohort study",
    excerpt: "BMJ cohort study of 130,978 London residents found long-term exposure to NO2 and PM2.5 associated with increased dementia incidence. Each 1 μg/m³ increase in PM2.5 linked to 16% higher dementia risk.",
    category: "Research",
    author: "Carey et al., BMJ 2018",
    date: "2018-08-14",
    readTime: "12 min read",
    image: "🌫️",
    tags: ["PM2.5", "NO2", "Air Quality", "Cohort Study"],
    url: "https://www.bmj.com/content/362/bmj.k3310"
  },
  {
    id: 2,
    title: "Effects of Age, Sex, and Ethnicity on the Association Between Apolipoprotein E Genotype and Alzheimer Disease",
    excerpt: "Meta-analysis from JAMA examining APOE ε4 effects across 5930 patients. One ε4 allele increases AD risk 3-fold, two alleles increase risk 15-fold. Risk varies by age, sex, and ethnicity.",
    category: "Research",
    author: "Farrer et al., JAMA 1997",
    date: "1997-10-22",
    readTime: "12 min read",
    image: "🧬",
    tags: ["APOE", "Genetics", "Risk Factors", "Meta-Analysis"],
    url: "https://jamanetwork.com/journals/jama/fullarticle/418198"
  },
  {
    id: 3,
    title: "Mediterranean Diet and Age-Related Cognitive Decline: A Randomized Clinical Trial",
    excerpt: "PREDIMED-NAVARRA trial with 447 cognitively healthy participants. Mediterranean diet supplemented with extra-virgin olive oil or nuts improved cognitive function compared to control diet over 6.5 years.",
    category: "Lifestyle",
    author: "Valls-Pedret et al., JAMA Internal Medicine 2015",
    date: "2015-07-20",
    readTime: "10 min read",
    image: "🥗",
    tags: ["Diet", "PREDIMED", "Prevention", "RCT"],
    url: "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2293082"
  },
  {
    id: 4,
    title: "Physical activity and risk of cognitive impairment and dementia: meta-analysis of prospective studies",
    excerpt: "Systematic review of 15 prospective studies with 33,816 participants. High physical activity levels associated with 38% reduced risk of cognitive decline and 35% lower dementia risk.",
    category: "Lifestyle",
    author: "Sofi et al., Journal of Internal Medicine 2011",
    date: "2011-01-01",
    readTime: "8 min read",
    image: "🏃",
    tags: ["Exercise", "Prevention", "Meta-Analysis"],
    url: "https://onlinelibrary.wiley.com/doi/10.1111/j.1365-2796.2010.02281.x"
  },
  {
    id: 5,
    title: "Sleep Quality and Preclinical Alzheimer Disease",
    excerpt: "JAMA Neurology study showing worse sleep quality associated with greater amyloid-β burden in cognitively normal adults. Sleep disruption may facilitate amyloid deposition, contributing to AD pathogenesis.",
    category: "Research",
    author: "Ju et al., JAMA Neurology 2013",
    date: "2013-10-21",
    readTime: "11 min read",
    image: "😴",
    tags: ["Sleep", "Amyloid", "Biomarkers", "Preclinical"],
    url: "https://jamanetwork.com/journals/jamaneurology/fullarticle/1745780"
  },
  {
    id: 6,
    title: "Linguistic Ability in Early Life and Cognitive Function and Alzheimer's Disease in Late Life",
    excerpt: "The Nun Study: analysis of autobiographies written at age 22 showed low linguistic ability predicted poor cognitive function and AD 58 years later. Supports cognitive reserve hypothesis.",
    category: "Education",
    author: "Snowdon et al., JAMA 1996",
    date: "1996-02-21",
    readTime: "9 min read",
    image: "📚",
    tags: ["Cognitive Reserve", "Education", "Nun Study", "Longitudinal"],
    url: "https://jamanetwork.com/journals/jama/fullarticle/402649"
  },
  {
    id: 7,
    title: "Lecanemab in Early Alzheimer's Disease",
    excerpt: "CLARITY AD phase 3 trial: lecanemab reduced clinical decline by 27% at 18 months in 1795 participants with early AD. Significant reduction in amyloid plaques and slower cognitive decline. FDA approved January 2023.",
    category: "Research",
    author: "van Dyck et al., NEJM 2023",
    date: "2023-01-05",
    readTime: "13 min read",
    image: "💊",
    tags: ["Treatment", "Lecanemab", "Clinical Trial", "FDA"],
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2212948"
  },
  {
    id: 8,
    title: "Social isolation, loneliness, and risk of dementia in more than 460,000 people",
    excerpt: "UK Biobank study of 462,619 participants followed 12 years. Social isolation increased dementia risk by 26%, loneliness by 4%. Social connection is a modifiable risk factor for dementia prevention.",
    category: "Lifestyle",
    author: "Huang et al., Nature Mental Health 2023",
    date: "2023-06-18",
    readTime: "7 min read",
    image: "👥",
    tags: ["Social Health", "UK Biobank", "Loneliness", "Prevention"],
    url: "https://www.nature.com/articles/s44220-023-00061-5"
  },
  {
    id: 9,
    title: "Association between systolic blood pressure and dementia in the Whitehall II cohort study",
    excerpt: "30-year follow-up of 10,308 British civil servants. Elevated systolic BP at age 50 associated with increased dementia risk. Each 10 mmHg increase linked to 12% higher dementia incidence.",
    category: "Research",
    author: "Kivimäki et al., BMJ 2018",
    date: "2018-06-13",
    readTime: "10 min read",
    image: "❤️",
    tags: ["Cardiovascular", "Hypertension", "Prevention", "Whitehall"],
    url: "https://www.bmj.com/content/361/bmj.k1456"
  },
  {
    id: 10,
    title: "Discriminative Accuracy of Plasma Phospho-tau217 for Alzheimer Disease vs Other Neurodegenerative Disorders",
    excerpt: "Plasma p-tau217 distinguished AD from other neurodegenerative diseases with 96% accuracy. Levels correlated with amyloid and tau PET. Promising blood biomarker for early AD detection and differential diagnosis.",
    category: "Research",
    author: "Palmqvist et al., JAMA 2020",
    date: "2020-08-25",
    readTime: "12 min read",
    image: "🔬",
    tags: ["Biomarkers", "Early Detection", "Blood Test", "p-tau217"],
    url: "https://jamanetwork.com/journals/jama/fullarticle/2768634"
  },
  {
    id: 11,
    title: "Dementia prevention, intervention, and care: 2020 report of the Lancet Commission",
    excerpt: "Landmark report identifying 12 modifiable risk factors accounting for 40% of worldwide dementia: education, hypertension, hearing, smoking, obesity, depression, inactivity, diabetes, social contact, alcohol, air pollution, head injury.",
    category: "Education",
    author: "Livingston et al., The Lancet 2020",
    date: "2020-08-08",
    readTime: "20 min read",
    image: "📊",
    tags: ["Prevention", "Risk Factors", "Lancet Commission", "Public Health"],
    url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30367-6/fulltext"
  },
  {
    id: 12,
    title: "Air pollution, cognitive deficits and brain abnormalities: A pilot study with children and dogs",
    excerpt: "Neuropathology study examining brains from Mexico City residents with high air pollution exposure. Found amyloid-β plaques, tau tangles, and neuroinflammation in young individuals, suggesting early AD-like pathology.",
    category: "Environment",
    author: "Calderón-Garcidueñas et al., Brain and Cognition 2008",
    date: "2008-06-01",
    readTime: "14 min read",
    image: "🏭",
    tags: ["Air Pollution", "Neuropathology", "PM2.5", "Children"],
    url: "https://www.sciencedirect.com/science/article/abs/pii/S0278262608000067"
  },
  {
    id: 13,
    title: "MIND diet associated with reduced incidence of Alzheimer's disease",
    excerpt: "Rush Memory and Aging Project: 923 participants followed 4.5 years. MIND diet (Mediterranean-DASH hybrid) reduced AD risk by 53% with high adherence, 35% with moderate adherence. Emphasizes brain-healthy foods.",
    category: "Lifestyle",
    author: "Morris et al., Alzheimer's & Dementia 2015",
    date: "2015-02-11",
    readTime: "9 min read",
    image: "🫐",
    tags: ["MIND Diet", "Nutrition", "Prevention", "Rush Study"],
    url: "https://alz-journals.onlinelibrary.wiley.com/doi/10.1016/j.jalz.2014.11.009"
  },
  {
    id: 14,
    title: "Donanemab in Early Symptomatic Alzheimer Disease: The TRAILBLAZER-ALZ 2 Randomized Clinical Trial",
    excerpt: "Phase 3 trial with 1736 participants: donanemab slowed cognitive decline by 35% in early AD. 47% showed no progression at 76 weeks. Targets amyloid plaques with potential to modify disease course.",
    category: "Research",
    author: "Sims et al., JAMA 2023",
    date: "2023-07-17",
    readTime: "11 min read",
    image: "💉",
    tags: ["Donanemab", "Clinical Trial", "Treatment", "Amyloid"],
    url: "https://jamanetwork.com/journals/jama/fullarticle/2807533"
  },
  {
    id: 15,
    title: "Hearing Loss and Incident Dementia",
    excerpt: "Baltimore Longitudinal Study of Aging: 639 participants followed 12 years. Hearing loss independently associated with dementia. Mild loss: 2x risk, moderate: 3x risk, severe: 5x risk. Hearing aids may reduce risk.",
    category: "Research",
    author: "Lin et al., Archives of Neurology 2011",
    date: "2011-02-01",
    readTime: "8 min read",
    image: "👂",
    tags: ["Hearing Loss", "Prevention", "Baltimore Study", "Sensory"],
    url: "https://jamanetwork.com/journals/jamaneurology/fullarticle/802291"
  },
  {
    id: 16,
    title: "Tau pathology and neurodegeneration contribute to cognitive impairment in Alzheimer's disease",
    excerpt: "Multi-center tau PET imaging study showing tau tangles spread through connected brain networks. Tau burden strongly correlates with cognitive symptoms and neurodegeneration, more than amyloid. Key therapeutic target.",
    category: "Research",
    author: "Ossenkoppele et al., Brain 2018",
    date: "2018-12-01",
    readTime: "13 min read",
    image: "🧠",
    tags: ["Tau", "PET Imaging", "Biomarkers", "Neuroimaging"],
    url: "https://academic.oup.com/brain/article/141/1/205/4665169"
  }
];

const categories = ["All", "Education", "Research", "Lifestyle", "Environment", "Caregiving"];

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Education": return <BookOpen size={16} />;
      case "Research": return <Brain size={16} />;
      case "Lifestyle": return <Heart size={16} />;
      case "Environment": return <Activity size={16} />;
      case "Caregiving": return <Lightbulb size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Education": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "Research": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "Lifestyle": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Environment": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "Caregiving": return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Alzheimer's Knowledge Hub
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Evidence-based articles, research insights, and practical guides for understanding and preventing Alzheimer's disease
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-purple-300 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter size={18} className="text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6 text-gray-600 dark:text-gray-400">
          Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group cursor-pointer block"
            >
              {/* Article Image/Icon */}
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 h-48 flex items-center justify-center text-6xl">
                {article.image}
              </div>

              {/* Article Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
                    {getCategoryIcon(article.category)}
                    {article.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {article.readTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={14} />
                    {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:gap-2 transition-all">
                    Read Article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Informed</h2>
            <p className="text-purple-100 mb-6">
              Subscribe to our newsletter for the latest research, articles, and insights on Alzheimer's prevention and care.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 outline-none"
              />
              <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
