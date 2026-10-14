import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Star,
  Shield,
  Trash2,
  X,
  Phone,
  Check,
  Tag,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { Contact } from '../../types';

interface ContactsViewProps {
  initialPrefilledPhone?: string;
  initialPrefilledName?: string;
  onClearPrefilled?: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  initialPrefilledPhone,
  initialPrefilledName,
  onClearPrefilled,
}) => {
  const { contacts, addContact, updateContact, deleteContact } = useAssistant();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'family' | 'work' | 'vip' | 'blocked'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!initialPrefilledPhone);

  const [newName, setNewName] = useState(initialPrefilledName || '');
  const [newPhone, setNewPhone] = useState(initialPrefilledPhone || '+92 ');
  const [newCategory, setNewCategory] = useState<Contact['category']>('family');
  const [newAlwaysScreen, setNewAlwaysScreen] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // Auto-detect Pakistani carrier from mobile prefix
  const detectCarrier = (phoneStr: string): string => {
    const cleaned = phoneStr.replace(/\s+/g, '').replace('+92', '0');
    if (cleaned.startsWith('030') || cleaned.startsWith('032')) return 'Jazz';
    if (cleaned.startsWith('031')) return 'Zong';
    if (cleaned.startsWith('033')) return 'Ufone';
    if (cleaned.startsWith('034')) return 'Telenor';
    if (cleaned.startsWith('051') || cleaned.startsWith('042') || cleaned.startsWith('021')) return 'PTCL';
    return 'Pakistan Mobile';
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addContact({
      name: newName.trim(),
      phone: newPhone.trim(),
      category: newCategory,
      alwaysScreen: newAlwaysScreen,
      carrier: detectCarrier(newPhone),
      notes: newNotes.trim(),
    });

    setNewName('');
    setNewPhone('+92 ');
    setNewNotes('');
    setIsAddModalOpen(false);
    onClearPrefilled?.();
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeCategory !== 'all') return c.category === activeCategory;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-xl mx-auto">
      {/* Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Contacts & VIP Rules</h1>
          <p className="text-xs text-slate-400">
            {contacts.length} saved contacts · Configure AI screening bypasses
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="min-h-[40px] px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, Pakistani number or relation..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
        {(['all', 'vip', 'family', 'work', 'blocked'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all capitalize whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat === 'vip' ? '★ VIP' : cat}
          </button>
        ))}
      </div>

      {/* Contacts List */}
      <div className="space-y-2">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">No contacts found</div>
            <p className="text-xs text-slate-500 mt-1">
              Add contacts to set custom VIP bypass or AI screening rules.
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      contact.category === 'vip'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        : contact.category === 'blocked'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                    }`}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        {contact.name}
                      </span>
                      {contact.category === 'vip' && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {contact.phone} · <span className="font-sans text-slate-300">{contact.carrier}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateContact(contact.id, {
                        alwaysScreen: !contact.alwaysScreen,
                      })
                    }
                    className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                      contact.alwaysScreen
                        ? 'bg-blue-950/80 border-blue-800 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle AI Screening for this contact"
                  >
                    <Shield className="w-3 h-3" />
                    <span>{contact.alwaysScreen ? 'AI Screened' : 'Direct Call'}</span>
                  </button>

                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="min-h-[36px] min-w-[36px] rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-850 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {contact.notes && (
                <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-850">
                  {contact.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                Add Contact to PakCall
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  onClearPrefilled?.();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ammi Jan, Hamza Driver, Dr. Bilal"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phone Number (Pakistan) *
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Detected Carrier: <strong className="text-blue-400">{detectCarrier(newPhone)}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category & Rule
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="vip">VIP (Bypasses AI - Instant Ring-Through)</option>
                  <option value="family">Family</option>
                  <option value="work">Work / Business</option>
                  <option value="general">General Contact</option>
                  <option value="blocked">Blocked Number (Silent Reject)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-medium text-white">Always Screen with AI</div>
                  <div className="text-[10px] text-slate-400">
                    AI will politely ask purpose before connecting
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newAlwaysScreen}
                  onChange={(e) => setNewAlwaysScreen(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Screening Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. If calling about parcel, ask to leave with guard."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
