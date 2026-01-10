import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsProps {
    emailIntegration: { connected: boolean; email: string };
    onConnect: (email: string) => void;
    onDisconnect: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ emailIntegration, onConnect, onDisconnect }) => {
    const [loading, setLoading] = useState(false);
    const [inputEmail, setInputEmail] = useState('hr@talentai.com');

    const handleConnect = () => {
        setLoading(true);
        // Simulate OAuth delay
        setTimeout(() => {
            onConnect(inputEmail);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="p-8 max-w-4xl animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Settings</h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-50 rounded-full">
                        <Mail className="text-red-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Email Integration</h3>
                        <p className="text-slate-500 text-sm">Connect your Gmail account to send automated interview invites and rejection letters.</p>
                    </div>
                </div>

                {emailIntegration.connected ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-600" size={20} />
                            <div>
                                <p className="font-semibold text-green-900">Connected as {emailIntegration.email}</p>
                                <p className="text-xs text-green-700">TalentAI has permission to send emails on your behalf.</p>
                            </div>
                        </div>
                        <button 
                            onClick={onDisconnect}
                            className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 flex gap-2">
                             <AlertCircle size={16} className="shrink-0 mt-0.5" />
                             <p>You must connect an account to use the automated email features in the Candidates tab.</p>
                        </div>

                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gmail Address</label>
                            <input 
                                value={inputEmail}
                                onChange={(e) => setInputEmail(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <button 
                            onClick={handleConnect}
                            disabled={loading}
                            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                            Connect Gmail Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};