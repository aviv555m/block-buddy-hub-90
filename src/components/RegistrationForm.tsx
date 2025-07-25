
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, GraduationCap, Calendar, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationFormProps {
  onRegistrationComplete: (userData: any) => void;
}

const RegistrationForm = ({ onRegistrationComplete }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    class: '',
    minecraftNickname: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const { toast } = useToast();

  // Validation functions
  const containsOffensiveWords = (text: string) => {
    const offensiveWords = ['badword1', 'badword2', 'spam', 'hack', 'cheat'];
    return offensiveWords.some(word => text.toLowerCase().includes(word));
  };

  const isValidMinecraftNickname = (nickname: string) => {
    // Minecraft nicknames: 3-16 characters, alphanumeric and underscore only
    const regex = /^[a-zA-Z0-9_]{3,16}$/;
    return regex.test(nickname) && !containsOffensiveWords(nickname);
  };

  const validateForm = () => {
    if (isLoginMode) {
      if (!formData.email || !formData.password) {
        toast({
          title: "Missing Information",
          description: "Please fill in your email and password.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      // Registration validation
      if (!formData.fullName || !formData.age || !formData.minecraftNickname || !formData.email || !formData.password) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return false;
      }

      if (containsOffensiveWords(formData.fullName)) {
        toast({
          title: "Invalid Name",
          description: "Please use appropriate language in your name.",
          variant: "destructive",
        });
        return false;
      }

      if (!isValidMinecraftNickname(formData.minecraftNickname)) {
        toast({
          title: "Invalid Minecraft Nickname",
          description: "Nickname must be 3-16 characters, alphanumeric and underscore only.",
          variant: "destructive",
        });
        return false;
      }

      const age = parseInt(formData.age);
      if (age < 8 || age > 18) {
        toast({
          title: "Age Restriction",
          description: "This server is for students aged 8-18 only.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submitted!', { formData, isLoginMode });
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (isLoginMode) {
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        } else if (data.user) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            toast({
              title: "Profile Error",
              description: "Failed to load user profile.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Successful! 🎉",
              description: "Welcome back to PicHunter Server!",
            });
            onRegistrationComplete(profile);
          }
        }
      } else {
        // Registration with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
              minecraft_username: formData.minecraftNickname,
              grade: formData.class || '',
            }
          }
        });

        if (error) {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          });
        } else if (data.user) {
          // Check if user needs email confirmation
          if (!data.session) {
            toast({
              title: "Registration Successful! 📧",
              description: "Please check your email to confirm your account.",
            });
          } else {
            // User is automatically logged in, fetch their profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              console.error('Profile fetch error:', profileError);
              // Create profile manually if it doesn't exist
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: formData.email,
                  full_name: formData.fullName,
                  minecraft_username: formData.minecraftNickname,
                  grade: formData.class || '',
                  is_admin: ['avivm0900@gmail.com', 'admin@test.com'].includes(formData.email)
                })
                .select()
                .single();

              if (insertError) {
                console.error('Profile creation error:', insertError);
                toast({
                  title: "Profile Error",
                  description: "Failed to create user profile.",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Registration Successful! 🎉",
                  description: "Welcome to PicHunter Server! You can now join the server.",
                });
                onRegistrationComplete(newProfile);
              }
            } else {
              toast({
                title: "Registration Successful! 🎉",
                description: "Welcome to PicHunter Server! You can now join the server.",
              });
              onRegistrationComplete(profile);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: isLoginMode ? "Failed to login. Please try again." : "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md minecraft-block border-4 border-minecraft-dirt shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-minecraft-grass rounded-lg flex items-center justify-center floating-animation">
            <div className="w-8 h-8 bg-minecraft-emerald rounded-sm"></div>
          </div>
          <CardTitle className="font-minecraft text-xl text-minecraft-dark">
            {isLoginMode ? 'Login to PicHunter' : 'Join PicHunter Server'}
          </CardTitle>
          <CardDescription className="font-pixel text-minecraft-dark/80">
            {isLoginMode ? 'Sign in to your account' : 'Register to access our Minecraft world'}
          </CardDescription>
          
          {/* Server IP Display */}
          <div className="bg-minecraft-dirt/20 p-3 rounded-lg border-2 border-minecraft-dirt/50">
            <p className="font-pixel text-sm text-minecraft-dark/70 mb-1">Server IP:</p>
            <code className="font-minecraft text-lg text-minecraft-dark bg-white/50 px-2 py-1 rounded">
              mode-pichunter.joinmc.link
            </code>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="font-pixel text-minecraft-dark flex items-center gap-2">
                    <User size={16} />
                    Full Name *
                  </Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="font-pixel border-2 border-minecraft-dirt focus:border-minecraft-grass"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="font-pixel text-minecraft-dark flex items-center gap-2">
                    <Calendar size={16} />
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="8"
                    max="18"
                    placeholder="Your age (8-18)"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="font-pixel border-2 border-minecraft-dirt focus:border-minecraft-grass"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class" className="font-pixel text-minecraft-dark flex items-center gap-2">
                    <GraduationCap size={16} />
                    Class/Grade (Optional)
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('class', value)}>
                    <SelectTrigger className="font-pixel border-2 border-minecraft-dirt focus:border-minecraft-grass">
                      <SelectValue placeholder="Select your class" />
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

                <div className="space-y-2">
                  <Label htmlFor="minecraft-nickname" className="font-pixel text-minecraft-dark flex items-center gap-2">
                    <Shield size={16} />
                    Minecraft Nickname *
                  </Label>
                  <Input
                    id="minecraft-nickname"
                    type="text"
                    placeholder="Your Minecraft username"
                    value={formData.minecraftNickname}
                    onChange={(e) => handleInputChange('minecraftNickname', e.target.value)}
                    className="font-pixel border-2 border-minecraft-dirt focus:border-minecraft-grass"
                    required
                  />
                  <p className="text-xs font-pixel text-minecraft-dark/60">
                    3-16 characters, letters, numbers, and underscore only
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-pixel text-minecraft-dark flex items-center gap-2">
                <Mail size={16} />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@school.edu"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="font-pixel border-2 border-minecraft-dirt focus:border-minecraft-grass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-pixel text-minecraft-dark flex items-center gap-2">
                <Shield size={16} />
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="font-pixel border-2 border-minecraft-dirt focus:border-minecraft-grass"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-minecraft-grass hover:bg-minecraft-grass/90 text-white font-minecraft text-sm px-6 py-3 transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-minecraft-dirt shadow-lg"
            >
              {isSubmitting ? 
                (isLoginMode ? 'Signing In...' : 'Creating Account...') : 
                (isLoginMode ? 'Sign In' : 'Join Server')
              }
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                console.log('Toggle button clicked!');
                setIsLoginMode(!isLoginMode);
              }}
              className="w-full font-pixel text-minecraft-dark/80 hover:text-minecraft-dark hover:bg-minecraft-grass/10"
            >
              {isLoginMode ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
