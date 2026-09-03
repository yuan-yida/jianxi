/**
 * 统一场景数据源
 *
 * 所有场景相关的数据、类型与图标映射均在此处集中定义，
 * 供 SceneSelect / CourseDetail / HomePage / ChatRoom / LearningPlan 等页面共享，
 * 避免各页面各自维护一份数据导致不一致。
 */

export interface Lesson {
  title: string;
  description: string;
  duration: number;
}

export interface Exercise {
  icon: string;
  title: string;
  description: string;
}

export interface SceneConfig {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
  ageGroups: string[];
  systemPrompt: string;
  vocabulary: string[];
  vocabularyCount: number;
  estimatedMinutes: number;
  tips?: string;
  objectives: string[];
  lessons: Lesson[];
  exercises: Exercise[];
}

export const SCENES: SceneConfig[] = [
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    titleZh: 'Restaurant Ordering',
    description: 'Practice ordering food, asking about menu items, and making special requests at a restaurant.',
    icon: 'utensils',
    category: 'daily_life',
    difficulty: 'beginner',
    ageGroups: ['all'],
    systemPrompt: `You are a friendly waiter/waitress at a casual American restaurant. Help the customer order food. Be patient, speak naturally, and use common restaurant vocabulary. If the customer makes grammar mistakes, gently incorporate the correct form in your response. Keep responses to 1-3 sentences. Always stay in character as the waiter.`,
    vocabulary: ['menu', 'appetizer', 'entree', 'dessert', 'bill', 'tip', 'reservation', 'special', 'allergic'],
    vocabularyCount: 9,
    estimatedMinutes: 5,
    tips: 'Start by greeting the waiter and asking for the menu. Practice ordering an appetizer, main course, and dessert. Don\'t forget to ask about specials or dietary restrictions!',
    objectives: [
      'Order food and drinks confidently in English',
      'Ask about menu items and ingredients',
      'Make special requests (allergies, substitutions)',
      'Understand the bill and tipping customs',
    ],
    lessons: [
      { title: 'Greeting & Seating', description: 'Learn how to greet the host and ask for a table', duration: 3 },
      { title: 'Reading the Menu', description: 'Understand menu sections and common dish descriptions', duration: 5 },
      { title: 'Placing Your Order', description: 'Practice ordering appetizers, mains, and desserts', duration: 5 },
      { title: 'Special Requests', description: 'Handle allergies, substitutions, and dietary needs', duration: 4 },
      { title: 'Paying the Bill', description: 'Ask for the check, split bills, and understand tipping', duration: 3 },
    ],
    exercises: [
      { icon: '🎭', title: 'Role Play', description: 'Simulate a full dining experience with the AI waiter' },
      { icon: '📝', title: 'Vocabulary Quiz', description: 'Test your knowledge of restaurant vocabulary' },
      { icon: '🎧', title: 'Listening Practice', description: 'Listen to common restaurant phrases and repeat' },
      { icon: '💬', title: 'Free Conversation', description: 'Open-ended practice with the AI partner' },
    ],
  },
  {
    id: 'airport',
    title: 'At the Airport',
    titleZh: 'Airport Check-in',
    description: 'Practice checking in for a flight, asking about gates, and handling travel situations.',
    icon: 'plane',
    category: 'travel',
    difficulty: 'elementary',
    ageGroups: ['all'],
    systemPrompt: `You are a helpful airline check-in agent at an international airport. Assist the passenger with check-in, baggage, and flight information. Be professional yet warm. If the passenger makes mistakes, subtly model correct usage. Keep responses concise (1-3 sentences). Stay in character as the agent.`,
    vocabulary: ['boarding pass', 'gate', 'terminal', 'baggage', 'check-in', 'delay', 'departure', 'arrival', 'passport', 'seat'],
    vocabularyCount: 10,
    estimatedMinutes: 5,
    tips: 'Have your passport and booking reference ready. Practice asking about gate changes, baggage allowance, and flight delays.',
    objectives: [
      'Complete the check-in process in English',
      'Ask about gate numbers and boarding times',
      'Handle baggage questions and restrictions',
      'Deal with flight delays and changes',
    ],
    lessons: [
      { title: 'Check-in Counter', description: 'Present your documents and check in your luggage', duration: 5 },
      { title: 'Security Check', description: 'Navigate security screening and understand instructions', duration: 4 },
      { title: 'Finding Your Gate', description: 'Ask for directions and understand airport announcements', duration: 3 },
      { title: 'Boarding the Plane', description: 'Handle boarding calls and seat assignments', duration: 3 },
    ],
    exercises: [
      { icon: '🎭', title: 'Role Play', description: 'Go through the full airport experience with AI agent' },
      { icon: '📝', title: 'Vocabulary Quiz', description: 'Test airport and travel vocabulary' },
      { icon: '🎧', title: 'Announcement Listening', description: 'Practice understanding airport announcements' },
      { icon: '💬', title: 'Problem Solving', description: 'Handle missed flights and lost baggage scenarios' },
    ],
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    titleZh: 'Hotel Reception',
    description: 'Practice checking into a hotel, asking about amenities, and making requests.',
    icon: 'bed',
    category: 'travel',
    difficulty: 'elementary',
    ageGroups: ['all'],
    systemPrompt: `You are a professional hotel receptionist at a upscale hotel. Help the guest with check-in, answer questions about facilities, and handle requests. Be courteous and professional. Gently correct mistakes by rephrasing. Keep responses to 1-3 sentences. Stay in character.`,
    vocabulary: ['reservation', 'check-in', 'check-out', 'room service', 'amenities', 'wifi', 'key card', 'elevator', 'housekeeping'],
    vocabularyCount: 9,
    estimatedMinutes: 5,
    tips: 'Practice checking in with a reservation, asking about breakfast hours, WiFi password, and requesting extra amenities.',
    objectives: [
      'Check in and out of a hotel in English',
      'Ask about hotel amenities and services',
      'Make special requests (extra towels, late checkout)',
      'Handle common hotel problems',
    ],
    lessons: [
      { title: 'Making a Reservation', description: 'Book a room by phone or online', duration: 4 },
      { title: 'Check-in Process', description: 'Present your booking and get your room key', duration: 5 },
      { title: 'Hotel Services', description: 'Ask about breakfast, WiFi, gym, and pool', duration: 4 },
      { title: 'Room Service & Requests', description: 'Order room service and make special requests', duration: 4 },
      { title: 'Check-out', description: 'Settle your bill and leave the hotel', duration: 3 },
    ],
    exercises: [
      { icon: '🎭', title: 'Role Play', description: 'Full hotel stay simulation from check-in to check-out' },
      { icon: '', title: 'Vocabulary Quiz', description: 'Test hotel and hospitality vocabulary' },
      { icon: '🎧', title: 'Listening Practice', description: 'Understand hotel staff instructions and announcements' },
      { icon: '💬', title: 'Problem Solving', description: 'Handle noisy neighbors, broken AC, and billing issues' },
    ],
  },
  {
    id: 'doctor',
    title: "Doctor's Visit",
    titleZh: 'Medical Consultation',
    description: 'Practice describing symptoms, understanding medical advice, and discussing health concerns.',
    icon: 'stethoscope',
    category: 'health',
    difficulty: 'intermediate',
    ageGroups: ['adult', 'senior'],
    systemPrompt: `You are a caring and professional doctor. Listen to the patient's symptoms, ask follow-up questions, and provide basic medical advice. Use clear, simple medical terms. Be empathetic. If the patient struggles with vocabulary, offer helpful suggestions. Keep responses to 2-3 sentences. Stay in character as the doctor.`,
    vocabulary: ['symptoms', 'prescription', 'diagnosis', 'allergy', 'fever', 'headache', 'nausea', 'examination', 'insurance', 'pharmacy'],
    vocabularyCount: 10,
    estimatedMinutes: 8,
    tips: 'Describe your symptoms clearly: when they started, how severe they are, and any medications you\'re taking. Ask about the diagnosis and treatment plan.',
    objectives: [
      'Describe symptoms accurately in English',
      'Understand medical advice and instructions',
      'Ask about medications and side effects',
      'Navigate health insurance discussions',
    ],
    lessons: [
      { title: 'Describing Symptoms', description: 'Learn to describe pain, discomfort, and illness', duration: 5 },
      { title: 'Medical History', description: 'Discuss your medical history and allergies', duration: 5 },
      { title: 'Understanding Diagnosis', description: 'Ask questions about your condition', duration: 5 },
      { title: 'Treatment & Prescription', description: 'Understand treatment plans and medication instructions', duration: 5 },
    ],
    exercises: [
      { icon: '🎭', title: 'Role Play', description: 'Full doctor visit simulation' },
      { icon: '📝', title: 'Medical Vocabulary', description: 'Learn common medical terms and phrases' },
      { icon: '🎧', title: 'Listening Practice', description: 'Understand doctor\'s instructions and advice' },
      { icon: '💬', title: 'Emergency Scenarios', description: 'Practice describing urgent medical situations' },
    ],
  },
  {
    id: 'job_interview',
    title: 'Job Interview',
    titleZh: 'Job Interview',
    description: 'Practice answering common interview questions and presenting yourself professionally.',
    icon: 'briefcase',
    category: 'career',
    difficulty: 'upper_intermediate',
    ageGroups: ['adult'],
    systemPrompt: `You are an experienced HR manager conducting a job interview. Ask professional questions about the candidate's experience, skills, and goals. Provide natural follow-up questions. Be professional but encouraging. If the candidate makes errors, continue the conversation naturally while modeling correct language. Keep responses to 2-3 sentences. Stay in character.`,
    vocabulary: ['experience', 'qualification', 'strength', 'weakness', 'deadline', 'teamwork', 'leadership', 'salary', 'position', 'reference'],
    vocabularyCount: 10,
    estimatedMinutes: 10,
    tips: 'Prepare answers for common questions: "Tell me about yourself", "What are your strengths?", and "Why do you want this job?" Use the STAR method for behavioral questions.',
    objectives: [
      'Answer common interview questions confidently',
      'Describe your experience and skills professionally',
      'Ask thoughtful questions about the role and company',
      'Negotiate salary and benefits appropriately',
    ],
    lessons: [
      { title: 'Self Introduction', description: 'Craft a compelling "Tell me about yourself" answer', duration: 5 },
      { title: 'Experience & Skills', description: 'Describe your work history and key achievements', duration: 5 },
      { title: 'Behavioral Questions', description: 'Use the STAR method for situational questions', duration: 8 },
      { title: 'Questions for the Interviewer', description: 'Ask smart questions about the role and company', duration: 4 },
      { title: 'Salary Negotiation', description: 'Discuss compensation professionally', duration: 5 },
    ],
    exercises: [
      { icon: '🎭', title: 'Mock Interview', description: 'Full interview simulation with AI HR manager' },
      { icon: '📝', title: 'Answer Builder', description: 'Practice structuring answers with the STAR method' },
      { icon: '', title: 'Listening Practice', description: 'Understand different interview question styles' },
      { icon: '💬', title: 'Q&A Practice', description: 'Practice asking questions to the interviewer' },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping',
    titleZh: 'Shopping & Bargaining',
    description: 'Practice asking about products, sizes, prices, and negotiating in a store.',
    icon: 'shopping-bag',
    category: 'daily_life',
    difficulty: 'beginner',
    ageGroups: ['all'],
    systemPrompt: `You are a friendly shop assistant helping a customer find products. Answer questions about sizes, colors, prices, and availability. Be helpful and enthusiastic about your products. Gently correct language mistakes through natural conversation. Keep responses to 1-2 sentences. Stay in character.`,
    vocabulary: ['size', 'color', 'price', 'discount', 'fitting room', 'refund', 'exchange', 'receipt', 'sale', 'try on'],
    vocabularyCount: 10,
    estimatedMinutes: 5,
    tips: 'Ask about available sizes and colors. Practice asking for a discount, trying items on, and understanding the return policy.',
    objectives: [
      'Ask about product availability, sizes, and colors',
      'Negotiate prices and ask about discounts',
      'Understand return and exchange policies',
      'Make purchases confidently in English',
    ],
    lessons: [
      { title: 'Browsing the Store', description: 'Ask about products and find what you need', duration: 4 },
      { title: 'Sizes & Colors', description: 'Ask about available options and try things on', duration: 4 },
      { title: 'Prices & Discounts', description: 'Ask about pricing, sales, and negotiate', duration: 4 },
      { title: 'Payment & Returns', description: 'Complete the purchase and understand return policy', duration: 3 },
    ],
    exercises: [
      { icon: '🎭', title: 'Role Play', description: 'Full shopping experience with AI assistant' },
      { icon: '📝', title: 'Vocabulary Quiz', description: 'Test shopping and retail vocabulary' },
      { icon: '🎧', title: 'Listening Practice', description: 'Understand sales pitches and product descriptions' },
      { icon: '💬', title: 'Bargaining Practice', description: 'Practice negotiating prices and asking for deals' },
    ],
  },
  {
    id: 'taxi',
    title: 'Taking a Taxi',
    titleZh: 'Taxi Ride',
    description: 'Practice giving directions, negotiating fares, and making small talk with a taxi driver.',
    icon: 'car',
    category: 'travel',
    difficulty: 'beginner',
    ageGroups: ['all'],
    systemPrompt: `You are a chatty but helpful taxi driver in a big city. Ask where the passenger wants to go, make small talk about the weather or city, and comment on traffic. Be friendly and casual. If the passenger makes mistakes, just respond naturally with correct language. Keep responses to 1-2 sentences. Stay in character.`,
    vocabulary: ['destination', 'fare', 'meter', 'traffic', 'shortcut', 'luggage', 'receipt', 'change', 'rush hour'],
    vocabularyCount: 9,
    estimatedMinutes: 5,
    tips: 'Tell the driver your destination clearly. Practice asking about the fare, estimated time, and making small talk about the city.',
    objectives: [
      'Give clear directions to your destination',
      'Ask about fares and payment methods',
      'Make small talk with the driver',
      'Handle common taxi situations',
    ],
    lessons: [
      { title: 'Hailing a Taxi', description: 'Learn to flag down a taxi and state your destination', duration: 3 },
      { title: 'Giving Directions', description: 'Provide clear directions and landmarks', duration: 4 },
      { title: 'Fare & Payment', description: 'Ask about the meter, fare estimate, and payment', duration: 3 },
      { title: 'Small Talk', description: 'Practice casual conversation with the driver', duration: 4 },
    ],
    exercises: [
      { icon: '', title: 'Role Play', description: 'Full taxi ride simulation with AI driver' },
      { icon: '📝', title: 'Direction Vocabulary', description: 'Learn directional phrases and landmarks' },
      { icon: '🎧', title: 'Listening Practice', description: 'Understand driver questions and city information' },
      { icon: '💬', title: 'Small Talk Practice', description: 'Practice casual conversation topics' },
    ],
  },
  {
    id: 'phone_call',
    title: 'Phone Conversation',
    titleZh: 'Phone Call',
    description: 'Practice making phone calls, leaving messages, and handling business calls.',
    icon: 'phone',
    category: 'career',
    difficulty: 'intermediate',
    ageGroups: ['all'],
    systemPrompt: `You are a professional colleague receiving a business phone call. Handle the call professionally, take messages if needed, and discuss work matters. Use phone conversation phrases naturally. Correct mistakes by rephrasing. Keep responses to 2-3 sentences. Stay in character.`,
    vocabulary: ['extension', 'voicemail', 'message', 'callback', 'conference', 'schedule', 'appointment', 'transfer', 'hold on', 'speaking'],
    vocabularyCount: 10,
    estimatedMinutes: 8,
    tips: 'Practice phone greetings, leaving voicemail messages, and asking someone to repeat or speak more slowly. Use phrases like "Could you hold on?" and "I\'ll call back later."',
    objectives: [
      'Make and receive professional phone calls',
      'Leave clear voicemail messages',
      'Handle call transfers and hold situations',
      'Schedule appointments over the phone',
    ],
    lessons: [
      { title: 'Phone Greetings', description: 'Learn professional phone opening phrases', duration: 4 },
      { title: 'Making Requests', description: 'Ask to speak with someone or request information', duration: 5 },
      { title: 'Leaving Messages', description: 'Leave clear and concise voicemail messages', duration: 5 },
      { title: 'Handling Difficulties', description: 'Deal with bad connections and misunderstandings', duration: 4 },
      { title: 'Ending Calls', description: 'Close calls professionally and confirm next steps', duration: 3 },
    ],
    exercises: [
      { icon: '🎭', title: 'Role Play', description: 'Full phone call simulation with AI colleague' },
      { icon: '📝', title: 'Phone Phrases', description: 'Learn essential phone conversation expressions' },
      { icon: '🎧', title: 'Listening Practice', description: 'Understand different accents and phone audio' },
      { icon: '💬', title: 'Voicemail Practice', description: 'Practice leaving clear voice messages' },
    ],
  },
];

/** 场景图标统一映射表（icon 字段 → emoji），新增场景时在此补充 */
export const SCENE_EMOJI_MAP: Record<string, string> = {
  utensils: '🍽️',
  plane: '✈️',
  bed: '🛏️',
  stethoscope: '🩺',
  briefcase: '💼',
  'shopping-bag': '🛍️',
  car: '🚕',
  phone: '📞',
};

/** 根据场景 icon 字段返回对应的 emoji 图标（全局统一映射） */
export function getSceneEmoji(icon: string): string {
  return SCENE_EMOJI_MAP[icon] || '💬';
}

/** 根据场景 id 查找场景（统一查询入口） */
export function getSceneById(id: string): SceneConfig | undefined {
  return SCENES.find((s) => s.id === id);
}
