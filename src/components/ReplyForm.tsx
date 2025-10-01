'use client';

import { useState } from 'react';

interface ReplyFormProps {
  recipientId: string;
  conversationId: string;
  onReplySuccess?: () => void;
}

export default function ReplyForm({ recipientId, conversationId, onReplySuccess }: ReplyFormProps) {
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
          conversationId
        }),
      });

      const result = await response.json();
      console.log('Reply response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply');
      }

      setSuccess('Reply sent successfully!');
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
    <div className="border-t bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="reply-message" className="block text-sm font-medium text-gray-700 mb-1">
            Reply to this conversation:
          </label>
          <textarea
            id="reply-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply here..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
            ✅ {success}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Recipient ID: {recipientId}
          </div>
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`px-4 py-2 rounded-md font-medium ${
              isLoading || !message.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
