
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PlayCircle, Loader2, CheckCircle, BarChart2 } from 'lucide-react';
import { chatWithHR } from '../services/geminiService';

interface VoiceScreeningProps {
    onComplete: (transcript: string, confidence: number) => void;
}

export const VoiceScreening: React.FC<VoiceScreeningProps> = ({ onComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [analyzing, setAnalyzing] = useState(false);
    const [completed, setCompleted] = useState(false);

    const recognitionRef = useRef<any>(null);

    const questions = [
        "Tell me about a challenging project you worked on recently.",
        "How do you handle tight deadlines or pressure?",
        "Why do you want to join our company?"
    ];

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev + ' ' + event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };
        } else {
            alert("Voice features not supported in this browser. Please use Chrome.");
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleNext = () => {
        if (isRecording) toggleRecording();
        
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(prev => prev + 1);
            // Add a separator in transcript for analysis
            setTranscript(prev => prev + ` [Answer to Q${questionIndex + 1} End] `);
        } else {
            finishScreening();
        }
    };

    const finishScreening = async () => {
        setAnalyzing(true);
        // Simulate AI Analysis of tone and content
        // In a real app, send transcript to backend/Gemini for sentiment analysis
        setTimeout(() => {
            const calculatedConfidence = Math.floor(Math.random() * (95 - 75) + 75); // Mock AI Score
            onComplete(transcript, calculatedConfidence);
            setAnalyzing(false);
            setCompleted(true);
        }, 2000);
    };

    if (completed) {
        return (
            <div className="text-center p-8 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Screening Complete</h3>
                <p className="text-emerald-700">Your responses have been analyzed by our AI Agent.</p>
            </div>
        );
    }

    if (analyzing) {
        return (
            <div className="text-center p-12">
                <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">AI is Analyzing your Voice...</h3>
                <p className="text-slate-500">Checking for confidence, clarity, and sentiment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${((questionIndex) / questions.length) * 100}%` }}
                />
            </div>

            <div className="text-center mb-8 mt-4">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">AI Voice Interviewer</span>
                <h2 className="text-2xl font-bold text-slate-800 mt-2">Question {questionIndex + 1} of {questions.length}</h2>
                <p className="text-lg text-slate-600 mt-4 font-medium">"{questions[questionIndex]}"</p>
            </div>

            <div className="flex justify-center mb-8">
                <button 
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                        ? 'bg-red-500 shadow-lg shadow-red-500/40 animate-pulse' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'
                    }`}
                >
                    {isRecording ? <MicOff className="text-white" size={32} /> : <Mic className="text-white" size={32} />}
                </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6 min-h-[100px] text-sm text-slate-600 italic border border-slate-200">
                {transcript || "Start speaking to see real-time transcription..."}
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={handleNext}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors flex items-center gap-2"
                >
                    {questionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                    <PlayCircle size={16} />
                </button>
            </div>
        </div>
    );
};
