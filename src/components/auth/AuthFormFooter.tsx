
import React from 'react';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthFormFooterProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
}

const AuthFormFooter = ({ mode, setMode }: AuthFormFooterProps) => {
  return (
    <div className="mt-6 text-center text-sm">
      {mode === 'login' ? (
        <p className="text-gray-700">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setMode('register')}
            className="text-black font-medium hover:underline"
          >
            Register
          </button>
        </p>
      ) : mode === 'register' ? (
        <p className="text-gray-700">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-black font-medium hover:underline"
          >
            Sign In
          </button>
        </p>
      ) : (
        <p className="text-gray-700">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-black font-medium hover:underline"
          >
            Back to Sign In
          </button>
        </p>
      )}
    </div>
  );
};

export default AuthFormFooter;
