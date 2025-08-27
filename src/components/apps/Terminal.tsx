import { useState, useRef, useEffect } from 'react';

const Terminal = () => {
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([
    { command: '', output: 'Welcome to PenguinOS Terminal v1.0.0\nType "help" for available commands.\n' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, (args: string[]) => string> = {
    help: () => `Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  echo     - Print text to the terminal
  ls       - List directory contents
  cd       - Change directory
  pwd      - Print working directory
  date     - Show current date and time
  whoami   - Display current user
  uname    - Show system information
  cat      - Display file contents
  mkdir    - Create a directory
  touch    - Create a file`,
    
    clear: () => {
      setHistory([]);
      return '';
    },
    
    echo: (args) => args.join(' '),
    
    ls: () => `Desktop  Documents  Downloads  Music  Pictures  Videos`,
    
    cd: (args) => {
      if (!args[0]) {
        setCurrentDirectory('/home/user');
        return '';
      }
      if (args[0] === '..') {
        const parts = currentDirectory.split('/');
        parts.pop();
        setCurrentDirectory(parts.join('/') || '/');
        return '';
      }
      setCurrentDirectory(`${currentDirectory}/${args[0]}`);
      return '';
    },
    
    pwd: () => currentDirectory,
    
    date: () => new Date().toString(),
    
    whoami: () => 'user',
    
    uname: () => 'PenguinOS 1.0.0 GNU/Linux',
    
    cat: (args) => {
      if (!args[0]) return 'cat: missing file operand';
      return `cat: ${args[0]}: No such file or directory`;
    },
    
    mkdir: (args) => {
      if (!args[0]) return 'mkdir: missing operand';
      return `Directory '${args[0]}' created`;
    },
    
    touch: (args) => {
      if (!args[0]) return 'touch: missing file operand';
      return `File '${args[0]}' created`;
    }
  };

  const executeCommand = (cmd: string) => {
    const [command, ...args] = cmd.trim().split(' ');
    
    if (!command) return '';
    
    if (command in commands) {
      return commands[command](args);
    }
    
    return `${command}: command not found. Type "help" for available commands.`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const output = executeCommand(currentCommand);
    
    if (currentCommand !== 'clear') {
      setHistory([...history, { command: currentCommand, output }]);
    }
    
    setCurrentCommand('');
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      className="h-full bg-terminal-bg text-terminal-fg font-mono text-sm p-4 cursor-text overflow-hidden flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={terminalRef} className="flex-1 overflow-y-auto">
        {history.map((entry, index) => (
          <div key={index}>
            {entry.command && (
              <div className="flex gap-2">
                <span className="text-green-400">user@penguin</span>
                <span className="text-blue-400">~{currentDirectory.replace('/home/user', '')}</span>
                <span className="text-terminal-fg">$</span>
                <span>{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <div className="whitespace-pre-wrap mb-1">{entry.output}</div>
            )}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="text-green-400">user@penguin</span>
          <span className="text-blue-400">~{currentDirectory.replace('/home/user', '')}</span>
          <span className="text-terminal-fg">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            className="flex-1 bg-transparent outline-none text-terminal-fg"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};

export default Terminal;