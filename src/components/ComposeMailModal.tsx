import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { Email } from '../types';

interface ComposeMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: Email) => void;
}

export default function ComposeMailModal({
  isOpen,
  onClose,
  onSend
}: ComposeMailModalProps) {
  const [sender, setSender] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<'primary' | 'social' | 'promotions' | 'updates'>('primary');
  const [failedAction, setFailedAction] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !subject || !body) return;

    // Build custom sandboxed item
    const newEmail: Email = {
      id: Date.now().toString(),
      sender,
      senderEmail: senderEmail || `${sender.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      subject,
      body,
      date: 'Just Now',
      category,
      status: 'unread',
      tags: ['Custom_Test'],
      previousFailedAction: failedAction || 'No auto-action was taken (unmanaged item).'
    };

    onSend(newEmail);
    // Reset
    setSender('');
    setSenderEmail('');
    setSubject('');
    setBody('');
    setFailedAction('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-2xl border border-slate-205 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Feed Customized Sandbox Email</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sender Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grandma Patel"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded px-2.5 py-1.5 font-medium text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sender Email</label>
              <input
                type="email"
                placeholder="e.g. grandma@gmail.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded px-2.5 py-1.5 font-medium text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject Line *</label>
              <input
                type="text"
                required
                placeholder="e.g. Weekend gathering planning"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded px-2.5 py-1.5 font-medium text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Gmail Category *</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded px-2 py-1.5 font-medium text-slate-800 outline-none"
              >
                <option value="primary">Primary Inbox</option>
                <option value="social">Social alerts</option>
                <option value="promotions">Promotions / SaaS</option>
                <option value="updates">Updates / Alert Console</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email Body Content *</label>
            <textarea
              required
              rows={4}
              placeholder="Hi Yves! I baked some sweet potato pies and want to bring some on Sunday. Let me know what time we can sync up..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded px-2.5 py-1.5 font-medium text-slate-800 outline-none resize-none"
            />
          </div>

          <div className="bg-red-50 border border-red-100 rounded-lg p-3">
            <label className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-red-800 mb-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-700" /> Simulate Former Faulty Action (Retraining Catalyst)
            </label>
            <input
              type="text"
              placeholder="e.g. Agent auto-declined Grandma: 'Client has busy slots, please buy calendars.'"
              value={failedAction}
              onChange={(e) => setFailedAction(e.target.value)}
              className="w-full bg-white border border-red-200 rounded px-2.5 py-1.5 text-xs text-red-900 outline-none focus:ring-1 focus:ring-red-400"
            />
          </div>

          <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
            >
              Discard Custom Email
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Inject sandboxed item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
