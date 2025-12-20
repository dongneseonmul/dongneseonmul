export type Bindings = {
  DB: D1Database;
}

export type User = {
  id: number;
  phone_number: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export type Gift = {
  id: number;
  store_name: string;
  store_intro: string;
  product_name: string;
  original_price: number;
  discount_rate: number;
  discounted_price: number;
  location: string;
  address: string;
  likes: number;
  purchases: number;
  description: string;
  created_at: string;
  images?: string[];
  comments?: Comment[];
  groupBuys?: GroupBuy[];
}

export type Comment = {
  id: number;
  gift_id: number;
  user_id: number;
  content: string;
  likes: number;
  created_at: string;
  nickname?: string;
  purchases?: number;
}

export type GroupBuy = {
  id: number;
  gift_id: number;
  creator_user_id: number;
  discount_rate: number;
  deposit_amount: number;
  current_count: number;
  target_count: number;
  is_complete: number;
  end_time: string;
  created_at: string;
  users?: Array<{ initial: string; color: string }>;
}

export type TogetherPost = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  visit_date: string;
  visit_time: string;
  people: string;
  store_name: string;
  store_address: string;
  question: string;
  gender: string;
  age: string;
  job: string;
  intro: string;
  likes: number;
  status: string;
  created_at: string;
  nickname?: string;
}

export type TogetherApplication = {
  id: number;
  post_id: number;
  user_id: number;
  answer: string;
  gender: string;
  age: string;
  job: string;
  intro: string;
  status: string;
  created_at: string;
  nickname?: string;
}

export type Purchase = {
  id: number;
  user_id: number;
  gift_id: number;
  quantity: number;
  voucher_code: string;
  expiry_date: string;
  has_review: number;
  has_receipt: number;
  is_refunded: number;
  created_at: string;
}
