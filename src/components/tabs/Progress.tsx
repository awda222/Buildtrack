import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project } from '../../types';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Progress({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, 'projects', projectId), (snapshot) => {
      setProject({ 
        id: snapshot.id, 
        ...snapshot.data(),
        _isSyncing: snapshot.metadata.hasPendingWrites
      } as Project);
    });
  }, [projectId]);

  if (!project) return null;

  const phases = [
    { name: 'Excavation', weight: 10 },
    { name: 'Foundation (PCC)', weight: 15 },
    { name: 'Footing & Columns', weight: 20 },
    { name: 'Plinth Beam', weight: 15 },
    { name: 'Brickwork (Ground)', weight: 20 },
    { name: 'Roof Slab', weight: 20 },
  ];

  const currentPhaseIndex = phases.findIndex(p => p.name === project.phase);

  const updatePhase = async (phase: string, completion: number) => {
    await updateDoc(doc(db, 'projects', projectId), { phase, completion });
  };

  const chartData = phases.map((p, i) => ({
    name: p.name,
    completion: i < currentPhaseIndex ? 100 : i === currentPhaseIndex ? project.completion : 0
  }));

  return (
    <div className="space-y-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress List */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight text-green-900">Phase Tracking</h3>
          <div className="space-y-4">
            {phases.map((phase, index) => {
              const isPast = index < currentPhaseIndex;
              const isCurrent = index === currentPhaseIndex;
              const isFuture = index > currentPhaseIndex;

              return (
                <motion.div 
                  key={phase.name}
                  onClick={() => updatePhase(phase.name, isPast ? 100 : index === 0 ? 0 : 0)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                    isCurrent ? "bg-white border-orange-500 shadow-lg ring-4 ring-orange-500/5 scale-[1.02]" : 
                    isPast ? "bg-green-50 border-green-100 opacity-60 hover:opacity-100" : "bg-white border-stone-100 opacity-40 grayscale hover:grayscale-0"
                  )}
                >
                  <motion.div 
                    initial={false}
                    animate={{ scale: isCurrent ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1, repeat: isCurrent ? Infinity : 0, repeatDelay: 2 }}
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      isPast ? "bg-green-800 text-white" : isCurrent ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-400"
                    )}
                  >
                    {isPast ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-sm font-black">{index + 1}</span>}
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className="font-black text-xs uppercase tracking-tight text-green-900">{phase.name}</h4>
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 space-y-2 relative"
                      >
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-orange-600">
                           <span>Current Progress</span>
                           <motion.span
                             key={project.completion}
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                           >{project.completion}%</motion.span>
                        </div>
                        <input 
                          type="range"
                          className="w-full h-1.5 bg-orange-100 rounded-full appearance-none cursor-pointer accent-orange-600 outline-none transition-all hover:h-2"
                          value={project.completion}
                          onChange={(e) => updatePhase(phase.name, parseInt(e.target.value))}
                        />
                      </motion.div>
                    )}
                  </div>
                  
                  {isCurrent && <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-2 w-2 rounded-full bg-orange-600" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight text-green-900">Timeline Analysis</h3>
          <div className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm">
            <div className="aspect-[4/3] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#1C1917' }} 
                    axisLine={false} 
                    tickLine={false}
                    interval={0}
                    height={60}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip 
                    cursor={{ fill: '#F5F5F4' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === currentPhaseIndex ? '#ea580c' : index < currentPhaseIndex ? '#2D4033' : '#E7E5E4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 p-5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Estimated Handover</p>
                <p className="text-lg font-black text-green-900">Oct 2026</p>
              </div>
              <Trophy className="h-8 w-8 text-green-900 opacity-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
