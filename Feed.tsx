
import React, { useState } from 'react';
import { FeedPost, UserProfile, MediaItem } from './types';

interface FeedProps {
  posts: FeedPost[];
  user: UserProfile | null;
  onNavigateToLogin: () => void;
  onPostsUpdate: (newPosts: FeedPost[]) => void;
  onSavePost?: (post: FeedPost) => void;
}

const MASTER_ADMIN_EMAIL = 'lapibfesgo@gmail.com';

const Feed: React.FC<FeedProps> = ({ posts, user, onNavigateToLogin, onPostsUpdate, onSavePost }) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);

  const isAdmin = user?.email.toLowerCase() === MASTER_ADMIN_EMAIL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10) as File[];
    if (files.length === 0) return;
    setSelectedFiles(files);
    const newPreviews = files.map(file => ({ url: URL.createObjectURL(file), type: file.type.startsWith('video') ? 'video' : 'image' }));
    setPreviews(newPreviews as any);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !newCaption.trim() || !isAdmin) return;

    setIsPublishing(true);
    try {
      const mediaPromises = selectedFiles.map(async (file) => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const data = await fileToBase64(file);
        return { url: data, type } as MediaItem;
      });

      const mediaItems = await Promise.all(mediaPromises);

      const newPost: FeedPost = {
        id: Date.now().toString(),
        media: mediaItems,
        caption: newCaption.trim(),
        author: user?.fullName || 'LAPIB Master',
        authorId: user?.id || 'master',
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
      };

      if(onSavePost) onSavePost(newPost);
      setNewCaption('');
      setSelectedFiles([]);
      setPreviews([]);
      setShowPostModal(false);
    } catch (err) {
      alert("Erro ao processar mídias.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in relative">
      <div className="max-w-xl mx-auto space-y-12">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={user}
            isAdmin={isAdmin}
            onLike={() => {}}
            onDelete={() => {}}
            onComment={(text) => {}} 
          />
        ))}
      </div>

      {isAdmin && (
        <button 
          onClick={() => setShowPostModal(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#055c47] text-white rounded-full shadow-2xl hover:scale-110 transition-all z-40 flex items-center justify-center border-4 border-white/50"
        >
          <i className="fa-solid fa-camera-retro text-2xl"></i>
        </button>
      )}

      {showPostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black uppercase tracking-tight text-[#055c47]">Nova Publicação Científica</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-red-500 transition"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handlePublish} className="p-8 space-y-6">
              <label className="flex items-center justify-center w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#055c47] transition-all">
                 <div className="text-center">
                    <i className="fa-solid fa-images text-2xl text-slate-300 mb-2 block"></i>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedFiles.length > 0 ? `${selectedFiles.length} arquivos` : 'Selecionar Mídias'}</span>
                 </div>
                 <input type="file" multiple accept="image/*,video/mp4" className="hidden" onChange={handleFileChange} />
              </label>
              <textarea 
                required
                placeholder="Relatório ou legenda da atividade..."
                className="w-full bg-slate-50 border rounded-xl p-4 text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-[#055c47]/20"
                value={newCaption}
                onChange={e => setNewCaption(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isPublishing || selectedFiles.length === 0}
                className="w-full bg-[#055c47] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 uppercase text-xs tracking-widest"
              >
                {isPublishing ? <i className="fa-solid fa-dna animate-spin"></i> : 'Efetivar Publicação'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<{ post: FeedPost; currentUser: UserProfile | null; onLike: () => void; onDelete: () => void; onComment: (text: string) => void; isAdmin: boolean }> = ({ post, currentUser, onLike, onDelete, onComment, isAdmin }) => {
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl text-left">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#055c47] flex items-center justify-center text-white border-2 border-white shadow-md">
           <i className="fa-solid fa-vials text-xs"></i>
        </div>
        <div>
          <h4 className="font-black text-xs text-slate-800 uppercase">{post.author}</h4>
          <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest block">{new Date(post.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="aspect-square bg-slate-50">
        {post.media[0].type === 'image' ? <img src={post.media[0].url} className="w-full h-full object-cover" /> : <video src={post.media[0].url} className="w-full h-full object-cover" controls />}
      </div>
      <div className="p-8 space-y-4">
        <div className="flex items-center gap-4">
          <button className={`text-2xl ${isLiked ? 'text-red-500' : 'text-slate-200'}`}><i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i></button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.likes.length} Reações</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">{post.caption}</p>
      </div>
    </div>
  );
};

export default Feed;
