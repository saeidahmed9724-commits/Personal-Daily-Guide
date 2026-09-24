import React, { useState } from 'react';
import { useDailyGuide } from '../../../context/GuideContext';
import { 
  FileText, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Tag, 
  Sparkles,
  Check
} from 'lucide-react';
import { PersonalNote, NoteCategory } from '../../../types/guide';

export const NotesHub: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useDailyGuide();
  
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NoteCategory>('general');
  const [newIsPinned, setNewIsPinned] = useState(false);

  // Edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<NoteCategory>('general');

  const categories: { key: NoteCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'work', label: 'الشغل' },
    { key: 'reflection', label: 'خواطر ووعي' },
    { key: 'institute', label: 'المعهد' },
    { key: 'ideas', label: 'أفكار' },
    { key: 'general', label: 'عام' },
  ];

  const filteredNotes = notes.filter(note => {
    const matchesCat = selectedCategory === 'all' || note.category === selectedCategory;
    const matchesQuery = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  const handleSaveNewNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;

    await addNote({
      title: newTitle.trim() || 'ملاحظة بدون عنوان',
      content: newContent.trim(),
      category: newCategory,
      isPinned: newIsPinned,
    });

    setNewTitle('');
    setNewContent('');
    setNewCategory('general');
    setNewIsPinned(false);
    setIsCreatingInline(false);
  };

  const startEditNote = (note: PersonalNote) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
  };

  const handleSaveEdit = async (noteId: string) => {
    await updateNote(noteId, {
      title: editTitle.trim() || 'ملاحظة بدون عنوان',
      content: editContent.trim(),
      category: editCategory,
    });
    setEditingNoteId(null);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>الملاحظات الشخصية (Notes)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            مساحة تدوين الأفكار والخواطر
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            مكان نظيف وهادئ لتدوين ملاحظات العمل، تأملات اليوم، ومواعيد المعهد.
          </p>
        </div>

        {!isCreatingInline && (
          <button
            onClick={() => setIsCreatingInline(true)}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>تدوين ملاحظة جديدة</span>
          </button>
        )}
      </div>

      {/* Inline Create Form */}
      {isCreatingInline && (
        <form onSubmit={handleSaveNewNote} className="bg-white rounded-2xl border border-stone-300 p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 text-sm">ملاحظة جديدة</h3>
            <button
              type="button"
              onClick={() => setIsCreatingInline(false)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              إلغاء
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="عنوان الملاحظة..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              autoFocus
            />

            <textarea
              placeholder="اكتب ما يدور في ذهنك بحرية..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as NoteCategory)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-stone-50 font-medium"
                >
                  <option value="general">عام</option>
                  <option value="work">الشغل</option>
                  <option value="reflection">خواطر ووعي</option>
                  <option value="institute">المعهد</option>
                  <option value="ideas">أفكار</option>
                </select>

                <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPinned}
                    onChange={e => setNewIsPinned(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>تثبيت في الأعلى</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.key
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 sm:mr-auto">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في الملاحظات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
            <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>الملاحظات المثبتة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isEditing={editingNoteId === note.id}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editContent={editContent}
                setEditContent={setEditContent}
                editCategory={editCategory}
                setEditCategory={setEditCategory}
                onSaveEdit={() => handleSaveEdit(note.id)}
                onCancelEdit={() => setEditingNoteId(null)}
                onStartEdit={() => startEditNote(note)}
                onTogglePin={() => togglePinNote(note.id)}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Other Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 pt-2">
            <FileText className="w-3.5 h-3.5" />
            <span>باقي الملاحظات</span>
          </div>
        )}

        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-xs text-stone-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto opacity-30" />
            <p>لا توجد ملاحظات تطابق معايير البحث.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unpinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isEditing={editingNoteId === note.id}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editContent={editContent}
                setEditContent={setEditContent}
                editCategory={editCategory}
                setEditCategory={setEditCategory}
                onSaveEdit={() => handleSaveEdit(note.id)}
                onCancelEdit={() => setEditingNoteId(null)}
                onStartEdit={() => startEditNote(note)}
                onTogglePin={() => togglePinNote(note.id)}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// Sub-component for individual note card
interface NoteCardProps {
  note: PersonalNote;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editContent: string;
  setEditContent: (val: string) => void;
  editCategory: NoteCategory;
  setEditCategory: (val: NoteCategory) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isEditing,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  editCategory,
  setEditCategory,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onTogglePin,
  onDelete
}) => {
  if (isEditing) {
    return (
      <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 shadow-sm space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full font-bold text-sm px-2.5 py-1.5 border border-stone-200 rounded-lg"
        />
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          rows={3}
          className="w-full text-xs leading-relaxed px-2.5 py-1.5 border border-stone-200 rounded-lg"
        />
        <div className="flex items-center justify-between pt-1">
          <select
            value={editCategory}
            onChange={e => setEditCategory(e.target.value as NoteCategory)}
            className="text-xs px-2 py-1 rounded border border-stone-200"
          >
            <option value="general">عام</option>
            <option value="work">الشغل</option>
            <option value="reflection">خواطر</option>
            <option value="institute">المعهد</option>
            <option value="ideas">أفكار</option>
          </select>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCancelEdit}
              className="px-2.5 py-1 text-xs border rounded-lg hover:bg-stone-50"
            >
              إلغاء
            </button>
            <button
              onClick={onSaveEdit}
              className="px-3 py-1 text-xs font-bold bg-stone-900 text-white rounded-lg hover:bg-black"
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryLabels: Record<NoteCategory, { label: string; badge: string }> = {
    general: { label: 'عام', badge: 'bg-stone-100 text-stone-700' },
    work: { label: 'الشغل', badge: 'bg-emerald-50 text-emerald-800' },
    reflection: { label: 'خواطر ووعي', badge: 'bg-purple-50 text-purple-800' },
    institute: { label: 'المعهد', badge: 'bg-blue-50 text-blue-800' },
    ideas: { label: 'أفكار', badge: 'bg-amber-50 text-amber-800' },
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition group space-y-3 ${
      note.isPinned 
        ? 'bg-amber-50/20 border-amber-200 hover:border-amber-300' 
        : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryLabels[note.category]?.badge || 'bg-stone-100 text-stone-700'}`}>
            {categoryLabels[note.category]?.label || note.category}
          </span>
          <h3 className="font-bold text-stone-900 text-sm leading-snug">
            {note.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
          <button
            onClick={onTogglePin}
            className={`p-1 rounded-lg hover:bg-stone-100 transition ${note.isPinned ? 'text-amber-600' : 'text-stone-400'}`}
            title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-600' : ''}`} />
          </button>
          <button
            onClick={onStartEdit}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
            title="تعديل"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-rose-600 transition"
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
        {note.content}
      </p>

      <div className="text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-100">
        {new Date(note.createdAt).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </div>
    </div>
  );
};
