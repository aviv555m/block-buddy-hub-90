
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Clock, MessageCircle, Shield, BookOpen, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminPanel from './AdminPanel';

interface ServerHomepageProps {
  userData: any;
}

const ServerHomepage = ({ userData }: ServerHomepageProps) => {
  const [onlineCount, setOnlineCount] = useState(12);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [serverSettings, setServerSettings] = useState({
    serverIP: 'mode-pichunter.joinmc.link',
    discordLink: 'https://discord.gg/schoolcraft',
    rules: [
      { num: 1, rule: "🏠 No griefing or destroying other players' builds" },
      { num: 2, rule: "💬 Keep chat friendly and respectful" },
      { num: 3, rule: "🤝 Help other students when they need it" },
      { num: 4, rule: "🎯 Stay in designated areas during class time" },
      { num: 5, rule: "🚫 No inappropriate builds or language" },
      { num: 6, rule: "📚 Educational projects take priority" },
      { num: 7, rule: "⚡ Ask permission before using redstone in shared areas" },
      { num: 8, rule: "🎮 Have fun and be creative!" },
    ]
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load server settings
    const savedSettings = localStorage.getItem('serverSettings');
    if (savedSettings) {
      setServerSettings(JSON.parse(savedSettings));
    }

    // Simulate server status updates
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 20) + 5);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const copyServerIP = async () => {
    try {
      await navigator.clipboard.writeText(serverSettings.serverIP);
      toast({
        title: "Copied! 📋",
        description: "Server IP copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the IP manually",
        variant: "destructive",
      });
    }
  };

  const handleAdminPanelAccess = () => {
    // Check if user has admin email
    const adminEmails = ['avivm0900@gmail.com', 'admin@test.com'];
    const isAdmin = adminEmails.includes(userData.email);
    
    if (isAdmin) {
      setShowAdminPanel(true);
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions to access this panel.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout Error",
          description: "An error occurred during logout.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAdminLogout = () => {
    setShowAdminPanel(false);
  };

  const handleServerSettingsUpdate = (newSettings: any) => {
    setServerSettings(newSettings);
    localStorage.setItem('serverSettings', JSON.stringify(newSettings));
  };

  if (showAdminPanel) {
    return <AdminPanel onLogout={handleAdminLogout} onSettingsUpdate={handleServerSettingsUpdate} serverSettings={serverSettings} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-green-100 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Card className="bg-white/95 dark:bg-gray-800/95 shadow-2xl border-2 border-green-500">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-lg flex items-center justify-center mb-4 animate-bounce">
              <div className="w-8 h-8 bg-white rounded-sm"></div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome to PicHunter Server!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              Hey {userData.minecraftNickname || userData.fullName || userData.email}! Ready to build and learn together?
              {(() => {
                const adminEmails = ['avivm0900@gmail.com', 'admin@test.com'];
                const isAdmin = adminEmails.includes(userData.email);
                return isAdmin && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                      <Shield size={12} className="mr-1" />
                      Admin Access
                    </span>
                  </div>
                );
              })()}
            </CardDescription>
            
            {/* Debug Info */}
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              <p>Debug: Email: {userData.email}</p>
              <p>Debug: Is Admin: {['avivm0900@gmail.com', 'admin@test.com'].includes(userData.email).toString()}</p>
              <p>Debug: Username: {userData.minecraftNickname || userData.fullName}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 justify-center">
              <Button 
                onClick={handleAdminPanelAccess}
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                <Settings className="mr-2" size={16} />
                Admin Panel
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click to access admin panel (admin email required)
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Server Connection */}
          <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Shield className="text-blue-500" />
                Server Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Server IP:</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded flex-1">
                    {serverSettings.serverIP}
                  </code>
                  <Button
                    onClick={copyServerIP}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <p><strong>1.</strong> Open Minecraft Java Edition</p>
                <p><strong>2.</strong> Click "Multiplayer"</p>
                <p><strong>3.</strong> Click "Add Server"</p>
                <p><strong>4.</strong> Paste the server IP above</p>
                <p><strong>5.</strong> Click "Done" and connect!</p>
              </div>
            </CardContent>
          </Card>

          {/* Server Status */}
          <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Users className="text-green-500" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Online</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300">
                  <span>Players Online:</span>
                  <span>{onlineCount}/50</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(onlineCount / 50) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 font-medium text-gray-500 dark:text-gray-400 text-sm">
                <Clock size={14} />
                <span>Updated {new Date().toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Server Rules */}
        <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BookOpen className="text-yellow-500" />
              Server Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serverSettings.rules.map((item) => (
                <div key={item.num} className="flex items-start gap-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                  <span className="font-bold text-green-500 min-w-[20px]">{item.num}.</span>
                  <span>{item.rule}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community */}
        <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <MessageCircle className="text-purple-500" />
              Join Our Community
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Connect with classmates, share builds, and get server updates!
            </p>
            <Button 
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold"
              onClick={() => window.open(serverSettings.discordLink, '_blank')}
            >
              🔗 Join Discord Server
            </Button>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">Quick Tips:</h4>
              <div className="space-y-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                <p>• Use /help for in-game commands</p>
                <p>• Ask staff for building permissions</p>
                <p>• Share screenshots in Discord!</p>
                <p>• Report issues to administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerHomepage;
