'use client';

import { useState } from 'react';

interface InstagramMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

interface ReplyFormProps {
  recipientId: string;
  conversationId: string;
  replyToMessage?: InstagramMessage | null;
  onReplySuccess?: () => void;
}

export default function ReplyForm({ recipientId, conversationId, replyToMessage, onReplySuccess }: ReplyFormProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending reply:', { recipientId, message, conversationId });
      
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          message: message.trim(),
          conversationId,
          replyToId: replyToMessage?.id || null
        }),
      });

      const result = await response.json();
      console.log('Reply response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply');
      }

      // Check if reply was saved to database
      if (result.savedToDatabase) {
        setSuccess('Reply sent and saved successfully!');
        console.log('✅ Reply saved to database with ID:', result.localMessageId);
      } else if (result.reason === 'Duplicate reply prevented') {
        setSuccess('Reply sent (duplicate prevented)');
        console.log('⚠️ Duplicate reply prevented');
      } else {
        setSuccess('Reply sent to Instagram (database save failed)');
        console.warn('⚠️ Database save failed:', result.dbError);
      }
      
      setMessage('');
      
      // Call success callback if provided
      if (onReplySuccess) {
        onReplySuccess();
      }

    } catch (err) {
      console.error('Reply error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t bg-white p-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center space-x-2">
          <textarea
            id="reply-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply here..."
            rows={2}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              isLoading || !message.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-xs bg-green-50 p-2 rounded">
            ✅ {success}
          </div>
        )}
      </form>
    </div>
  );
}
