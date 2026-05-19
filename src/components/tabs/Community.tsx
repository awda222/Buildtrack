import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../App';
import { Announcement, Reply } from '../../types';
import { Send, User, MessageCircle, Share2, RefreshCw, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

function PostItem({ post, projectId }: { post: Announcement; projectId: string }) {
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
      collection(db, `projects/${projectId}/announcements/${post.id}/replies`),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setReplies(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        _isSyncing: doc.metadata.hasPendingWrites
      } as any)));
    });
  }, [projectId, post.id, showReplies]);

  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, `projects/${projectId}/announcements`, post.id);
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
    const postRef = doc(db, `projects/${projectId}/announcements`, post.id);
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
      await addDoc(collection(db, `projects/${projectId}/announcements/${post.id}/replies`), {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm site-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center">
            <User className="h-4 w-4 text-stone-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black uppercase tracking-tight text-green-900">{post.authorName}</p>
              {post._isSyncing && (
                <RefreshCw className="h-2 w-2 text-orange-400 animate-spin" />
              )}
            </div>
            <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-green-900 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="mt-6 flex items-center gap-6 pt-4 border-t border-stone-50">
        <button 
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 transition-colors group",
            isLiked ? "text-green-700" : "text-stone-300 hover:text-green-900"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{likes.length || 0}</span>
        </button>

        <button 
          onClick={handleDislike}
          className={cn(
            "flex items-center gap-2 transition-colors group",
            isDisliked ? "text-red-700" : "text-stone-300 hover:text-red-600"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{dislikes.length || 0}</span>
        </button>

        <button 
          onClick={() => setShowReplies(!showReplies)}
          className={cn(
            "flex items-center gap-2 transition-colors group",
            showReplies ? "text-green-900" : "text-stone-300 hover:text-green-900"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {showReplies ? 'Hide' : 'Replies'}
          </span>
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

export default function Community({ projectId }: { projectId: string }) {
  const { profile, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [input, setInput] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, `projects/${projectId}/announcements`), orderBy('createdAt', 'desc'));
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
      await addDoc(collection(db, `projects/${projectId}/announcements`), {
        projectId,
        authorId: user.uid,
        authorName: profile.displayName || 'Anonymous',
        content: input,
        createdAt: new Date().toISOString(),
        likes: [],
        dislikes: []
      });
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-sans">
      {/* New Post Box */}
      <div className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm">
        <form onSubmit={handlePost} className="space-y-4">
          <div className="flex items-start gap-4">
             <div className="h-10 w-10 rounded-xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                <User className="h-6 w-6 text-stone-400" />
             </div>
             <textarea 
               placeholder="Announce something to the site team..."
               className="flex-1 border-none focus:ring-0 text-xl py-2 min-h-[100px] bg-transparent resize-none font-black uppercase tracking-tight text-green-900 placeholder:text-stone-300"
               value={input}
               onChange={e => setInput(e.target.value)}
             />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-stone-50">
             <div className="flex items-center gap-2 text-stone-400">
                <Share2 className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Internal Sync Only</span>
             </div>
             <button
               type="submit"
               disabled={!input.trim() || isPosting}
               className="bg-green-900 text-white rounded-lg px-6 py-2.5 font-black uppercase tracking-widest text-[10px] shadow-md shadow-green-100 disabled:opacity-50 hover:bg-green-800 transition-all flex items-center gap-2"
             >
                {isPosting ? 'Broadcasting...' : 'Broadcast'}
                <Send className="h-3 w-3" />
             </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {announcements.map((post) => (
            <PostItem key={post.id} post={post} projectId={projectId} />
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
