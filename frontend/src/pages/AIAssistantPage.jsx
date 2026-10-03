import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  AlertTriangle,
  Sparkles,
  User,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function AIAssistantPage({ onNavigate }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: (
        "👋 **Hello! I am your Medicare-AI Health Assistant.**\n\n"
        + "I can help explain medical terms, discuss symptoms, recommend appropriate doctor specialties, and offer safe self-care advice.\n\n"
        + "How are you feeling today?"
      ),
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [followUps, setFollowUps] = useState([
    "I have fever and headache.",
    "Can you explain normal blood pressure ranges?",
    "Which doctor should I see for persistent knee pain?",
    "What are safe remedies for throat irritation?"
  ]);

  // Speech Recognition & Synthesis
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom on message update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageToSend = inputMessage) => {
    const text = messageToSend.trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const resp = await api.sendChatMessage(text, conversationId, isListening);
      setConversationId(resp.conversation_id);
      setIsEmergency(resp.is_emergency);

      const assistantMsg = {
        role: 'assistant',
        content: resp.reply,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (resp.follow_up_questions && resp.follow_up_questions.length > 0) {
        setFollowUps(resp.follow_up_questions);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I am temporarily having trouble processing your request. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const content = messages.map(m => `[${m.role.toUpperCase()} - ${new Date(m.timestamp).toLocaleTimeString()}]:\n${m.content}\n`).join('\n---\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MedicareAI_Consultation_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  const handleNewChat = () => {
    setConversationId(null);
    setIsEmergency(false);
    setMessages([
      {
        role: 'assistant',
        content: "New health session started. Please share your symptoms or healthcare questions.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="space-y-4">
      
      <MedicalDisclaimer />

      {/* Emergency Alert Banner if triggered */}
      {isEmergency && (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-4 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              <div>
                <div className="font-black text-sm">POTENTIAL EMERGENCY DETECTED</div>
                <div className="text-xs">Your described symptoms indicate the need for urgent clinical care.</div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('emergency')}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
            >
              Emergency Mode SOS
            </button>
          </div>
        </div>
      )}

      {/* Chat Window Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col h-[75vh]">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Medicare-AI Assistant</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Safe clinical decision-support & health guidance
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
              title="Start New Session"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Session</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
              title="Export Conversation"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                )}

                <div
                  className={`relative max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Text to Speech Speaker Button on Assistant messages */}
                  {!isUser && (
                    <button
                      onClick={() => speakText(m.content)}
                      className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="h-4 w-4 text-emerald-500 animate-spin" />
              <span>Analyzing clinical knowledge base...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Follow-Ups */}
        {followUps.length > 0 && !loading && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 px-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Suggested Questions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {followUps.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-100 p-3 sm:p-4 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`rounded-xl p-3 transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title={isListening ? "Listening... Speak now" : "Start Voice Input"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Describe your symptoms or ask a health question..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="rounded-xl bg-emerald-600 p-3 text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
