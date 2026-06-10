import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoContext } from '../../context/VideoContext';
import { Sparkles, CloudUpload, ChevronDown, Info, FileVideo, X, Image as ImageIcon, FileCheck, FileText } from 'lucide-react';

const UploadVideo = () => {
  const navigate = useNavigate();
  const { addVideo, videos } = useContext(VideoContext);

  const [formData, setFormData] = useState({
    name: '',
    cues: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumb, setSelectedThumb] = useState(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const nextId = `EX-26${(videos.length + 1).toString().padStart(4, '0')}`;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePublish = () => {
    if (!selectedFile) return;
    addVideo({ 
      name: formData.name || 'Untitled Dynamic Asset',
      fileSize: formatFileSize(selectedFile.size)
    });
    navigate('/video-manager');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen p-8 bg-[#0A0D14] text-white">
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2 flex items-center gap-2">
            <span 
              className="cursor-pointer hover:text-white transition-colors flex items-center gap-1"
              onClick={() => navigate('/video-manager')}
            >
              &larr; VIDEO MANAGER
            </span> 
            <span className="text-[#1E293B]">&gt;</span> 
            <span className="text-white">UPLOAD NEW VIDEO</span>
          </p>
          <h1 className="text-[28px] font-bold tracking-tight flex items-center gap-2 mb-2">
            Upload Video Asset <Sparkles className="text-[#38BDF8]" size={24} />
          </h1>
          <p className="text-[#94A3B8] text-[13px] font-medium">Configure and index biomechanical video assets for performance protocols.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Top Row: Video & Thumbnail Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Drag & Drop Video */}
              <div className="bg-[#131B2F] border border-[#1E293B] rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <CloudUpload className="text-[#38BDF8]" size={18} />
                  <h2 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">DRAG & DROP VIDEO</h2>
                </div>
                
                <div 
                  className={`border border-dashed rounded-2xl flex-1 min-h-[220px] flex flex-col items-center justify-center transition-all group ${
                    isDraggingVideo ? 'border-[#38BDF8] bg-[#38BDF8]/10' : 'border-[#1E293B] bg-[#0A0D14]/50 hover:border-[#38BDF8]/50 hover:bg-[#0A0D14]'
                  } ${selectedFile ? 'cursor-default' : 'cursor-pointer'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingVideo(false); }}
                  onDrop={(e) => {
                    e.preventDefault(); setIsDraggingVideo(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => !selectedFile && videoInputRef.current.click()}
                >
                  <input 
                    type="file" className="hidden" ref={videoInputRef} accept="video/*"
                    onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }}
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                      <div className="w-12 h-12 rounded-full bg-[#34D399]/20 flex items-center justify-center mb-3">
                        <FileVideo className="text-[#34D399]" size={24} />
                      </div>
                      <h3 className="text-white font-bold text-[13px] mb-1">{selectedFile.name}</h3>
                      <p className="text-[#34D399] text-[11px] font-bold mb-4">{formatFileSize(selectedFile.size)}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-[10px] font-bold text-[#EF4444] hover:bg-[#EF4444]/10 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CloudUpload className="text-[#94A3B8]" size={20} />
                      </div>
                      <h3 className="text-white font-bold text-[13px] mb-1">Drag & drop video file</h3>
                      <p className="text-[#64748B] text-[11px] font-medium mb-4">Or click to browse</p>
                      
                      <div className="flex items-center gap-2 text-[9px] font-bold text-[#475569] uppercase tracking-widest">
                        <span>MP4, MOV, WEBM • MAX 500MB</span>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-center text-[#475569] text-[9px] font-bold uppercase tracking-[0.1em] mt-6">
                  MOVEMENT SCANNING IS AUTOMATED
                </p>
              </div>

              {/* Drag & Drop Thumbnail */}
              <div className="bg-[#131B2F] border border-[#1E293B] rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="text-[#38BDF8]" size={18} />
                  <h2 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">DRAG & DROP THUMBNAIL</h2>
                </div>
                
                <div 
                  className={`border border-dashed rounded-2xl flex-1 min-h-[220px] flex flex-col items-center justify-center transition-all group ${
                    isDraggingThumb ? 'border-[#38BDF8] bg-[#38BDF8]/10' : 'border-[#1E293B] bg-[#0A0D14]/50 hover:border-[#38BDF8]/50 hover:bg-[#0A0D14]'
                  } ${selectedThumb ? 'cursor-default' : 'cursor-pointer'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingThumb(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingThumb(false); }}
                  onDrop={(e) => {
                    e.preventDefault(); setIsDraggingThumb(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedThumb(e.dataTransfer.files[0]);
                  }}
                  onClick={() => !selectedThumb && thumbInputRef.current.click()}
                >
                  <input 
                    type="file" className="hidden" ref={thumbInputRef} accept="image/*"
                    onChange={(e) => { if (e.target.files[0]) setSelectedThumb(e.target.files[0]); }}
                  />
                  
                  {selectedThumb ? (
                    <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                      <div className="w-12 h-12 rounded-full bg-[#34D399]/20 flex items-center justify-center mb-3">
                        <ImageIcon className="text-[#34D399]" size={24} />
                      </div>
                      <h3 className="text-white font-bold text-[13px] mb-1">{selectedThumb.name}</h3>
                      <p className="text-[#34D399] text-[11px] font-bold mb-4">{formatFileSize(selectedThumb.size)}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedThumb(null); }}
                        className="text-[10px] font-bold text-[#EF4444] hover:bg-[#EF4444]/10 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="text-[#94A3B8]" size={20} />
                      </div>
                      <h3 className="text-white font-bold text-[13px] mb-1">Drag & drop thumbnail image</h3>
                      <p className="text-[#64748B] text-[11px] font-medium mb-4">Or click to browse</p>
                      
                      <div className="flex items-center gap-2 text-[9px] font-bold text-[#475569] uppercase tracking-widest">
                        <span>PNG, JPG, WEBP • MAX 10MB</span>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-center text-[#475569] text-[9px] font-bold uppercase tracking-[0.1em] mt-6">
                  16:9 ASPECT RATIO RECOMMENDED
                </p>
              </div>

            </div>

            {/* Live Player Preview */}
            <div className="bg-[#131B2F] border border-[#1E293B] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-[#38BDF8]" size={18} />
                <h2 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">LIVE PLAYER PREVIEW</h2>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[500px] aspect-video bg-[#0A0D14] rounded-xl border border-[#1E293B] flex flex-col items-center justify-center mb-6">
                  <FileVideo size={32} className="text-[#1E293B] mb-4" />
                  <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest">AWAITING MEDIA UPLOAD...</p>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#1E3A8A] text-[#60A5FA] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    LOWER BACK
                  </div>
                  <div className="text-[#64748B] text-[11px] font-bold uppercase tracking-widest">
                    {nextId}
                  </div>
                </div>
                
                <h3 className="text-white text-xl font-bold mb-2">
                  {formData.name || 'Untitled Dynamic Asset'}
                </h3>
                <p className="text-[#64748B] text-[13px] text-center max-w-[400px]">
                  {formData.cues || 'No cues provided yet. Type cues below to see them here...'}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Asset Specifications (4 cols) */}
          <div className="xl:col-span-4 bg-[#131B2F] border border-[#1E293B] rounded-2xl p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-[#38BDF8]" size={18} />
              <h2 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">ASSET SPECIFICATIONS</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">EXERCISE ID</label>
                <input 
                  type="text" 
                  value={nextId}
                  readOnly
                  className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[13px] text-[#64748B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">EXERCISE NAME</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="e.g. Supine Pelvic Clocks"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-[#38BDF8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">TARGET AREA</label>
                <div className="relative">
                  <select className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[13px] text-white outline-none appearance-none cursor-pointer focus:border-[#38BDF8] transition-colors">
                    <option>Lower Back</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">COACHING CUES / DESCRIPTION</label>
                <textarea 
                  name="cues"
                  placeholder="Provide biomechanical cues for patients executing this movement. These cues will display inside the patient tracker app..."
                  value={formData.cues}
                  onChange={handleChange}
                  className="w-full h-[120px] bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[13px] text-[#475569] outline-none focus:border-[#38BDF8] transition-colors resize-none leading-relaxed placeholder-[#475569]/70"
                ></textarea>
              </div>

              <div className="flex items-start gap-3 bg-[#0A0D14] border border-[#1E3A8A]/30 rounded-xl p-4 mt-2">
                <Info size={16} className="text-[#3B82F6] shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-[#64748B] leading-relaxed">
                  <span className="text-[#3B82F6]">You must select or drop a valid video asset and wait for processing to finish before publishing is unlocked.</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={handlePublish}
                  className={`w-full py-3.5 transition-colors rounded-xl text-[12px] font-bold uppercase tracking-widest ${
                    selectedFile 
                      ? 'bg-[#3B82F6] hover:bg-blue-600 text-white cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-[#1E3A8A] text-[#94A3B8] cursor-pointer'
                  }`}
                >
                  PUBLISH ASSET CATALOG
                </button>
                <button 
                  onClick={() => navigate('/video-manager')}
                  className="w-full py-3.5 bg-transparent border border-[#1E293B] hover:bg-[#1E293B] transition-colors text-white rounded-xl text-[12px] font-bold uppercase tracking-widest"
                >
                  CANCEL
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UploadVideo;
