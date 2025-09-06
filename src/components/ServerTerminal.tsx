import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface ServerTerminalProps {
  onOpenApp: (appName: string) => void;
  currentUser: string;
  serverStartTime: Date;
}

const ServerTerminal: React.FC<ServerTerminalProps> = ({ onOpenApp, currentUser, serverStartTime }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'PenguinOS Server Mode v1.0.0',
    'Type "help" for available commands',
    ''
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Parent will handle the escape key
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatUptime = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const parts = trimmedCmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1).join(' ');

    let output: string[] = [];

    switch (command) {
      case 'help':
        output = [
          'Available commands:',
          '  open <app>     - Open an application',
          '  check server   - Show server status',
          '  list apps      - List available applications',
          '  clear          - Clear terminal',
          '  exit           - Exit server mode',
          ''
        ];
        break;

      case 'open':
        if (args) {
          const appName = args.toLowerCase();
          const availableApps = ['terminal', 'files', 'firefox', 'settings', 'about', 'system heart', 'digital hearts', 'server manager'];
          
          if (availableApps.includes(appName)) {
            output = [`Opening ${args}...`];
            onOpenApp(args);
          } else {
            output = [`Error: Application "${args}" not found`, 'Use "list apps" to see available applications'];
          }
        } else {
          output = ['Usage: open <app_name>'];
        }
        break;

      case 'check':
        if (args === 'server') {
          const uptime = formatUptime(serverStartTime);
          const osStartTime = new Date(Date.now() - Math.random() * 86400000); // Simulated OS start time
          const osUptime = formatUptime(osStartTime);
          
          output = [
            '=== Server Status ===',
            `Server Version: PenguinOS Server 1.0.0`,
            `Server Uptime: ${uptime}`,
            `OS Uptime: ${osUptime}`,
            `Active Admin: ${currentUser}`,
            `Session Started: ${serverStartTime.toLocaleString()}`,
            `Server Status: ONLINE`,
            `CPU Usage: ${Math.floor(Math.random() * 30 + 10)}%`,
            `Memory Usage: ${Math.floor(Math.random() * 40 + 20)}%`,
            `Active Connections: ${Math.floor(Math.random() * 10 + 1)}`,
            ''
          ];
        } else {
          output = ['Usage: check server'];
        }
        break;

      case 'list':
        if (args === 'apps') {
          output = [
            'Available applications:',
            '  - terminal',
            '  - files',
            '  - firefox',
            '  - settings',
            '  - server manager',
            '  - about',
            '  - system heart',
            '  - digital hearts',
            ''
          ];
        } else {
          output = ['Usage: list apps'];
        }
        break;

      case 'clear':
        setHistory(['']);
        return;

      case 'exit':
        output = ['Exiting server mode...'];
        // The parent component should handle the actual exit
        break;

      case '':
        return;

      default:
        output = [`Command not found: ${command}`, 'Type "help" for available commands'];
    }

    setHistory([...history, `admin@penguin-server:~$ ${cmd}`, ...output]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[30000] bg-black flex flex-col">
      <div className="bg-gray-900 text-green-400 p-2 flex items-center gap-2 border-b border-gray-700">
        <TerminalIcon className="w-4 h-4" />
        <span className="text-sm font-mono">PenguinOS Server Terminal</span>
        <span className="ml-auto text-xs opacity-70">Press ESC to exit</span>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm text-green-400"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="mr-2">admin@penguin-server:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default ServerTerminal;