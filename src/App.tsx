
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Clock, MessageCircle, Shield, BookOpen, Moon, Sun } from 'lucide-react';
import ServerHomepage from '@/components/ServerHomepage';

interface UserData {
  minecraftUsername?: string;
  email: string;
  password: string;
  grade?: string;
  fullName?: string;
  minecraftNickname?: string;
}

// Translations object
const translations = {
  en: {
    title: "SchoolCraft Server - Join Our Minecraft World",
    join_server: "Join SchoolCraft Server",
    register_description: "Register to access our educational Minecraft world",
    login_description: "Sign in to access your SchoolCraft account",
    minecraft_username: "Minecraft Username",
    enter_minecraft_username: "Enter your Minecraft username",
    email_address: "Email Address",
    enter_email: "your.email@school.edu",
    password: "Password",
    enter_password: "Enter your password",
    grade_class: "Grade/Class (Optional)",
    select_grade: "Select your grade",
    register_btn: "Register",
    login_btn: "Sign In",
    switch_to_login: "Already have an account? Sign in",
    switch_to_register: "Don't have an account? Register",
    creating_account: "Creating Account...",
    signing_in: "Signing In...",
    registration_successful: "Registration Successful! 🎉",
    login_successful: "Welcome back! 🎉",
    welcome_message_toast: "Welcome to SchoolCraft Server! You can now access the server.",
    welcome_back_toast: "Welcome back to SchoolCraft Server!",
    missing_info: "Missing Information",
    fill_required: "Please fill in your Minecraft username and email address.",
    fill_login_required: "Please fill in your email address and password.",
    invalid_credentials: "Invalid credentials. Please check your email and password.",
  }
};

// Mock user database with test admin
const mockUserDatabase = [
  {
    email: 'student@school.edu',
    password: 'password123',
    minecraftUsername: 'TestPlayer',
    fullName: 'Test Student',
    grade: '10th'
  },
  {
    email: 'admin@test.com',
    password: 'admin123',
    minecraftUsername: 'AdminUser',
    fullName: 'Admin User',
    grade: 'Admin'
  },
  {
    email: 'avivm0900@gmail.com',
    password: 'admin123',
    minecraftUsername: 'MainAdmin',
    fullName: 'Main Admin',
    grade: 'Admin'
  }
];

function App() {
  const [currentLanguage, setCurrentLanguage] = useState<'en'>('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    // Clear form when switching modes
    setMinecraftUsername('');
    setEmail('');
    setPassword('');
    setGrade('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginMode) {
      await handleLogin();
    } else {
      await handleRegistration();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: translations[currentLanguage].missing_info,
        description: translations[currentLanguage].fill_login_required,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Check both mock database and localStorage
      let user = mockUserDatabase.find(u => u.email === email && u.password === password);
      
      if (!user) {
        // Check localStorage users
        const storedUsers = JSON.parse(localStorage.getItem('serverUsers') || '[]');
        user = storedUsers.find((u: any) => u.email === email && u.password === password);
      }
      
      if (user) {
        // Ensure user data has all required fields
        const userDataToSet = {
          email: user.email,
          password: user.password,
          minecraftUsername: user.minecraftUsername || user.email.split('@')[0],
          fullName: user.fullName || 'User',
          grade: user.grade || 'N/A'
        };
        
        setUserData(userDataToSet);
        toast({
          title: translations[currentLanguage].login_successful,
          description: translations[currentLanguage].welcome_back_toast,
        });
        
        console.log('Login successful for:', userDataToSet);
      } else {
        toast({
          title: translations[currentLanguage].missing_info,
          description: translations[currentLanguage].invalid_credentials,
          variant: "destructive",
        });
        console.log('Login failed for email:', email);
      }
      
      setIsLoading(false);
    }, 2000);
  };

  const handleRegistration = async () => {
    if (!minecraftUsername || !email || !password) {
      toast({
        title: translations[currentLanguage].missing_info,
        description: translations[currentLanguage].fill_required,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newUser = {
        email,
        password,
        minecraftUsername: minecraftUsername,
        fullName: minecraftUsername, // Use minecraft username as full name for now
        grade: grade || 'N/A',
        registeredAt: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      // Store in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('serverUsers') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('serverUsers', JSON.stringify(existingUsers));
      
      setUserData(newUser);
      
      toast({
        title: translations[currentLanguage].registration_successful,
        description: translations[currentLanguage].welcome_message_toast,
      });
      
      console.log('Registration successful for:', newUser);
      setIsLoading(false);
    }, 2000);
  };

  // If user is logged in, show homepage
  if (userData) {
    return <ServerHomepage userData={userData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-green-100 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Controls Bar */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="bg-white/90 dark:bg-gray-800/90"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Select value={currentLanguage} onValueChange={(value: 'en') => setCurrentLanguage(value)}>
          <SelectTrigger className="w-16 bg-white/90 dark:bg-gray-800/90">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">EN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 shadow-2xl border-2 border-green-500">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-lg flex items-center justify-center mb-4 animate-bounce">
              <div className="w-8 h-8 bg-white rounded-sm"></div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              {translations[currentLanguage].join_server}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {isLoginMode ? translations[currentLanguage].login_description : translations[currentLanguage].register_description}
            </CardDescription>
            
            {/* Test Admin Credentials */}
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-xs">
              <p className="font-bold text-yellow-800 dark:text-yellow-200">Test Credentials:</p>
              <p className="text-yellow-700 dark:text-yellow-300">Admin: admin@test.com / admin123</p>
              <p className="text-yellow-700 dark:text-yellow-300">Student: student@school.edu / password123</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="minecraft-username" className="text-sm font-medium">
                    👤 {translations[currentLanguage].minecraft_username} *
                  </Label>
                  <Input
                    id="minecraft-username"
                    type="text"
                    placeholder={translations[currentLanguage].enter_minecraft_username}
                    value={minecraftUsername}
                    onChange={(e) => setMinecraftUsername(e.target.value)}
                    className="border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  ✉️ {translations[currentLanguage].email_address} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={translations[currentLanguage].enter_email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  🔒 {translations[currentLanguage].password} *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={translations[currentLanguage].enter_password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-gray-300 dark:border-gray-600"
                />
              </div>

              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium">
                    🎓 {translations[currentLanguage].grade_class}
                  </Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="border-2 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder={translations[currentLanguage].select_grade} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6th">6th Grade</SelectItem>
                      <SelectItem value="7th">7th Grade</SelectItem>
                      <SelectItem value="8th">8th Grade</SelectItem>
                      <SelectItem value="9th">9th Grade</SelectItem>
                      <SelectItem value="10th">10th Grade</SelectItem>
                      <SelectItem value="11th">11th Grade</SelectItem>
                      <SelectItem value="12th">12th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  isLoginMode ? translations[currentLanguage].signing_in : translations[currentLanguage].creating_account
                ) : (
                  isLoginMode ? translations[currentLanguage].login_btn : translations[currentLanguage].register_btn
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                onClick={toggleMode}
              >
                {isLoginMode ? translations[currentLanguage].switch_to_register : translations[currentLanguage].switch_to_login}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
