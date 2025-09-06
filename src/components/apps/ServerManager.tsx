import React, { useState, useEffect } from 'react';
import { Server, Activity, Users, HardDrive, Cpu, WifiIcon, Terminal, RefreshCw, Power, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ServerManagerProps {
  currentUser?: string;
  onEnterServerMode?: () => void;
}

const ServerManager: React.FC<ServerManagerProps> = ({ currentUser = 'admin', onEnterServerMode }) => {
  const { toast } = useToast();
  const [serverStartTime] = useState(new Date(Date.now() - Math.random() * 3600000));
  const [cpuUsage, setCpuUsage] = useState(25);
  const [memoryUsage, setMemoryUsage] = useState(45);
  const [diskUsage] = useState(62);
  const [networkTraffic, setNetworkTraffic] = useState({ in: 1250, out: 890 });
  const [activeConnections, setActiveConnections] = useState(5);
  const [services, setServices] = useState([
    { name: 'Web Server', status: 'running', port: 80, uptime: '2d 14h' },
    { name: 'Database', status: 'running', port: 5432, uptime: '2d 14h' },
    { name: 'SSH', status: 'running', port: 22, uptime: '2d 14h' },
    { name: 'FTP', status: 'stopped', port: 21, uptime: '-' },
    { name: 'Mail Server', status: 'running', port: 25, uptime: '1d 8h' },
  ]);
  const [logs] = useState([
    { time: '10:45:23', level: 'info', message: 'System backup completed successfully' },
    { time: '10:42:15', level: 'warning', message: 'High memory usage detected (85%)' },
    { time: '10:38:45', level: 'info', message: 'User admin logged in from 192.168.1.105' },
    { time: '10:35:12', level: 'error', message: 'Failed to connect to external API' },
    { time: '10:30:00', level: 'info', message: 'Scheduled maintenance task started' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.min(100, Math.max(10, cpuUsage + (Math.random() - 0.5) * 10)));
      setMemoryUsage(Math.min(100, Math.max(20, memoryUsage + (Math.random() - 0.5) * 5)));
      setNetworkTraffic({
        in: Math.max(100, networkTraffic.in + (Math.random() - 0.5) * 200),
        out: Math.max(100, networkTraffic.out + (Math.random() - 0.5) * 150),
      });
      setActiveConnections(Math.max(1, activeConnections + Math.floor((Math.random() - 0.5) * 3)));
    }, 3000);

    return () => clearInterval(interval);
  }, [cpuUsage, memoryUsage, networkTraffic, activeConnections]);

  const formatUptime = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleServiceToggle = (serviceName: string) => {
    setServices(services.map(service => {
      if (service.name === serviceName) {
        const newStatus = service.status === 'running' ? 'stopped' : 'running';
        toast({
          title: `Service ${newStatus === 'running' ? 'Started' : 'Stopped'}`,
          description: `${serviceName} has been ${newStatus === 'running' ? 'started' : 'stopped'} successfully.`,
        });
        return {
          ...service,
          status: newStatus,
          uptime: newStatus === 'running' ? '0m' : '-'
        };
      }
      return service;
    }));
  };

  const handleRestartServer = () => {
    toast({
      title: "Server Restart",
      description: "Server restart initiated. This may take a few moments...",
    });
  };

  const handleRefreshStats = () => {
    toast({
      title: "Stats Refreshed",
      description: "Server statistics have been updated.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'stopped': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full h-full bg-background text-foreground p-4 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Server Manager</h1>
              <p className="text-sm text-muted-foreground">PenguinOS Server Administration</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshStats}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {onEnterServerMode && (
              <Button variant="outline" size="sm" onClick={onEnterServerMode}>
                <Terminal className="w-4 h-4 mr-2" />
                Terminal Mode
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleRestartServer}>
              <Power className="w-4 h-4 mr-2" />
              Restart Server
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">ONLINE</div>
              <p className="text-xs text-muted-foreground">Uptime: {formatUptime(serverStartTime)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cpuUsage.toFixed(0)}%</div>
              <Progress value={cpuUsage} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Memory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memoryUsage.toFixed(0)}%</div>
              <Progress value={memoryUsage} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeConnections}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current server configuration and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Hostname</span>
                      <span className="font-mono">penguin-server</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">OS Version</span>
                      <span className="font-mono">PenguinOS Server 1.0.0</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Kernel</span>
                      <span className="font-mono">5.15.0-penguin</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Administrator</span>
                      <span className="font-mono">{currentUser}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-mono">192.168.1.100</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Disk Usage</span>
                      <span className="font-mono">{diskUsage}% (124GB / 200GB)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Load Average</span>
                      <span className="font-mono">0.45, 0.52, 0.48</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Last Backup</span>
                      <span className="font-mono">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Running Services</CardTitle>
                <CardDescription>Manage server services and daemons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services.map(service => (
                    <div key={service.name} className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${service.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">Port: {service.port} | Uptime: {service.uptime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={service.status === 'running' ? 'default' : 'secondary'}>
                          {service.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleServiceToggle(service.name)}
                        >
                          {service.status === 'running' ? 'Stop' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
                <CardDescription>Real-time network traffic and connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <WifiIcon className="w-4 h-4" />
                      Traffic
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Incoming</span>
                          <span className="font-mono">{(networkTraffic.in / 1000).toFixed(2)} MB/s</span>
                        </div>
                        <Progress value={(networkTraffic.in / 2000) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Outgoing</span>
                          <span className="font-mono">{(networkTraffic.out / 1000).toFixed(2)} MB/s</span>
                        </div>
                        <Progress value={(networkTraffic.out / 2000) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Connection Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Connections</span>
                        <span className="font-mono">{activeConnections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">HTTP Requests/min</span>
                        <span className="font-mono">245</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database Queries/min</span>
                        <span className="font-mono">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Packet Loss</span>
                        <span className="font-mono">0.01%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system events and messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 py-2 border-b font-mono text-sm">
                      <span className="text-muted-foreground">{log.time}</span>
                      <Badge variant="outline" className={getLogLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm">
                    Load More Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ServerManager;