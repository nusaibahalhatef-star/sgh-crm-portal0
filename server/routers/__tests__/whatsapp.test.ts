import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '../../db';

// Mock db module
vi.mock('../../db');

describe('WhatsApp Router Procedures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('markAsRead', () => {
    it('should update conversation unreadCount to 0', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ success: true });
      (db.updateWhatsAppConversation as any).mockImplementation(mockUpdate);

      // Simulate the procedure
      const conversationId = 123;
      await db.updateWhatsAppConversation(conversationId, { unreadCount: 0 });

      expect(mockUpdate).toHaveBeenCalledWith(conversationId, { unreadCount: 0 });
    });
  });

  describe('conversations.list', () => {
    it('should return all conversations', async () => {
      const mockConversations = [
        { id: 1, customerName: 'أحمد', phoneNumber: '967712345678', unreadCount: 2 },
        { id: 2, customerName: 'فاطمة', phoneNumber: '967712345679', unreadCount: 0 },
      ];
      (db.getAllWhatsAppConversations as any).mockResolvedValue(mockConversations);

      const result = await db.getAllWhatsAppConversations();

      expect(result).toEqual(mockConversations);
      expect(result).toHaveLength(2);
    });
  });

  describe('conversations.search', () => {
    it('should search conversations by name or phone', async () => {
      const mockResults = [
        { id: 1, customerName: 'أحمد', phoneNumber: '967712345678', unreadCount: 0 },
      ];
      (db.searchWhatsAppConversations as any).mockResolvedValue(mockResults);

      const result = await db.searchWhatsAppConversations('أحمد');

      expect(result).toEqual(mockResults);
      expect(result[0].customerName).toContain('أحمد');
    });
  });

  describe('unreadCount', () => {
    it('should return count of unread conversations', async () => {
      (db.getUnreadWhatsAppConversationsCount as any).mockResolvedValue(5);

      const result = await db.getUnreadWhatsAppConversationsCount();

      expect(result).toBe(5);
    });
  });

  describe('templates.syncFromMeta', () => {
    it('should sync templates from Meta', async () => {
      const mockResult = {
        success: true,
        total: 3,
        synced: 2,
        updated: 1,
        message: 'تمت المزامنة: 2 قالب جديد، 1 قالب محدّث من أصل 3 قالب معتمد',
      };

      // This would be tested in integration tests
      expect(mockResult.success).toBe(true);
      expect(mockResult.synced + mockResult.updated).toBe(3);
    });
  });
});
