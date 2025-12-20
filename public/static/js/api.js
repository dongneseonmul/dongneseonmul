// API Base URL
const API_BASE_URL = '/api';

// API Helper Functions
const API = {
  // ============================================
  // Authentication APIs
  // ============================================
  async checkPhoneNumber(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      return await response.json();
    } catch (error) {
      console.error('Error checking phone number:', error);
      return { exists: false };
    }
  },

  async login(phoneNumber, nickname) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, nickname })
      });
      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false };
    }
  },

  async requestVerification(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      return await response.json();
    } catch (error) {
      console.error('Error requesting verification:', error);
      return { success: false };
    }
  },

  async verifyCode(phoneNumber, code) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code })
      });
      return await response.json();
    } catch (error) {
      console.error('Error verifying code:', error);
      return { success: false, verified: false };
    }
  },

  // ============================================
  // Gifts APIs
  // ============================================
  async getGifts() {
    try {
      const response = await fetch(`${API_BASE_URL}/gifts`);
      const data = await response.json();
      return data.gifts || [];
    } catch (error) {
      console.error('Error fetching gifts:', error);
      return [];
    }
  },

  async getGiftById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/gifts/${id}`);
      const data = await response.json();
      return data.gift || null;
    } catch (error) {
      console.error('Error fetching gift:', error);
      return null;
    }
  },

  async toggleGiftLike(giftId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error toggling gift like:', error);
      return { success: false };
    }
  },

  async getUserLikedGifts(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/gifts/likes/${userId}`);
      const data = await response.json();
      return data.likedGiftIds || [];
    } catch (error) {
      console.error('Error fetching liked gifts:', error);
      return [];
    }
  },

  // ============================================
  // Comments APIs
  // ============================================
  async addComment(giftId, userId, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, userId, content })
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false };
    }
  },

  async toggleCommentLike(commentId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error toggling comment like:', error);
      return { success: false };
    }
  },

  // ============================================
  // Group Buy APIs
  // ============================================
  async createGroupBuy(giftId, userId, discountRate) {
    try {
      const response = await fetch(`${API_BASE_URL}/group-buys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, userId, discountRate })
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating group buy:', error);
      return { success: false };
    }
  },

  async joinGroupBuy(groupBuyId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/group-buys/${groupBuyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error joining group buy:', error);
      return { success: false };
    }
  },

  // ============================================
  // Together Posts APIs
  // ============================================
  async getTogetherPosts() {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts`);
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching together posts:', error);
      return [];
    }
  },

  async getTogetherPostById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts/${id}`);
      const data = await response.json();
      return data.post || null;
    } catch (error) {
      console.error('Error fetching together post:', error);
      return null;
    }
  },

  async createTogetherPost(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating together post:', error);
      return { success: false };
    }
  },

  async applyTogetherPost(postId, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts/${postId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error applying to together post:', error);
      return { success: false };
    }
  },

  async updateApplicationStatus(applicationId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating application status:', error);
      return { success: false };
    }
  },

  async toggleTogetherLike(postId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error toggling together like:', error);
      return { success: false };
    }
  },

  async getUserLikedTogetherPosts(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts/likes/${userId}`);
      const data = await response.json();
      return data.likedPostIds || [];
    } catch (error) {
      console.error('Error fetching liked together posts:', error);
      return [];
    }
  },

  async getUserTogetherPosts(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts/user/${userId}`);
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching user together posts:', error);
      return [];
    }
  },

  async getUserAppliedTogetherPosts(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/together-posts/applied/${userId}`);
      const data = await response.json();
      return data.applications || [];
    } catch (error) {
      console.error('Error fetching applied together posts:', error);
      return [];
    }
  },

  // ============================================
  // Purchase APIs
  // ============================================
  async createPurchase(userId, giftId, quantity) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, giftId, quantity })
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating purchase:', error);
      return { success: false };
    }
  },

  async getUserPurchases(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases/${userId}`);
      const data = await response.json();
      return data.purchases || [];
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  },

  async updatePurchaseReview(purchaseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases/${purchaseId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating purchase review:', error);
      return { success: false };
    }
  },

  async updatePurchaseReceipt(purchaseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases/${purchaseId}/receipt`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating purchase receipt:', error);
      return { success: false };
    }
  }
};

console.log('✅ API Helper loaded');
