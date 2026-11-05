export interface ChatProductItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date | string;
  quickReplies?: string[];
  products?: ChatProductItem[];
}

export interface QuickReplyOption {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}

