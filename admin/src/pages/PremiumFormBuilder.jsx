import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragOverlay,
   defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   verticalListSortingStrategy,
   useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
   Trash2,
   ChevronRight,
   ArrowLeft,
   Save,
   GripVertical,
   Type,
   Hash,
   AlignLeft,
   Eye,
   CheckSquare,
   Radio,
   ToggleRight,
   List,
   Tag,
   Upload,
   Calendar,
   MapPin,
   X,
   Sparkles,
   Zap,
   Undo2,
   Redo2,
   Monitor,
   Smartphone,
   Tablet,
   Maximize,
   Minimize,
   Workflow,
   Search,
   PanelLeftClose,
   PanelRightClose,
   PanelLeft,
   PanelRight,
   Layout,
   Wand2,
   FileText,
   Mail,
   Lock,
   Phone,
   Link,
   Clock,
   ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import '../premium-builder.css';

// --- Field Type Definitions & Protocol Groups ---
const FIELD_GROUPS = [
   {
      id: 'text_input',
      title: 'TEXT & INPUT PROTOCOL',
      fields: {
         text: { label: 'Text Input', icon: <Type size={14} /> },
         email: { label: 'Email Address', icon: <Mail size={14} /> },
         password: { label: 'Password Secure', icon: <Lock size={14} /> },
         phone: { label: 'Telephone', icon: <Phone size={14} /> },
         url: { label: 'URL Address', icon: <Link size={14} /> },
         search: { label: 'Search Bar', icon: <Search size={14} /> },
         textarea: { label: 'Textarea Multi', icon: <AlignLeft size={14} /> }
      }
   },
   {
      id: 'numeric_chrono',
      title: 'NUMERIC & CHRONO',
      fields: {
         number: { label: 'Number Field', icon: <Hash size={14} /> },
         date: { label: 'Date Picker', icon: <Calendar size={14} /> },
         datetime: { label: 'Date & Time', icon: <Clock size={14} /> },
         time: { label: 'Time Picker', icon: <Clock size={14} /> },
         month: { label: 'Month Picker', icon: <Calendar size={14} /> },
         week: { label: 'Week Picker', icon: <Calendar size={14} /> }
      }
   },
   {
      id: 'selection_protocol',
      title: 'SELECTION PROTOCOL',
      fields: {
         select: { label: 'Select Dropdown', icon: <ChevronDown size={14} /> },
         checkbox: { label: 'Checkbox Group', icon: <CheckSquare size={14} /> },
         radio: { label: 'Radio Group', icon: <Radio size={14} /> },
         switch: { label: 'Switch Toggle', icon: <ToggleRight size={14} /> }
      }
   },
   {
      id: 'transmission',
      title: 'TRANSMISSION',
      fields: {
         upload: { label: 'File Upload', icon: <Upload size={14} /> }
      }
   }
];

const FIELD_TYPES = FIELD_GROUPS.reduce((acc, group) => ({ ...acc, ...group.fields }), {});

// --- Sub-Component: Layer Item (Sidebar) ---
const LayerItem = ({ field, isActive, onSelect, onRemove, onRename }) => {
   const { isDarkMode } = useUI();
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field._id });
   const [isEditing, setIsEditing] = useState(false);
   const [tempLabel, setTempLabel] = useState(field.label);

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 100 : 1,
      opacity: isDragging ? 0.3 : 1,
   };

   const handleRename = () => {
      setIsEditing(false);
      if (tempLabel.trim() && tempLabel !== field.label) onRename(field._id, tempLabel);
   };

   return (
      <div
         ref={setNodeRef}
         style={style}
         className={`layer-item ${isActive ? 'active' : ''}`}
         onClick={() => onSelect(field._id)}
      >
         <div className="layer-icon" {...attributes} {...listeners} style={{ cursor: 'grab' }}>
            <GripVertical size={14} />
         </div>
         <div className="layer-icon">
            {FIELD_TYPES[field.fieldType]?.icon || <Type size={16} />}
         </div>
         <div className="flex-1 min-w-0">
            {isEditing ? (
               <input
                  autoFocus
                  className="layer-rename-input"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
               />
            ) : (
               <div className="flex flex-col" onDoubleClick={() => setIsEditing(true)}>
                  <span className="layer-label">
                     {field.label}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--builder-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                     {field.fieldType} node
                  </span>
               </div>
            )}
         </div>
         <div
            className="layer-action-btn"
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', opacity: 0.3 }}
            onClick={(e) => { e.stopPropagation(); onRemove(field._id); }}
         >
            <Trash2 size={14} />
         </div>
      </div>
   );
};

// --- Sub-Component: Canvas Sortable Component (Preview) ---
const CanvasSortableItem = ({ field, isActive, onSelect }) => {
   const { isDarkMode } = useUI();
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field._id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
      zIndex: isDragging ? 1000 : 1,
   };

   const renderMockInput = () => {
      switch (field.fieldType) {
         case 'text':
         case 'password':
         case 'number':
            return (
               <div className="field-visual-mock" style={{ minHeight: '54px', border: '2px solid var(--builder-border)', borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '0 20px', background: 'var(--builder-bg)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--builder-text-dim)', fontWeight: '600' }}>Enter {field.label.toLowerCase()} here...</span>
               </div>
            );

         case 'textarea':
            return (
               <div className="field-visual-mock" style={{ minHeight: '120px', border: '2px solid var(--builder-border)', borderRadius: '20px', display: 'flex', alignItems: 'flex-start', padding: '20px', background: 'var(--builder-bg)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--builder-text-dim)', fontWeight: '600', lineHeight: '1.6' }}>Detailed multi-line text input...</span>
               </div>
            );

         case 'editor':
            return (
               <div className="field-visual-mock" style={{ border: '2px solid var(--builder-border)', borderRadius: '16px', overflow: 'hidden', background: 'var(--builder-bg)' }}>
                  <div style={{ padding: '8px 14px', background: 'var(--builder-bg-soft)', borderBottom: '1px solid var(--builder-border)', display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold', color: 'var(--builder-text)' }}>
                     <span>B</span> <span>I</span> <span><u>U</u></span> <span>• List</span>
                  </div>
                  <div style={{ padding: '16px', minHeight: '70px', fontSize: '13px', color: 'var(--builder-text-dim)' }}>
                     Rich Text Form Editor content area...
                  </div>
               </div>
            );

         case 'rating':
            return (
               <div className="flex items-center gap-2" style={{ padding: '8px 0' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                     <Sparkles key={star} size={22} style={{ color: '#f59e0b', fill: star <= 4 ? '#f59e0b' : 'transparent' }} />
                  ))}
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--builder-text-dim)', marginLeft: '8px' }}>4.0 / 5 Stars</span>
               </div>
            );

         case 'feature':
            return (
               <div className="flex flex-wrap gap-2" style={{ padding: '4px 0' }}>
                  {['Free WiFi', 'Breakfast Included', 'Swimming Pool'].map((feat, i) => (
                     <span key={i} className="badge" style={{ background: 'var(--builder-primary-soft)', color: 'var(--builder-primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        ✓ {feat}
                     </span>
                  ))}
               </div>
            );

         case 'checkbox':
         case 'radio':
            return (
               <div className="toolbox-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: 0 }}>
                  {(field.config?.options?.length > 0 ? field.config.options : [{ label: 'Primary Data Node' }, { label: 'Secondary Data Node' }]).map((opt, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div style={{ width: '24px', height: '24px', borderRadius: field.fieldType === 'radio' ? '50%' : '8px', border: '2px solid var(--builder-border)', background: 'var(--builder-bg)' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--builder-text)' }}>{opt.label}</span>
                     </div>
                  ))}
               </div>
            );

         case 'switch':
            return (
               <div className="flex items-center gap-4">
                  <div className={`saas-switch ${field.isActive ? 'active' : ''}`}>
                     <div className="saas-switch-thumb" />
                  </div>
                  <div className="flex-col">
                     <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--builder-text-dim)', letterSpacing: '0.1em' }}>Logic Stream</span>
                     <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--builder-primary)' }}>{field.config?.inactiveLabel || 'Inactive'} :: DEFAULT_MODE</span>
                  </div>
               </div>
            );

         case 'upload':
            return (
               <div className="toolbox-item" style={{ width: '100%', padding: '40px', borderStyle: 'dashed', borderRadius: '32px' }}>
                  <Upload size={24} style={{ marginBottom: '16px', color: 'var(--builder-primary)' }} />
                  <div style={{ textAlign: 'center' }}>
                     <p style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Synchronize Assets</p>
                     <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--builder-text-dim)' }}>{field.config?.maxFiles || 5} Node Limit / Encrypted Transfer</p>
                  </div>
               </div>
            );

         case 'map':
            return (
               <div className="toolbox-item" style={{ width: '100%', height: '160px', padding: 0, overflow: 'hidden', position: 'relative', borderRadius: '24px' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'url(https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/0,0,1,0,0/400x200?access_token=none)', backgroundSize: 'cover', opacity: 0.2 }} />
                  <div className="flex-col items-center justify-center" style={{ position: 'relative', zIndex: 10 }}>
                     <MapPin size={24} style={{ color: '#10b981' }} />
                     <span className="badge" style={{ marginTop: '12px' }}>GIS_ENGINE_ACTIVE</span>
                  </div>
               </div>
            );

         case 'date':
            return (
               <div className="field-visual-mock" style={{ minHeight: '54px', border: '2px solid var(--builder-border)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'var(--builder-bg)' }}>
                  <div className="flex items-center gap-3">
                     <Calendar size={16} className="text-amber-500" />
                     <div className="flex-col">
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>Temporal Selection Placeholder</span>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--builder-text-dim)', textTransform: 'uppercase' }}>Constraint: {field.config?.pastLimit || 0}D Past / {field.config?.futureLimit || 365}D Future</span>
                     </div>
                  </div>
                  <ChevronRight size={16} style={{ opacity: 0.3 }} />
               </div>
            );

         default:
            return <div className="field-visual-mock" style={{ padding: '20px', border: '1px dashed var(--builder-border)', textAlign: 'center', color: 'var(--builder-text-dim)' }}>Abstract system node...</div>;
      }
   };

   return (
      <div
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...listeners}
         className={`canvas-field-wrapper ${isActive ? 'active' : ''}`}
         onClick={(e) => { e.stopPropagation(); onSelect(field._id); }}
      >
         {isActive && <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--builder-primary-soft)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />}

         <div className="flex justify-between items-start" style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            <div className="flex-col gap-2">
               <div className="flex items-center gap-3">
                  <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: isActive ? 'var(--builder-primary)' : 'var(--builder-text-dim)' }}>
                     {field.label} {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  {field.isRequired && <span className="badge" style={{ background: '#ef444410', color: '#ef4444', border: '1px solid #ef444420' }}>Required</span>}
               </div>
               <div style={{ height: '3px', width: isActive ? '80px' : '30px', background: isActive ? 'var(--builder-primary)' : 'var(--builder-border)', borderRadius: '10px', transition: 'all 0.4s' }} />
               {field.secondaryLabel && <span style={{ fontSize: '11px', color: 'var(--builder-text-dim)', fontStyle: 'italic', marginTop: '4px' }}>{field.secondaryLabel}</span>}
            </div>
            <div className="toolbox-icon" style={{ padding: '0', width: '40px', height: '40px', opacity: 0.4 }}>
               {FIELD_TYPES[field.fieldType]?.icon || <Workflow size={18} />}
            </div>
         </div>

         <div style={{ position: 'relative', zIndex: 1 }}>
            {renderMockInput()}
         </div>
      </div>
   );
};

// --- MAIN BUILDER COMPONENT ---
const PremiumFormBuilder = () => {
   const { serviceId } = useParams();
   const navigate = useNavigate();
   const { showToast } = useToast();
   const { isDarkMode } = useUI();

   const [fields, setFields] = useState([]);
   const [deletedIds, setDeletedIds] = useState([]);
   const [service, setService] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [selectedId, setSelectedId] = useState(null);
   const [activeId, setActiveId] = useState(null);

   const [history, setHistory] = useState([]);
   const [historyIndex, setHistoryIndex] = useState(-1);
   const [viewMode, setViewMode] = useState('desktop');
   const [activeTab, setActiveTab] = useState('props');
   const [zoomLevel, setZoomLevel] = useState(0.85);
   const [leftPanelOpen, setLeftPanelOpen] = useState(true);
   const [rightPanelOpen, setRightPanelOpen] = useState(true);
   const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
   const [aiPrompt, setAiPrompt] = useState('');
   const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
   const [livePreviewDevice, setLivePreviewDevice] = useState('desktop');

   // DnD Sensors
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
   );

   // Load Data
   const loadData = useCallback(async () => {
      try {
         setLoading(true);
         const [sRes, fRes] = await Promise.all([
            api.get('/services'),
            api.get(`/package-fields/setup/${serviceId}`)
         ]);
         const currentService = sRes.data.data.find(s => s._id === serviceId);
         setService(currentService);

         const sortedFields = fRes.data.data.sort((a, b) => a.order - b.order);
         setFields(sortedFields);
         setDeletedIds([]);
         addToHistory(sortedFields);
      } catch (err) {
         showToast('Error', 'Failed to initialize workspace', 'error');
      } finally {
         setLoading(false);
      }
   }, [serviceId]);

   useEffect(() => { loadData(); }, [loadData]);

   // History System
   const addToHistory = useCallback((currentFields) => {
      const serialized = JSON.stringify(currentFields);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(serialized);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
   }, [history, historyIndex]);

   const undo = () => {
      if (historyIndex > 0) {
         setFields(JSON.parse(history[historyIndex - 1]));
         setHistoryIndex(historyIndex - 1);
      }
   };

   const redo = () => {
      if (historyIndex < history.length - 1) {
         setFields(JSON.parse(history[historyIndex + 1]));
         setHistoryIndex(historyIndex + 1);
      }
   };

   const applyChange = (newFields) => {
      setFields(newFields);
      addToHistory(newFields);
   };

   const addField = (type = 'text') => {
      const newId = `temp_${Date.now()}`;
      const newField = {
         _id: newId,
         label: `New ${FIELD_TYPES[type].label}`,
         fieldName: `field_${fields.length + 1}_${Math.floor(Math.random() * 1000)}`,
         fieldType: type,
         isRequired: false,
         secondaryLabel: '',
         showInCard: false,
         order: fields.length,
         config: {
            minLength: 0, maxLength: 500, rows: 3,
            options: (type === 'radio' || type === 'checkbox') ? [{ label: 'Option 1', value: 'node_1', image: '' }] : [],
            searchable: false, multiple: false, withImage: false, minFiles: 1, maxFiles: 5, accept: ['image'],
            activeLabel: 'On', inactiveLabel: 'Off', pastLimit: 0, futureLimit: 365, disableWeekends: false,
            mapMode: 'coordinate', withSatellite: false, allowCustom: true
         }
      };
      applyChange([...fields, newField]);
      setSelectedId(newId);
   };

   const addSection = (type = 'group1') => {
      const timestamp = Date.now();
      let newGroup = [];

      if (type === 'group1') {
         newGroup = [
            {
               _id: `temp_header_${timestamp}`,
               label: 'Section Header',
               fieldName: `header_${timestamp}`,
               fieldType: 'section_header',
               isRequired: false,
               secondaryLabel: 'BootstrapMade Style Section',
               order: fields.length,
               config: {}
            },
            {
               _id: `temp_title_${timestamp}`,
               label: 'Section Title',
               fieldName: 'title',
               fieldType: 'text',
               isRequired: true,
               order: fields.length + 1,
               config: { minLength: 0, maxLength: 500 }
            },
            {
               _id: `temp_subtitle_${timestamp}`,
               label: 'Section Subtitle',
               fieldName: 'sub_title',
               fieldType: 'text',
               isRequired: false,
               order: fields.length + 2,
               config: { minLength: 0, maxLength: 500 }
            },
            {
               _id: `temp_shortdesc_${timestamp}`,
               label: 'Short Description',
               fieldName: 'short_desc',
               fieldType: 'textarea',
               isRequired: false,
               order: fields.length + 3,
               config: { rows: 2 }
            },
            {
               _id: `temp_desc_${timestamp}`,
               label: 'Full Description',
               fieldName: 'desc',
               fieldType: 'textarea',
               isRequired: false,
               order: fields.length + 4,
               config: { rows: 4 }
            }
         ];
      }

      applyChange([...fields, ...newGroup]);
      setSelectedId(newGroup[0]._id);
      showToast('Section Added', 'BootstrapMade Group 1 template initialized', 'success');
   };

   const generateWithAI = () => {
      if (!aiPrompt.trim()) return;

      const prompt = aiPrompt.toLowerCase();
      const timestamp = Date.now();
      let aiFields = [];

      if (prompt.includes('contact')) {
         aiFields = [
            { label: 'Contact Us', fieldType: 'section_header', secondaryLabel: 'We respond within 24 hours' },
            { label: 'Full Name', fieldName: 'name', fieldType: 'text', isRequired: true },
            { label: 'Email Address', fieldName: 'email', fieldType: 'text', isRequired: true },
            { label: 'Subject', fieldName: 'subject', fieldType: 'text' },
            { label: 'Message', fieldName: 'message', fieldType: 'textarea', config: { rows: 4 } }
         ];
      } else if (prompt.includes('register') || prompt.includes('signup')) {
         aiFields = [
            { label: 'Create Account', fieldType: 'section_header', secondaryLabel: 'Join our community' },
            { label: 'Username', fieldName: 'username', fieldType: 'text', isRequired: true },
            { label: 'Email', fieldName: 'email', fieldType: 'text', isRequired: true },
            { label: 'Password', fieldName: 'password', fieldType: 'text', isRequired: true },
            { label: 'Terms', fieldName: 'terms', fieldType: 'checkbox' }
         ];
      } else if (prompt.includes('booking') || prompt.includes('reservation')) {
         aiFields = [
            { label: 'Book Your Stay', fieldType: 'section_header', secondaryLabel: 'Check availability in real-time' },
            { label: 'Check-in Date', fieldName: 'checkin', fieldType: 'date', isRequired: true },
            { label: 'Check-out Date', fieldName: 'checkout', fieldType: 'date', isRequired: true },
            { label: 'Guests', fieldName: 'guests', fieldType: 'number' },
            { label: 'Room Type', fieldName: 'room_type', fieldType: 'select', config: { options: [{ label: 'Deluxe', value: 'deluxe' }, { label: 'Suite', value: 'suite' }] } }
         ];
      } else {
         const items = aiPrompt.split(',').map(s => s.trim());
         aiFields = [
            { label: 'Custom AI Layout', fieldType: 'section_header', secondaryLabel: 'Generated from your prompt' },
            ...items.map((item, idx) => ({
               label: item.charAt(0).toUpperCase() + item.slice(1),
               fieldName: item.toLowerCase().replace(/\s+/g, '_'),
               fieldType: 'text',
               order: fields.length + idx + 1
            }))
         ];
      }

      const processedFields = aiFields.map((f, i) => ({
         ...f,
         _id: `ai_${timestamp}_${i}`,
         order: fields.length + i
      }));

      applyChange([...fields, ...processedFields]);
      setIsAiPromptOpen(false);
      setAiPrompt('');
      showToast('AI Synchronized', 'Form manifest reconstructed', 'success');
   };

   const removeField = (id) => {
      if (!id.startsWith('temp_')) setDeletedIds(prev => [...prev, id]);
      applyChange(fields.filter(f => f._id !== id));
      if (selectedId === id) setSelectedId(null);
   };

   const updateField = (id, updates) => applyChange(fields.map(f => f._id === id ? { ...f, ...updates } : f));
   const updateConfig = (id, configUpdates) => applyChange(fields.map(f => f._id === id ? { ...f, config: { ...f.config, ...configUpdates } } : f));

   // --- Drag & Drop Handlers ---
   const handleDragStart = (event) => setActiveId(event.active.id);
   const handleDragEnd = (event) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
         const oldIndex = fields.findIndex(f => f._id === active.id);
         const newIndex = fields.findIndex(f => f._id === over.id);
         applyChange(arrayMove(fields, oldIndex, newIndex));
      }
      setActiveId(null);
   };

   const deployChanges = async () => {
      try {
         setSaving(true);
         const selectedFieldName = selectedField?.fieldName;

         for (const id of deletedIds) await api.delete(`/package-fields/${id}`);

         const updatedFields = [...fields];
         for (let i = 0; i < updatedFields.length; i++) {
            const field = { ...updatedFields[i], order: i, service: serviceId };
            if (field._id.startsWith('temp_')) {
               const { _id, ...postData } = field;
               const res = await api.post('/package-fields', postData);
               updatedFields[i] = res.data.data;
            } else {
               await api.put(`/package-fields/${field._id}`, field);
            }
         }

         const reorderPayload = updatedFields.map((f, i) => ({ id: f._id, order: i }));
         await api.put('/package-fields/reorder', { fields: reorderPayload });

         showToast('Deployed', 'Schema successfully synchronized', 'success');

         const fRes = await api.get(`/package-fields/setup/${serviceId}`);
         const freshFields = fRes.data.data.sort((a, b) => a.order - b.order);
         setFields(freshFields);
         setDeletedIds([]);
         addToHistory(freshFields);

         if (selectedFieldName) {
            const matchingField = freshFields.find(f => f.fieldName === selectedFieldName);
            if (matchingField) setSelectedId(matchingField._id);
         }

      } catch (err) {
         showToast('Sync Error', err.response?.data?.message || 'Sync failed', 'error');
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}><p className="text-indigo-400 font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">Initializing Architecture Studio...</p></div>;

   const selectedField = fields.find(f => f._id === selectedId);
   const activeField = fields.find(f => f._id === activeId);

   return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
         <div className={`builder-root-frame ${isDarkMode ? 'dark-mode' : ''}`}>
            <header className="builder-header">
               <div className="header-left">
                  <button className="back-btn" onClick={() => navigate('/packages/setup')}>
                     <ArrowLeft size={18} />
                  </button>
                  <div className="header-divider" />
                  <div className="project-info">
                     <p className="breadcrumb">LOGIC SUITE / {service?.title?.toUpperCase() || 'SCHEMA'}</p>
                     <h1 className="project-title">{service?.title} Schema Editor</h1>
                  </div>
                  <div className="header-divider" />
                  <button
                     className={`view-btn ${!leftPanelOpen ? 'active' : ''}`}
                     onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                     title={leftPanelOpen ? "Collapse Layers" : "Expand Layers"}
                  >
                     {leftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                  </button>
               </div>

               <div className="header-center">
                  <div className="view-selector" style={{ display: 'flex', gap: '4px', background: 'var(--builder-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--builder-border)' }}>
                     {[
                        { id: 'desktop', label: 'Desktop', icon: <Monitor size={15} /> },
                        { id: 'tablet', label: 'Tablet', icon: <Tablet size={15} /> },
                        { id: 'mobile', label: 'Mobile', icon: <Smartphone size={15} /> }
                     ].map(v => (
                        <button
                           key={v.id}
                           className={`view-btn ${viewMode === v.id ? 'active' : ''}`}
                           onClick={() => setViewMode(v.id)}
                           style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              background: viewMode === v.id ? 'var(--builder-primary)' : 'transparent',
                              color: viewMode === v.id ? '#ffffff' : 'var(--builder-text-muted)'
                           }}
                           title={`Switch to ${v.label} Viewport`}
                        >
                           {v.icon}
                           <span>{v.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="header-right">
                  <button
                     className={`view-btn ${isLivePreviewOpen ? 'active' : ''}`}
                     onClick={() => {
                        setLivePreviewDevice(viewMode);
                        setIsLivePreviewOpen(true);
                     }}
                     style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: '1px solid var(--builder-border)',
                        background: 'var(--builder-bg)',
                        color: 'var(--builder-text)',
                        cursor: 'pointer'
                     }}
                     title="Open Interactive Live Form Preview"
                  >
                     <Eye size={16} style={{ color: 'var(--builder-primary)' }} />
                     <span>Live Preview</span>
                  </button>
                  <div className="header-divider" />
                  <button
                     className={`view-btn ${!rightPanelOpen ? 'active' : ''}`}
                     onClick={() => setRightPanelOpen(!rightPanelOpen)}
                     title={rightPanelOpen ? "Collapse Inspector" : "Expand Inspector"}
                  >
                     {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
                  </button>
                  <div className="header-divider" />
                  <div className="history-btns">
                     <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
                     <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
                  </div>
                  <div className="header-divider" />
                  <button className="deploy-btn" onClick={deployChanges}>
                     {saving ? <Zap size={16} className="animate-spin" /> : <Save size={16} />}
                     <span>{saving ? 'Publishing...' : 'Publish Architecture'}</span>
                  </button>
               </div>
            </header>

            <main className="builder-body">
               <TransformWrapper
                  initialScale={0.85}
                  minScale={0.2}
                  maxScale={3}
                  centerOnInit={true}
                  limitToBounds={false}
                  onTransformed={(ref) => setZoomLevel(ref.state.scale)}
                  doubleClick={{ disabled: false }}
                  wheel={{ step: 0.1 }}
               >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                     <>
                        {/* Floating Zoom Controls */}
                        <div className="floating-zoom-controls">
                           <div className="zoom-display">{Math.round(zoomLevel * 100)}%</div>
                           <button onClick={() => zoomIn()} title="Zoom In">+</button>
                           <button onClick={() => zoomOut()} title="Zoom Out">-</button>
                           <button onClick={() => resetTransform()} title="Reset View"><Maximize size={14} /></button>
                        </div>

                        <aside
                           className={`layers-panel ${!leftPanelOpen ? 'collapsed' : ''}`}
                           style={{
                              width: leftPanelOpen ? '300px' : '0',
                              opacity: leftPanelOpen ? 1 : 0,
                              overflow: 'hidden',
                              borderRight: leftPanelOpen ? '1px solid var(--builder-border)' : '0px solid transparent',
                              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, border 0.3s ease'
                           }}
                        >
                           <div className="panel-header">
                              <h3>Design Tool Protocols</h3>
                              <div className="flex gap-2">
                                 <button
                                    onClick={() => setIsAiPromptOpen(!isAiPromptOpen)}
                                    style={{ background: isAiPromptOpen ? 'var(--builder-primary)' : 'transparent', color: isAiPromptOpen ? 'white' : 'var(--builder-primary)', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                                    title="Build with AI"
                                 >
                                    <Wand2 size={12} />
                                 </button>
                                 <Sparkles size={12} style={{ color: 'var(--builder-primary)' }} />
                              </div>
                           </div>

                           {isAiPromptOpen && (
                              <div style={{ padding: '15px', background: 'var(--builder-bg-soft)', borderBottom: '1px solid var(--builder-border)' }}>
                                 <p style={{ fontSize: '8px', fontWeight: '900', color: 'var(--builder-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>AI Architect</p>
                                 <textarea
                                    placeholder="e.g. A package setup form..."
                                    style={{ width: '100%', background: 'var(--builder-bg)', border: '1px solid var(--builder-border)', borderRadius: '8px', color: 'var(--builder-text)', fontSize: '11px', padding: '10px', minHeight: '60px', marginBottom: '10px' }}
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                 />
                                 <button
                                    className="w-full"
                                    style={{ background: 'var(--builder-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                                    onClick={generateWithAI}
                                 >
                                    Construct Form
                                 </button>
                              </div>
                           )}

                           {FIELD_GROUPS.map(group => (
                              <React.Fragment key={group.id}>
                                 <div className="panel-header">
                                    <h3>{group.title}</h3>
                                    <Sparkles size={12} style={{ color: 'var(--builder-primary)' }} />
                                 </div>
                                 <div className="toolbox-section">
                                    <div className="toolbox-grid">
                                       {Object.keys(group.fields).map(type => (
                                          <div key={type} className="toolbox-item" onClick={() => addField(type)}>
                                             <div className="toolbox-icon">
                                                {group.fields[type].icon}
                                             </div>
                                             <span>{group.fields[type].label}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </React.Fragment>
                           ))}

                           <div className="panel-header">
                              <h3>Project Hierarchy</h3>
                              <Search size={12} />
                           </div>

                           <div className="layers-list custom-scrollbar">
                              <SortableContext items={fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                                 {fields.map(f => (
                                    <LayerItem
                                       key={f._id}
                                       field={f}
                                       isActive={selectedId === f._id}
                                       onSelect={setSelectedId}
                                       onRemove={removeField}
                                       onRename={(id, label) => updateField(id, { label })}
                                    />
                                 ))}
                                 {fields.length === 0 && (
                                    <div className="manifest-empty">
                                       <Workflow size={40} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                       <p>Manifest Empty</p>
                                    </div>
                                 )}
                              </SortableContext>
                           </div>
                        </aside>

                        <section className="canvas-panel">
                           <TransformComponent
                              wrapperStyle={{
                                 width: "100%",
                                 height: "100%",
                                 cursor: "grab"
                              }}
                              contentStyle={{
                                 width: "fit-content",
                                 height: "fit-content",
                                 display: "flex",
                                 justifyContent: "center",
                                 alignItems: "center",
                                 padding: "200px"
                              }}
                           >
                              <div className="canvas-viewport">
                                 <div className={`canvas-card ${viewMode}`}>
                                    <div className="canvas-card-header">
                                       <div className="flex items-center gap-3">
                                          <div className="pulse-indicator" />
                                          <span className="badge">LOGIC_ENGINE_V2.4</span>
                                       </div>
                                       <span className="viewport-label">{viewMode.toUpperCase()} VIEWPORT</span>
                                    </div>

                                    <div className="canvas-content custom-scrollbar">
                                       <SortableContext items={fields.map(f => f._id)} strategy={verticalListSortingStrategy}>
                                          <div className="fields-stack">
                                             {fields.map(f => (
                                                <CanvasSortableItem key={f._id} field={f} isActive={selectedId === f._id} onSelect={setSelectedId} />
                                             ))}
                                             {fields.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-40 text-center">
                                                   <Sparkles size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
                                                   <button className="deploy-btn" onClick={() => addField('text')}>Spawn Base Input</button>
                                                </div>
                                             )}
                                          </div>
                                       </SortableContext>
                                    </div>
                                 </div>
                              </div>
                           </TransformComponent>
                        </section>

                        <aside
                           className={`inspector-panel ${!rightPanelOpen ? 'collapsed' : ''}`}
                           style={{
                              width: rightPanelOpen ? '340px' : '0',
                              opacity: rightPanelOpen ? 1 : 0,
                              overflow: 'hidden',
                              borderLeft: rightPanelOpen ? '1px solid var(--builder-border)' : '0px solid transparent',
                              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, border 0.3s ease'
                           }}
                        >
                           <div className="inspector-tabs">
                              <button className={activeTab === 'props' ? 'active' : ''} onClick={() => setActiveTab('props')}>Attributes</button>
                              <button className={activeTab === 'config' ? 'active' : ''} onClick={() => setActiveTab('config')}>Technical</button>
                           </div>

                           <div className="inspector-content custom-scrollbar">
                              {selectedField ? (
                                 <div className="section">
                                    {activeTab === 'props' ? (
                                       <div className="flex-col gap-6">
                                          <div className="control-group">
                                             <label>Field Identifier</label>
                                             <input value={selectedField.label} onChange={(e) => updateField(selectedField._id, { label: e.target.value })} />
                                          </div>
                                          <div className="control-group">
                                             <label>Secondary Descriptor</label>
                                             <input value={selectedField.secondaryLabel} onChange={(e) => updateField(selectedField._id, { secondaryLabel: e.target.value })} />
                                          </div>
                                          <div className="control-group">
                                             <label>Schema Mapping Key</label>
                                             <input value={selectedField.fieldName} onChange={(e) => updateField(selectedField._id, { fieldName: e.target.value })} />
                                          </div>
                                          <div className="control-group">
                                             <div className="flex items-center justify-between">
                                                <label style={{ margin: 0 }}>Mandatory Field</label>
                                                <div className={`saas-switch ${selectedField.isRequired ? 'active' : ''}`} onClick={() => updateField(selectedField._id, { isRequired: !selectedField.isRequired })}>
                                                   <div className="saas-switch-thumb" />
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    ) : (
                                       <div className="flex-col gap-6">
                                          {(selectedField.fieldType === 'radio' || selectedField.fieldType === 'checkbox') && (
                                             <div className="control-group">
                                                <label>Data Manifest Nodes</label>
                                                <button className="deploy-btn" style={{ width: '100%', marginBottom: '16px' }} onClick={() => updateConfig(selectedField._id, { options: [...selectedField.config.options, { label: 'New Node', value: 'node_' + Date.now(), image: '' }] })}>CONNECT NEW NODE +</button>
                                                <div className="manifest-node-list">
                                                   {selectedField.config.options.map((opt, idx) => (
                                                      <div key={idx} className="node-item">
                                                         <input className="flex-1" value={opt.label} onChange={(e) => {
                                                            const newOpts = [...selectedField.config.options];
                                                            newOpts[idx].label = e.target.value;
                                                            updateConfig(selectedField._id, { options: newOpts });
                                                         }} />
                                                         <button className="back-btn" style={{ width: '32px', height: '32px' }} onClick={() => {
                                                            const newOpts = selectedField.config.options.filter((_, i) => i !== idx);
                                                            updateConfig(selectedField._id, { options: newOpts });
                                                         }}><X size={14} /></button>
                                                      </div>
                                                   ))}
                                                </div>
                                             </div>
                                          )}
                                          {/* Add technical config for other fields here if needed */}
                                       </div>
                                    )}
                                 </div>
                              ) : (
                                 <div className="inspector-empty">
                                    <Search size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                    <p>Interrogation Neutral</p>
                                 </div>
                              )}
                           </div>
                        </aside>
                     </>
                  )}
               </TransformWrapper>
            </main>

            <DragOverlay dropAnimation={defaultDropAnimationSideEffects}>
               {activeId ? (
                  <div className="layer-item active" style={{ width: '280px', opacity: 0.9 }}>
                     <div className="layer-icon"><Workflow size={14} /></div>
                     <span className="layer-label">{fields.find(f => f._id === activeId)?.label}</span>
                  </div>
               ) : null}
            </DragOverlay>

            {/* INTERACTIVE LIVE PREVIEW MODAL */}
            {isLivePreviewOpen && (
               <div className="builder-preview-overlay">
                  <header className="builder-preview-header">
                     <div className="flex items-center gap-3">
                        <button
                           className="back-btn"
                           onClick={() => setIsLivePreviewOpen(false)}
                           title="Close Preview"
                        >
                           <X size={18} />
                        </button>
                        <div className="header-divider" />
                        <div>
                           <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: 'var(--builder-text)' }}>
                              Interactive Live Form Preview
                           </h3>
                           <p style={{ fontSize: '11px', color: 'var(--builder-text-muted)', margin: 0 }}>
                              Test field responses and layout across devices
                           </p>
                        </div>
                     </div>

                     <div className="view-selector" style={{ display: 'flex', gap: '4px', background: 'var(--builder-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--builder-border)' }}>
                        {[
                           { id: 'desktop', label: 'Desktop (960px)', icon: <Monitor size={15} /> },
                           { id: 'tablet', label: 'Tablet (768px)', icon: <Tablet size={15} /> },
                           { id: 'mobile', label: 'Mobile (390px)', icon: <Smartphone size={15} /> }
                        ].map(v => (
                           <button
                              key={v.id}
                              className={`view-btn ${livePreviewDevice === v.id ? 'active' : ''}`}
                              onClick={() => setLivePreviewDevice(v.id)}
                              style={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: '6px',
                                 padding: '6px 14px',
                                 borderRadius: '8px',
                                 fontSize: '12px',
                                 fontWeight: '700',
                                 border: 'none',
                                 cursor: 'pointer',
                                 background: livePreviewDevice === v.id ? 'var(--builder-primary)' : 'transparent',
                                 color: livePreviewDevice === v.id ? '#ffffff' : 'var(--builder-text-muted)'
                              }}
                           >
                              {v.icon}
                              <span>{v.label}</span>
                           </button>
                        ))}
                     </div>

                     <button
                        className="deploy-btn"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        onClick={() => setIsLivePreviewOpen(false)}
                     >
                        Close Preview
                     </button>
                  </header>

                  <div className="builder-preview-body">
                     <div className={`builder-preview-frame ${livePreviewDevice}`}>
                        {livePreviewDevice === 'mobile' && (
                           <div className="mobile-notch-bar" style={{ borderRadius: '24px 24px 0 0', margin: '-24px -16px 16px -16px' }}>
                              <span>9:41</span>
                              <div className="notch-camera" />
                              <div className="notch-status-icons">
                                 <span>5G</span>
                                 <div className="notch-battery" />
                              </div>
                           </div>
                        )}

                        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--builder-border)', paddingBottom: '16px' }}>
                           <span className="badge" style={{ background: 'var(--builder-primary-soft)', color: 'var(--builder-primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>
                              {livePreviewDevice.toUpperCase()} VIEWPORT ACTIVE
                           </span>
                           <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '12px', color: 'var(--builder-text)' }}>
                              {service?.title || 'Form'} Submission Form
                           </h2>
                           <p style={{ fontSize: '13px', color: 'var(--builder-text-muted)', margin: '4px 0 0 0' }}>
                              Fill out the form fields to test validation and submission behavior.
                           </p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); showToast('Form Test', 'Telemetry input validated successfully!', 'success'); }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              {fields.map((f) => (
                                 <div key={f._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--builder-text)' }}>
                                       {f.label} {f.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                                    </label>
                                    {f.secondaryLabel && <span style={{ fontSize: '11px', color: 'var(--builder-text-muted)' }}>{f.secondaryLabel}</span>}

                                    {f.fieldType === 'textarea' ? (
                                       <textarea
                                          placeholder={`Enter ${f.label.toLowerCase()}...`}
                                          required={f.isRequired}
                                          rows={f.config?.rows || 3}
                                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--builder-border)', background: 'var(--builder-bg)', color: 'var(--builder-text)', fontSize: '13px' }}
                                       />
                                    ) : f.fieldType === 'select' ? (
                                       <select
                                          required={f.isRequired}
                                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--builder-border)', background: 'var(--builder-bg)', color: 'var(--builder-text)', fontSize: '13px' }}
                                       >
                                          <option value="">Select option...</option>
                                          {f.config?.options?.map((opt, i) => (
                                             <option key={i} value={opt.value || opt.label}>{opt.label}</option>
                                          ))}
                                       </select>
                                    ) : f.fieldType === 'checkbox' || f.fieldType === 'radio' ? (
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          {(f.config?.options?.length > 0 ? f.config.options : [{ label: 'Option 1' }, { label: 'Option 2' }]).map((opt, i) => (
                                             <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--builder-text)', cursor: 'pointer' }}>
                                                <input type={f.fieldType} name={`preview_${f._id}`} value={opt.value || opt.label} />
                                                <span>{opt.label}</span>
                                             </label>
                                          ))}
                                       </div>
                                    ) : (
                                       <input
                                          type={['email', 'password', 'number', 'date', 'time', 'url'].includes(f.fieldType) ? f.fieldType : 'text'}
                                          placeholder={`Enter ${f.label.toLowerCase()}...`}
                                          required={f.isRequired}
                                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--builder-border)', background: 'var(--builder-bg)', color: 'var(--builder-text)', fontSize: '13px' }}
                                       />
                                    )}
                                 </div>
                              ))}
                           </div>

                           <button
                              type="submit"
                              className="deploy-btn"
                              style={{ width: '100%', marginTop: '28px', padding: '14px', borderRadius: '12px', justifyContent: 'center', fontSize: '14px' }}
                           >
                              Submit Telemetry Test
                           </button>
                        </form>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </DndContext>
   );
};

export default PremiumFormBuilder;
