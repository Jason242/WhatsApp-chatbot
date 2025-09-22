export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export const faqDatabase: FAQItem[] = [
  // General Information
  {
    id: "hours",
    question: "What are your business hours?",
    answer: "Our business hours are Monday through Friday, 9:00 AM to 6:00 PM EST. We're closed on weekends and major holidays.",
    keywords: ["hours", "open", "close", "time", "schedule", "business", "office", "working"],
    category: "general"
  },
  
  // Example: Add your custom FAQ
  {
    id: "news-updates",
    question: "How do I get the latest news updates?",
    answer: "You can get the latest news by asking me 'news' or 'latest news'. I'll fetch the most recent articles from our news feed.",
    keywords: ["news", "updates", "latest", "articles", "feed", "current", "recent"],
    category: "news"
  },
  {
    id: "contact",
    question: "How can I contact you?",
    answer: "You can reach us via:\n• Email: support@company.com\n• Phone: (555) 123-4567\n• Live chat on our website\n• This WhatsApp number for quick questions",
    keywords: ["contact", "phone", "email", "reach", "support", "call", "message", "help"],
    category: "contact"
  },
  {
    id: "location",
    question: "Where are you located?",
    answer: "Our main office is located at:\n123 Business Street\nSuite 456\nCity, State 12345\n\nWe also have remote team members available to assist you.",
    keywords: ["location", "address", "where", "office", "building", "visit", "directions"],
    category: "general"
  },

  // Services and Resources
  {
    id: "services",
    question: "What services do you offer?",
    answer: "We offer a comprehensive range of services including:\n• Consulting and strategy\n• Technical support\n• Training and education\n• Custom solutions\n• Ongoing maintenance and support",
    keywords: ["services", "offer", "provide", "do", "what", "help", "solutions", "consulting"],
    category: "services"
  },
  {
    id: "pricing",
    question: "What are your pricing options?",
    answer: "We offer flexible pricing plans:\n• Basic Plan: $99/month\n• Professional Plan: $199/month\n• Enterprise Plan: Custom pricing\n\nContact us for a detailed quote based on your specific needs.",
    keywords: ["price", "cost", "pricing", "plans", "money", "fees", "rate", "charge", "payment"],
    category: "pricing"
  },
  {
    id: "getting-started",
    question: "How do I get started?",
    answer: "Getting started is easy:\n1. Schedule a free consultation\n2. We'll assess your needs\n3. Choose the right plan for you\n4. Begin implementation\n\nContact us to schedule your consultation today!",
    keywords: ["start", "begin", "getting started", "how", "first", "initial", "new", "setup"],
    category: "onboarding"
  },

  // Support and Documentation
  {
    id: "support",
    question: "What kind of support do you provide?",
    answer: "We provide comprehensive support including:\n• 24/7 technical assistance\n• Email and phone support\n• Live chat during business hours\n• Detailed documentation and guides\n• Video tutorials and training sessions",
    keywords: ["support", "help", "assistance", "technical", "documentation", "guides", "training"],
    category: "support"
  },
  {
    id: "documentation",
    question: "Where can I find documentation?",
    answer: "Our documentation is available at:\n• docs.company.com\n• Help section on our website\n• PDF guides (downloadable)\n• Video tutorial library\n\nIf you can't find what you're looking for, contact our support team.",
    keywords: ["documentation", "docs", "manual", "guide", "instructions", "tutorial", "help", "how-to"],
    category: "resources"
  },
  {
    id: "training",
    question: "Do you offer training?",
    answer: "Yes! We offer various training options:\n• Live online training sessions\n• Self-paced video courses\n• Custom training for teams\n• Certification programs\n• One-on-one coaching\n\nContact us to learn more about our training programs.",
    keywords: ["training", "learn", "course", "education", "teach", "session", "workshop", "certification"],
    category: "training"
  },

  // Technical Resources
  {
    id: "requirements",
    question: "What are the system requirements?",
    answer: "Minimum system requirements:\n• Operating System: Windows 10+ / macOS 10.14+ / Linux\n• RAM: 4GB minimum, 8GB recommended\n• Storage: 500MB available space\n• Internet connection required\n• Modern web browser (Chrome, Firefox, Safari, Edge)",
    keywords: ["requirements", "system", "minimum", "specs", "compatibility", "browser", "operating"],
    category: "technical"
  },
  {
    id: "troubleshooting",
    question: "How do I troubleshoot common issues?",
    answer: "For common issues, try these steps:\n1. Clear your browser cache\n2. Check your internet connection\n3. Restart the application\n4. Update to the latest version\n\nIf issues persist, contact our support team with details about the problem.",
    keywords: ["troubleshoot", "problem", "issue", "error", "fix", "broken", "not working", "help"],
    category: "technical"
  },

  // Account and Billing
  {
    id: "account",
    question: "How do I manage my account?",
    answer: "You can manage your account through:\n• Our online portal at portal.company.com\n• Account settings in the application\n• Contacting our customer service team\n\nYou can update billing info, change plans, and view usage history.",
    keywords: ["account", "manage", "settings", "portal", "profile", "login", "dashboard"],
    category: "account"
  },
  {
    id: "billing",
    question: "How does billing work?",
    answer: "Billing details:\n• Monthly or annual billing cycles\n• Automatic payment via credit card\n• Invoices sent via email\n• 30-day money-back guarantee\n• No setup fees or hidden costs\n\nView your billing history anytime in your account portal.",
    keywords: ["billing", "payment", "invoice", "charge", "subscription", "refund", "money", "card"],
    category: "billing"
  }
];

export class FAQMatcher {
  private faqData: FAQItem[];

  constructor(faqData: FAQItem[] = faqDatabase) {
    this.faqData = faqData;
  }

  /**
   * Search for FAQ items based on user input
   */
  search(query: string, maxResults: number = 3): FAQItem[] {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    
    // Score each FAQ item based on keyword matches
    const scoredItems = this.faqData.map(item => ({
      item,
      score: this.calculateScore(words, item)
    }));

    // Filter items with score > 0 and sort by score
    const matches = scoredItems
      .filter(scored => scored.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(scored => scored.item);

    return matches;
  }

  /**
   * Get a default response when no matches are found
   */
  getDefaultResponse(): string {
    return "I couldn't find a specific answer to your question. Here are some ways to get help:\n\n" +
           "• Contact our support team at support@company.com\n" +
           "• Call us at (555) 123-4567 during business hours\n" +
           "• Visit our documentation at docs.company.com\n" +
           "• Ask me about: hours, contact, services, pricing, support, or training";
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return [...new Set(this.faqData.map(item => item.category))];
  }

  /**
   * Get FAQs by category
   */
  getByCategory(category: string): FAQItem[] {
    return this.faqData.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  private calculateScore(words: string[], item: FAQItem): number {
    let score = 0;
    
    for (const word of words) {
      // Check exact keyword matches (higher score)
      if (item.keywords.some(keyword => keyword.toLowerCase() === word)) {
        score += 10;
      }
      
      // Check partial keyword matches
      if (item.keywords.some(keyword => keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase()))) {
        score += 5;
      }
      
      // Check question and answer content
      if (item.question.toLowerCase().includes(word) || item.answer.toLowerCase().includes(word)) {
        score += 2;
      }
    }
    
    return score;
  }
}