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
        if (args) {
          // Help for specific command
          const helpDetails: { [key: string]: string[] } = {
            'open': ['open <app> - Opens an application', 'Example: open terminal', 'Available apps: terminal, files, firefox, settings, about, system heart, digital hearts, server manager'],
            'check': ['check server - Shows detailed server status', 'Displays uptime, CPU, memory, and connection stats'],
            'list': ['list apps - Lists all available applications', 'list users - Shows connected users'],
            'update': ['update server - Checks for server updates', 'Scans for available system updates'],
            'install': ['install <app> - Installs an application', 'Example: install system-heart'],
            'uninstall': ['uninstall <app> - Removes an application', 'Example: uninstall digital-hearts'],
            'server': ['server logs - View recent server logs', 'Shows system events and errors'],
            'users': ['users - List connected users and admin privileges', 'Shows active sessions and permissions'],
            'network': ['network status - Display network activity', 'Shows connections, traffic, and IP information'],
            'shutdown': ['shutdown - Safely shutdown the server', 'Performs clean system shutdown'],
            'restart': ['restart - Restart the server', 'Performs system reboot'],
            'clear': ['clear - Clear the terminal screen'],
            'exit': ['exit - Exit server mode']
          };
          
          if (helpDetails[args]) {
            output = helpDetails[args];
          } else {
            output = [`No help available for command: ${args}`, 'Type "help" to see all commands'];
          }
        } else {
          output = [
            'Available commands:',
            '  open <app>        - Open an application',
            '  check server      - Show server status',
            '  list apps/users   - List applications or users',
            '  update server     - Check for server updates',
            '  install <app>     - Install an application',
            '  uninstall <app>   - Remove an application',
            '  server logs       - View server logs',
            '  users             - List connected users',
            '  network status    - Show network activity',
            '  shutdown          - Shutdown the server',
            '  restart           - Restart the server',
            '  clear             - Clear terminal',
            '  exit              - Exit server mode',
            '',
            'Type "help <command>" for detailed information'
          ];
        }
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
        } else if (args === 'users') {
          output = [
            '=== Connected Users ===',
            `admin (${currentUser}) - Active Session`,
            '  Privileges: Full Admin',
            '  IP: 192.168.1.100',
            '  Session Duration: ' + formatUptime(serverStartTime),
            '',
            'guest_user01 - Idle',
            '  Privileges: Read-Only',
            '  IP: 192.168.1.105',
            '  Session Duration: 15m 32s',
            ''
          ];
        } else {
          output = ['Usage: list apps | list users'];
        }
        break;

      case 'update':
        if (args === 'server') {
          output = [
            'Checking for server updates...',
            '',
            'Current Version: PenguinOS Server 1.0.0',
            'Latest Version: PenguinOS Server 1.0.0',
            '',
            '✓ Server is up to date',
            'Last checked: ' + new Date().toLocaleString(),
            ''
          ];
        } else {
          output = ['Usage: update server'];
        }
        break;

      case 'install':
        if (args) {
          const supportedApps = ['system-heart', 'digital-hearts', 'server-manager'];
          if (supportedApps.includes(args)) {
            output = [
              `Installing ${args}...`,
              'Downloading package...',
              'Extracting files...',
              'Configuring application...',
              `✓ ${args} installed successfully`,
              ''
            ];
            // Trigger actual installation
            if (args === 'system-heart') {
              localStorage.setItem('systemheart-installed', 'true');
              window.dispatchEvent(new Event('systemheart-installed'));
            } else if (args === 'digital-hearts') {
              localStorage.setItem('digitalhearts-installed', 'true');
              window.dispatchEvent(new Event('digitalhearts-installed'));
            } else if (args === 'server-manager') {
              localStorage.setItem('servermanager-installed', 'true');
              window.dispatchEvent(new Event('servermanager-installed'));
            }
          } else {
            output = [`Package "${args}" not found`, 'Available packages: system-heart, digital-hearts, server-manager'];
          }
        } else {
          output = ['Usage: install <app_name>'];
        }
        break;

      case 'uninstall':
        if (args) {
          const installedApps = ['system-heart', 'digital-hearts', 'server-manager'];
          if (installedApps.includes(args)) {
            output = [
              `Uninstalling ${args}...`,
              'Removing application files...',
              'Cleaning configuration...',
              `✓ ${args} uninstalled successfully`,
              ''
            ];
            // Trigger actual uninstallation
            if (args === 'system-heart') {
              localStorage.removeItem('systemheart-installed');
              window.dispatchEvent(new Event('systemheart-removed'));
            } else if (args === 'digital-hearts') {
              localStorage.removeItem('digitalhearts-installed');
              window.dispatchEvent(new Event('digitalhearts-removed'));
            } else if (args === 'server-manager') {
              localStorage.removeItem('servermanager-installed');
              window.dispatchEvent(new Event('servermanager-removed'));
            }
          } else {
            output = [`Application "${args}" is not installed`];
          }
        } else {
          output = ['Usage: uninstall <app_name>'];
        }
        break;

      case 'server':
        if (args === 'logs') {
          const now = new Date();
          output = [
            '=== Server Logs ===',
            `[${now.toISOString()}] INFO: Server running normally`,
            `[${new Date(now.getTime() - 120000).toISOString()}] INFO: User ${currentUser} logged in`,
            `[${new Date(now.getTime() - 300000).toISOString()}] WARNING: High memory usage detected (45%)`,
            `[${new Date(now.getTime() - 600000).toISOString()}] INFO: Automatic backup completed`,
            `[${new Date(now.getTime() - 900000).toISOString()}] INFO: Security scan completed - No threats found`,
            `[${new Date(now.getTime() - 1200000).toISOString()}] INFO: Server started`,
            ''
          ];
        } else {
          output = ['Usage: server logs'];
        }
        break;

      case 'users':
        output = [
          '=== User Management ===',
          `Active Admin: ${currentUser}`,
          '  Status: Online',
          '  Permissions: Full Control',
          '',
          'Other Users:',
          '  guest_user01 - Status: Idle',
          '  guest_user02 - Status: Offline',
          '',
          'Total Sessions: 3',
          'Active Sessions: 2',
          ''
        ];
        break;

      case 'network':
        if (args === 'status') {
          output = [
            '=== Network Status ===',
            'Network Interface: eth0',
            'IP Address: 192.168.1.100',
            'Gateway: 192.168.1.1',
            'DNS: 8.8.8.8, 8.8.4.4',
            '',
            'Traffic Statistics:',
            `  Incoming: ${Math.floor(Math.random() * 100 + 50)} MB`,
            `  Outgoing: ${Math.floor(Math.random() * 50 + 20)} MB`,
            `  Bandwidth Usage: ${Math.floor(Math.random() * 30 + 10)}%`,
            '',
            'Active Connections:',
            '  HTTP: 5',
            '  HTTPS: 12',
            '  SSH: 2',
            ''
          ];
        } else {
          output = ['Usage: network status'];
        }
        break;

      case 'shutdown':
        output = [
          'Initiating server shutdown...',
          'Saving current state...',
          'Closing active connections...',
          'Stopping services...',
          '',
          '⚠ Server will shutdown in 10 seconds',
          'Type "cancel" to abort'
        ];
        break;

      case 'restart':
        output = [
          'Initiating server restart...',
          'Saving current state...',
          'Preparing for restart...',
          '',
          '⚠ Server will restart in 10 seconds',
          'All connections will be temporarily interrupted',
          'Type "cancel" to abort'
        ];
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