import React from 'react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;

    const handleLogin = () => {
        onLogin();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-zinc-900 border border-purple-500/30 p-8 rounded-2xl w-full max-w-md m-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-transparent border-none cursor-pointer"
                >
                    <iconify-icon icon="solar:close-circle-linear" width="24"></iconify-icon>
                </button>
                <h3 className="text-2xl font-bold text-white mb-4">Login</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Registered Phone Number"
                        className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-cyan-600 text-black font-bold py-3 rounded hover:bg-cyan-500 cursor-pointer border-none"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
