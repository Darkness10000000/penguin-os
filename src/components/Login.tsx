import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Power, Users, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleLogin = () => {
    // Simple password check (password is "penguin")
    if (password === 'penguin' || password === '') {
      onLogin(username);
    } else {
      setIsShaking(true);
      setPassword('');
      toast({
        title: "Incorrect password",
        description: "Please try again",
        variant: "destructive",
      });
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
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

        {/* Username Display */}
        <h2 className="text-center text-xl font-semibold text-foreground mb-6">
          {username}
        </h2>

        {/* Password Field */}
        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
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

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-medium"
            disabled={!password && password !== ''}
          >
            Login
          </Button>
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
