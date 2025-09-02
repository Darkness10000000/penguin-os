import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Power, Users, Accessibility, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "Logging you in...",
        });
        onLogin(email);
      }
    } catch (error: any) {
      setIsShaking(true);
      toast({
        title: isSignUp ? "Sign up failed" : "Login failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setTimeout(() => setIsShaking(false), 500);
      if (!isSignUp) setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden">
      {/* Blurred background */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110"
        style={{ 
          backgroundImage: 'url(/src/assets/wallpaper.jpg)',
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

      {/* Login Panel */}
      <div 
        className={`relative bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-96 transition-all duration-300 ${
          isFocused ? 'transform -translate-y-2 shadow-3xl' : ''
        } ${isShaking ? 'animate-shake' : ''}`}
      >
        {/* User Avatar */}
        <div className="flex justify-center mb-6">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>
              <User className="w-12 h-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-foreground mb-6">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="pl-10 h-12 bg-background/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10 h-12 bg-background/50"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Login/Signup Button */}
          <Button
            onClick={handleAuth}
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </Button>

          {/* Toggle between login and signup */}
          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Other Options */}
        <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-border/50">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors group">
            <Users className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-accent transition-colors group">
            <Lock className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-accent transition-colors group">
            <Power className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-accent transition-colors group">
            <Accessibility className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>
      </div>

      {/* Time and Date */}
      <div className="absolute top-8 left-8 text-white">
        <div className="text-5xl font-light">
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-lg opacity-80 mt-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default Login;
