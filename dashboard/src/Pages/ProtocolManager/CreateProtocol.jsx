import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtocolContext } from '../../context/ProtocolContext';
import { Trash2, PlusCircle, X, ChevronDown, Layers } from 'lucide-react';

const CreateProtocol = () => {
  const navigate = useNavigate();
  const { addProtocol } = useContext(ProtocolContext);

  const [metadata, setMetadata] = useState({
    id: 'LB-001',
    name: 'The Lumbar Full Hour Reset',
    targetArea: 'Lower Back',
    userCase: 'Stiff or Tight',
    duration: '~60 Minutes'
  });

  const [phases, setPhases] = useState([
    {
      id: 1,
      title: 'RESET PHASE',
      color: 'text-[#06B6D4]',
      bgNumber: 'bg-[#06B6D4]/10',
      exercises: [
        { id: 1, name: 'Pelvic Reset', sets: '1', reps: '4-6 breaths' }
      ]
    },
    {
      id: 2,
      title: 'CONTROL PHASE',
      color: 'text-[#10B981]',
      bgNumber: 'bg-[#10B981]/10',
      exercises: [
        { id: 1, name: 'Dead Bug', sets: '3', reps: '10' },
        { id: 2, name: 'McGill Curl-Up', sets: '3', reps: '10' },
        { id: 3, name: 'Bird Dog', sets: '3', reps: '10' }
      ]
    },
    {
      id: 3,
      title: 'INTEGRATE PHASE',
      color: 'text-[#8B5CF6]',
      bgNumber: 'bg-[#8B5CF6]/10',
      exercises: [
        { id: 1, name: 'B-Stance Glute Bridge with Band', sets: '3', reps: '10' },
        { id: 2, name: 'Staggered-Stance Romanian Deadlift', sets: '3', reps: '8' },
        { id: 3, name: 'Bulgarian Split Squat (Front Loaded)', sets: '3', reps: '6' },
        { id: 4, name: 'Offset Front Rack Carry', sets: '3', reps: '20' }
      ]
    }
  ]);

  const handlePublish = () => {
    addProtocol({
      name: metadata.name || 'New Custom Protocol',
      duration: metadata.duration || '30m'
    });
    navigate('/protocol-manager');
  };

  const updateExercise = (phaseId, exerciseId, field, value) => {
    setPhases(phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          exercises: p.exercises.map(e => e.id === exerciseId ? { ...e, [field]: value } : e)
        };
      }
      return p;
    }));
  };

  const addExercise = (phaseId) => {
    setPhases(phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          exercises: [...p.exercises, { id: Date.now(), name: '', sets: '', reps: '' }]
        };
      }
      return p;
    }));
  };

  const removeExercise = (phaseId, exerciseId) => {
    setPhases(phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          exercises: p.exercises.filter(e => e.id !== exerciseId)
        };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-[#0A0D14] text-white">
      <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">
              PROTOCOL MANAGER <span className="mx-2 text-[#1E293B]">&gt;</span> <span className="text-[#38BDF8]">CREATE NEW PROTOCOL</span>
            </p>
            <h1 className="text-[28px] font-bold tracking-tight">New Performance Protocol</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 rounded-xl border border-[#1E293B] text-white text-[13px] font-bold hover:bg-[#131B2F] transition-colors">
              Save Draft
            </button>
            <button 
              onClick={handlePublish}
              className="px-6 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 transition-colors text-white text-[13px] font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              Publish Protocol
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Metadata */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#131B2F] border border-[#1E293B] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-8">
                <Layers className="text-[#38BDF8]" size={20} />
                <h2 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Protocol Metadata</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Protocol ID</label>
                  <input 
                    type="text" 
                    value={metadata.id}
                    onChange={(e) => setMetadata({...metadata, id: e.target.value})}
                    className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#38BDF8] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Protocol Name</label>
                  <input 
                    type="text" 
                    value={metadata.name}
                    onChange={(e) => setMetadata({...metadata, name: e.target.value})}
                    className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#38BDF8] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Target Area</label>
                  <div className="relative">
                    <select 
                      value={metadata.targetArea}
                      onChange={(e) => setMetadata({...metadata, targetArea: e.target.value})}
                      className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#38BDF8] transition-colors appearance-none"
                    >
                      <option>Lower Back</option>
                      <option>Upper Back</option>
                      <option>Hips</option>
                      <option>Shoulders</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">User Case</label>
                  <div className="relative">
                    <select 
                      value={metadata.userCase}
                      onChange={(e) => setMetadata({...metadata, userCase: e.target.value})}
                      className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#38BDF8] transition-colors appearance-none"
                    >
                      <option>Stiff or Tight</option>
                      <option>Pain or Aching</option>
                      <option>Post-Workout Recovery</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Equipment Needed</label>
                  <div className="relative mb-3">
                    <select className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#3B82F6] transition-colors appearance-none">
                      <option>Select equipment...</option>
                    </select>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 flex items-center gap-1 text-[12px] font-bold transition-colors">
                      Add <PlusCircle size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 px-3 py-1.5 rounded-full text-[12px] font-bold">
                      Bench <X size={12} className="cursor-pointer hover:text-white" />
                    </span>
                    <span className="flex items-center gap-1 bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 px-3 py-1.5 rounded-full text-[12px] font-bold">
                      Mini Band <X size={12} className="cursor-pointer hover:text-white" />
                    </span>
                    <span className="flex items-center gap-1 bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 px-3 py-1.5 rounded-full text-[12px] font-bold">
                      Mat <X size={12} className="cursor-pointer hover:text-white" />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Duration</label>
                  <div className="relative">
                    <select 
                      value={metadata.duration}
                      onChange={(e) => setMetadata({...metadata, duration: e.target.value})}
                      className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#38BDF8] transition-colors appearance-none"
                    >
                      <option>~15 Minutes</option>
                      <option>~30 Minutes</option>
                      <option>~45 Minutes</option>
                      <option>~60 Minutes</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Session Builder */}
          <div className="lg:col-span-8">
            <div className="bg-[#131B2F] border border-[#1E293B] rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Layers className="text-[#38BDF8]" size={20} />
                <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Phase-Based Session Builder</h2>
              </div>
              
              <div className="h-[1px] w-full bg-[#1E293B] mb-8"></div>

              <div className="space-y-10">
                {phases.map((phase) => (
                  <div key={phase.id} className="relative">
                    {/* Phase Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${phase.bgNumber} ${phase.color}`}>
                        0{phase.id}
                      </div>
                      <h3 className={`text-[11px] font-bold uppercase tracking-widest ${phase.color}`}>
                        {phase.title}
                      </h3>
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-4">
                      {/* Headers */}
                      {phase.exercises.length > 0 && (
                        <div className="flex gap-4 px-2">
                          <div className="flex-1 text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Exercise Name</div>
                          <div className="w-20 text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">Sets</div>
                          <div className="w-24 text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">Reps</div>
                          <div className="w-8"></div>
                        </div>
                      )}

                      {/* Exercise Rows */}
                      {phase.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex gap-4 items-center">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={exercise.name}
                              onChange={(e) => updateExercise(phase.id, exercise.id, 'name', e.target.value)}
                              placeholder="Exercise name..."
                              className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-[#38BDF8] transition-colors"
                            />
                          </div>
                          <div className="w-20">
                            <input 
                              type="text" 
                              value={exercise.sets}
                              onChange={(e) => updateExercise(phase.id, exercise.id, 'sets', e.target.value)}
                              className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[13px] text-white text-center outline-none focus:border-[#38BDF8] transition-colors"
                            />
                          </div>
                          <div className="w-24">
                            <input 
                              type="text" 
                              value={exercise.reps}
                              onChange={(e) => updateExercise(phase.id, exercise.id, 'reps', e.target.value)}
                              className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-3 text-[13px] text-white text-center outline-none focus:border-[#38BDF8] transition-colors"
                            />
                          </div>
                          <button 
                            onClick={() => removeExercise(phase.id, exercise.id)}
                            className="w-8 h-8 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Exercise Button */}
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => addExercise(phase.id)}
                        className="flex items-center gap-2 px-5 py-2.5 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white rounded-xl text-[12px] font-bold transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      >
                        Add New Exercise <PlusCircle size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CreateProtocol;
