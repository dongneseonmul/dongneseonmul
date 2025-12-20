import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all API routes
app.use('/api/*', cors())

// ============================================
// Helper Functions
// ============================================

function generateVoucherCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  let code = ''
  
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  for (let i = 0; i < 2; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  
  return code
}

function getExpiryDate(): string {
  const date = new Date()
  date.setMonth(date.getMonth() + 3)
  return date.toISOString().split('T')[0]
}

function getInitial(text: string): string {
  if (!text) return 'ㅇ'
  const char = text.charAt(0)
  const code = char.charCodeAt(0)
  
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const chosung = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
    return chosung[Math.floor((code - 0xAC00) / 588)]
  }
  
  return char.toUpperCase()
}

function getRandomColor(): string {
  const colors = ['#4A90E2', '#5B7FE8', '#6C8FD9', '#7D9FCA', '#8EAFBB']
  return colors[Math.floor(Math.random() * colors.length)]
}

// Convert snake_case to camelCase for frontend compatibility
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item))
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      acc[camelKey] = toCamelCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// ============================================
// Authentication API
// ============================================

// Check phone number and return user info
app.post('/api/auth/check', async (c) => {
  const { phoneNumber } = await c.req.json()
  const { DB } = c.env
  
  const user = await DB.prepare('SELECT * FROM users WHERE phone_number = ?')
    .bind(phoneNumber)
    .first()
  
  if (user) {
    return c.json({ exists: true, user })
  } else {
    return c.json({ exists: false })
  }
})

// Register or login user
app.post('/api/auth/login', async (c) => {
  const { phoneNumber, nickname } = await c.req.json()
  const { DB } = c.env
  
  // Check if user exists
  let user = await DB.prepare('SELECT * FROM users WHERE phone_number = ?')
    .bind(phoneNumber)
    .first()
  
  if (user) {
    // Update nickname if different
    if (user.nickname !== nickname) {
      await DB.prepare('UPDATE users SET nickname = ?, updated_at = CURRENT_TIMESTAMP WHERE phone_number = ?')
        .bind(nickname, phoneNumber)
        .run()
      
      user.nickname = nickname
    }
  } else {
    // Create new user
    const result = await DB.prepare('INSERT INTO users (phone_number, nickname) VALUES (?, ?)')
      .bind(phoneNumber, nickname)
      .run()
    
    user = await DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first()
  }
  
  return c.json({ success: true, user })
})

// Request SMS verification (simulated)
app.post('/api/auth/request-verification', async (c) => {
  const { phoneNumber } = await c.req.json()
  
  // Simulate SMS sending
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
  console.log(`Verification code for ${phoneNumber}: ${verificationCode}`)
  
  return c.json({ success: true, message: 'Verification code sent' })
})

// Verify SMS code (simulated - always returns true for demo)
app.post('/api/auth/verify-code', async (c) => {
  const { phoneNumber, code } = await c.req.json()
  
  // In production, verify the code against stored value
  return c.json({ success: true, verified: true })
})

// ============================================
// Gifts API (동네선물)
// ============================================

// Get all gifts
app.get('/api/gifts', async (c) => {
  const { DB } = c.env
  
  const gifts = await DB.prepare(`
    SELECT g.*, 
           (SELECT COUNT(*) FROM gift_likes WHERE gift_id = g.id) as likes,
           (SELECT COUNT(*) FROM purchases WHERE gift_id = g.id) as purchases
    FROM gifts g
    ORDER BY g.created_at DESC
  `).all()
  
  // Get images for each gift
  for (const gift of gifts.results) {
    const images = await DB.prepare('SELECT image_url FROM gift_images WHERE gift_id = ? ORDER BY display_order')
      .bind(gift.id)
      .all()
    
    gift.images = images.results.map((img: any) => img.image_url)
  }
  
  return c.json({ gifts: toCamelCase(gifts.results) })
})

// Get gift by ID with full details
app.get('/api/gifts/:id', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  
  const gift = await DB.prepare(`
    SELECT g.*, 
           (SELECT COUNT(*) FROM gift_likes WHERE gift_id = g.id) as likes,
           (SELECT COUNT(*) FROM purchases WHERE gift_id = g.id) as purchases
    FROM gifts g
    WHERE g.id = ?
  `).bind(id).first()
  
  if (!gift) {
    return c.json({ error: 'Gift not found' }, 404)
  }
  
  // Get images
  const images = await DB.prepare('SELECT image_url FROM gift_images WHERE gift_id = ? ORDER BY display_order')
    .bind(id)
    .all()
  
  gift.images = images.results.map((img: any) => img.image_url)
  
  // Get comments with user info
  const comments = await DB.prepare(`
    SELECT c.*, u.nickname,
           (SELECT COUNT(*) FROM purchases WHERE user_id = c.user_id AND gift_id = c.gift_id) as purchase_count,
           (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.gift_id = ?
    ORDER BY c.created_at DESC
  `).bind(id).all()
  
  // Add frontend-compatible fields
  gift.comments = comments.results.map((c: any) => ({
    ...c,
    date: c.created_at?.split(' ')[0] || '',
    purchases: c.purchase_count || 0,
    comment: c.content || '',
    empathy: c.likes || 0
  }))
  
  // Get group buys (최근 5개: 미완료 우선, 그 다음 최신순)
  const groupBuys = await DB.prepare(`
    SELECT gb.*
    FROM group_buys gb
    WHERE gb.gift_id = ?
    ORDER BY gb.is_complete ASC, gb.created_at DESC
    LIMIT 5
  `).bind(id).all()
  
  // Get participants for each group buy
  for (const gb of groupBuys.results) {
    const participants = await DB.prepare(`
      SELECT u.nickname
      FROM group_buy_participants gbp
      JOIN users u ON gbp.user_id = u.id
      WHERE gbp.group_buy_id = ?
    `).bind(gb.id).all()
    
    gb.users = participants.results.map((p: any) => ({
      initial: getInitial(p.nickname),
      color: getRandomColor()
    }))
    
    gb.current_count = participants.results.length
  }
  
  gift.groupBuys = groupBuys.results
  
  // Get related together posts
  const togetherPosts = await DB.prepare(`
    SELECT tp.*, u.nickname,
           (SELECT COUNT(*) FROM together_likes WHERE post_id = tp.id) as likes
    FROM together_posts tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.store_name LIKE ? AND tp.status = 'open'
    ORDER BY tp.created_at DESC
    LIMIT 5
  `).bind(`%${gift.store_name}%`).all()
  
  // Add frontend-compatible fields to together posts
  gift.togetherPosts = togetherPosts.results.map((p: any) => ({
    ...p,
    time: p.created_at?.split(' ')[1]?.substring(0, 5) || '',
    date: p.visit_date || '',
  }))
  
  return c.json({ gift: toCamelCase(gift) })
})

// Debug API: Check group buys raw data
app.get('/api/debug/gift/:id/groupbuys', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  
  const groupBuys = await DB.prepare(`
    SELECT gb.*
    FROM group_buys gb
    WHERE gb.gift_id = ?
    ORDER BY gb.is_complete ASC, gb.created_at DESC
    LIMIT 5
  `).bind(id).all()
  
  return c.json({ 
    giftId: id,
    count: groupBuys.results.length,
    groupBuys: groupBuys.results 
  })
})

// Toggle gift like
app.post('/api/gifts/:id/like', async (c) => {
  const id = c.req.param('id')
  const { userId } = await c.req.json()
  const { DB } = c.env
  
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }
  
  // Check if already liked
  const existing = await DB.prepare('SELECT * FROM gift_likes WHERE user_id = ? AND gift_id = ?')
    .bind(userId, id)
    .first()
  
  if (existing) {
    // Unlike
    await DB.prepare('DELETE FROM gift_likes WHERE user_id = ? AND gift_id = ?')
      .bind(userId, id)
      .run()
    
    return c.json({ success: true, liked: false })
  } else {
    // Like
    await DB.prepare('INSERT INTO gift_likes (user_id, gift_id) VALUES (?, ?)')
      .bind(userId, id)
      .run()
    
    return c.json({ success: true, liked: true })
  }
})

// Get user's liked gifts
app.get('/api/gifts/likes/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env
  
  const likes = await DB.prepare('SELECT gift_id FROM gift_likes WHERE user_id = ?')
    .bind(userId)
    .all()
  
  return c.json({ likedGiftIds: likes.results.map((l: any) => l.gift_id) })
})

// ============================================
// Comments API (후기)
// ============================================

// Add comment
app.post('/api/comments', async (c) => {
  const { giftId, userId, content } = await c.req.json()
  const { DB } = c.env
  
  if (!userId || !content) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  const result = await DB.prepare('INSERT INTO comments (gift_id, user_id, content) VALUES (?, ?, ?)')
    .bind(giftId, userId, content)
    .run()
  
  const comment = await DB.prepare(`
    SELECT c.*, u.nickname,
           (SELECT COUNT(*) FROM purchases WHERE user_id = c.user_id AND gift_id = c.gift_id) as purchase_count,
           0 as likes
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).bind(result.meta.last_row_id).first()
  
  return c.json({ success: true, comment })
})

// Toggle comment like (empathy)
app.post('/api/comments/:id/like', async (c) => {
  const id = c.req.param('id')
  const { userId } = await c.req.json()
  const { DB } = c.env
  
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }
  
  // Check if already liked
  const existing = await DB.prepare('SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?')
    .bind(userId, id)
    .first()
  
  if (existing) {
    // Unlike
    await DB.prepare('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?')
      .bind(userId, id)
      .run()
    
    return c.json({ success: true, liked: false })
  } else {
    // Like
    await DB.prepare('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)')
      .bind(userId, id)
      .run()
    
    return c.json({ success: true, liked: true })
  }
})

// ============================================
// Group Buy API (공동구매)
// ============================================

// Create group buy
app.post('/api/group-buys', async (c) => {
  const { giftId, userId, discountRate } = await c.req.json()
  const { DB } = c.env
  
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }
  
  // Check if there's an incomplete group buy for this gift
  const existingGroupBuy = await DB.prepare(`
    SELECT * FROM group_buys 
    WHERE gift_id = ? AND is_complete = 0 
    ORDER BY created_at ASC 
    LIMIT 1
  `).bind(giftId).first()
  
  if (existingGroupBuy) {
    // Join existing group buy instead of creating new one
    // Check if user already joined
    const alreadyJoined = await DB.prepare(`
      SELECT * FROM group_buy_participants 
      WHERE group_buy_id = ? AND user_id = ?
    `).bind(existingGroupBuy.id, userId).first()
    
    if (alreadyJoined) {
      return c.json({ error: 'Already joined' }, 400)
    }
    
    // Add participant
    await DB.prepare('INSERT INTO group_buy_participants (group_buy_id, user_id) VALUES (?, ?)')
      .bind(existingGroupBuy.id, userId)
      .run()
    
    // Check if we've reached target count
    const count = await DB.prepare('SELECT COUNT(*) as count FROM group_buy_participants WHERE group_buy_id = ?')
      .bind(existingGroupBuy.id)
      .first()
    
    if (count && count.count >= existingGroupBuy.target_count) {
      // Mark as complete
      await DB.prepare('UPDATE group_buys SET is_complete = 1 WHERE id = ?')
        .bind(existingGroupBuy.id)
        .run()
      
      // Create purchase records for all participants
      const participants = await DB.prepare('SELECT user_id FROM group_buy_participants WHERE group_buy_id = ?')
        .bind(existingGroupBuy.id)
        .all()
      
      const gift = await DB.prepare('SELECT * FROM gifts WHERE id = ?').bind(giftId).first()
      
      for (const p of participants.results) {
        const voucherCode = generateVoucherCode()
        const expiryDate = getExpiryDate()
        
        await DB.prepare(`
          INSERT INTO purchases (user_id, gift_id, quantity, voucher_code, expiry_date)
          VALUES (?, ?, ?, ?, ?)
        `).bind(p.user_id, giftId, 1, voucherCode, expiryDate).run()
      }
      
      return c.json({ success: true, groupBuyId: existingGroupBuy.id, complete: true })
    }
    
    return c.json({ success: true, groupBuyId: existingGroupBuy.id, complete: false })
  }
  
  // Create new group buy (only if no existing incomplete one)
  const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  
  const result = await DB.prepare(`
    INSERT INTO group_buys (gift_id, creator_user_id, discount_rate, end_time)
    VALUES (?, ?, ?, ?)
  `).bind(giftId, userId, discountRate || 20, endTime).run()
  
  // Add creator as first participant
  await DB.prepare('INSERT INTO group_buy_participants (group_buy_id, user_id) VALUES (?, ?)')
    .bind(result.meta.last_row_id, userId)
    .run()
  
  return c.json({ success: true, groupBuyId: result.meta.last_row_id })
})

// Join group buy
app.post('/api/group-buys/:id/join', async (c) => {
  const id = c.req.param('id')
  const { userId } = await c.req.json()
  const { DB } = c.env
  
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }
  
  // Check if group buy exists and is not complete
  const groupBuy = await DB.prepare('SELECT * FROM group_buys WHERE id = ? AND is_complete = 0')
    .bind(id)
    .first()
  
  if (!groupBuy) {
    return c.json({ error: 'Group buy not available' }, 404)
  }
  
  // Add participant
  try {
    await DB.prepare('INSERT INTO group_buy_participants (group_buy_id, user_id) VALUES (?, ?)')
      .bind(id, userId)
      .run()
  } catch (e) {
    return c.json({ error: 'Already joined' }, 400)
  }
  
  // Check if we've reached target count
  const count = await DB.prepare('SELECT COUNT(*) as count FROM group_buy_participants WHERE group_buy_id = ?')
    .bind(id)
    .first()
  
  if (count && count.count >= groupBuy.target_count) {
    // Mark as complete
    await DB.prepare('UPDATE group_buys SET is_complete = 1 WHERE id = ?')
      .bind(id)
      .run()
    
    // Create purchase records for all participants
    const participants = await DB.prepare('SELECT user_id FROM group_buy_participants WHERE group_buy_id = ?')
      .bind(id)
      .all()
    
    for (const participant of participants.results) {
      const voucherCode = generateVoucherCode()
      const expiryDate = getExpiryDate()
      
      await DB.prepare(`
        INSERT INTO purchases (user_id, gift_id, quantity, voucher_code, expiry_date)
        VALUES (?, ?, 1, ?, ?)
      `).bind(participant.user_id, groupBuy.gift_id, voucherCode, expiryDate).run()
    }
    
    return c.json({ success: true, complete: true })
  }
  
  return c.json({ success: true, complete: false })
})

// Get all group buys for a gift (전체 보기)
app.get('/api/gifts/:id/group-buys/all', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  
  const groupBuys = await DB.prepare(`
    SELECT gb.*
    FROM group_buys gb
    WHERE gb.gift_id = ?
    ORDER BY gb.is_complete ASC, gb.created_at DESC
  `).bind(id).all()
  
  // Get participants for each group buy
  for (const gb of groupBuys.results) {
    const participants = await DB.prepare(`
      SELECT u.nickname
      FROM group_buy_participants gbp
      JOIN users u ON gbp.user_id = u.id
      WHERE gbp.group_buy_id = ?
    `).bind(gb.id).all()
    
    gb.users = participants.results.map((p: any) => ({
      initial: getInitial(p.nickname),
      color: getRandomColor()
    }))
    
    gb.current_count = participants.results.length
  }
  
  return c.json({ groupBuys: toCamelCase(groupBuys.results) })
})

// ============================================
// Together Posts API (같이가요)
// ============================================

// Get all together posts
app.get('/api/together-posts', async (c) => {
  const { DB } = c.env
  
  const posts = await DB.prepare(`
    SELECT tp.*, u.nickname,
           (SELECT COUNT(*) FROM together_likes WHERE post_id = tp.id) as likes
    FROM together_posts tp
    JOIN users u ON tp.user_id = u.id
    ORDER BY tp.created_at DESC
  `).all()
  
  // Add frontend-compatible fields
  const postsWithFields = posts.results.map((p: any) => ({
    ...p,
    time: p.created_at?.split(' ')[1]?.substring(0, 5) || '',
    date: p.visit_date || '',
  }))
  
  return c.json({ posts: toCamelCase(postsWithFields) })
})

// Get together post by ID
app.get('/api/together-posts/:id', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  
  const post = await DB.prepare(`
    SELECT tp.*, u.nickname,
           (SELECT COUNT(*) FROM together_likes WHERE post_id = tp.id) as likes
    FROM together_posts tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.id = ?
  `).bind(id).first()
  
  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }
  
  // Get applications for this post
  const applications = await DB.prepare(`
    SELECT ta.*, u.nickname
    FROM together_applications ta
    JOIN users u ON ta.user_id = u.id
    WHERE ta.post_id = ?
    ORDER BY ta.created_at DESC
  `).bind(id).all()
  
  post.applications = applications.results
  
  // Add frontend-compatible fields
  const postWithFields = {
    ...post,
    time: post.created_at?.split(' ')[1]?.substring(0, 5) || '',
    date: post.visit_date || '',
  }
  
  return c.json({ post: toCamelCase(postWithFields) })
})

// Create together post
app.post('/api/together-posts', async (c) => {
  const { userId, title, content, visitDate, visitTime, people, storeName, storeAddress, question, gender, age, job, intro } = await c.req.json()
  const { DB } = c.env
  
  if (!userId || !title || !content) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  const result = await DB.prepare(`
    INSERT INTO together_posts (user_id, title, content, visit_date, visit_time, people, store_name, store_address, question, gender, age, job, intro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(userId, title, content, visitDate, visitTime, people, storeName, storeAddress, question, gender, age, job, intro).run()
  
  return c.json({ success: true, postId: result.meta.last_row_id })
})

// Apply to together post
app.post('/api/together-posts/:id/apply', async (c) => {
  const id = c.req.param('id')
  const { userId, answer, gender, age, job, intro } = await c.req.json()
  const { DB } = c.env
  
  if (!userId || !answer) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  try {
    const result = await DB.prepare(`
      INSERT INTO together_applications (post_id, user_id, answer, gender, age, job, intro)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, userId, answer, gender, age, job, intro).run()
    
    return c.json({ success: true, applicationId: result.meta.last_row_id })
  } catch (e) {
    return c.json({ error: 'Already applied' }, 400)
  }
})

// Update application status (accept/reject)
app.patch('/api/together-applications/:id', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()
  const { DB } = c.env
  
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400)
  }
  
  await DB.prepare('UPDATE together_applications SET status = ? WHERE id = ?')
    .bind(status, id)
    .run()
  
  return c.json({ success: true })
})

// Toggle together post like
app.post('/api/together-posts/:id/like', async (c) => {
  const id = c.req.param('id')
  const { userId } = await c.req.json()
  const { DB } = c.env
  
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }
  
  // Check if already liked
  const existing = await DB.prepare('SELECT * FROM together_likes WHERE user_id = ? AND post_id = ?')
    .bind(userId, id)
    .first()
  
  if (existing) {
    // Unlike
    await DB.prepare('DELETE FROM together_likes WHERE user_id = ? AND post_id = ?')
      .bind(userId, id)
      .run()
    
    return c.json({ success: true, liked: false })
  } else {
    // Like
    await DB.prepare('INSERT INTO together_likes (user_id, post_id) VALUES (?, ?)')
      .bind(userId, id)
      .run()
    
    return c.json({ success: true, liked: true })
  }
})

// Get user's liked together posts
app.get('/api/together-posts/likes/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env
  
  const likes = await DB.prepare('SELECT post_id FROM together_likes WHERE user_id = ?')
    .bind(userId)
    .all()
  
  return c.json({ likedPostIds: likes.results.map((l: any) => l.post_id) })
})

// Get user's together posts
app.get('/api/together-posts/user/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env
  
  const posts = await DB.prepare(`
    SELECT tp.*, u.nickname,
           (SELECT COUNT(*) FROM together_likes WHERE post_id = tp.id) as likes
    FROM together_posts tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.user_id = ?
    ORDER BY tp.created_at DESC
  `).bind(userId).all()
  
  return c.json({ posts: posts.results })
})

// Get user's applied together posts
app.get('/api/together-posts/applied/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env
  
  const applications = await DB.prepare(`
    SELECT tp.*, u.nickname, ta.status, ta.created_at as application_date,
           (SELECT COUNT(*) FROM together_likes WHERE post_id = tp.id) as likes
    FROM together_applications ta
    JOIN together_posts tp ON ta.post_id = tp.id
    JOIN users u ON tp.user_id = u.id
    WHERE ta.user_id = ?
    ORDER BY ta.created_at DESC
  `).bind(userId).all()
  
  return c.json({ applications: applications.results })
})

// ============================================
// Purchase API (구매)
// ============================================

// Create purchase
app.post('/api/purchases', async (c) => {
  const { userId, giftId, quantity } = await c.req.json()
  const { DB } = c.env
  
  if (!userId || !giftId) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  const voucherCode = generateVoucherCode()
  const expiryDate = getExpiryDate()
  
  const result = await DB.prepare(`
    INSERT INTO purchases (user_id, gift_id, quantity, voucher_code, expiry_date)
    VALUES (?, ?, ?, ?, ?)
  `).bind(userId, giftId, quantity || 1, voucherCode, expiryDate).run()
  
  return c.json({ success: true, purchaseId: result.meta.last_row_id, voucherCode })
})

// Get user's purchases
app.get('/api/purchases/:userId', async (c) => {
  const userId = c.req.param('userId')
  const { DB } = c.env
  
  const purchases = await DB.prepare(`
    SELECT p.*, g.store_name, g.store_intro, g.product_name, g.original_price, g.discount_rate, g.discounted_price, g.location,
           (SELECT image_url FROM gift_images WHERE gift_id = g.id ORDER BY display_order LIMIT 1) as image
    FROM purchases p
    JOIN gifts g ON p.gift_id = g.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).bind(userId).all()
  
  return c.json({ purchases: toCamelCase(purchases.results) })
})

// Update purchase review status
app.patch('/api/purchases/:id/review', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  
  await DB.prepare('UPDATE purchases SET has_review = 1 WHERE id = ?')
    .bind(id)
    .run()
  
  return c.json({ success: true })
})

// Update purchase receipt status
app.patch('/api/purchases/:id/receipt', async (c) => {
  const id = c.req.param('id')
  const { DB } = c.env
  
  await DB.prepare('UPDATE purchases SET has_receipt = 1 WHERE id = ?')
    .bind(id)
    .run()
  
  return c.json({ success: true })
})

// ============================================
// Root route - let Cloudflare Pages serve index.html
// ============================================

// Remove the root route handler - let Cloudflare Pages serve static files

export default app
