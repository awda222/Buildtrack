import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Announcement, Reply } from '../types';
import { Send, User, MessageCircle, Share2, RefreshCw, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

function PostItem({ post, replyPath, postPath }: { post: Announcement; replyPath: string; postPath: string }) {
  const { user, profile } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const likes = post.likes || [];
  const dislikes = post.dislikes || [];
  const isLiked = user ? likes.includes(user.uid) : false;
  const isDisliked = user ? dislikes.includes(user.uid) : false;

  useEffect(() => {
    if (!showReplies) return;
    const q = query(
      collection(db, replyPath),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setReplies(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        _isSyncing: doc.metadata.hasPendingWrites
      } as any)));
    });
  }, [replyPath, showReplies]);

  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, postPath, post.id);
    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(postRef, { 
        likes: arrayUnion(user.uid),
        dislikes: arrayRemove(user.uid)
      });
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    const postRef = doc(db, postPath, post.id);
    if (isDisliked) {
      await updateDoc(postRef, { dislikes: arrayRemove(user.uid) });
    } else {
      await updateDoc(postRef, { 
        dislikes: arrayUnion(user.uid),
        likes: arrayRemove(user.uid)
      });
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !user || !profile) return;
    setIsReplying(true);
    try {
      await addDoc(collection(db, replyPath), {
        announcementId: post.id,
        authorId: user.uid,
        authorName: profile.displayName || 'Anonymous',
        content: replyInput,
        createdAt: new Date().toISOString()
      });
      setReplyInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-stone-200 rounded-[2.5rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center shadow-inner">
            <User className="h-6 w-6 text-stone-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black uppercase tracking-tight text-green-900 font-display">{post.authorName}</p>
              {post._isSyncing && (
                <RefreshCw className="h-3 w-3 text-orange-400 animate-spin" />
              )}
            </div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-green-900 leading-[1.6] font-medium whitespace-pre-wrap text-lg font-sans">{post.content}</p>
      </div>

      <div className="mt-8 flex items-center gap-4 pt-6 border-t border-stone-100/60">
        <button 
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2 rounded-full transition-all group font-black uppercase text-[10px] tracking-widest",
            isLiked ? "bg-green-50 text-green-700" : "bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{likes.length || 0} Applaud</span>
        </button>

        <button 
          onClick={() => setShowReplies(!showReplies)}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2 rounded-full transition-all group font-black uppercase text-[10px] tracking-widest ml-auto",
            showReplies ? "bg-orange-50 text-orange-600" : "bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{replies.length > 0 ? `${replies.length} Replies` : 'Reply'}</span>
        </button>
      </div>

      {showReplies && (
        <div className="mt-6 pt-6 border-t border-stone-50 space-y-4">
          <div className="space-y-4">
            {replies.map(reply => (
              <div key={reply.id} className="flex gap-3">
                <div className="h-6 w-6 rounded-md bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                  <User className="h-3 w-3 text-stone-400" />
                </div>
                <div className="flex-1 bg-stone-50 rounded-lg px-3 py-2 border border-stone-100">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-tight text-green-900">{reply.authorName}</span>
                    <div className="flex items-center gap-1">
                      {reply._isSyncing && <RefreshCw className="h-1.5 w-1.5 text-orange-400 animate-spin" />}
                      <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">{formatDate(reply.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-800 font-medium">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} className="flex gap-2 bg-stone-50 p-1 rounded-lg border border-stone-100">
            <input 
              type="text" 
              placeholder="Write a reply..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-2 px-2 font-medium text-green-900"
              value={replyInput}
              onChange={e => setReplyInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!replyInput.trim() || isReplying}
              className="p-2 text-green-900 hover:bg-white rounded-md transition-all disabled:opacity-30"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}

export default function CommunityView({ projectId }: { projectId?: string }) {
  const { profile, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [input, setInput] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const path = projectId ? `projects/${projectId}/announcements` : 'announcements';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        _isSyncing: doc.metadata.hasPendingWrites
      } as any)));
    });
  }, [projectId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !profile) return;
    setIsPosting(true);
    try {
      const path = projectId ? `projects/${projectId}/announcements` : 'announcements';
      const data: any = {
        authorId: user.uid,
        authorName: profile.displayName || 'Anonymous',
        content: input,
        createdAt: new Date().toISOString(),
        likes: [],
        dislikes: []
      };
      if (projectId) data.projectId = projectId;
      
      await addDoc(collection(db, path), data);
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const getReplyPath = (postId: string) => {
    return projectId 
      ? `projects/${projectId}/announcements/${postId}/replies` 
      : `announcements/${postId}/replies`;
  };

  const getPostPath = (postId: string) => {
    return projectId 
      ? `projects/${projectId}/announcements` 
      : 'announcements';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20 md:pb-0">
      {!projectId && (
        <div className="flex flex-col gap-2 mb-10 text-center md:text-left">
          <h2 className="text-5xl font-black uppercase tracking-tight text-green-900 font-display leading-[0.85]">Community <br /> <span className="text-orange-600">Hub</span></h2>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-400 mt-2">Real-time collaboration across all sites</p>
        </div>
      )}
      {/* New Post Box */}
      <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] ring-1 ring-stone-100">
        <form onSubmit={handlePost} className="space-y-6">
          <div className="flex items-start gap-6">
             <div className="h-14 w-14 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-200 shadow-inner">
                <User className="h-8 w-8 text-stone-300" />
             </div>
             <textarea 
               placeholder={projectId ? "What's the status on field?" : "Share a site insight..."}
               className="flex-1 border-none focus:ring-0 text-2xl py-2 min-h-[120px] bg-transparent resize-none font-black uppercase tracking-tight text-green-900 placeholder:text-stone-200 font-display"
               value={input}
               onChange={e => setInput(e.target.value)}
             />
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-stone-100">
             <div className="flex items-center gap-2.5 text-stone-400">
                <Share2 className="h-4 w-4 text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  {projectId ? 'Site Network' : 'Global Feed'}
                </span>
             </div>
             <button
               type="submit"
               disabled={!input.trim() || isPosting}
               className="bg-green-900 text-white rounded-2xl px-10 py-4 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-green-900/20 disabled:opacity-30 hover:bg-black transition-all flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
             >
                {isPosting ? 'Publishing...' : 'Publish Intelligence'}
                <Send className="h-4 w-4 stroke-[3px]" />
             </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {announcements.map((post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              replyPath={getReplyPath(post.id)}
              postPath={getPostPath(post.id)}
            />
          ))}
        </AnimatePresence>

        {announcements.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-stone-400" />
            <p className="uppercase tracking-widest text-xs font-black">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
