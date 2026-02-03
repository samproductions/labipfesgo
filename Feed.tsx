
import React, { useState } from 'react';
import { FeedPost, UserProfile, MediaItem } from './types';

interface FeedProps {
  posts: FeedPost[];
  user: UserProfile | null;
  onNavigateToLogin: () => void;
  onPostsUpdate: (newPosts: FeedPost[]) => void;
}

const MASTER_ADMIN_EMAIL = 'lapibfesgo@gmail.com';

const Feed: React.FC<FeedProps> = ({ posts, user, onNavigateToLogin, onPostsUpdate }) => {
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
    
    const newPreviews: { url: string; type: 'image' | 'video' }[] = [];
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      newPreviews.push({ url, type });
    });
    setPreviews(newPreviews);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1080;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
      reader.onerror = reject;
    });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !newCaption.trim() || !isAdmin) return;

    setIsPublishing(true);
    try {
      const mediaPromises = selectedFiles.map(async (file) => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        let data: string;
        if (type === 'image') {
          data = await compressImage(file);
        } else {
          data = await fileToBase64(file);
        }
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

      onPostsUpdate([newPost, ...posts]);
      setNewCaption('');
      setSelectedFiles([]);
      setPreviews([]);
      setShowPostModal(false);
      alert("Publicação efetivada no carrossel da LAPIB!");
    } catch (err) {
      console.error(err);
      alert("Erro ao processar mídias.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return onNavigateToLogin();
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const liked = p.likes.includes(user.id);
        return {
          ...p,
          likes: liked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id]
        };
      }
      return p;
    });
    onPostsUpdate(updatedPosts);
  };

  const handleDelete = (postId: string) => {
    if (confirm("Deletar permanentemente?")) {
      onPostsUpdate(posts.filter(p => p.id !== postId));
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
            onLike={() => handleLike(post.id)}
            onDelete={() => handleDelete(post.id)}
            onComment={(text) => {
              if (!user) return onNavigateToLogin();
              const updated = posts.map(p => {
                if (p.id === post.id) {
                  return {
                    ...p,
                    comments: [...p.comments, {
                      id: Math.random().toString(),
                      userId: user.id,
                      userName: user.fullName,
                      userPhoto: user.photoUrl,
                      text,
                      timestamp: new Date().toISOString()
                    }]
                  };
                }
                return p;
              });
              onPostsUpdate(updated);
            }} 
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <i className="fa-solid fa-rss text-6xl mb-4"></i>
            <p className="font-black uppercase tracking-widest text-xs">Nenhuma publicação científica ainda.</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <button 
          onClick={() => setShowPostModal(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#055c47] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 flex items-center justify-center border-4 border-white/50"
        >
          <i className="fa-solid fa-camera-retro text-2xl"></i>
        </button>
      )}

      {showPostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden border border-white/40">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black uppercase tracking-tight text-[#055c47]">Nova Mídia de Pesquisa</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-red-500 transition"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handlePublish} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arquivos (Máx 10)</label>
                <label className="flex items-center justify-center w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#055c47] transition-all group">
                   <div className="text-center">
                      <i className="fa-solid fa-images text-2xl text-slate-300 group-hover:text-[#055c47] mb-2 block"></i>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {selectedFiles.length > 0 ? `${selectedFiles.length} selecionados` : 'Clique para selecionar'}
                      </span>
                   </div>
                   <input type="file" multiple accept="image/*,video/mp4" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {previews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {previews.map((prev, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border shrink-0 bg-slate-100">
                      {prev.type === 'image' ? (
                        <img src={prev.url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center relative">
                           <video src={prev.url} className="w-full h-full object-cover" />
                           <i className="fa-solid fa-play absolute text-white text-xs"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relatório da Atividade</label>
                <textarea 
                  required
                  placeholder="Explique o procedimento científico realizado..."
                  className="w-full bg-slate-50 border rounded-xl p-4 text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-[#055c47]/20"
                  value={newCaption}
                  onChange={e => setNewCaption(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={isPublishing || selectedFiles.length === 0}
                className="w-full bg-[#055c47] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 uppercase text-xs tracking-widest"
              >
                {isPublishing ? <i className="fa-solid fa-dna animate-spin text-xl"></i> : 'Publicar no Feed'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<{ post: FeedPost; currentUser: UserProfile | null; onLike: () => void; onDelete: () => void; onComment: (text: string) => void; isAdmin: boolean }> = ({ post, currentUser, onLike, onDelete, onComment, isAdmin }) => {
  const [commentText, setCommentText] = useState('');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#055c47] flex items-center justify-center text-white border-2 border-white shadow-md">
             <i className="fa-solid fa-vials text-xs"></i>
          </div>
          <div className="text-left">
            <h4 className="font-black text-xs text-slate-800 leading-none uppercase">{post.author}</h4>
            <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-1 block">{new Date(post.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
        {isAdmin && (
          <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500 transition">
            <i className="fa-solid fa-trash-can text-xs"></i>
          </button>
        )}
      </div>
      
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
        {post.media.length > 0 && (
          <div className="w-full h-full">
            {post.media[activeMediaIndex].type === 'image' ? (
              <img src={post.media[activeMediaIndex].url} className="w-full h-full object-cover" alt="Post" />
            ) : (
              <video src={post.media[activeMediaIndex].url} className="w-full h-full object-cover" controls muted />
            )}
          </div>
        )}
        {post.media.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button 
              onClick={() => setActiveMediaIndex(prev => Math.max(0, prev - 1))}
              className="w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-black/40 transition"
              disabled={activeMediaIndex === 0}
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
            </button>
            <button 
              onClick={() => setActiveMediaIndex(prev => Math.min(post.media.length - 1, prev + 1))}
              className="w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-black/40 transition"
              disabled={activeMediaIndex === post.media.length - 1}
            >
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        )}
      </div>
      
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-6">
          <button onClick={onLike} className={`text-2xl transition-all active:scale-150 ${isLiked ? 'text-red-500' : 'text-slate-200'}`}>
            <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
          </button>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {post.likes.length} Reações Científicas
          </div>
        </div>
        
        <div className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left">
          <span className="font-black text-[#055c47] mr-2 uppercase text-[9px] tracking-widest block mb-1">Nota da Pesquisa:</span>
          {post.caption}
        </div>
        
        {post.comments.length > 0 && (
          <div className="space-y-3 pt-2 text-left">
            {post.comments.slice(0, 3).map(c => (
              <div key={c.id} className="text-[10px] text-slate-500 flex gap-2">
                <span className="font-black text-slate-800 uppercase shrink-0">{c.userName}:</span>
                <span className="font-medium">{c.text}</span>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); if(commentText.trim()){ onComment(commentText); setCommentText(''); } }} className="pt-4">
          <input 
            type="text" 
            placeholder="Participar da discussão..."
            className="w-full text-xs outline-none bg-slate-50 rounded-full px-6 py-4 border border-slate-100 focus:border-emerald-500 transition-all font-medium"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};

export default Feed;
