-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gifts (동네선물) Table
CREATE TABLE IF NOT EXISTS gifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_name TEXT NOT NULL,
  store_intro TEXT NOT NULL,
  product_name TEXT NOT NULL,
  original_price INTEGER NOT NULL,
  discount_rate INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gift Images Table
CREATE TABLE IF NOT EXISTS gift_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gift_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE
);

-- Comments (추천 후기) Table
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gift_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Group Buys (공동구매) Table
CREATE TABLE IF NOT EXISTS group_buys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gift_id INTEGER NOT NULL,
  creator_user_id INTEGER NOT NULL,
  discount_rate INTEGER NOT NULL,
  deposit_amount INTEGER DEFAULT 2000,
  current_count INTEGER DEFAULT 1,
  target_count INTEGER DEFAULT 2,
  is_complete INTEGER DEFAULT 0,
  end_time DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE,
  FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Group Buy Participants Table
CREATE TABLE IF NOT EXISTS group_buy_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_buy_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_buy_id) REFERENCES group_buys(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(group_buy_id, user_id)
);

-- Together Posts (같이가요) Table
CREATE TABLE IF NOT EXISTS together_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  visit_time TEXT NOT NULL,
  people TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_address TEXT,
  question TEXT,
  gender TEXT,
  age TEXT,
  job TEXT,
  intro TEXT,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Together Applications (같이가요 신청) Table
CREATE TABLE IF NOT EXISTS together_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  answer TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT NOT NULL,
  job TEXT NOT NULL,
  intro TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES together_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- Purchase History Table
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gift_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  voucher_code TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  has_review INTEGER DEFAULT 0,
  has_receipt INTEGER DEFAULT 0,
  is_refunded INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE
);

-- Likes Table (동네선물 좋아요)
CREATE TABLE IF NOT EXISTS gift_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gift_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE,
  UNIQUE(user_id, gift_id)
);

-- Together Post Likes Table (같이가요 좋아요)
CREATE TABLE IF NOT EXISTS together_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES together_posts(id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)
);

-- Comment Likes Table (후기 공감)
CREATE TABLE IF NOT EXISTS comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  UNIQUE(user_id, comment_id)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_gifts_location ON gifts(location);
CREATE INDEX IF NOT EXISTS idx_gift_images_gift_id ON gift_images(gift_id);
CREATE INDEX IF NOT EXISTS idx_comments_gift_id ON comments(gift_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_group_buys_gift_id ON group_buys(gift_id);
CREATE INDEX IF NOT EXISTS idx_group_buys_status ON group_buys(is_complete);
CREATE INDEX IF NOT EXISTS idx_together_posts_user_id ON together_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_together_posts_status ON together_posts(status);
CREATE INDEX IF NOT EXISTS idx_together_applications_post_id ON together_applications(post_id);
CREATE INDEX IF NOT EXISTS idx_together_applications_user_id ON together_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_likes_user_id ON gift_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_together_likes_user_id ON together_likes(user_id);
