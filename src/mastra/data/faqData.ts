export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

export const faqDatabase: FAQItem[] = [
  // Calendar & Schedule Information
  {
    id: "school-hours",
    question: "What are MOKI's hours?",
    answer: "MOKI operates:\n• Monday to Friday: 8:00 AM - 3:00 PM\n• Early drop-off: 7:30 AM (additional fee)\n• Extended care: 3:00 PM - 6:00 PM (additional fee)\n• Closed on weekends and public holidays",
    keywords: ["hours", "schedule", "time", "open", "close", "drop-off", "pick-up", "extended", "care"],
    category: "calendar"
  },
  {
    id: "holiday-schedule",
    question: "When are school holidays and breaks?",
    answer: "MOKI holidays and early closing days are announced every Monday at 12:00 PM GMT+2 for that week.\n\nTypical holiday schedule:\n• Summer break: June 15 - August 20\n• Winter break: December 20 - January 5\n• Spring break: March 15 - March 22\n• Public holidays: New Year's Day, MLK Day, Presidents' Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas\n\nEarly closing days and schedule changes are announced via WhatsApp every Monday at 12:00 PM GMT+2.",
    keywords: ["holidays", "breaks", "vacation", "closed", "summer", "winter", "spring", "calendar", "dates", "announcement", "monday", "early closing", "schedule changes"],
    category: "calendar"
  },
  {
    id: "daily-schedule",
    question: "What does a typical day look like?",
    answer: "Daily MOKI schedule:\n• 8:00 AM: Arrival and morning activities\n• 8:30 AM: Circle time and announcements\n• 9:00 AM: Learning centers and activities\n• 10:00 AM: Outdoor play\n• 10:30 AM: Snack time\n• 11:00 AM: Group lessons\n• 12:00 PM: Lunch\n• 12:30 PM: Quiet time/nap\n• 1:30 PM: Afternoon activities\n• 2:30 PM: Free play and preparation for pickup\n• 3:00 PM: Dismissal",
    keywords: ["schedule", "daily", "routine", "activities", "play", "nap", "lunch", "snack", "circle time"],
    category: "calendar"
  },

  // Events & Activities
  {
    id: "upcoming-events",
    question: "What events are coming up?",
    answer: "Upcoming MOKI events this month:\n• Parent-Teacher Conferences: March 10-15\n• Spring Festival: March 22\n• Book Fair: March 25-29\n• Field Trip to Local Farm: April 5\n• Mother's Day Celebration: May 10\n\nEvent announcements are sent every Monday at 12:00 PM GMT+2. Check our WhatsApp group for the latest updates!",
    keywords: ["events", "upcoming", "activities", "festival", "conference", "field trip", "celebration", "party", "moki", "announcement"],
    category: "events"
  },
  {
    id: "field-trips",
    question: "What field trips are planned?",
    answer: "Planned field trips this semester:\n• Local Library: March 15\n• Children's Museum: April 5\n• Nature Center: April 20\n• Fire Station Visit: May 8\n\nPermission slips will be sent home 2 weeks before each trip. All trips require parental consent and emergency contact information.",
    keywords: ["field trip", "excursion", "museum", "library", "nature", "fire station", "permission", "consent"],
    category: "events"
  },
  {
    id: "parent-events",
    question: "Are there events for parents?",
    answer: "Parent events this semester:\n• Monthly Coffee & Chat: First Friday of each month, 8:30 AM\n• Parent-Teacher Conferences: March 10-15\n• Spring Festival: March 22 (family event)\n• Volunteer Appreciation Lunch: May 15\n• End-of-Year Celebration: June 10\n\nAll parents are welcome to attend! RSVP required for some events.",
    keywords: ["parent", "coffee", "chat", "conference", "volunteer", "appreciation", "celebration", "family"],
    category: "events"
  },

  // General FAQs
  {
    id: "contact-info",
    question: "How can I contact MOKI?",
    answer: "MOKI Contact Information:\n• Main Office: +1 (555) 123-MOKI\n• Director Email: director@moki.edu\n• Teacher Line: +1 (555) 123-TEACH\n• Emergency Line: +1 (555) 123-HELP\n• Address: 123 Learning Lane, Education City, EC 12345\n• Office Hours: 7:30 AM - 5:30 PM, Monday-Friday\n\nAll announcements and updates are sent every Monday at 12:00 PM GMT+2",
    keywords: ["contact", "phone", "email", "address", "office", "director", "teacher", "emergency", "moki", "announcements"],
    category: "general"
  },
  {
    id: "what-to-bring",
    question: "What should my child bring to school?",
    answer: "Daily essentials:\n• Backpack with name label\n• Lunch box (if bringing lunch)\n• Water bottle\n• Change of clothes (in a labeled bag)\n• Comfort item for nap time (optional)\n\nPlease label everything with your child's name. We provide snacks, but you can send special treats for celebrations.",
    keywords: ["bring", "backpack", "lunch", "clothes", "water bottle", "label", "snack", "supplies"],
    category: "general"
  },
  {
    id: "sick-policy",
    question: "What is the sick child policy?",
    answer: "Sick child policy:\n• Children with fever (100.4°F+) must stay home\n• 24-hour fever-free before returning\n• No school with vomiting or diarrhea\n• Contagious illnesses require doctor's note to return\n• We'll call you immediately if your child becomes ill at school\n\nYour child's health and the health of all children is our priority.",
    keywords: ["sick", "fever", "illness", "policy", "health", "contagious", "doctor", "note", "temperature"],
    category: "general"
  },
  {
    id: "pickup-dropoff",
    question: "What are the pickup and drop-off procedures?",
    answer: "Pickup and drop-off procedures:\n• Drop-off: 8:00-8:30 AM at main entrance\n• Pickup: 3:00-3:30 PM at same entrance\n• Authorized pickup persons must show ID\n• Late pickup fee: $5 per 15 minutes after 3:30 PM\n• Emergency contacts must be on file\n• Notify us if someone else will pick up your child",
    keywords: ["pickup", "drop-off", "procedure", "authorized", "ID", "late", "fee", "emergency", "contact"],
    category: "general"
  },

  // Emergency & Safety
  {
    id: "emergency-procedures",
    question: "What are the emergency procedures?",
    answer: "MOKI Emergency Procedures:\n• Fire drills: Monthly practice\n• Lockdown drills: Quarterly practice\n• Emergency contact: +1 (555) 123-HELP\n• Weather closures: Follow school district announcements\n• Medical emergencies: 911 + notify parents immediately\n• All staff are CPR and First Aid certified\n\nEmergency updates sent via WhatsApp immediately when needed.",
    keywords: ["emergency", "fire", "lockdown", "weather", "medical", "CPR", "first aid", "safety", "drill", "moki"],
    category: "emergency"
  },
  {
    id: "medication-policy",
    question: "What is the medication policy?",
    answer: "Medication policy:\n• Prescription medications require doctor's authorization\n• Over-the-counter medications need parental consent\n• All medications must be in original containers\n• Administered by trained staff only\n• Medication log maintained for each dose\n• EpiPens and inhalers: Parents must provide and train staff\n\nForms available at the main office.",
    keywords: ["medication", "prescription", "over-the-counter", "authorization", "consent", "EpiPen", "inhaler", "doctor"],
    category: "emergency"
  },

  // Policies & Procedures
  {
    id: "tuition-fees",
    question: "What are the tuition and fees?",
    answer: "Current tuition and fees:\n• Monthly tuition: $800\n• Registration fee: $150 (annual)\n• Early drop-off: $5/day\n• Extended care: $10/day\n• Field trip fees: $15-25 per trip\n• Late pickup: $5 per 15 minutes\n\nPayment due by the 5th of each month. Sibling discounts available.",
    keywords: ["tuition", "fees", "payment", "registration", "discount", "sibling", "monthly", "annual"],
    category: "policies"
  },
  {
    id: "dress-code",
    question: "Is there a dress code?",
    answer: "MOKI dress code guidelines:\n• Comfortable, play-appropriate clothing\n• Closed-toe shoes (no flip-flops)\n• Extra clothes in backpack\n• Label all items with child's name\n• No toys from home (except comfort items)\n• Weather-appropriate outdoor wear\n\nWe encourage independence, so easy-to-manage clothing is best!",
    keywords: ["dress", "clothing", "shoes", "clothes", "play", "comfortable", "weather", "label", "moki"],
    category: "policies"
  },

  // Parent Resources
  {
    id: "parent-contact-list",
    question: "How can I get the parents contact list?",
    answer: "MOKI Parents Contact List:\n• Available through the main office\n• Email director@moki.edu to request access\n• Includes phone numbers and email addresses\n• Updated monthly with new families\n• Consent required from all parents before sharing\n• Used for playdates, carpooling, and emergency contact\n\nContact the office to add your information to the list.",
    keywords: ["parent", "contact", "list", "phone", "email", "directory", "playdate", "carpool", "emergency", "moki"],
    category: "general"
  },
  {
    id: "announcement-schedule",
    question: "When are announcements made?",
    answer: "MOKI Announcement Schedule:\n• Every Monday at 12:00 PM GMT+2\n• Sent via WhatsApp group\n• Includes: holiday schedules, early closing days, event updates\n• Emergency announcements sent immediately\n• Weekly newsletter with detailed information\n• All parents automatically receive announcements\n\nMake sure your WhatsApp notifications are enabled!",
    keywords: ["announcement", "monday", "12:00", "GMT+2", "whatsapp", "holiday", "early closing", "schedule", "newsletter", "moki"],
    category: "general"
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
           "• Contact MOKI main office at +1 (555) 123-MOKI\n" +
           "• Email the director at director@moki.edu\n" +
           "• Call our teacher line at +1 (555) 123-TEACH\n" +
           "• Ask me about: calendar, events, policies, emergency procedures, or general questions\n\n" +
           "Popular topics: MOKI hours, holidays, events, field trips, pickup/dropoff, sick policy, tuition, parent contact list, and announcements!\n\n" +
           "Remember: All announcements are sent every Monday at 12:00 PM GMT+2!";
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