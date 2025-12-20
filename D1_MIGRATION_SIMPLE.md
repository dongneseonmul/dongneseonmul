# Cloudflare D1 마이그레이션 - 간단한 방법

## 🚀 빠른 실행 가이드

Cloudflare D1 Console에서 **아래 SQL을 하나씩 복사해서 실행**하세요.

### 1단계: 테이블 생성 (각각 실행)

#### 1. Users 테이블
```sql
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, phone_number TEXT UNIQUE NOT NULL, nickname TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
```

#### 2. Gifts 테이블
```sql
CREATE TABLE IF NOT EXISTS gifts (id INTEGER PRIMARY KEY AUTOINCREMENT, store_name TEXT NOT NULL, store_intro TEXT NOT NULL, product_name TEXT NOT NULL, original_price INTEGER NOT NULL, discount_rate INTEGER NOT NULL, discounted_price INTEGER NOT NULL, location TEXT NOT NULL, address TEXT NOT NULL, likes INTEGER DEFAULT 0, purchases INTEGER DEFAULT 0, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
```

#### 3. Gift Images 테이블
```sql
CREATE TABLE IF NOT EXISTS gift_images (id INTEGER PRIMARY KEY AUTOINCREMENT, gift_id INTEGER NOT NULL, image_url TEXT NOT NULL, display_order INTEGER DEFAULT 0, FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE);
```

#### 4. Comments 테이블
```sql
CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, gift_id INTEGER NOT NULL, user_id INTEGER NOT NULL, content TEXT NOT NULL, likes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
```

#### 5. Group Buys 테이블
```sql
CREATE TABLE IF NOT EXISTS group_buys (id INTEGER PRIMARY KEY AUTOINCREMENT, gift_id INTEGER NOT NULL, creator_user_id INTEGER NOT NULL, discount_rate INTEGER NOT NULL, deposit_amount INTEGER DEFAULT 2000, current_count INTEGER DEFAULT 1, target_count INTEGER DEFAULT 2, is_complete INTEGER DEFAULT 0, end_time DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE, FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE CASCADE);
```

#### 6. Group Buy Participants 테이블
```sql
CREATE TABLE IF NOT EXISTS group_buy_participants (id INTEGER PRIMARY KEY AUTOINCREMENT, group_buy_id INTEGER NOT NULL, user_id INTEGER NOT NULL, joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (group_buy_id) REFERENCES group_buys(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE(group_buy_id, user_id));
```

#### 7. Together Posts 테이블
```sql
CREATE TABLE IF NOT EXISTS together_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, visit_date TEXT NOT NULL, visit_time TEXT NOT NULL, people TEXT NOT NULL, store_name TEXT NOT NULL, store_address TEXT, question TEXT, gender TEXT, age TEXT, job TEXT, intro TEXT, likes INTEGER DEFAULT 0, status TEXT DEFAULT 'open', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
```

#### 8. Together Applications 테이블
```sql
CREATE TABLE IF NOT EXISTS together_applications (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, answer TEXT NOT NULL, gender TEXT NOT NULL, age TEXT NOT NULL, job TEXT NOT NULL, intro TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES together_posts(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE(post_id, user_id));
```

#### 9. Purchases 테이블
```sql
CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, gift_id INTEGER NOT NULL, quantity INTEGER DEFAULT 1, voucher_code TEXT NOT NULL, expiry_date TEXT NOT NULL, has_review INTEGER DEFAULT 0, has_receipt INTEGER DEFAULT 0, is_refunded INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE);
```

#### 10. Gift Likes 테이블
```sql
CREATE TABLE IF NOT EXISTS gift_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, gift_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE, UNIQUE(user_id, gift_id));
```

#### 11. Together Likes 테이블
```sql
CREATE TABLE IF NOT EXISTS together_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, post_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (post_id) REFERENCES together_posts(id) ON DELETE CASCADE, UNIQUE(user_id, post_id));
```

#### 12. Comment Likes 테이블
```sql
CREATE TABLE IF NOT EXISTS comment_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, comment_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE, UNIQUE(user_id, comment_id));
```

---

### 2단계: 인덱스 생성 (각각 실행)

```sql
CREATE INDEX IF NOT EXISTS idx_gifts_location ON gifts(location);
```

```sql
CREATE INDEX IF NOT EXISTS idx_gift_images_gift_id ON gift_images(gift_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_comments_gift_id ON comments(gift_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_group_buys_gift_id ON group_buys(gift_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_group_buys_status ON group_buys(is_complete);
```

```sql
CREATE INDEX IF NOT EXISTS idx_together_posts_user_id ON together_posts(user_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_together_posts_status ON together_posts(status);
```

```sql
CREATE INDEX IF NOT EXISTS idx_together_applications_post_id ON together_applications(post_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_together_applications_user_id ON together_applications(user_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_gift_likes_user_id ON gift_likes(user_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_together_likes_user_id ON together_likes(user_id);
```

---

### 3단계: 샘플 데이터 삽입 (한 번에 실행 가능)

#### 사용자 데이터
```sql
INSERT OR IGNORE INTO users (id, phone_number, nickname) VALUES (1, '01012345678', '여행좋아'), (2, '01098765432', '맛집탐험가'), (3, '01055556666', '산책러버');
```

#### 선물 데이터
```sql
INSERT OR IGNORE INTO gifts (id, store_name, store_intro, product_name, original_price, discount_rate, discounted_price, location, address, description) VALUES (1, '로컬브루어리', '수제맥주 전문점', '수제맥주 2잔 + 안주 1개', 25000, 10, 22500, '서울시 광진구', '서울시 광진구 자양동 123-45', '다양한 종류의 수제맥주를 맛볼 수 있는 브루어리입니다. 분위기 좋고 안주도 맛있어요!'), (2, '카페봄날', '감성 카페', '아메리카노 + 디저트 세트', 12000, 15, 10200, '서울시 광진구', '서울시 광진구 구의동 789-12', '봄날처럼 따뜻한 감성 카페입니다. 커피와 디저트가 일품이에요.'), (3, '이탈리안키친', '정통 이탈리안 레스토랑', '파스타 + 샐러드 세트', 28000, 10, 25200, '서울시 광진구', '서울시 광진구 화양동 456-78', '셰프가 직접 만드는 정통 이탈리안 요리를 맛보세요.'), (4, '플라워카페', '꽃과 함께하는 카페', '음료 1잔 + 꽃 한 송이', 15000, 20, 12000, '서울시 광진구', '서울시 광진구 능동 321-98', '아름다운 꽃들과 함께 여유로운 시간을 보내세요.');
```

#### 이미지 데이터
```sql
INSERT OR IGNORE INTO gift_images (gift_id, image_url, display_order) VALUES (1, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600', 0), (1, 'https://images.unsplash.com/photo-1532634993-15f421e42ec0?w=600', 1), (2, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600', 0), (2, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', 1), (3, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600', 0), (3, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600', 1), (4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', 0), (4, 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600', 1);
```

#### 후기 데이터
```sql
INSERT OR IGNORE INTO comments (gift_id, user_id, content, likes) VALUES (1, 2, '수제맥주가 정말 맛있어요! 분위기도 좋고 데이트하기 딱이에요', 12), (1, 3, '다양한 맥주를 맛볼 수 있어서 좋았어요. 안주도 훌륭합니다!', 8), (2, 1, '조용하고 아늑한 분위기가 최고예요. 디저트도 맛있습니다', 15), (2, 3, '커피 향이 진하고 케이크도 촉촉해요. 재방문 의사 100%!', 10), (3, 1, '파스타 면이 쫄깃하고 소스가 정말 맛있어요!', 9), (4, 2, '꽃 향기와 커피 향이 어우러져 힐링되는 느낌이에요', 7);
```

#### 같이가요 게시글
```sql
INSERT OR IGNORE INTO together_posts (id, user_id, title, content, visit_date, visit_time, people, store_name, store_address, question, gender, age, job, intro) VALUES (1, 1, '주말에 수제맥주 함께 마실 분!', '로컬브루어리에서 수제맥주 마시면서 이야기 나누실 분 찾아요. 편하게 대화하며 즐거운 시간 보내요!', '1월 27일 토요일', '저녁 7시', '2명', '로컬브루어리', '서울시 광진구 자양동 123-45', '맥주 좋아하시나요?', '여', '30대', '회사원', '맥주를 좋아하는 30대 직장인입니다. 주말에 가볍게 한잔하며 이야기 나누는 걸 좋아해요.'), (2, 2, '카페에서 책 읽으며 힐링하실 분', '카페봄날에서 조용히 책 읽으면서 여유로운 시간 보내실 분 구해요', '1월 25일 목요일', '오후 2시', '2명', '카페봄날', '서울시 광진구 구의동 789-12', '어떤 책을 좋아하시나요?', '여', '20대', '학생', '책 읽기를 좋아하는 대학생입니다. 조용한 카페에서 책 읽는 시간이 가장 행복해요.'), (3, 3, '이탈리안 레스토랑 함께 갈 분!', '이탈리안키친에서 맛있는 파스타 먹으면서 즐거운 대화 나눠요', '1월 30일 화요일', '저녁 6시 30분', '3명', '이탈리안키친', '서울시 광진구 화양동 456-78', '좋아하는 음식은?', '남', '30대', '디자이너', '음식을 좋아하는 프리랜서 디자이너입니다. 맛집 탐방을 즐겨해요!');
```

---

### 4단계: 확인

#### 테이블 목록 확인
```sql
SELECT name FROM sqlite_master WHERE type='table';
```

#### 데이터 확인
```sql
SELECT * FROM gifts;
```

---

## ✅ 완료 후 테스트

```bash
curl https://dongneseonmul.pages.dev/api/gifts
```

정상 응답이 나오면 성공입니다! 🎉
