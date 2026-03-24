import { User, Mentor, ConnectionRequest, Message } from '../types';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
    user: User;
    token: string;
}

const TOKEN_KEY = 'mentor_link_token';
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:5000/api`
    : '/api';

const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    auth: {
        login: async (email: string, password: string): Promise<AuthResponse> => {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data: AuthResponse = await res.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            return data;
        },

        register: async (userData: User): Promise<AuthResponse> => {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            const data: AuthResponse = await res.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            return data;
        },

        me: async (): Promise<User | null> => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return null;
            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
                if (!res.ok) {
                    localStorage.removeItem(TOKEN_KEY);
                    return null;
                }
                return await res.json();
            } catch (err) {
                console.error("Failed to fetch me", err);
                return null;
            }
        },

        logout: () => {
            localStorage.removeItem(TOKEN_KEY);
        },

        googleLogin: async (credential: string, role: 'mentee' | 'mentor'): Promise<AuthResponse> => {
            try {
                const decoded = jwtDecode(credential) as any;
                const res = await fetch(`${API_BASE_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ googlePayload: decoded, role })
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Google login failed');
                }
                const data: AuthResponse = await res.json();
                localStorage.setItem(TOKEN_KEY, data.token);
                return data;
            } catch (e) {
                console.error("Google verify err", e);
                throw new Error('Failed to parse or verify Google credential');
            }
        }
    },
    requests: {
        getAllRequests: async (): Promise<ConnectionRequest[]> => {
            const res = await fetch(`${API_BASE_URL}/requests`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch all requests');
            return res.json();
        },
        sendRequest: async (menteeId: string, mentorId: string, menteeName: string, mentorName: string, selectedSlot: string): Promise<ConnectionRequest> => {
            const res = await fetch(`${API_BASE_URL}/requests`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ menteeId, mentorId, menteeName, mentorName, selectedSlot })
            });
            if (!res.ok) throw new Error('Failed to send request');
            return res.json();
        },
        getRequestsForUser: async (userId: string, role: string): Promise<ConnectionRequest[]> => {
            const res = await fetch(`${API_BASE_URL}/requests/user/${userId}?role=${role}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch requests');
            return res.json();
        },
        updateRequestStatus: async (requestId: string, status: 'accepted' | 'rejected'): Promise<ConnectionRequest> => {
            const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update request');
            return res.json();
        },
        cancelRequest: async (requestId: string): Promise<void> => {
            const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: 'cancelled' }),
            });
            if (!res.ok) throw new Error('Failed to cancel request');
        }
    },
    users: {
        getAllUsers: async (): Promise<User[]> => {
            const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        getMentors: async (): Promise<User[]> => {
            const res = await fetch(`${API_BASE_URL}/users/mentors`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch mentors');
            return res.json();
        },
        updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
            const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update profile');
            return res.json();
        },
        sendHeartbeat: async (id: string) => {
            const res = await fetch(`${API_BASE_URL}/users/${id}/heartbeat`, {
                method: 'POST',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to send heartbeat');
            return res.json();
        }
    },
    messages: {
        getMessages: async (requestId: string): Promise<Message[]> => {
            const res = await fetch(`${API_BASE_URL}/messages/${requestId}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch messages');
            return res.json();
        },
        sendMessage: async (requestId: string, senderId: string, recipientId: string, content: string, fileUrl?: string, fileType?: string): Promise<Message> => {
            const res = await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ requestId, senderId, recipientId, content, fileUrl, fileType })
            });
            if (!res.ok) throw new Error('Failed to send message');
            return res.json();
        },
        uploadFile: async (file: File): Promise<{ url: string, type: string }> => {
            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem(TOKEN_KEY);
            const res = await fetch(`${API_BASE_URL}/messages/upload`, {
                method: 'POST',
                headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload file');
            return res.json();
        },
        markAsRead: async (requestId: string, userId: string): Promise<void> => {
            const res = await fetch(`${API_BASE_URL}/messages/read/${requestId}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error('Failed to mark messages as read');
        }
    },
    reviews: {
        getReviews: async (mentorId: string): Promise<any[]> => {
            const res = await fetch(`${API_BASE_URL}/reviews/${mentorId}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch reviews');
            return res.json();
        },
        getAllReviews: async (): Promise<any[]> => {
            const res = await fetch(`${API_BASE_URL}/reviews`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch all reviews');
            return res.json();
        },
        submitReview: async (review: { mentorId: string, menteeId: string, menteeName: string, rating: number, comment: string }): Promise<any> => {
            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(review)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to submit review');
            }
            return res.json();
        }
    },
    resources: {
        getResources: async (mentorId?: string): Promise<any[]> => {
            const url = mentorId ? `${API_BASE_URL}/resources?mentorId=${mentorId}` : `${API_BASE_URL}/resources`;
            const res = await fetch(url, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch resources');
            return res.json();
        },
        addResource: async (resource: { mentorId: string, title: string, description?: string, url: string, type: string }): Promise<any> => {
            const res = await fetch(`${API_BASE_URL}/resources`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(resource)
            });
            if (!res.ok) throw new Error('Failed to add resource');
            return res.json();
        },
        deleteResource: async (id: string): Promise<void> => {
            const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete resource');
        }
    },
    notifications: {
        getNotifications: async (userId: string): Promise<Notification[]> => {
            const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch notifications');
            return res.json();
        },
        markRead: async (id: string): Promise<Notification> => {
            const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to mark notification as read');
            return res.json();
        },
        clearAll: async (userId: string): Promise<void> => {
            const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}/clear`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to clear all notifications');
        }
    },
    admin: {
        getStatus: async (): Promise<any> => {
            const res = await fetch(`${API_BASE_URL}/admin/status`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch admin status');
            return res.json();
        },
        toggleBlockUser: async (userId: string): Promise<any> => {
            const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-block`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to toggle user block status');
            return res.json();
        }
    }
};
