import React, { useState } from 'react';
import { CommunityPost } from '../../types';
import {
  Heart,
  MessageCircle,
  Plus,
  Shield,
  Search,
  Filter,
  AlertTriangle,
  UserCheck,
  Send,
  Sparkles,
} from 'lucide-react';

interface CommunityScreenProps {
  posts: CommunityPost[];
  currentUserName: string;
  onAddPost: (post: CommunityPost) => void;
  onReact: (postId: string, reaction: 'hug' | 'spoon' | 'strength' | 'heart') => void;
  onAddComment: (postId: string, comment: string) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  posts,
  currentUserName,
  onAddPost,
  onReact,
  onAddComment,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // New post form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState<'pacing' | 'fatigue' | 'coping' | 'nutrition' | 'work_school' | 'appointments'>('pacing');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const topics = [
    { id: 'all', label: 'All Topics' },
    { id: 'pacing', label: 'Pacing & Spoons' },
    { id: 'fatigue', label: 'Fatigue Science' },
    { id: 'coping', label: 'Everyday Coping' },
    { id: 'nutrition', label: 'Gentle Nutrition' },
    { id: 'work_school', label: 'Work & Accommodations' },
    { id: 'appointments', label: 'Doctor Prep & Visits' },
  ];

  const filteredPosts = posts.filter((p) => {
    const matchesTopic = selectedTopic === 'all' || p.topic === selectedTopic;
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorName: isAnonymous ? 'Anonymous Friend' : currentUserName,
      isAnonymous,
      timeAgo: 'Just now',
      topic: postTopic,
      title: postTitle.trim(),
      content: postContent.trim(),
      tags: [postTopic, 'Shared Experience'],
      reactions: { hug: 1, spoon: 1, strength: 1, heart: 1 },
      commentsCount: 0,
      comments: [],
    };

    onAddPost(newPost);
    setShowNewPostModal(false);
    setPostTitle('');
    setPostContent('');
  };

  const handlePostComment = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Healno Community Circle</h2>
          <p className="text-xs text-[#132A1F]/60">Peer kindness, spoon sharing, and shared wisdom</p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Safety and Guidelines Banner */}
      <div className="bg-[#E8EFE9] rounded-2xl p-3 text-[11px] text-[#132A1F]/80 flex items-start gap-2 border border-[#132A1F]/5">
        <Shield className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
        <span>
          A gentle, supportive peer circle. Discussions reflect personal journeys, not verified clinical medical advice. Never share sensitive private identifiers.
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search coping tips, pacing discussions, meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#132A1F]/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#132A1F]/20"
        />
      </div>

      {/* Topic Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedTopic === t.id
                ? 'bg-[#132A1F] text-white shadow-xs'
                : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isCommentsOpen = activeCommentPostId === post.id;
          return (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-4.5 border border-[#132A1F]/10 shadow-xs space-y-3"
            >
              {/* Author info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E8EFE9] text-[#132A1F] flex items-center justify-center font-bold text-xs">
                    {post.isAnonymous ? '🌿' : post.authorName[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#132A1F] flex items-center gap-1.5">
                      <span>{post.authorName}</span>
                      {post.isAnonymous && (
                        <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded-md">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#132A1F]/50">
                      {post.timeAgo} · in {post.topic}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] bg-[#FFE5D9] text-[#6B4435] px-2 py-0.5 rounded-full font-semibold capitalize">
                  {post.topic.replace('_', ' & ')}
                </span>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-sm font-bold text-[#132A1F] font-display mb-1">
                  {post.title}
                </h3>
                <p className="text-xs text-[#132A1F]/80 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-[#132A1F]/60 bg-[#F8F6F0] px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Supportive Reactions Bar */}
              <div className="pt-3 border-t border-[#132A1F]/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {/* Hug 🫂 */}
                  <button
                    onClick={() => onReact(post.id, 'hug')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                      post.userReacted?.includes('hug')
                        ? 'bg-[#B7E4C7] text-[#132A1F] font-bold'
                        : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:bg-[#E8EFE9]'
                    }`}
                    title="Send a warm hug"
                  >
                    <span>🫂</span>
                    <span className="tabular-nums text-[11px]">{post.reactions.hug}</span>
                  </button>

                  {/* Spoon Sent 🥄 */}
                  <button
                    onClick={() => onReact(post.id, 'spoon')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                      post.userReacted?.includes('spoon')
                        ? 'bg-[#E89D35] text-white font-bold'
                        : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:bg-[#E8EFE9]'
                    }`}
                    title="Send a spoon of energy"
                  >
                    <span>🥄</span>
                    <span className="tabular-nums text-[11px]">{post.reactions.spoon}</span>
                  </button>

                  {/* You Got This 🌿 */}
                  <button
                    onClick={() => onReact(post.id, 'strength')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                      post.userReacted?.includes('strength')
                        ? 'bg-[#74C69D] text-[#132A1F] font-bold'
                        : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:bg-[#E8EFE9]'
                    }`}
                    title="You got this"
                  >
                    <span>🌿</span>
                    <span className="tabular-nums text-[11px]">{post.reactions.strength}</span>
                  </button>

                  {/* Heart 💛 */}
                  <button
                    onClick={() => onReact(post.id, 'heart')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                      post.userReacted?.includes('heart')
                        ? 'bg-[#FFE5D9] text-[#E76F51] font-bold'
                        : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:bg-[#E8EFE9]'
                    }`}
                    title="Care & Love"
                  >
                    <span>💛</span>
                    <span className="tabular-nums text-[11px]">{post.reactions.heart}</span>
                  </button>
                </div>

                {/* Comment count */}
                <button
                  onClick={() =>
                    setActiveCommentPostId(isCommentsOpen ? null : post.id)
                  }
                  className="flex items-center gap-1 text-xs text-[#132A1F]/60 hover:text-[#132A1F] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{post.commentsCount || 0}</span>
                </button>
              </div>

              {/* Comment Thread Drawer */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-[#132A1F]/10 space-y-3">
                  {post.comments && post.comments.length > 0 ? (
                    <div className="space-y-2">
                      {post.comments.map((c) => (
                        <div key={c.id} className="bg-[#F8F6F0] p-2.5 rounded-xl text-xs">
                          <div className="flex justify-between font-semibold text-[#132A1F] mb-0.5">
                            <span>{c.author}</span>
                            <span className="text-[10px] text-[#132A1F]/40 font-normal">{c.timeAgo}</span>
                          </div>
                          <p className="text-[#132A1F]/80">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#132A1F]/50 italic">
                      Be the first to share an encouraging word.
                    </p>
                  )}

                  {/* Add comment input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a supportive reply..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePostComment(post.id);
                      }}
                      className="flex-1 bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => handlePostComment(post.id)}
                      className="w-8 h-8 rounded-xl bg-[#132A1F] text-white flex items-center justify-center hover:bg-[#2D6A4F] transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <h3 className="text-base font-bold text-[#132A1F] font-display">
                Share With the Healno Circle
              </h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-xs bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-semibold"
              >
                Cancel
              </button>
            </div>

            {/* Privacy Warning */}
            <div className="mt-3 bg-[#FFE5D9] text-[#6B4435] text-xs p-3 rounded-2xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
              <span>
                <strong>Privacy check:</strong> Never share sensitive clinical numbers, full names of clinic staff, or private contact details.
              </span>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Topic</label>
                <select
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value as any)}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="pacing">Pacing & Spoons</option>
                  <option value="fatigue">Fatigue Science</option>
                  <option value="coping">Everyday Coping Strategies</option>
                  <option value="nutrition">Gentle Nutrition</option>
                  <option value="work_school">Work & Accommodations</option>
                  <option value="appointments">Doctor Prep & Visits</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Post Title</label>
                <input
                  type="text"
                  placeholder="e.g. A small victory on pacing my mornings..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Your Story or Reflection</label>
                <textarea
                  placeholder="Share what worked for you or what support you are hoping for today..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#F8F6F0] rounded-xl">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#132A1F] rounded"
                />
                <label htmlFor="anonCheck" className="text-xs text-[#132A1F] font-medium cursor-pointer">
                  Post anonymously (hides your name & avatar)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-colors font-display"
              >
                Publish to Community
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
