'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Eye, Clock, User, Reply, ArrowLeft, X, Heart, MessageSquare, Calendar, Image } from 'lucide-react'

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
  timestamp: string;
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
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const isInitialLoad = useRef(true)
  const previousCommentIds = useRef<Set<string>>(new Set())
  const userManuallyToggled = useRef<Set<string>>(new Set())

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
        
        // Auto-select first post ONLY on initial load
        if (!selectedPost && data.length > 0 && isInitialLoad.current) {
          setSelectedPost(data[0])
          isInitialLoad.current = false
        }
        
        // If a post was selected but got updated, maintain the selection
        if (selectedPost && data.length > 0) {
          const updatedSelectedPost = data.find((post: InstagramPost) => post.id === selectedPost.id)
          if (updatedSelectedPost) {
            setSelectedPost(updatedSelectedPost)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

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

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments')
      if (response.ok) {
        const data = await response.json()
        
        // Only auto-expand for NEW replies, but respect user's manual actions
        const newExpanded = new Set(expandedComments)
        const currentCommentIds = new Set<string>(data.map((c: InstagramComment) => c.id))
        
        data.forEach((comment: InstagramComment) => {
          if (comment.parentCommentId && !previousCommentIds.current.has(comment.id)) {
            // This is a NEW reply, auto-expand its parent ONLY if user hasn't manually toggled it
            if (!userManuallyToggled.current.has(comment.parentCommentId)) {
              newExpanded.add(comment.parentCommentId)
            }
          }
        })
        
        // Update previous comment IDs for next comparison
        previousCommentIds.current = currentCommentIds
        
        // Only update expanded state if there are actual changes
        if (newExpanded.size !== expandedComments.size || 
            !Array.from(newExpanded).every(id => expandedComments.has(id))) {
          setExpandedComments(newExpanded)
        }
        
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
        
        // Auto-expand the parent comment to show the new reply
        const newExpanded = new Set(expandedComments)
        newExpanded.add(replyingTo.commentId)
        setExpandedComments(newExpanded)
        
        setReplyText('')
        setReplyingTo(null)
        // Refresh comments to show new reply
        fetchComments()
        
        // Auto-scroll to bottom after reply (like chat apps)
        setTimeout(() => {
          const chatContainer = document.querySelector('.chat-container')
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
          }
        }, 100)
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
    const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes}m`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
    return `${Math.floor(minutes / 1440)}d`
  }

  const getPostComments = (postId: string) => {
    return comments
      .filter(comment => comment.postId === postId && !comment.parentCommentId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Oldest first (like chat)
  }

  const getCommentReplies = (commentId: string) => {
    return comments
      .filter(comment => comment.parentCommentId === commentId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Oldest first (like chat)
  }

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    
    // Track that user manually toggled this comment
    userManuallyToggled.current.add(commentId)
    setExpandedComments(newExpanded)
  }

  // Component untuk render single comment dengan replies - DM Style
  const CommentBubble = ({ comment, isReply = false }: { comment: InstagramComment, isReply?: boolean }) => {
    const replies = getCommentReplies(comment.commentId)
    const isExpanded = expandedComments.has(comment.commentId)
    const isFromBusiness = comment.username === 'anugrahfadhilah2025' // Your business account
    
    return (
      <div className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
        {/* Comment Bubble */}
        <div className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'} mb-2`}>
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
            isFromBusiness 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}>
            {!isFromBusiness && (
              <div className="text-xs font-medium mb-1 opacity-75">
                {comment.username || `User ${comment.userId.slice(-4)}`}
              </div>
            )}
            <div className="text-sm">{comment.text}</div>
            <div className={`text-xs mt-1 ${
              isFromBusiness ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(comment.timestamp)}
            </div>
          </div>
        </div>
        
        {/* Reply Button - Always show for customer comments */}
        {!isFromBusiness && (
          <div className="flex justify-start mb-2">
            <button
              onClick={() => setReplyingTo(comment)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <Reply className="h-3 w-3" />
              <span>Reply</span>
            </button>
          </div>
        )}
        
        {/* Show Replies Toggle */}
        {replies.length > 0 && (
          <div className="flex justify-start mb-2">
            <button
              onClick={() => toggleCommentExpansion(comment.commentId)}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            >
              {isExpanded ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          </div>
        )}
        
        {/* Nested Replies */}
        {isExpanded && replies.map(reply => (
          <CommentBubble key={reply.id} comment={reply} isReply={true} />
        ))}
      </div>
    )
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
        {/* Posts List - Similar to DM conversations list */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Posts
            </h2>
            
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No posts with comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const postComments = comments.filter(c => c.postId === post.postId && !c.parentCommentId)
                  const totalReplies = comments.filter(c => c.postId === post.postId && c.parentCommentId).length
                  const latestComment = postComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
                  const hasUnread = postComments.some(c => !c.isReplied)
                  
                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedPost?.id === post.id
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md'
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${selectedPost?.id === post.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Image className={`h-4 w-4 ${selectedPost?.id === post.id ? 'text-blue-600' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {post.caption ? post.caption.slice(0, 40) + '...' : `Post ${post.postId.slice(-6)}`}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatTime(post.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {hasUnread && (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-blue-600">{postComments.length}</span>
                          </div>
                          {totalReplies > 0 && (
                            <div className="flex items-center space-x-1">
                              <Reply className="h-3 w-3 text-green-500" />
                              <span className="text-xs font-medium text-green-600">{totalReplies}</span>
                            </div>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hasUnread 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {hasUnread ? 'New' : 'Read'}
                        </div>
                      </div>

                      {/* Latest Comment Preview */}
                      {latestComment && (
                        <div className="bg-gray-50 rounded-lg p-2 mt-2">
                          <p className="text-xs text-gray-600 truncate">
                            <span className="font-medium">{latestComment.username || 'User'}:</span> {latestComment.text.slice(0, 35)}...
                          </p>
                          <span className="text-xs text-gray-400">{formatTime(latestComment.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Comments Detail - DM Style Chat */}
        <div className="flex-1 flex flex-col">
          {selectedPost ? (
            <>
              {/* Post Header */}
              <div className="bg-white border-b border-gray-200 p-4">
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

              {/* Comments Chat Area - DM Style */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 chat-container">
                {getPostComments(selectedPost.postId).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No comments on this post yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getPostComments(selectedPost.postId).map((comment) => (
                      <CommentBubble key={comment.id} comment={comment} />
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Input - DM Style */}
              {replyingTo && (
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        Replying to <span className="font-medium">{replyingTo.username || `User ${replyingTo.userId.slice(-4)}`}</span>
                      </p>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg border-l-2 border-blue-500">
                      <p className="text-sm text-gray-800">{replyingTo.text}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleReply()
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Post</h3>
                <p className="text-gray-500">Choose a post from the left to view and manage comments</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
