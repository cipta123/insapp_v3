'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Eye, Clock, User } from 'lucide-react'

interface InstagramComment {
  id: string;
  commentId: string;
  postId: string;
  parentCommentId?: string | null;
  userId: string;
  username?: string | null;
  text: string;
  timestamp: string;
  isReplied: boolean;
  isHidden: boolean;
  post?: {
    id: string;
    postId: string;
    caption?: string | null;
    mediaType?: string | null;
    permalink?: string | null;
  };
  replies?: InstagramComment[];
}

interface InstagramPost {
  id: string;
  postId: string;
  caption?: string | null;
  mediaType?: string | null;
  permalink?: string | null;
  commentCount: number;
  unreadComments: number;
  latestComment?: InstagramComment | null;
  comments: InstagramComment[];
}

export default function CommentsPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const [comments, setComments] = useState<InstagramComment[]>([])
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<InstagramComment | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch posts and comments
  useEffect(() => {
    fetchPosts()
    fetchComments()
    
    // Auto-refresh every 3 seconds (same as DM)
    const interval = setInterval(() => {
      fetchPosts()
      fetchComments()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments')
      if (response.ok) {
        const data = await response.json()
        setComments(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyingTo || !replyText.trim()) return

    console.log('🔥 REPLY_UI: Starting reply process...');
    console.log('🔥 REPLY_UI: Comment ID:', replyingTo.commentId);
    console.log('🔥 REPLY_UI: Reply text:', replyText.trim());

    try {
      const response = await fetch('/api/comments/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: replyingTo.commentId,
          replyText: replyText.trim()
        })
      })

      if (response.ok) {
        console.log('✅ Reply sent successfully')
        setReplyText('')
        setReplyingTo(null)
        
        // Refresh data
        fetchPosts()
        fetchComments()
      } else {
        console.error('Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes}m`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
    return `${Math.floor(minutes / 1440)}d`
  }

  const getPostComments = (postId: string) => {
    return comments.filter(comment => comment.postId === postId && !comment.parentCommentId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instagram Comments</h1>
            <p className="text-gray-600">Manage and reply to Instagram post comments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{posts.length}</span> posts
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">{comments.length}</span> comments
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Posts List */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts</h2>
            
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No posts with comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPost?.id === post.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Post {post.postId.slice(-8)}
                        </p>
                        {post.caption && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {post.caption}
                          </p>
                        )}
                      </div>
                      {post.unreadComments > 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.commentCount} comments</span>
                      {post.latestComment && (
                        <span>{formatTime(post.latestComment.timestamp)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Detail */}
        <div className="flex-1 flex flex-col">
          {selectedPost ? (
            <>
              {/* Post Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Post Comments
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getPostComments(selectedPost.postId).length} comments
                    </p>
                  </div>
                  {selectedPost.permalink && (
                    <a
                      href={selectedPost.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Post →
                    </a>
                  )}
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6">
                {getPostComments(selectedPost.postId).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No comments on this post yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getPostComments(selectedPost.postId).map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg border ${
                          comment.isReplied
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {comment.username || `User ${comment.userId.slice(-4)}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTime(comment.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {comment.isReplied ? (
                              <span className="text-xs text-green-600 font-medium">
                                Replied
                              </span>
                            ) : (
                              <span className="text-xs text-blue-600 font-medium">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-800 mb-3">{comment.text}</p>
                        
                        {!comment.isReplied && (
                          <button
                            onClick={() => setReplyingTo(comment)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo && (
                <div className="bg-white border-t border-gray-200 p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Replying to <span className="font-medium">{replyingTo.username || `User ${replyingTo.userId.slice(-4)}`}</span>:
                    </p>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border-l-2 border-blue-500">
                      {replyingTo.text}
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Post</h3>
                <p className="text-gray-500">Choose a post from the list to view and manage comments</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
