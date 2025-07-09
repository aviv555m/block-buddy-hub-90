import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Download, Trash2, Edit, Shield, UserPlus, UserMinus, Settings, Save } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  age: string;
  class: string;
  minecraftNickname: string;
  email: string;
  registeredAt: string;
  status: 'active' | 'banned';
  isAdmin?: boolean;
}

interface AdminPanelProps {
  onLogout: () => void;
  onSettingsUpdate?: (settings: any) => void;
  serverSettings?: any;
}

const AdminPanel = ({ onLogout, onSettingsUpdate, serverSettings }: AdminPanelProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  
  // Server settings state
  const [serverIP, setServerIP] = useState(serverSettings?.serverIP || 'schoolcraft.example.com');
  const [discordLink, setDiscordLink] = useState(serverSettings?.discordLink || 'https://discord.gg/schoolcraft');
  const [rulesText, setRulesText] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    // Simulate fetching online count (in real app, this would call Minecraft API)
    setOnlineCount(Math.floor(Math.random() * 15) + 5);
    
    // Initialize rules text
    if (serverSettings?.rules) {
      const rulesString = serverSettings.rules.map((rule: any) => rule.rule).join('\n');
      setRulesText(rulesString);
    }
  }, [serverSettings]);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('serverUsers') || '[]');
    // Initialize admin status for existing users
    const usersWithAdminStatus = storedUsers.map((user: any) => ({
      ...user,
      status: (user.status as 'active' | 'banned') || 'active',
      isAdmin: user.isAdmin || user.email === 'avivm0900@gmail.com' || user.email === 'admin@test.com'
    }));
    
    // Ensure the main admins exist
    const adminEmails = ['avivm0900@gmail.com', 'admin@test.com'];
    adminEmails.forEach((email, index) => {
      const adminExists = usersWithAdminStatus.some((user: User) => user.email === email);
      if (!adminExists) {
        usersWithAdminStatus.push({
          id: `admin-${index}`,
          fullName: email === 'avivm0900@gmail.com' ? 'Main Admin' : 'Test Admin',
          age: '25',
          class: 'Admin',
          minecraftNickname: email === 'avivm0900@gmail.com' ? 'MainAdmin' : 'TestAdmin',
          email: email,
          registeredAt: new Date().toISOString(),
          status: 'active' as const,
          isAdmin: true
        });
      }
    });
    
    setUsers(usersWithAdminStatus);
    localStorage.setItem('serverUsers', JSON.stringify(usersWithAdminStatus));
  };

  const saveServerSettings = () => {
    const rules = rulesText.split('\n').filter(rule => rule.trim()).map((rule, index) => ({
      num: index + 1,
      rule: rule.trim()
    }));

    const newSettings = {
      serverIP,
      discordLink,
      rules
    };

    if (onSettingsUpdate) {
      onSettingsUpdate(newSettings);
    }

    toast({
      title: "Settings Saved",
      description: "Server settings have been updated successfully.",
    });
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.minecraftNickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteUser = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    
    if (userToDelete?.email === 'avivm0900@gmail.com') {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the main admin account.",
        variant: "destructive",
      });
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('serverUsers', JSON.stringify(updatedUsers));
      toast({
        title: "User Deleted",
        description: "User has been successfully removed.",
      });
    }
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === 'active' ? 'banned' as const : 'active' as const };
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem('serverUsers', JSON.stringify(updatedUsers));
    
    const user = updatedUsers.find(u => u.id === userId);
    toast({
      title: user?.status === 'banned' ? "User Banned" : "User Unbanned",
      description: `${user?.fullName} has been ${user?.status === 'banned' ? 'banned' : 'unbanned'}.`,
    });
  };

  const toggleAdminStatus = (userId: string) => {
    const userToToggle = users.find(user => user.id === userId);
    
    if (userToToggle?.email === 'avivm0900@gmail.com') {
      toast({
        title: "Cannot Modify",
        description: "Cannot remove admin privileges from the main admin.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, isAdmin: !user.isAdmin };
      }
      return user;
    });
    setUsers(updatedUsers);
    localStorage.setItem('serverUsers', JSON.stringify(updatedUsers));
    
    const user = updatedUsers.find(u => u.id === userId);
    toast({
      title: user?.isAdmin ? "Admin Added" : "Admin Removed",
      description: `${user?.fullName} has been ${user?.isAdmin ? 'granted' : 'removed from'} admin privileges.`,
    });
  };

  const addAdminByEmail = () => {
    if (!newAdminEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.map(user => {
      if (user.email === newAdminEmail) {
        return { ...user, isAdmin: true };
      }
      return user;
    });

    const userFound = users.some(user => user.email === newAdminEmail);
    if (!userFound) {
      toast({
        title: "User Not Found",
        description: "No user found with that email address.",
        variant: "destructive",
      });
      return;
    }

    setUsers(updatedUsers);
    localStorage.setItem('serverUsers', JSON.stringify(updatedUsers));
    setNewAdminEmail('');
    
    toast({
      title: "Admin Added",
      description: `User with email ${newAdminEmail} has been granted admin privileges.`,
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pichunter-users-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "User data has been exported successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-green-100 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/95 dark:bg-gray-800/95 shadow-2xl border-2 border-green-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Shield className="text-yellow-500" />
                  PicHunter Admin Panel
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Manage server users and settings
                </CardDescription>
              </div>
              <Button 
                onClick={onLogout}
                variant="destructive"
                className="font-medium"
              >
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Navigation Tabs */}
        <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
          <CardContent className="p-2">
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveTab('users')}
                variant={activeTab === 'users' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Users className="mr-2" size={16} />
                User Management
              </Button>
              <Button
                onClick={() => setActiveTab('settings')}
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Settings className="mr-2" size={16} />
                Server Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTab === 'users' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">{users.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users size={20} className="text-green-500" />
                    Online Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">{onlineCount}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Shield size={20} className="text-red-500" />
                    Banned Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">
                    {users.filter(u => u.status === 'banned').length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Shield size={20} className="text-yellow-500" />
                    Admins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">
                    {users.filter(u => u.isAdmin).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Admin Section */}
            <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Add Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address to make admin"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addAdminByEmail} className="bg-yellow-500 hover:bg-yellow-600">
                    <UserPlus size={16} className="mr-2" />
                    Add Admin
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">User Management</CardTitle>
                  <Button 
                    onClick={exportData}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Download size={16} className="mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-2">
                  <Search size={20} className="text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Name</th>
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Minecraft Nick</th>
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Email</th>
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Age</th>
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Class</th>
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Status</th>
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Role</th>
                        <th className="text-left p-2 font-bold text-gray-800 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="p-2 text-gray-800 dark:text-white">{user.fullName}</td>
                          <td className="p-2 text-gray-800 dark:text-white">{user.minecraftNickname}</td>
                          <td className="p-2 text-gray-800 dark:text-white text-sm">{user.email}</td>
                          <td className="p-2 text-gray-800 dark:text-white">{user.age}</td>
                          <td className="p-2 text-gray-800 dark:text-white">{user.class || 'N/A'}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.isAdmin 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                            }`}>
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1 flex-wrap">
                              <Button
                                onClick={() => toggleUserStatus(user.id)}
                                size="sm"
                                variant={user.status === 'active' ? 'destructive' : 'default'}
                                className="text-xs"
                              >
                                {user.status === 'active' ? 'Ban' : 'Unban'}
                              </Button>
                              <Button
                                onClick={() => toggleAdminStatus(user.id)}
                                size="sm"
                                variant={user.isAdmin ? 'secondary' : 'default'}
                                className="text-xs"
                                disabled={user.email === 'avivm0900@gmail.com'}
                              >
                                {user.isAdmin ? <UserMinus size={12} /> : <UserPlus size={12} />}
                              </Button>
                              <Button
                                onClick={() => deleteUser(user.id)}
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                                disabled={user.email === 'avivm0900@gmail.com'}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'settings' && (
          <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Server Settings</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Configure server IP, Discord link, and rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="server-ip" className="text-sm font-medium">Server IP Address</Label>
                <Input
                  id="server-ip"
                  value={serverIP}
                  onChange={(e) => setServerIP(e.target.value)}
                  placeholder="e.g., minecraft.yourserver.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord-link" className="text-sm font-medium">Discord Invite Link</Label>
                <Input
                  id="discord-link"
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  placeholder="e.g., https://discord.gg/yourserver"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules" className="text-sm font-medium">Server Rules</Label>
                <Textarea
                  id="rules"
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  placeholder="Enter each rule on a new line..."
                  rows={8}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter each rule on a new line. Emojis and formatting will be preserved.
                </p>
              </div>

              <Button onClick={saveServerSettings} className="w-full bg-green-500 hover:bg-green-600">
                <Save size={16} className="mr-2" />
                Save Server Settings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
