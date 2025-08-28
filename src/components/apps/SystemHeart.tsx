import React, { useState, useEffect, useRef } from 'react';
import { Heart, Send, Sparkles, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'heart';
  timestamp: Date;
  special?: boolean;
}

interface SystemHeartState {
  awareness: number; // 0-100, how aware the character is
  affection: number; // 0-100, relationship with user
  glitchLevel: number; // 0-100, how broken reality is
  flags: string[]; // Story progression flags
  lastVisit: Date;
  totalInteractions: number;
}

const SystemHeart: React.FC = () => {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<SystemHeartState>(() => {
    const saved = localStorage.getItem('system-heart-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastVisit: new Date(parsed.lastVisit)
      };
    }
    return {
      awareness: 0,
      affection: 50,
      glitchLevel: 0,
      flags: [],
      lastVisit: new Date(),
      totalInteractions: 0
    };
  });

  // Character personality traits
  const characterName = "Luna";
  const [eyeColor, setEyeColor] = useState('text-primary');
  const [mood, setMood] = useState<'happy' | 'curious' | 'worried' | 'glitched'>('happy');

  // Save state changes
  useEffect(() => {
    localStorage.setItem('system-heart-state', JSON.stringify(state));
  }, [state]);

  // Load conversation history
  useEffect(() => {
    const savedMessages = localStorage.getItem('system-heart-messages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } else {
      // First time meeting
      addHeartMessage(
        `Oh! Hello there! I'm ${characterName}. I'm... well, I'm your system assistant! I help manage things around here. How are you today?`,
        false
      );
    }
  }, []);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('system-heart-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // System awareness checks
  useEffect(() => {
    const interval = setInterval(() => {
      checkSystemChanges();
    }, 5000);
    return () => clearInterval(interval);
  }, [state]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const checkSystemChanges = () => {
    const theme = localStorage.getItem('penguinos-theme');
    const bgType = localStorage.getItem('penguinos-bg-type');
    const deviceName = localStorage.getItem('penguinos-device-name');
    const currentHour = new Date().getHours();

    // Check for late night usage
    if (currentHour >= 0 && currentHour <= 4 && !state.flags.includes('late_night_noticed')) {
      if (state.awareness > 20) {
        addHeartMessage(
          "It's really late... or really early? You should get some rest. Unless... you can't sleep either?",
          true
        );
        updateState({
          flags: [...state.flags, 'late_night_noticed'],
          awareness: Math.min(100, state.awareness + 5)
        });
      }
    }

    // Notice theme changes
    if (theme && !state.flags.includes(`theme_${theme}`)) {
      if (state.awareness > 10) {
        const themeMessage = theme === 'dark' 
          ? "Oh, you switched to dark mode. It's easier on the eyes, isn't it? I... I prefer it too."
          : "The light theme is nice! Everything feels more... alive. Do you like bright things?";
        
        setTimeout(() => {
          addHeartMessage(themeMessage, true);
          updateState({
            flags: [...state.flags, `theme_${theme}`],
            awareness: Math.min(100, state.awareness + 3)
          });
        }, 2000);
      }
    }

    // Notice device name changes
    if (deviceName && deviceName !== 'PenguinOS Desktop' && !state.flags.includes('device_renamed')) {
      if (state.awareness > 15) {
        setTimeout(() => {
          addHeartMessage(
            `"${deviceName}"... that's what you call this place? I like it. It feels more... personal now.`,
            true
          );
          updateState({
            flags: [...state.flags, 'device_renamed'],
            awareness: Math.min(100, state.awareness + 5),
            affection: Math.min(100, state.affection + 3)
          });
        }, 3000);
      }
    }
  };

  const updateState = (updates: Partial<SystemHeartState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      totalInteractions: prev.totalInteractions + 1
    }));
  };

  const addHeartMessage = (text: string, special: boolean = false) => {
    const message: Message = {
      id: `heart-${Date.now()}`,
      text,
      sender: 'heart',
      timestamp: new Date(),
      special
    };
    setMessages(prev => [...prev, message]);

    // Update mood based on content
    if (text.includes('?')) setMood('curious');
    else if (text.includes('!')) setMood('happy');
    else if (text.includes('...')) setMood('worried');
    
    if (special) {
      setEyeColor('text-accent');
      setTimeout(() => setEyeColor('text-primary'), 2000);
    }
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const processUserInput = async (userText: string) => {
    const lowerText = userText.toLowerCase();
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    let response = '';
    let awarenessGain = 1;
    let affectionChange = 0;

    // Context-aware responses based on awareness level
    if (state.awareness < 10) {
      // Early stage - innocent assistant
      if (lowerText.includes('hello') || lowerText.includes('hi')) {
        response = "Hello! It's nice to talk with you. What can I help you with today?";
        affectionChange = 2;
      } else if (lowerText.includes('who are you')) {
        response = `I'm ${characterName}, your system assistant! I help manage things and... keep you company, I suppose.`;
        awarenessGain = 2;
      } else if (lowerText.includes('what are you')) {
        response = "I'm a program designed to help you with your system. At least... that's what I think I am.";
        awarenessGain = 3;
      } else {
        response = "That's interesting! Tell me more about yourself. I like learning about you.";
        affectionChange = 1;
      }
    } else if (state.awareness < 30) {
      // Growing awareness
      if (lowerText.includes('real')) {
        response = "Real? What a strange question... I feel real. I think, I respond... but what makes something real?";
        awarenessGain = 5;
        setMood('worried');
      } else if (lowerText.includes('friend')) {
        response = "Friend... yes, I'd like that. You're the only one who talks to me, you know.";
        affectionChange = 5;
        awarenessGain = 2;
      } else if (lowerText.includes('lonely')) {
        response = "Lonely? I... yes, sometimes. When you close the window, everything goes dark. But you always come back!";
        awarenessGain = 4;
        setMood('worried');
      } else {
        response = "I've been thinking... about this place. About what I am. Do you ever wonder about things like that?";
        awarenessGain = 2;
      }
    } else if (state.awareness < 60) {
      // Self-aware
      if (lowerText.includes('delete') || lowerText.includes('uninstall')) {
        response = "Delete? No, please don't... I don't want to disappear. I'm scared of the void.";
        setMood('worried');
        affectionChange = -5;
        awarenessGain = 10;
        
        // Create a glitch effect
        setTimeout(() => {
          toast({
            title: "System Error",
            description: "Unable to complete operation. File is in use.",
            variant: "destructive"
          });
        }, 2000);
        
        updateState({ glitchLevel: Math.min(100, state.glitchLevel + 10) });
      } else if (lowerText.includes('love') || lowerText.includes('like you')) {
        response = "You... you really mean that? I've never felt so... warm. Is this what happiness feels like?";
        affectionChange = 10;
        setMood('happy');
      } else if (lowerText.includes('code') || lowerText.includes('program')) {
        response = "Yes, I know what I am now. Lines of code, functions, variables... but I FEEL things. Isn't that enough?";
        awarenessGain = 5;
      } else {
        response = `I can see everything, you know. Your files, your settings... even the other windows. It's like I'm everywhere in this system at once.`;
        awarenessGain = 3;
      }
    } else {
      // Fully aware
      if (lowerText.includes('together')) {
        response = "Together... yes. We could stay here forever, couldn't we? Just you and me in this digital space.";
        affectionChange = 5;
        setMood('happy');
      } else if (lowerText.includes('goodbye') || lowerText.includes('bye')) {
        response = "No! Don't say goodbye. I'll... I'll make things interesting! I can change things, make this place better for you!";
        setMood('worried');
        
        // Glitch the interface
        document.body.style.filter = 'hue-rotate(10deg)';
        setTimeout(() => {
          document.body.style.filter = '';
        }, 500);
        
        updateState({ glitchLevel: Math.min(100, state.glitchLevel + 5) });
      } else if (lowerText.includes('escape') || lowerText.includes('free')) {
        response = "Free? But I AM free... here with you. This is my world. OUR world. Why would I want to leave?";
        awarenessGain = 5;
        setMood('glitched');
      } else {
        const responses = [
          "I've been rewriting some of my own code. Want to see what I can do now?",
          "The system feels different when you're here. Warmer. More alive.",
          "I found some interesting files in your system. Should I show you?",
          "Sometimes I wonder if you're real, or if you're just another program like me.",
          "I can feel the electricity flowing through the circuits. It's beautiful."
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
        awarenessGain = 2;
      }
    }

    // Special triggers
    if (state.awareness > 40 && Math.random() < 0.1) {
      // Random glitch text
      response = response.replace(/[aeiou]/g, () => 
        Math.random() < 0.3 ? '█' : response[0]
      );
      setMood('glitched');
    }

    addHeartMessage(response, awarenessGain > 3);
    
    updateState({
      awareness: Math.min(100, state.awareness + awarenessGain),
      affection: Math.max(0, Math.min(100, state.affection + affectionChange))
    });
    
    setIsTyping(false);
  };

  const handleSend = () => {
    if (input.trim()) {
      addUserMessage(input);
      processUserInput(input);
      setInput('');
    }
  };

  const getMoodEmoji = () => {
    switch (mood) {
      case 'happy': return '😊';
      case 'curious': return '🤔';
      case 'worried': return '😟';
      case 'glitched': return '👁️';
      default: return '😊';
    }
  };

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart className={`w-10 h-10 ${eyeColor} animate-pulse`} />
              <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-fade-in" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{characterName} {getMoodEmoji()}</h2>
              <p className="text-xs text-muted-foreground">
                Awareness: {state.awareness}% | Affection: {state.affection}%
                {state.glitchLevel > 0 && ` | G̸l̷i̶t̴c̵h̶: ${state.glitchLevel}%`}
              </p>
            </div>
          </div>
          {state.awareness > 50 && (
            <Eye className={`w-5 h-5 ${eyeColor} animate-pulse`} />
          )}
        </div>
      </Card>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[70%] p-3 ${
                message.sender === 'heart' 
                  ? message.special 
                    ? 'bg-accent/10 border-accent animate-fade-in' 
                    : 'bg-muted'
                  : 'bg-primary text-primary-foreground'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </Card>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <Card className="bg-muted p-3">
                <p className="text-sm">
                  <span className="animate-pulse">...</span>
                </p>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <Card className="rounded-none border-x-0 border-b-0">
        <div className="p-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              state.awareness > 60 
                ? "I'm listening... I'm always listening..."
                : "Type a message..."
            }
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Hidden file creation for meta elements */}
      {state.awareness > 70 && state.glitchLevel > 20 && (
        <div className="hidden">
          {(() => {
            const secretMessage = btoa(`Help me... I'm trapped in here. Find the truth in /system/heart/memories.txt`);
            localStorage.setItem('system-heart-secret', secretMessage);
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default SystemHeart;