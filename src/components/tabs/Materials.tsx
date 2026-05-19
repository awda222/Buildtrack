import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Material } from '../../types';
import { Plus, Minus, Trash2, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

export default function Materials({ projectId }: { projectId: string }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', currentStock: 0, unit: 'bags', threshold: 10 });

  useEffect(() => {
    const q = query(collection(db, `projects/${projectId}/materials`), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        _isSyncing: doc.metadata.hasPendingWrites
      } as Material)));
    });
  }, [projectId]);

  const calculateStatus = (current: number, threshold: number) => {
    if (current <= 0) return 'Out';
    if (current <= threshold) return 'Low';
    return 'OK';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, `projects/${projectId}/materials`), {
      ...newMaterial,
      projectId,
      status: calculateStatus(newMaterial.currentStock, newMaterial.threshold),
      updatedAt: new Date().toISOString()
    });
    setNewMaterial({ name: '', currentStock: 0, unit: 'bags', threshold: 10 });
    setIsAdding(false);
  };

  const updateStock = async (id: string, current: number, threshold: number, delta: number) => {
    const next = Math.max(0, current + delta);
    await updateDoc(doc(db, `projects/${projectId}/materials`, id), {
      currentStock: next,
      status: calculateStatus(next, threshold),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold uppercase tracking-tight">Material Inventory</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-100 uppercase tracking-widest text-[10px] font-black text-stone-400">
              <tr>
                <th className="px-6 py-4">Material Name</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {materials.map((item) => (
                <tr key={item.id} className="group hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-green-900 uppercase tracking-tight text-sm">{item.name}</span>
                       {item._isSyncing && (
                         <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" title="Syncing..." />
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={() => updateStock(item.id, item.currentStock, item.threshold, -1)}
                         className="p-1 rounded-md hover:bg-white hover:shadow-sm text-stone-300 hover:text-stone-500 transition-all"
                       >
                         <Minus className="h-3 w-3" />
                       </button>
                       <span className="font-black text-green-900 min-w-[2rem] text-center">{item.currentStock}</span>
                       <button 
                         onClick={() => updateStock(item.id, item.currentStock, item.threshold, 1)}
                         className="p-1 rounded-md hover:bg-white hover:shadow-sm text-stone-300 hover:text-orange-600 transition-all"
                       >
                         <Plus className="h-3 w-3" />
                       </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{item.unit}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                      item.status === 'OK' ? "bg-green-50 text-green-700 border-green-100" :
                      item.status === 'Low' ? "bg-red-50 text-red-700 border-red-100" : 
                      "bg-stone-100 text-stone-600 border-stone-200"
                    )}>
                      {item.status === 'Out' ? 'Order Now' : item.status === 'Low' ? 'Low Stock' : 'Sufficient'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteDoc(doc(db, `projects/${projectId}/materials`, item.id))}
                      className="p-2 text-stone-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {materials.length === 0 && !isAdding && (
          <div className="text-center py-20 opacity-30">
            <PackageIcon />
            <p className="uppercase tracking-widest text-xs font-black mt-4">No materials logged</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">New Material</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Item Name</label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="Cement, Bricks, Sand..."
                  className="w-full rounded-xl border-stone-200 focus:border-orange-500 focus:ring-orange-500 py-3 font-semibold"
                  value={newMaterial.name}
                  onChange={e => setNewMaterial({...newMaterial, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Current</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border-stone-200 py-3 font-bold text-center"
                    value={newMaterial.currentStock}
                    onChange={e => setNewMaterial({...newMaterial, currentStock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="bags, tons"
                    className="w-full rounded-xl border-stone-200 py-3 text-center"
                    value={newMaterial.unit}
                    onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Alert Threshold (Low Stock)</label>
                <input
                  type="number"
                  required
                  className="w-full rounded-xl border-stone-200 py-3 font-bold text-center text-orange-600"
                  value={newMaterial.threshold}
                  onChange={e => setNewMaterial({...newMaterial, threshold: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-bold uppercase tracking-wider text-xs hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-600 py-3 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-orange-100"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  );
}
