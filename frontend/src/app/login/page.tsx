'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(username, password);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] hero-bg">
        <div className="logo-container animate-pulse">
          <Image src="/logo.png" alt="Loading" width={80} height={80} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0f1a] relative overflow-hidden">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative hero-bg items-center justify-center p-12">
        {/* Background decorations */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#1e3a5f]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#d4a853]/15 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="logo-container mb-8 animate-float">
            <Image src="/logo.png" alt="G3 Edu" width={150} height={150} className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 animate-fadeIn">
            Bienvenue sur <span className="gradient-text">G3 Edu</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 animate-fadeIn-delay-1">
            Votre plateforme d&apos;apprentissage premium avec des cours exclusifs de haute qualité.
          </p>
          
          {/* Features */}
          <div className="space-y-4 text-left animate-fadeIn-delay-2">
            <div className="flex items-center gap-4 glass-gold rounded-xl p-4">
              <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Contenu exclusif</p>
                <p className="text-sm text-slate-400">Accédez à des cours uniques</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 glass rounded-xl p-4">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Sécurisé</p>
                <p className="text-sm text-slate-400">Session unique par utilisateur</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="logo-container inline-block mb-4">
              <Image src="/logo.png" alt="G3 Edu" width={80} height={80} />
            </div>
            <h1 className="text-2xl font-bold text-white">G3 Edu</h1>
            <p className="text-[#d4a853] text-sm">Excellence Éducative</p>
          </div>
          
          {/* Login Card */}
          <div className="glass rounded-3xl p-8 shadow-2xl animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Connexion</h2>
              <p className="text-slate-400">Entrez vos identifiants pour accéder à la plateforme</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fadeIn">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                  Identifiant
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre identifiant"
                  required
                  autoFocus
                  className="input"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    required
                    className="input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-gold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0a0f1a] border-t-transparent rounded-full animate-spin"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 glass-gold rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#d4a853] font-medium text-sm">Sécurité renforcée</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Une seule session active autorisée. Connexion depuis un autre appareil déconnectera celui-ci.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-8">
            © {new Date().getFullYear()} G3 Edu - Excellence Éducative
          </p>
        </div>
      </div>
    </div>
  );
}
