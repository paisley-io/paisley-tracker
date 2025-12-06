'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Download, Filter, ChevronDown, ChevronUp, CheckSquare, AlertCircle, CheckCircle2, 
  Lock, Unlock, RefreshCw, Send, MessageSquare, Upload, FileJson, Maximize2, Minimize2,
  Calendar, Link, Layers, Layout, Plus, Trash2, X, Database, LogOut
} from 'lucide-react';

// --- Users Configuration ---
const USERS = [
  { name: 'Puja', role: 'Project Manager', canSignOff: false, color: 'pink', avatarVal: 'P' },
  { name: 'Rich', role: 'Business Manager', canSignOff: true, color: 'blue', avatarVal: 'R' },
  { name: 'Mike', role: 'CTO', canSignOff: false, color: 'green', avatarVal: 'M' },
  { name: 'James', role: 'Tech Manager', canSignOff: false, color: 'purple', avatarVal: 'J' },
  { name: 'Observer', role: 'Observer', canSignOff: false, color: 'gray', avatarVal: 'O' },
];

const getUserColor = (name: string) => {
  const user = USERS.find(u => u.name === name);
  return user ? user.color : 'gray';
};

const createEmptyItem = () => ({
  id: crypto.randomUUID(),
  priority: 'P1',
  title: '',
  category: '',
  sowRef: '',
  sstStatus: { label: 'Pending', desc: '' },
  ourPosition: { label: 'Pending', desc: '' },
  decision: 'DISCUSS',
  phase: 'Phase 1',
  timeline: 'TBD',
  dependencies: 'None',
  checked: false,
  signedOff: false,
  activity: []
});

// --- SUB-COMPONENTS ---

const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [observerName, setObserverName] = useState("");

  const handleUserSelect = (user: any) => {
    if (user.role === 'Observer') {
      setShowNameInput(true);
    } else {
      onLogin(user);
    }
  };

  const handleObserverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (observerName.trim()) {
      const baseObserver = USERS.find(u => u.role === 'Observer');
      onLogin({
        ...baseObserver,
        name: observerName.trim(), 
        avatarVal: observerName.trim()[0].toUpperCase()
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Paisley Tracker</h2>
          <p className="opacity-90">Login to manage scope & approvals</p>
        </div>
        <div className="p-6">
          {!showNameInput ? (
            <div className="grid grid-cols-1 gap-3">
              {USERS.map(user => (
                <button
                  key={user.name}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-${user.color}-100 text-${user.color}-700`}>
                    {user.avatarVal}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 group-hover:text-indigo-600">{user.role}</div>
                  </div>
                  {user.canSignOff && (
                    <div className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Approver</div>
                  )}
                  {user.role === 'Observer' && (
                    <div className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium border border-gray-200">Read Only</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleObserverSubmit} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Enter your name:</label>
                <input
                  type="text"
                  autoFocus
                  value={observerName}
                  onChange={(e) => setObserverName(e.target.value)}
                  placeholder="Your Name (e.g. John Doe)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNameInput(false)} className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">Back</button>
                <button type="submit" disabled={!observerName.trim()} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">Continue</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, colorClass }: { label: string, count: number, colorClass: string }) => (
  <div className={`flex flex-col p-4 rounded-xl border ${colorClass} shadow-sm min-w-[140px] flex-1`}>
    <div className="flex justify-between items-start mb-2">
      <span className="text-3xl font-bold text-gray-800">{count}</span>
    </div>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const PriorityBadge = ({ p }: { p: string }) => {
  const style = p === 'P0' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' : 'bg-orange-100 text-orange-700 ring-1 ring-orange-200';
  return <div className={`${style} px-2 py-1 rounded text-xs font-bold`}>{p}</div>;
};

const DecisionSelect = ({ value, onChange, disabled }: any) => {
  const styles: any = {
    'DISCUSS': 'bg-orange-100 text-orange-800 border-orange-200',
    'AGREE': 'bg-green-100 text-green-800 border-green-200',
    'DEFER': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'QA': 'bg-blue-100 text-blue-800 border-blue-200',
    'VERIFY': 'bg-purple-100 text-purple-800 border-purple-200',
    'OUT OF SCOPE': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className={`relative inline-block w-40 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${styles[value] || styles.DISCUSS} w-full px-3 py-1.5 rounded border font-bold text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500`}
      >
        <option value="DISCUSS">DISCUSS</option>
        <option value="AGREE">AGREED</option>
        <option value="QA">VERIFY IN QA</option>
        <option value="VERIFY">VERIFY</option>
        <option value="DEFER">DEFERRED</option>
        <option value="OUT OF SCOPE">OUT OF SCOPE</option>
      </select>
    </div>
  );
};

const ActivityStream = ({ activity, onAddComment, currentUser, isLocked }: any) => {
  const [newComment, setNewComment] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  };

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div ref={scrollRef} className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[250px] min-h-[100px]">
        {(!activity || activity.length === 0) && <div className="text-center text-gray-400 text-xs py-4 italic">No activity yet. Start the discussion!</div>}
        {activity && activity.map((item: any) => {
          const isSystem = item.type === 'system';
          const userColor = getUserColor(item.user);
          if (isSystem) {
            return (
              <div key={item.id} className="flex items-center justify-center gap-2 text-gray-400 my-1 text-[10px] uppercase font-medium">
                <span>{item.user} {item.text}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{formatTime(item.timestamp)}</span>
              </div>
            );
          }
          return (
            <div key={item.id} className="flex gap-3 text-sm group">
              <div className={`mt-1 w-8 h-8 min-w-[2rem] rounded-full flex items-center justify-center text-xs font-bold border bg-${userColor}-100 text-${userColor}-700 border-${userColor}-200`}>
                {item.user[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-900">{item.user}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-${userColor}-50 text-${userColor}-600 border-${userColor}-100`}>{item.role}</span>
                  <span className="text-xs text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">{formatTime(item.timestamp)}</span>
                </div>
                <div className="text-gray-700 mt-1 bg-white p-2 rounded-lg border border-gray-100 shadow-sm leading-relaxed">{item.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      {!isLocked && (
        <form onSubmit={handleSubmit} className="p-2 bg-white border-t border-gray-200 flex gap-2 items-end">
           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-${currentUser.color}-100 text-${currentUser.color}-700 mb-2`}>{currentUser.name[0]}</div>
           <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={`Reply as ${currentUser.name}...`} className="flex-1 bg-transparent border-none text-sm p-2 resize-none focus:ring-0 max-h-20 outline-none" rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }}} />
           <button type="submit" disabled={!newComment.trim()} className="p-2 text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"><Send size={16} /></button>
        </form>
      )}
      {isLocked && <div className="p-3 bg-gray-100 text-center text-xs text-gray-500 font-medium border-t border-gray-200">Thread locked due to sign-off.</div>}
    </div>
  );
};

// 6. Item Card
const ItemCard = ({ item, onUpdate, onDelete, currentUser, isExpanded, onToggleExpand }: any) => {
  const isLocked = item.signedOff;
  const hasDependency = item.dependencies && item.dependencies !== "None" && item.dependencies.trim() !== "";
  const isObserver = currentUser.role === 'Observer';

  const handleAddComment = (text: string) => {
    const newActivity = {
      id: crypto.randomUUID(),
      type: 'comment',
      user: currentUser.name,
      role: currentUser.role,
      text: text,
      timestamp: new Date().toISOString()
    };
    onUpdate(item.id, { activity: [...(item.activity || []), newActivity] });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (isObserver) return;
    const newActivity = {
      id: crypto.randomUUID(),
      type: 'system',
      user: currentUser.name,
      text: `changed status to ${val}`,
      timestamp: new Date().toISOString()
    };
    onUpdate(item.id, { decision: val, activity: [...(item.activity || []), newActivity] });
  };

  const handleSignOffToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isObserver) return;
    const action = !item.signedOff ? 'SIGNED OFF' : 'UNLOCKED';
    const newActivity = {
      id: crypto.randomUUID(),
      type: 'system',
      user: currentUser.name,
      text: `${action} this item`,
      timestamp: new Date().toISOString()
    };
    onUpdate(item.id, { signedOff: !item.signedOff, activity: [...(item.activity || []), newActivity] });
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm mb-3 overflow-hidden transition-all ${isLocked ? 'border-gray-300 bg-gray-50' : 'border-gray-100'} ${isExpanded ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'}`}>
      <div onClick={onToggleExpand} className="p-4 cursor-pointer flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <PriorityBadge p={item.priority} />
          <div className={`flex-1 ${isLocked ? 'opacity-70' : ''}`}>
            <h3 className="font-bold text-gray-900 text-base leading-tight flex items-center gap-2">
              {item.title || <span className="text-gray-400 italic">Untitled Item</span>}
              {isLocked && <Lock size={14} className="text-gray-400" />}
              {hasDependency && !isExpanded && <Link size={14} className="text-amber-500" />}
            </h3>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span className="hidden sm:inline">SOW: {item.sowRef || 'N/A'}</span>
              {item.timeline && item.timeline !== 'TBD' && <span className="text-indigo-600 bg-indigo-50 px-2 rounded font-medium">{item.timeline}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isExpanded && <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${item.decision === 'AGREE' ? 'bg-green-100 text-green-700 border-green-200' : item.decision === 'VERIFY' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{item.decision}</span>}
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            {isLocked && <div className="bg-gray-100 text-gray-500 text-xs font-bold text-center py-2 border-b border-gray-200 flex items-center justify-center gap-2"><Lock size={12} /> ITEM SIGNED OFF & LOCKED</div>}
            
            <div className="px-4 pt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200 text-gray-700"><Calendar size={14} className="text-gray-400" /><span className="font-bold">Timeline:</span> {item.timeline}</div>
                {hasDependency && <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded border border-amber-200 text-amber-800"><Link size={14} className="text-amber-500" /><span className="font-bold">Dependency:</span> {item.dependencies}</div>}
            </div>

            <div className={`px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100"><div className="text-xs font-bold text-blue-800 mb-1">SST Claim: {item.sstStatus.label}</div><div className="text-sm text-blue-600/90">{item.sstStatus.desc || "No description provided"}</div></div>
                <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100"><div className="text-xs font-bold text-purple-800 mb-1">Status: {item.ourPosition.label}</div><div className="text-sm text-purple-600/90">{item.ourPosition.desc || "No description provided"}</div></div>
            </div>

            <div className="px-4 mb-4"><div className="flex items-center gap-2 mb-2"><MessageSquare size={14} className="text-gray-400" /><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discussion & Activity</span></div><ActivityStream activity={item.activity} onAddComment={handleAddComment} currentUser={currentUser} isLocked={isLocked} /></div>

            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className={`relative inline-block w-40 ${isLocked || isObserver ? 'opacity-50 pointer-events-none' : ''}`}>
                      <select value={item.decision} onChange={handleStatusChange} disabled={isLocked || isObserver} className="w-full px-3 py-1.5 rounded border font-bold text-sm appearance-none cursor-pointer focus:outline-none bg-white">
                        <option value="DISCUSS">DISCUSS</option><option value="AGREE">AGREED</option><option value="QA">VERIFY IN QA</option><option value="VERIFY">VERIFY</option><option value="DEFER">DEFERRED</option><option value="OUT OF SCOPE">OUT OF SCOPE</option>
                      </select>
                    </div>
                    
                    {currentUser.canSignOff && (
                    <button onClick={handleSignOffToggle} className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold transition-colors ${item.signedOff ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}>
                        {item.signedOff ? <><Unlock size={14} /> UNLOCK</> : <><CheckSquare size={14} /> SIGN OFF</>}
                    </button>
                    )}
                    
                    {!isObserver && (
                      <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="flex items-center gap-2 px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors">
                        <Trash2 size={14} /> DELETE
                      </button>
                    )}
                </div>
                <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full">{item.phase}</span>
            </div>
        </div>
      )}
    </div>
  );
};

// 7. Item Form Modal
const ItemFormModal = ({ item, onSave, onClose }: any) => {
  const [formData, setFormData] = useState(item || createEmptyItem());
  const isEdit = !!item;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { alert("Title is required"); return; }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-indigo-600 text-white p-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-bold">{isEdit ? 'Edit Item' : 'Add New Item'}</h3>
          <button onClick={onClose} className="hover:bg-indigo-700 rounded p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Priority *</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2"><option value="P0">P0 - Critical</option><option value="P1">P1 - High</option><option value="P2">P2 - Medium</option></select></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">SOW Reference</label><input type="text" value={formData.sowRef} onChange={(e) => setFormData({ ...formData, sowRef: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Title *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Category</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Phase</label><select value={formData.phase} onChange={(e) => setFormData({ ...formData, phase: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2"><option value="Phase 1">Phase 1</option><option value="Phase 2">Phase 2</option><option value="Future">Future</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Timeline</label><input type="text" value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Dependencies</label><input type="text" value={formData.dependencies} onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">SST Status</label><textarea value={formData.sstStatus.desc} onChange={(e) => setFormData({ ...formData, sstStatus: { ...formData.sstStatus, desc: e.target.value } })} rows={2} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Our Position</label><textarea value={formData.ourPosition.desc} onChange={(e) => setFormData({ ...formData, ourPosition: { ...formData.ourPosition, desc: e.target.value } })} rows={2} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button></div>
        </form>
      </div>
    </div>
  );
};

// 8. Import Modal
const ImportModal = ({ onClose, onImport }: any) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFiles = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setLoading(true);
          await onImport(json);
        } else {
          setError("File must contain a JSON array.");
        }
      } catch (err: any) {
        setError("Invalid JSON: " + err.message);
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Import Data</h3>
        <p className="text-sm text-gray-500 mb-6">Upload a JSON file to bulk-import items.</p>
        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`} onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files[0]); }}>
          <FileJson size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-900">Drag & Drop JSON</p>
          <p className="text-xs text-gray-500 mt-1">or</p>
          <button onClick={() => fileInputRef.current?.click()} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors" disabled={loading}>{loading ? 'Importing...' : 'Browse Files'}</button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0])} />
        </div>
        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
        <div className="mt-6 flex justify-end"><button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium" disabled={loading}>Cancel</button></div>
      </div>
    </div>
  );
};

// 9. Delete Confirmation
const DeleteConfirmModal = ({ onConfirm, onCancel }: any) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle size={24} className="text-red-600" /></div><div><h3 className="text-lg font-bold text-gray-900">Delete Item?</h3><p className="text-sm text-gray-500">This action cannot be undone.</p></div></div>
      <div className="flex justify-end gap-3"><button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">Delete</button></div>
    </div>
  </div>
);

// --- Main App ---
export default function App() {
  const [items, setItems] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showImport, setShowImport] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // --- Load Data ---
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- Handlers ---
  const handleUpdateItem = async (id: string, updates: any) => {
    if (!currentUser) return;
    const oldItems = [...items];
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
    try {
      await fetch('/api/items', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
    } catch (e) {
      console.error("Update failed:", e);
      setItems(oldItems);
      alert("Update failed.");
    }
  };

  const handleSaveItem = async (formData: any) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const newItem = { ...formData, id: formData.id || crypto.randomUUID() };
      await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) });
      await loadItems();
      setShowItemForm(false);
      setEditingItem(null);
    } catch (e) { console.error("Save failed:", e); alert("Save failed."); } finally { setLoading(false); }
  };

  const handleDeleteItem = async (id: string) => { setDeleteConfirm(id); };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      await fetch(`/api/items?id=${deleteConfirm}`, { method: 'DELETE' });
      await loadItems();
      setDeleteConfirm(null);
    } catch (e) { console.error("Delete failed:", e); alert("Delete failed."); } finally { setLoading(false); }
  };

  const handleImport = async (jsonData: any[]) => {
    setLoading(true);
    try {
      await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) });
      await loadItems();
      setShowImport(false);
      alert(`Successfully imported ${jsonData.length} items!`);
    } catch (e) { console.error("Import failed:", e); alert("Import failed."); } finally { setLoading(false); }
  };

  const handleExport = () => {
    const headers = ["ID", "Module", "Feature", "Timeline", "Dependencies", "Status", "Latest Activity"];
    const rows = items.map(item => {
      const lastActivity = item.activity && item.activity.length > 0 ? item.activity[item.activity.length - 1].text : "";
      const escape = (text: any) => text ? `"${text.toString().replace(/"/g, '""')}"` : '""';
      return [item.id, escape(item.category), escape(item.title), escape(item.timeline), escape(item.dependencies), escape(item.decision), escape(lastActivity)].join(",");
    });
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paisley_export_${Date.now()}.csv`;
    link.click();
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedItems(newSet);
  };

  const toggleAll = (expand: boolean) => {
    if (expand) setExpandedItems(new Set(items.map(i => i.id))); else setExpandedItems(new Set());
  };

  const filteredItems = items.filter(item => filterPriority === 'All' || item.priority === filterPriority);

  const groupedItems = useMemo(() => {
    const groups: any = {};
    filteredItems.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  const stats = useMemo(() => ({
    total: items.length,
    discuss: items.filter(i => i.decision === 'DISCUSS').length,
    agreed: items.filter(i => i.decision === 'AGREE').length,
    completed: items.filter(i => i.signedOff).length
  }), [items]);

  const isObserver = currentUser && currentUser.role === 'Observer';

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-gray-500 font-medium">Loading Paisley Tracker...</p>
      </div>
    );
  }

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20 font-sans">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Database className="text-indigo-600" /> Paisley Project Tracker</h1><p className="text-gray-500 text-sm mt-1">Live Database Edition</p></div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`flex items-center gap-2 bg-${currentUser.color}-50 px-3 py-2 rounded-full border border-${currentUser.color}-100`}>
                <div className={`bg-${currentUser.color}-100 text-${currentUser.color}-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold`}>{currentUser.avatarVal}</div>
                <span className="text-sm font-bold text-gray-900">{currentUser.name}</span>
                <button onClick={() => setCurrentUser(null)} className="ml-2 text-gray-400 hover:text-red-600 transition-colors" title="Switch User"><LogOut size={14} /></button>
              </div>
              {!isObserver && (<><button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"><Plus size={16} /> Add Item</button><button onClick={() => setShowImport(true)} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium text-sm transition-colors"><Upload size={16} /> Import</button></>)}
              <button onClick={handleExport} disabled={items.length === 0} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"><Download size={16} /> Export</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tasks" count={stats.total} colorClass="bg-gray-100 border-gray-200" />
          <StatCard label="Need Discussion" count={stats.discuss} colorClass="bg-orange-100 border-orange-200" />
          <StatCard label="Agreed Scope" count={stats.agreed} colorClass="bg-green-100 border-green-200" />
          <StatCard label="Signed Off" count={stats.completed} colorClass="bg-purple-100 border-purple-200" />
        </div>

        <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="px-3 text-gray-400"><Filter size={18} /></div>
            <select className="bg-transparent text-sm font-medium text-gray-700 cursor-pointer outline-none border-none focus:ring-0" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="All">All Priorities</option><option value="P0">P0 (Critical)</option><option value="P1">P1 (High)</option><option value="P2">P2 (Medium)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)} className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50"><Maximize2 size={12} /> Expand All</button>
            <button onClick={() => toggleAll(false)} className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50"><Minimize2 size={12} /> Collapse All</button>
          </div>
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-50 rounded-full flex items-center justify-center"><Layout size={40} className="text-indigo-600" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Empty Shell Ready</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">This tracker is ready to scale. Add items manually or import a JSON file to populate instantly.</p>
            {!isObserver && (<div className="flex justify-center gap-3"><button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"><Plus size={18} /> Add First Item</button><button onClick={() => setShowImport(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"><Upload size={18} /> Import Data</button></div>)}
            {isObserver && <p className="text-sm text-gray-400 italic">You are in Observer mode. Wait for an admin to populate data.</p>}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-6">
            {Object.entries(groupedItems).map(([category, categoryItems]: any) => (
              <div key={category} className="bg-gray-50/50 rounded-xl border border-gray-200/60 overflow-hidden">
                <div className="px-4 py-3 bg-gray-100/80 border-b border-gray-200 flex items-center gap-2"><Layers size={16} className="text-gray-500" /><h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">{category}</h2><span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border border-gray-200">{categoryItems.length}</span></div>
                <div className="p-2 space-y-1">{categoryItems.map((item: any) => (<ItemCard key={item.id} item={item} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} currentUser={currentUser} isExpanded={expandedItems.has(item.id)} onToggleExpand={() => toggleExpand(item.id)} />))}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
      {showItemForm && <ItemFormModal item={editingItem} onSave={handleSaveItem} onClose={() => { setShowItemForm(false); setEditingItem(null); }} />}
      {deleteConfirm && <DeleteConfirmModal onConfirm={confirmDelete} onCancel={() => setDeleteConfirm(null)} />}
    </div>
  );
}