// API Service for Smart School Frontend
const API_BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ? `${import.meta.env.VITE_API_URL}/api` : '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Test database connection
  async testDatabase() {
    return this.request('/test-db');
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  // Real Database endpoints
  async getStudents() {
    return this.request('/students');
  }

  async getAttendance() {
    return this.request('/attendance');
  }

  async getPayments() {
    return this.request('/payments');
  }

  async getProfile(userId) {
    return this.request(`/profile/${userId}`);
  }

  async addAttendance(data) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addPayment(data) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Fee Balance endpoints
  async getFeeBalance(userId) {
    return this.request(`/fee-balance/${userId}`);
  }

  async getFeeStructure() {
    return this.request('/fee-structure');
  }

  // Payment Plan endpoints
  async getPaymentPlans(userId) {
    return this.request(`/payment-plans/${userId}`);
  }

  async createPaymentPlan(planData) {
    return this.request('/payment-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePaymentPlan(planId, planData) {
    return this.request(`/payment-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deletePaymentPlan(planId) {
    return this.request(`/payment-plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Generic GET request
  async get(endpoint) {
    return this.request(endpoint);
  }

  // Generic POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generic PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Generic DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // AI Tutoring endpoints - N8N Webhook Only
  async generateLanguageLesson(data) {
    const response = await fetch('http://localhost:5678/webhook/ai_tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRole: 'student',
        language: data.language || 'English',
        level: data.level || 'intermediate',
        topic: data.topic || 'general studies',
        lessonType: data.lessonType || 'general',
        studentId: data.studentId || 1,
        message: data.message || ''
      }),
    });
    
    if (!response.ok) {
      throw new Error(`N8N Webhook error: ${response.status} - Please activate the AI tutor workflow in N8N`);
    }
    
    return response.json();
  }

  async generateTextSummary(data) {
    const response = await fetch('http://localhost:5678/webhook/ai_tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRole: 'student',
        language: 'English',
        level: 'intermediate',
        topic: 'text summary',
        lessonType: 'text-summary',
        studentId: 1,
        message: data.text || ''
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async generateVocabularyList(data) {
    const response = await fetch('http://localhost:5678/webhook/ai_tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRole: 'student',
        language: 'English',
        level: 'intermediate',
        topic: 'vocabulary',
        lessonType: 'vocabulary-list',
        studentId: 1,
        message: data.subject || ''
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async generateCareerAssessment(data) {
    const response = await fetch('http://localhost:5678/webhook/ai_tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRole: 'parent',
        interests: data.interests || ['General'],
        subjects: data.subjects || ['Mathematics', 'English'],
        skills: data.skills || ['Problem solving', 'Communication'],
        gradeLevel: data.gradeLevel || 'Grade 5',
        studentId: data.studentId || 1,
        message: data.message || ''
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // AI Teaching endpoints - Through N8N Webhook
  async generateAssignmentScaffold(data) {
    const response = await fetch('http://localhost:5678/webhook/ai_tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRole: 'teacher',
        assignment: data.assignment || '',
        gradeLevel: data.gradeLevel || 'Grade 5',
        subject: data.subject || 'General',
        message: data.message || ''
      }),
    });
    
    if (!response.ok) {
      throw new Error(`N8N Webhook error: ${response.status} - Please activate the AI tutor workflow in N8N`);
    }
    
    return response.json();
  }

  async generateScienceLab(data) {
    const response = await fetch('http://localhost:5678/webhook/ai_tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRole: 'teacher',
        assignment: data.labTopic || 'Science Lab',
        gradeLevel: data.gradeLevel || 'Grade 5',
        subject: 'Science',
        message: data.message || ''
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async generateDOKQuestions(data) {
    const response = await fetch('http://localhost:5678/webhook/ai_tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRole: 'teacher',
        assignment: data.topic || 'Assessment Questions',
        gradeLevel: data.gradeLevel || 'Grade 5',
        subject: data.subject || 'General',
        message: data.message || ''
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Named exports for convenience
export const {
  healthCheck,
  testDatabase,
  getUsers,
  getStudents,
  getAttendance,
  getPayments,
  getFeeBalance,
  getFeeStructure,
  getPaymentPlans,
  createPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
  generateLanguageLesson,
  generateTextSummary,
  generateVocabularyList,
  generateCareerAssessment,
  generateAssignmentScaffold,
  generateScienceLab,
  generateDOKQuestions,
  get,
  post,
  put,
  delete: deleteRequest
} = apiService;
