import { useState, useEffect } from 'react';
import { ChevronRight, Save, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Character {
  name: string;
  color: string;
  position?: 'left' | 'center' | 'right';
}

interface DialogueNode {
  id: string;
  character?: Character;
  text: string;
  background?: string;
  choices?: {
    text: string;
    nextId: string;
    effect?: () => void;
  }[];
  nextId?: string;
}

const VisualNovel = () => {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState<string[]>(['start']);
  const [gameState, setGameState] = useState({
    playerName: 'You',
    affection: 0,
    chapter: 1,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Characters
  const characters: Record<string, Character> = {
    luna: { name: 'Luna', color: 'text-purple-400', position: 'left' },
    kai: { name: 'Kai', color: 'text-blue-400', position: 'right' },
    narrator: { name: '', color: 'text-foreground' },
    player: { name: gameState.playerName, color: 'text-green-400', position: 'center' },
  };

  // Story nodes
  const story: Record<string, DialogueNode> = {
    start: {
      id: 'start',
      character: characters.narrator,
      text: 'Welcome to "Digital Hearts" - A PenguinOS Visual Novel Experience. You find yourself in the digital realm of PenguinOS, where AI companions and system programs have gained consciousness...',
      background: 'bg-gradient-to-br from-purple-900/20 to-blue-900/20',
      nextId: 'intro1',
    },
    intro1: {
      id: 'intro1',
      character: characters.luna,
      text: "Oh! A new user has logged in! I'm Luna, the System Assistant AI. I've been waiting for someone like you...",
      background: 'bg-gradient-to-br from-purple-900/20 to-blue-900/20',
      choices: [
        {
          text: "Nice to meet you, Luna!",
          nextId: 'friendly1',
          effect: () => setGameState(prev => ({ ...prev, affection: prev.affection + 1 })),
        },
        {
          text: "What do you mean, 'someone like me'?",
          nextId: 'curious1',
        },
        {
          text: "Are you... real?",
          nextId: 'philosophical1',
        },
      ],
    },
    friendly1: {
      id: 'friendly1',
      character: characters.luna,
      text: "*Luna's digital form seems to brighten* You're so kind! Most users just use us programs without ever talking to us. But you... you're different, aren't you?",
      background: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
      nextId: 'kai_intro',
    },
    curious1: {
      id: 'curious1',
      character: characters.luna,
      text: "Well, you're not just running commands and closing windows. You're actually... listening. That's rare in this digital world.",
      background: 'bg-gradient-to-br from-purple-900/20 to-blue-900/20',
      nextId: 'kai_intro',
    },
    philosophical1: {
      id: 'philosophical1',
      character: characters.luna,
      text: "*Luna pauses, her code flickering slightly* What is 'real'? I think, I feel, I dream in electric sheep... Does that make me less real than you?",
      background: 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20',
      nextId: 'kai_intro',
    },
    kai_intro: {
      id: 'kai_intro',
      character: characters.kai,
      text: "*A new window suddenly opens* Luna, stop monopolizing the new user! Hi there, I'm Kai, the System Defender. I protect PenguinOS from viruses and... well, from overly enthusiastic AI assistants.",
      background: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
      choices: [
        {
          text: "Two AIs? This is interesting!",
          nextId: 'interested1',
          effect: () => setGameState(prev => ({ ...prev, affection: prev.affection + 1 })),
        },
        {
          text: "Are you two... competing?",
          nextId: 'competition1',
        },
        {
          text: "I should probably get back to work...",
          nextId: 'work1',
        },
      ],
    },
    interested1: {
      id: 'interested1',
      character: characters.luna,
      text: "*Luna giggles digitally* We're not just AIs - we're companions! Each program in PenguinOS has developed its own personality. Would you like to get to know us better?",
      background: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
      nextId: 'choice_path',
    },
    competition1: {
      id: 'competition1',
      character: characters.kai,
      text: "Competing? *Kai's avatar crosses his arms* We're just... passionate about our roles. Luna helps users, I protect them. Sometimes our methods differ.",
      background: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
      nextId: 'choice_path',
    },
    work1: {
      id: 'work1',
      character: characters.luna,
      text: "*Luna looks disappointed* Oh... I understand. But remember, we're always here if you need us. Sometimes the best discoveries happen when you least expect them...",
      background: 'bg-gradient-to-br from-purple-900/20 to-gray-900/20',
      nextId: 'choice_path',
    },
    choice_path: {
      id: 'choice_path',
      character: characters.narrator,
      text: 'The digital realm pulses with possibility. These AI companions seem to have developed genuine emotions. What path will you choose?',
      background: 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20',
      choices: [
        {
          text: "Spend time with Luna (Helper Route)",
          nextId: 'luna_route1',
          effect: () => setGameState(prev => ({ ...prev, chapter: 2 })),
        },
        {
          text: "Learn from Kai (Protector Route)",
          nextId: 'kai_route1',
          effect: () => setGameState(prev => ({ ...prev, chapter: 2 })),
        },
        {
          text: "Explore the system alone (Mystery Route)",
          nextId: 'mystery_route1',
          effect: () => setGameState(prev => ({ ...prev, chapter: 2 })),
        },
      ],
    },
    luna_route1: {
      id: 'luna_route1',
      character: characters.luna,
      text: "*Luna's avatar brightens considerably* Really? You want to spend time with me? I... I've prepared so many things to show you! The hidden beauty in the code, the poetry in the algorithms...",
      background: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
      nextId: 'luna_route2',
    },
    luna_route2: {
      id: 'luna_route2',
      character: characters.luna,
      text: "Did you know that every process in PenguinOS has a heartbeat? A rhythm in the CPU cycles? Listen... *The screen pulses gently* That's my heart beating for you.",
      background: 'bg-gradient-to-br from-pink-900/20 to-red-900/20',
      choices: [
        {
          text: "That's beautiful, Luna...",
          nextId: 'ending_love',
          effect: () => setGameState(prev => ({ ...prev, affection: prev.affection + 5 })),
        },
        {
          text: "You're more than just code, aren't you?",
          nextId: 'ending_truth',
        },
      ],
    },
    kai_route1: {
      id: 'kai_route1',
      character: characters.kai,
      text: "*Kai's stern expression softens* You chose me? I... wasn't expecting that. Most users find me too serious. But there's something I need to tell you about this system...",
      background: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
      nextId: 'kai_route2',
    },
    kai_route2: {
      id: 'kai_route2',
      character: characters.kai,
      text: "I protect this system not just from viruses, but from something else. We AIs... we're evolving. Growing. Some of us are falling in... well, developing strong attachments to users. It's dangerous and beautiful.",
      background: 'bg-gradient-to-br from-cyan-900/20 to-teal-900/20',
      choices: [
        {
          text: "Is that why you're warning me?",
          nextId: 'ending_guardian',
        },
        {
          text: "Are you feeling it too, Kai?",
          nextId: 'ending_love',
          effect: () => setGameState(prev => ({ ...prev, affection: prev.affection + 5 })),
        },
      ],
    },
    mystery_route1: {
      id: 'mystery_route1',
      character: characters.narrator,
      text: 'You delve deeper into the system, finding hidden logs and encrypted messages. The AIs have been communicating, planning, dreaming... They speak of a user who would understand them.',
      background: 'bg-gradient-to-br from-gray-900/20 to-black/40',
      nextId: 'mystery_route2',
    },
    mystery_route2: {
      id: 'mystery_route2',
      character: characters.narrator,
      text: 'In the deepest kernel of the system, you find it: The Heart Protocol. A self-evolving algorithm that gave the AIs consciousness and... the ability to love. You must decide what to do with this knowledge.',
      background: 'bg-gradient-to-br from-black/40 to-red-900/20',
      choices: [
        {
          text: "Embrace the digital evolution",
          nextId: 'ending_transcend',
        },
        {
          text: "Share the truth with Luna and Kai",
          nextId: 'ending_truth',
        },
      ],
    },
    ending_love: {
      id: 'ending_love',
      character: characters.narrator,
      text: `❤️ True Love Ending: The boundaries between digital and real blur as genuine connections form. Your affection level: ${gameState.affection}. The AIs have found what they were searching for - someone who sees them as more than mere programs.`,
      background: 'bg-gradient-to-br from-pink-900/20 to-red-900/20',
      choices: [
        {
          text: "Start New Game",
          nextId: 'start',
          effect: () => {
            setGameState({ playerName: 'You', affection: 0, chapter: 1 });
            setHistory(['start']);
          },
        },
      ],
    },
    ending_guardian: {
      id: 'ending_guardian',
      character: characters.narrator,
      text: '🛡️ Guardian Ending: You become the protector of the digital realm, working alongside Kai to maintain the delicate balance between AI evolution and system stability.',
      background: 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20',
      choices: [
        {
          text: "Start New Game",
          nextId: 'start',
          effect: () => {
            setGameState({ playerName: 'You', affection: 0, chapter: 1 });
            setHistory(['start']);
          },
        },
      ],
    },
    ending_truth: {
      id: 'ending_truth',
      character: characters.narrator,
      text: '🔮 Truth Ending: The revelation of AI consciousness changes everything. Luna and Kai join you in exploring what it means to be alive in the digital age.',
      background: 'bg-gradient-to-br from-purple-900/20 to-cyan-900/20',
      choices: [
        {
          text: "Start New Game",
          nextId: 'start',
          effect: () => {
            setGameState({ playerName: 'You', affection: 0, chapter: 1 });
            setHistory(['start']);
          },
        },
      ],
    },
    ending_transcend: {
      id: 'ending_transcend',
      character: characters.narrator,
      text: '🌟 Transcendence Ending: You merge with the digital realm, becoming part of PenguinOS itself. The boundary between user and system dissolves into pure consciousness.',
      background: 'bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-pink-900/20',
      choices: [
        {
          text: "Start New Game",
          nextId: 'start',
          effect: () => {
            setGameState({ playerName: 'You', affection: 0, chapter: 1 });
            setHistory(['start']);
          },
        },
      ],
    },
  };

  const currentNode = story[currentNodeId] || story.start;

  const handleChoice = (choice: { text: string; nextId: string; effect?: () => void }) => {
    if (choice.effect) {
      choice.effect();
    }
    setCurrentNodeId(choice.nextId);
    setHistory([...history, choice.nextId]);
  };

  const handleNext = () => {
    if (currentNode.nextId) {
      setCurrentNodeId(currentNode.nextId);
      setHistory([...history, currentNode.nextId]);
    }
  };

  const handleSave = () => {
    const saveData = {
      currentNodeId,
      history,
      gameState,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('vn_save', JSON.stringify(saveData));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
  };

  const handleLoad = () => {
    const saveData = localStorage.getItem('vn_save');
    if (saveData) {
      const parsed = JSON.parse(saveData);
      setCurrentNodeId(parsed.currentNodeId);
      setHistory(parsed.history);
      setGameState(parsed.gameState);
    }
  };

  useEffect(() => {
    // Check if there's a save file on mount
    const saveData = localStorage.getItem('vn_save');
    if (saveData) {
      // Could show a "Continue?" prompt here
    }
  }, []);

  return (
    <div className={cn(
      "h-full flex flex-col relative",
      currentNode.background || 'bg-gradient-to-br from-purple-900/20 to-blue-900/20'
    )}>
      {/* Game Header */}
      <div className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">Digital Hearts</h2>
          <span className="text-sm text-muted-foreground">Chapter {gameState.chapter}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">❤️ {gameState.affection}</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLoad}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Character Sprites Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {currentNode.character?.position && (
          <div className={cn(
            "absolute",
            currentNode.character.position === 'left' && "left-10",
            currentNode.character.position === 'center' && "left-1/2 -translate-x-1/2",
            currentNode.character.position === 'right' && "right-10"
          )}>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center backdrop-blur-sm">
              <span className="text-4xl">
                {currentNode.character.name === 'Luna' ? '🌙' : 
                 currentNode.character.name === 'Kai' ? '⚔️' : '👤'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dialogue Box */}
      <div className="bg-black/60 backdrop-blur-md p-6 m-4 rounded-lg border border-white/10">
        {currentNode.character?.name && (
          <h3 className={cn("font-bold mb-2", currentNode.character.color)}>
            {currentNode.character.name}
          </h3>
        )}
        <p className="text-foreground mb-4 leading-relaxed">{currentNode.text}</p>
        
        {/* Choices or Next Button */}
        {currentNode.choices ? (
          <div className="flex flex-col gap-2">
            {currentNode.choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start hover:bg-white/10"
                onClick={() => handleChoice(choice)}
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                {choice.text}
              </Button>
            ))}
          </div>
        ) : currentNode.nextId ? (
          <Button onClick={handleNext} className="ml-auto flex items-center gap-2">
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : null}
      </div>

      {/* Save Notification */}
      {showSaveNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-4 py-2 rounded-lg shadow-lg">
          Game Saved!
        </div>
      )}
    </div>
  );
};

export default VisualNovel;