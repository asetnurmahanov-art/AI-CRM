import React, { useState, useEffect } from 'react';
import { Specification, DocSection } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { docsService } from '../services/docsService';
import { Card } from './ui/Card';
import { Title, Caption } from './ui/Typography';



const DocsManager: React.FC = () => {
    const { user } = useAuth();
    const [specs, setSpecs] = useState<Specification[]>([]);
    // Default to null on mobile to show list first, but can default to first on desktop if needed. 
    // For simplicity, let's start with null to force selection or handle consistent state.
    const [selectedSpec, setSelectedSpec] = useState<Specification | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [draftSpec, setDraftSpec] = useState<Specification | null>(null);

    // Auto-select first item on large screens if nothing selected (optional, but good for "dashboard" feel)
    useEffect(() => {
        const unsubscribe = docsService.subscribe((data) => {
            setSpecs(data);
            // Optional: Auto-select locally if needed, but risky with real-time updates resetting selection
        });
        return () => unsubscribe();
    }, []);

    // Auto-select first item on large screens if nothing selected
    useEffect(() => {
        if (window.innerWidth >= 768 && specs.length > 0 && !selectedSpec) {
            // Only auto-select if we really want to forced behavior, strictly speaking it might be better to let user choose
            // But following previous logic:
            // setSelectedSpec(specs[0]);
        }
    }, [specs]); // depend on specs loading

    const handleCreate = async () => {
        const newSpecStr = {
            title: 'New Specification',
            category: 'General',
            status: 'draft' as const,
            sections: [],
            authorName: user?.displayName || 'Unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        try {
            const id = await docsService.create(newSpecStr);
            // We don't setSpecs manually, subscription will catch it
            const createdSpec = { ...newSpecStr, id } as Specification;
            // We might want to select it immediately, but let's wait for subscription or optimally:
            // For better UX we might optimistically select it if we could, but finding it in 'specs' array requires wait
            setSelectedSpec(createdSpec);
            setDraftSpec(createdSpec);
            setIsEditing(true);
        } catch (error) {
            console.error("Failed to create spec", error);
        }
    };

    const handleSave = async () => {
        if (draftSpec && draftSpec.id) {
            try {
                await docsService.update(draftSpec.id, draftSpec);
                setIsEditing(false);
                setSelectedSpec(draftSpec);
            } catch (error) {
                console.error("Failed to save spec", error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this specification?')) {
            try {
                await docsService.delete(id);
                if (selectedSpec?.id === id) {
                    setSelectedSpec(null);
                    setIsEditing(false);
                    setDraftSpec(null);
                }
            } catch (error) {
                console.error("Failed to delete spec", error);
            }
        }
    };

    const updateSection = (index: number, field: keyof DocSection, value: string) => {
        if (!draftSpec) return;
        const newSections = [...draftSpec.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setDraftSpec({ ...draftSpec, sections: newSections });
    };

    const addSection = () => {
        if (!draftSpec) return;
        setDraftSpec({
            ...draftSpec,
            sections: [...draftSpec.sections, { id: Date.now().toString(), title: 'New Section', content: '' }]
        });
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 pb-2 px-2 md:px-0">
            {/* SIDEBAR NAVIGATION 
          Mobile: Hidden if spec selected
          Desktop: Always visible (w-64)
      */}
            <nav className={`w-full md:w-72 flex-shrink-0 flex flex-col gap-4 transition-all duration-300 ${selectedSpec ? 'hidden md:flex' : 'flex'}`}>
                <header className="px-2 py-2">
                    <Title className="!text-xl md:!text-3xl">Документация</Title>
                    <Caption className="mt-1">База знаний</Caption>
                </header>

                <Card className="!p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 bg-ios-card/80 backdrop-blur-xl border border-white/20 shadow-xl">
                    <button
                        onClick={handleCreate}
                        className="w-full mb-2 bg-ios-primary text-ios-bg px-4 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                    >
                        <span className="text-lg">+</span> Новая запись
                    </button>

                    <div className="space-y-2">
                        {specs.map(spec => (
                            <button
                                key={spec.id}
                                onClick={() => { setSelectedSpec(spec); setIsEditing(false); }}
                                className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedSpec?.id === spec.id
                                    ? 'bg-ios-bg border-ios-border/50 shadow-sm scale-[1.02]'
                                    : 'border-transparent hover:bg-ios-bg/40 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-bold truncate leading-tight ${selectedSpec?.id === spec.id ? 'text-ios-primary' : 'text-ios-secondary'}`}>
                                        {spec.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] px-2 py-1 rounded-lg uppercase tracking-wider font-black
                    ${spec.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                            spec.status === 'review' ? 'bg-orange-500/10 text-orange-600' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {spec.status}
                                    </span>
                                    <span className="text-[10px] text-ios-secondary/60 font-medium bg-ios-sub/50 px-2 py-1 rounded-lg">
                                        {spec.category}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            </nav>

            {/* MAIN CONTENT AREA 
          Mobile: Hidden if NO spec selected
          Desktop: Always visible (flex-1)
      */}
            <main className={`flex-1 min-w-0 h-full flex flex-col transition-all duration-300 ${!selectedSpec ? 'hidden md:flex' : 'flex'}`}>
                {selectedSpec ? (
                    <Card className="h-full flex flex-col !p-0 overflow-hidden bg-white/60 backdrop-blur-2xl border-white/40 shadow-2xl rounded-[2rem]">
                        {/* Header / Toolbar */}
                        <div className="h-16 px-4 md:px-8 border-b border-ios-border/50 flex items-center justify-between shrink-0 bg-white/40 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setSelectedSpec(null)}
                                    className="md:hidden p-2 -ml-2 text-ios-secondary hover:text-ios-primary rounded-full hover:bg-black/5"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <div className="min-w-0 flex-1">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={draftSpec?.title}
                                            onChange={(e) => setDraftSpec(prev => prev ? { ...prev, title: e.target.value } : null)}
                                            className="text-lg md:text-xl font-bold bg-transparent border-b-2 border-ios-accent/50 text-ios-primary focus:border-ios-accent outline-none w-full py-1"
                                            placeholder="Specification Title"
                                        />
                                    ) : (
                                        <h1 className="text-lg md:text-xl font-black text-ios-primary truncate tracking-tight">{selectedSpec.title}</h1>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                                {isEditing ? (
                                    <>
                                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-ios-secondary hover:bg-black/5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                                            Отмена
                                        </button>
                                        <button onClick={handleSave} className="px-4 py-2 bg-ios-accent text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-ios-accent/30 hover:bg-ios-accent/90 transition-all active:scale-95">
                                            Сохранить
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => { setDraftSpec(selectedSpec); setIsEditing(true); }}
                                        className="px-4 py-2 bg-ios-sub text-ios-primary rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-ios-sub/80 transition-colors"
                                    >
                                        Изменить
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-white/30">
                            {isEditing && draftSpec ? (
                                <div className="space-y-8 max-w-3xl mx-auto animate-fade-in-up">
                                    {/* Meta Controls */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/50 p-4 rounded-2xl border border-white/60 shadow-sm">
                                            <label className="block text-[10px] font-black text-ios-secondary uppercase mb-2">Category</label>
                                            <input
                                                className="w-full bg-transparent border-b border-ios-border p-2 text-sm text-ios-primary focus:border-ios-accent outline-none font-bold"
                                                value={draftSpec.category}
                                                onChange={(e) => setDraftSpec({ ...draftSpec, category: e.target.value })}
                                                placeholder="e.g. API, Feature"
                                            />
                                        </div>
                                        <div className="bg-white/50 p-4 rounded-2xl border border-white/60 shadow-sm">
                                            <label className="block text-[10px] font-black text-ios-secondary uppercase mb-2">Status</label>
                                            <select
                                                className="w-full bg-transparent border-b border-ios-border p-2 text-sm text-ios-primary focus:border-ios-accent outline-none font-bold"
                                                value={draftSpec.status}
                                                onChange={(e) => setDraftSpec({ ...draftSpec, status: e.target.value as any })}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="review">Review</option>
                                                <option value="approved">Approved</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Section Editor */}
                                    <div className="space-y-6">
                                        {draftSpec.sections.map((section, idx) => (
                                            <div key={section.id} className="bg-white p-6 rounded-3xl shadow-ios border border-white/50 group transition-all hover:shadow-ios-heavy">
                                                <div className="flex justify-between items-center mb-4">
                                                    <input
                                                        className="font-black text-lg text-ios-primary bg-transparent border-b-2 border-transparent hover:border-ios-border focus:border-ios-accent outline-none transition-colors"
                                                        value={section.title}
                                                        onChange={(e) => updateSection(idx, 'title', e.target.value)}
                                                        placeholder="Section Title"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newSections = draftSpec.sections.filter((_, i) => i !== idx);
                                                            setDraftSpec({ ...draftSpec, sections: newSections });
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                                                        title="Delete Section"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="w-full min-h-[150px] text-sm md:text-base text-ios-primary bg-transparent border-none outline-none resize-y font-mono leading-relaxed placeholder-gray-300"
                                                    value={section.content}
                                                    onChange={(e) => updateSection(idx, 'content', e.target.value)}
                                                    placeholder="# Write your content here (Markdown supported)..."
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={addSection}
                                            className="flex-1 py-6 border-2 border-dashed border-ios-border rounded-3xl text-ios-secondary font-bold hover:border-ios-accent hover:text-ios-accent hover:bg-ios-accent/5 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
                                        >
                                            <span className="text-xl">+</span> Add Content Section
                                        </button>

                                        <button
                                            onClick={() => draftSpec.id && handleDelete(draftSpec.id)}
                                            className="px-6 py-6 border-2 border-dashed border-red-200 rounded-3xl text-red-400 font-bold hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
                                        >
                                            Delete Doc
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                                    {/* Meta Header */}
                                    <div className="flex flex-wrap gap-3 items-center pb-6 border-b border-dashed border-ios-border/50">
                                        <span className="px-3 py-1 bg-ios-sub text-ios-secondary text-[10px] rounded-xl font-black uppercase tracking-widest">{selectedSpec.category}</span>
                                        <span className={`px-3 py-1 text-[10px] rounded-xl font-black uppercase tracking-widest
                      ${selectedSpec.status === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                            {selectedSpec.status}
                                        </span>
                                        <span className="text-xs text-ios-secondary/50 font-medium ml-auto">
                                            Updated {new Date(selectedSpec.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {selectedSpec.sections.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-32 text-ios-secondary/40">
                                            <div className="w-16 h-16 rounded-full bg-ios-sub flex items-center justify-center mb-4">
                                                <span className="text-2xl opacity-50">📝</span>
                                            </div>
                                            <p className="font-bold">Нет содержания</p>
                                            <p className="text-xs mt-1">Нажмите "Изменить" чтобы добавить разделы.</p>
                                        </div>
                                    )}

                                    <div className="space-y-12">
                                        {selectedSpec.sections.map(section => (
                                            <div key={section.id} className="group">
                                                <h3 className="text-xl md:text-2xl font-black text-ios-primary mb-4 flex items-center gap-2">
                                                    {section.title}
                                                    <span className="h-px flex-1 bg-ios-border/50 rounded-full"></span>
                                                </h3>
                                                <div className="prose prose-base prose-slate max-w-none text-ios-secondary font-medium leading-loose bg-white p-6 rounded-3xl border border-white shadow-sm">
                                                    {/* Simple whitespace rendering for now, could be ReactMarkdown later */}
                                                    <div className="whitespace-pre-wrap">{section.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-ios-secondary/30 flex-col gap-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-ios-bg shadow-inner flex items-center justify-center">
                            <span className="text-4xl grayscale opacity-50">📚</span>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-lg">База знаний</p>
                            <p className="text-sm font-medium opacity-70 mt-1">Выберите документ для просмотра</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DocsManager;
