import React, { useState } from 'react';
import { signIn, signUp, sendPasswordReset } from '../services/firebaseService';
import { LogoIcon } from './icons/LogoIcon';

type AuthView = 'signIn' | 'signUp' | 'resetPassword' | 'resetSuccess';

export const Login: React.FC = () => {
  const [view, setView] = useState<AuthView>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError("Email is required.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'signUp') {
        if (!password) {
          setError("Password is required.");
          setIsLoading(false);
          return;
        }
        await signUp(email, password);
      } else if (view === 'signIn') {
         if (!password) {
          setError("Password is required.");
          setIsLoading(false);
          return;
        }
        await signIn(email, password);
      }
      // On success, onAuthChange in App.tsx will handle the redirect.
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!email) {
        setError("Please enter your email to reset your password.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordReset(email);
      setMessage("Password reset link sent! Please check your email inbox (and spam folder).");
      setView('resetSuccess');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    let errorMessage = "An unknown error occurred. Please try again.";
    if (err.code) {
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password.";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Please sign in.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters.";
          break;
        default:
          errorMessage = "Authentication failed. Please try again.";
          break;
      }
    }
    setError(errorMessage);
  }

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
  };
  
  const renderFormContent = () => {
    if (view === 'resetSuccess') {
      return (
        <div className="text-center">
          <p className="text-green-400 mb-6">{message}</p>
          <button onClick={() => switchView('signIn')} className="w-full font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none">
            Back to Sign In
          </button>
        </div>
      );
    }

    if (view === 'resetPassword') {
      return (
        <>
          <p className="text-text-secondary mb-8">Enter your email to receive a password reset link.</p>
          <form onSubmit={handlePasswordReset} className="space-y-6 text-left">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-bg-color border border-border-color rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
               <span className={isLoading ? 'opacity-0' : 'opacity-100'}>Send Reset Link</span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm">
            <button onClick={() => switchView('signIn')} className="font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none">
              Remember your password? Sign In
            </button>
          </p>
        </>
      );
    }
    
    // Default to signIn or signUp view
    const isSignUp = view === 'signUp';
    return (
      <>
        <p className="text-text-secondary mb-8">
            {isSignUp 
              ? 'Create an account to save your analysis history.' 
              : 'Sign in to access your analysis history.'}
        </p>
        <form onSubmit={handleAuthAction} className="space-y-6 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-bg-color border border-border-color rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
             <div className="flex items-center justify-between">
                <label htmlFor="password"className="block text-sm font-medium text-text-primary">Password</label>
                {!isSignUp && (
                    <button type="button" onClick={() => switchView('resetPassword')} className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                        Forgot Password?
                    </button>
                )}
              </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-bg-color border border-border-color rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={isSignUp ? "6+ characters required" : "••••••••"}
            />
          </div>
          {isSignUp && (
            <p className="text-xs text-text-secondary">
              By creating an account, you agree to our <a href="#" className="underline hover:text-text-primary">Terms & Conditions</a> and <a href="#" className="underline hover:text-text-primary">Privacy Policy</a>.
            </p>
          )}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-color focus:ring-emerald-500 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>
              {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
              )}
          </button>
        </form>
         <p className="mt-6 text-center text-sm">
          <button onClick={() => switchView(isSignUp ? 'signIn' : 'signUp')} className="font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md mx-auto bg-panel-color backdrop-blur-sm border border-border-color rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="flex justify-center items-center gap-3 mb-6">
            <LogoIcon className="w-10 h-10 text-emerald-400" />
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                Great Trades <span className="text-emerald-400">AI</span>
            </h1>
        </div>
        {renderFormContent()}
      </div>
      <footer className="absolute bottom-0 text-center p-4 text-text-secondary text-sm w-full">
        <p>Disclaimer: This is an AI-generated analysis and not financial advice. Always do your own research.</p>
        <p className="mt-2">The Website Created By Sujan Basu</p>
      </footer>
    </div>
  );
};