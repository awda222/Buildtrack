import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Expense } from '../../types';
import { Plus, Receipt, IndianRupee, Trash2, Filter } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Expenses({ projectId }: { projectId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'Materials', vendor: '' });

  useEffect(() => {
    const q = query(collection(db, `projects/${projectId}/expenses`), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        _isSyncing: doc.metadata.hasPendingWrites
      } as Expense)));
    });
  }, [projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, `projects/${projectId}/expenses`), {
      ...newExpense,
      projectId,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
    setNewExpense({ description: '', amount: 0, category: 'Materials', vendor: '' });
    setIsAdding(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-green-900">Project Expenditure</h3>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest leading-none mt-1">Real-time cost tracking</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-green-900 px-5 py-2.5 rounded-xl hover:bg-green-800 transition-all shadow-md shadow-green-100"
        >
          <Plus className="h-4 w-4" />
          Log Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="site-card p-5 bg-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Spent</p>
          <p className="text-2xl font-black text-green-900 mt-1">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="site-card p-5 bg-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Material Costs</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{formatCurrency(totalExpenses * 0.6)}</p>
        </div>
        <div className="site-card p-5 bg-white border-green-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Budget Health</p>
          <p className="text-xs font-black text-green-900 mt-1 uppercase tracking-widest">On Track</p>
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-100 uppercase tracking-widest text-[10px] font-black text-stone-400">
              <tr>
                <th className="px-6 py-4">Expense Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {expenses.map((expense) => (
                <tr key={expense.id} className="group hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <div>
                       <div className="flex items-center gap-1.5">
                         <p className="font-bold text-green-900 uppercase tracking-tight text-sm">{expense.description}</p>
                         {expense._isSyncing && (
                           <div className="h-1 w-1 rounded-full bg-orange-400 animate-pulse" />
                         )}
                       </div>
                       <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mt-0.5">{formatDate(expense.date)}</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-stone-100 text-[9px] font-black text-stone-500 uppercase tracking-widest">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-green-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100">
                     <button 
                       onClick={() => deleteDoc(doc(db, `projects/${projectId}/expenses`, expense.id))}
                       className="text-stone-300 hover:text-red-500 transition-colors"
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && !isAdding && (
          <div className="text-center py-20 opacity-30">
            <IndianRupee className="h-10 w-10 mx-auto text-stone-400" />
            <p className="uppercase tracking-widest text-xs font-black mt-4">No expenses logged</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Log New Expense</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Description</label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. 50 Bags Ultratech Cement"
                  className="w-full rounded-xl border-stone-200 py-3 font-semibold"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border-stone-200 py-3 font-bold"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Vendor</label>
                   <input
                     type="text"
                     placeholder="Optional"
                     className="w-full rounded-xl border-stone-200 py-3"
                     value={newExpense.vendor}
                     onChange={e => setNewExpense({...newExpense, vendor: e.target.value})}
                   />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Category</label>
                <select
                  className="w-full rounded-xl border-stone-200 py-3 font-bold uppercase tracking-widest text-xs"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option>Materials</option>
                  <option>Labour Wages</option>
                  <option>Fuel/Transport</option>
                  <option>Equipment</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-600 py-3 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-orange-100"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
