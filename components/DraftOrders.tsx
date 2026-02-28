
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Trash2, Plus, User, UserPlus, Send, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { DraftOrder, Seller } from '../types';
import { dbService } from '../services/dbService';

const DraftOrders: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDraft, setNewDraft] = useState({ cliente: '', vendedor: '', data_entrega: '' });
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [draftData, sellerData] = await Promise.all([
        dbService.getDrafts().catch(() => []),
        dbService.getSellers().catch(() => [])
      ]);
      setDrafts(draftData);
      // More resilient filter for active sellers
      setSellers(sellerData.filter(s => !s.status || s.status.toLowerCase() === 'ativo'));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraft.cliente.trim() || !newDraft.vendedor.trim()) return;
    
    setIsSubmittingDraft(true);
    try {
      await dbService.addDraft(newDraft as any);
      setNewDraft({ cliente: '', vendedor: '', data_entrega: '' });
      await loadData();
      alert("Anotação salva com sucesso!");
    } catch (e: any) {
      console.error("Erro ao adicionar rascunho:", e);
      alert("Erro ao salvar rascunho: " + (e.message || "Erro desconhecido"));
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await dbService.deleteDraft(id);
      await loadData();
    } catch (e) {
      console.error("Erro ao excluir rascunho:", e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Rascunho de Pedidos</h1>
            <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Anotações rápidas do dia</p>
          </div>
        </div>
        <button onClick={loadData} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-8">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Plus size={16} className="text-amber-500" /> Nova Anotação
            </h3>
            <form onSubmit={handleAddDraft} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Cliente</label>
                <input 
                  type="text" 
                  placeholder="EX: MERCADO CENTRAL..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-amber-400 shadow-inner"
                  value={newDraft.cliente}
                  onChange={e => setNewDraft({...newDraft, cliente: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Vendedor Responsável</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-amber-400 shadow-inner"
                  value={newDraft.vendedor}
                  onChange={e => setNewDraft({...newDraft, vendedor: e.target.value})}
                >
                  <option value="">SELECIONE O VENDEDOR...</option>
                  {sellers.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Data de Entrega</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-amber-400 shadow-inner"
                  value={newDraft.data_entrega}
                  onChange={e => setNewDraft({...newDraft, data_entrega: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingDraft || !newDraft.cliente || !newDraft.vendedor}
                className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingDraft ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                ANOTAR PEDIDO
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pedidos Pendentes de Faturamento</h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={32} />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Carregando rascunhos...</p>
                </div>
              ) : drafts.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <AlertCircle size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Nenhum pedido anotado no momento</p>
                  <p className="text-slate-200 font-bold uppercase tracking-widest text-[8px] mt-2">Use o formulário ao lado para começar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drafts.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 group hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition-all animate-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase leading-tight">{d.cliente}</p>
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                            {d.vendedor}
                          </p>
                          {d.data_entrega && (
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                              Entrega: {new Date(d.data_entrega + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                            {d.created_at ? new Date(d.created_at).toLocaleString('pt-BR') : 'Agora'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteDraft(d.id)}
                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir anotação"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftOrders;
