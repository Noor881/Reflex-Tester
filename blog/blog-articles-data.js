// Blog Articles Metadata
const blogArticles = [
    // Reaction Time Science
    {
        title: "What is Reaction Time? Complete Guide (2025)",
        slug: "what-is-reaction-time.html",
        category: "Science",
        excerpt: "Everything you need to know about reaction time: definition, science, measurement, and benchmarks for gaming, sports, and health.",
        date: "January 29, 2025",
        readTime: "12 min",
        icon: "🧠"
    },
    {
        title: "Average Reaction Time by Age: Complete 2025 Data",
        slug: "average-reaction-time-by-age.html",
        category: "Science",
        excerpt: "Comprehensive age-based reaction time benchmarks from childhood to seniors, with scientific data and improvement strategies.",
        date: "January 28, 2025",
        readTime: "10 min",
        icon: "📊"
    },
    {
        title: "Reaction Time & Age: Large-Scale Scientific Study",
        slug: "reaction-time-age-study.html",
        category: "Science",
        excerpt: "Analysis of reaction time changes across lifespan based on comprehensive research data.",
        date: "January 25, 2025",
        readTime: "8 min",
        icon: "🔬"
    },
    {
        title: "Female vs Male Reaction Time: Scientific Analysis",
        slug: "female-vs-male-reaction-time-study.html",
        category: "Science",
        excerpt: "Evidence-based comparison of gender differences in reaction speed and performance.",
        date: "January 22, 2025",
        readTime: "9 min",
        icon: "⚖️"
    },
    {
        title: "Genetics vs Training: What Determines Reaction Time?",
        slug: "genetics-vs-training-reaction-time.html",
        category: "Science",
        excerpt: "Discover how much of your reaction speed is genetic and how much you can improve through training.",
        date: "January 20, 2025",
        readTime: "11 min",
        icon: "🧬"
    },
    {
        title: "Fastest Reaction Time Ever Recorded",
        slug: "fastest-reaction-time-ever-recorded.html",
        category: "Science",
        excerpt: "Explore the limits of human reaction speed with records from athletes, gamers, and scientific studies.",
        date: "January 18, 2025",
        readTime: "7 min",
        icon: "⚡"
    },

    // Gaming Performance
    {
        title: "Pro Gamer Reaction Times: Complete Analysis",
        slug: "pro-gamer-reaction-times.html",
        category: "Gaming",
        excerpt: "Detailed breakdown of professional esports player reaction times across different games and roles.",
        date: "January 27, 2025",
        readTime: "10 min",
        icon: "🎮"
    },
    {
        title: "How Reaction Time Gives Gaming Advantage",
        slug: "reaction-time-gaming-advantage.html",
        category: "Gaming",
        excerpt: "Why milliseconds matter in competitive gaming and how faster reactions translate to wins.",
        date: "January 24, 2025",
        readTime: "8 min",
        icon: "🏆"
    },
    {
        title: "Hardware Guide: Optimize Your Reaction Time",
        slug: "hardware-guide-reaction-time.html",
        category: "Gaming",
        excerpt: "Best monitors, mice, and keyboards for minimizing input lag and maximizing response speed.",
        date: "January 21, 2025",
        readTime: "12 min",
        icon: "⌨️"
    },
    {
        title: "Monitor Refresh Rate Impact on Reaction Time",
        slug: "moniter-refresh-rate.html",
        category: "Gaming",
        excerpt: "How 60Hz vs 144Hz vs 240Hz affects your visual reaction speed and gaming performance.",
        date: "January 19, 2025",
        readTime: "9 min",
        icon: "🖥️"
    },
    {
        title: "Mouse Sensitivity & Reaction Time Optimization",
        slug: "mouse-sensitivity-reaction-time.html",
        category: "Gaming",
        excerpt: "Find your perfect sensitivity settings for faster, more accurate reactions in FPS games.",
        date: "January 17, 2025",
        readTime: "8 min",
        icon: "🖱️"
    },
    {
        title: "VR Reaction Time Training: The Future is Here",
        slug: "vr-reaction-time-training.html",
        category: "Gaming",
        excerpt: "How virtual reality is revolutionizing reflex training with immersive, 3D environments.",
        date: "January 15, 2025",
        readTime: "10 min",
        icon: "🥽"
    },

    // Training & Improvement
    {
        title: "How to Improve Your Reaction Time: Complete Guide",
        slug: "improve-reaction-time.html",
        category: "Training",
        excerpt: "Proven techniques and exercises to shave milliseconds off your reaction speed in 30 days.",
        date: "January 26, 2025",
        readTime: "14 min",
        icon: "💪"
    },
    {
        title: "Improve Reflexes in 30 Days: Step-by-Step Plan",
        slug: "improve-reflexes-30-days.html",
        category: "Training",
        excerpt: "Complete 30-day training program with daily exercises to dramatically improve reaction time.",
        date: "January 23, 2025",
        readTime: "15 min",
        icon: "📅"
    },
    {
        title: "Sports-Specific Reaction Time Training",
        slug: "sports-reaction-time-training.html",
        category: "Training",
        excerpt: "Targeted drills for tennis, baseball, boxing, and other sports requiring lightning reflexes.",
        date: "January 16, 2025",
        readTime: "11 min",
        icon: "⚾"
    },
    {
        title: "Vision Training for Faster Reactions",
        slug: "vision-training-faster-reactions.html",
        category: "Training",
        excerpt: "Eye exercises and visual processing drills to improve reaction speed at the source.",
        date: "January 14, 2025",
        readTime: "9 min",
        icon: "👁️"
    },
    {
        title: "Natural Ways to Improve Reaction Time",
        slug: "improve-reaction-time-naturally.html",
        category: "Training",
        excerpt: "No supplements needed: improve reflexes through diet, exercise, and lifestyle changes.",
        date: "January 12, 2025",
        readTime: "10 min",
        icon: "🌿"
    },
    {
        title: "Breathing Techniques for Faster Reflexes",
        slug: "breathing-techniques-faster-reflexes.html",
        category: "Training",
        excerpt: "How proper breathing patterns can enhance neural response and reaction speed.",
        date: "January 10, 2025",
        readTime: "7 min",
        icon: "🫁"
    },
    {
        title: "Meditation & Mindfulness for Reaction Speed",
        slug: "meditation-mindfulness-reaction-speed.html",
        category: "Training",
        excerpt: "Scientific evidence showing how meditation improves focus and reaction time.",
        date: "January 8, 2025",
        readTime: "8 min",
        icon: "🧘"
    },

    // Health & Lifestyle
    {
        title: "Sleep Deprivation Impact on Reaction Time",
        slug: "sleep-deprivation-reaction-time.html",
        category: "Health",
        excerpt: "How lack of sleep destroys your reflexes and what to do about it.",
        date: "January 13, 2025",
        readTime: "9 min",
        icon: "😴"
    },
    {
        title: "Dehydration & Reaction Time: Scientific Study",
        slug: "dehydration-reaction-time-study.html",
        category: "Health",
        excerpt: "Even mild dehydration slows reactions by 15%. Here's the research and solutions.",
        date: "January 11, 2025",
        readTime: "7 min",
        icon: "💧"
    },
    {
        title: "Caffeine's Effect on Cognitive Performance",
        slug: "caffeine-cognitive-performance-timing.html",
        category: "Health",
        excerpt: "When to drink coffee for peak performance and how much is optimal.",
        date: "January 9, 2025",
        readTime: "8 min",
        icon: "☕"
    },
    {
        title: "Caffeine & Reaction Time: Complete Research Analysis",
        slug: "caffeine-reaction-time-study.html",
        category: "Health",
        excerpt: "Meta-analysis of caffeine studies showing exact reaction time improvements.",
        date: "January 7, 2025",
        readTime: "10 min",
        icon: "📈"
    },
    {
        title: "Nutrition Guide for Peak Reaction Performance",
        slug: "nutrition-reaction-time-performance.html",
        category: "Health",
        excerpt: "Foods, supplements, and meal timing for optimal neural speed and focus.",
        date: "January 6, 2025",
        readTime: "12 min",
        icon: "🥗"
    },
    {
        title: "Nootropics for Reaction Time Enhancement",
        slug: "nootropics-reaction-time-enhancement.html",
        category: "Health",
        excerpt: "Evidence-based review of cognitive enhancers that improve reaction speed.",
        date: "January 5, 2025",
        readTime: "11 min",
        icon: "💊"
    },
    {
        title: "Stress & Anxiety Impact on Reaction Time",
        slug: "stress-anxiety-reaction-time-impact.html",
        category: "Health",
        excerpt: "How mental stress slows reflexes and techniques to stay calm under pressure.",
        date: "January 4, 2025",
        readTime: "9 min",
        icon: "😰"
    },
    {
        title: "Time of Day Effects on Reaction Performance",
        slug: "time-of-day-reaction-performance.html",
        category: "Health",
        excerpt: "Circadian rhythm's impact on reflexes: when you're naturally fastest and slowest.",
        date: "January 3, 2025",
        readTime: "8 min",
        icon: "🕐"
    },
    {
        title: "Power Naps vs Full Sleep for Performance",
        slug: "power-naps-vs-full-sleep.html",
        category: "Health",
        excerpt: "Strategic napping to boost reaction time without sacrificing night sleep.",
        date: "January 2, 2025",
        readTime: "7 min",
        icon: "💤"
    },
    {
        title: "REM Sleep & Memory Consolidation for Reflexes",
        slug: "rem-sleep-memory-consolidation.html",
        category: "Health",
        excerpt: "How deep sleep consolidates motor learning and improves reaction patterns.",
        date: "January 1, 2025",
        readTime: "10 min",
        icon: "🌙"
    },
    {
        title: "Sleep Deprivation & Immune Function",
        slug: "sleep-deprivation-immune-function.html",
        category: "Health",
        excerpt: "Cascading effects of poor sleep on health, cognition, and physical performance.",
        date: "December 30, 2024",
        readTime: "9 min",
        icon: "🛡️"
    },
    {
        title: "Exercise vs Medication for Anxiety Management",
        slug: "exercise-vs-medication-anxiety.html",
        category: "Health",
        excerpt: "Physical activity as a powerful tool for reducing stress and improving focus.",
        date: "December 28, 2024",
        readTime: "11 min",
        icon: "🏃"
    },

    // Professions & Comparisons
    {
        title: "Reaction Time by Profession: Complete Comparison",
        slug: "reaction-time-professions-comparison.html",
        category: "Science",
        excerpt: "Pilots, surgeons, athletes, gamers: who has the fastest reflexes and why?",
        date: "December 26, 2024",
        readTime: "10 min",
        icon: "👨‍✈️"
    }
];
