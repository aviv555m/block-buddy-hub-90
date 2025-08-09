import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, AlertTriangle, Home, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  minecraft_username?: string | null;
  full_name?: string | null;
  grade?: string | null;
  is_admin: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

const AdminPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // SEO: basic title for the page
  useEffect(() => {
    document.title = 'Admin Panel - User Management';
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user;
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        setCurrentEmail(user.email || '');

        // Check admin permissions
        const { data: profile, error: profErr } = await (supabase as any)
          .from('profiles')
          .select('id,email,is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (profErr) {
          console.error('Profile load error', profErr);
        }

        if (!profile?.is_admin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        setIsAdmin(true);

        // Load all users
        const { data: list, error: listErr } = await (supabase as any)
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (listErr) {
          throw listErr;
        }
        setProfiles(list || []);
      } catch (e: any) {
        console.error('Admin load error', e);
        toast({ title: 'Error', description: 'Failed to load users.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Users exported to JSON.' });
  };

  const escapeXml = (s: any) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const xmlString = useMemo(() => {
    const rows = profiles.map(u => `  <user>
    <id>${escapeXml(u.id)}</id>
    <email>${escapeXml(u.email)}</email>
    <minecraft_username>${escapeXml(u.minecraft_username)}</minecraft_username>
    <full_name>${escapeXml(u.full_name)}</full_name>
    <grade>${escapeXml(u.grade)}</grade>
    <is_admin>${u.is_admin}</is_admin>
    <created_at>${escapeXml(u.created_at)}</created_at>
    <updated_at>${escapeXml(u.updated_at)}</updated_at>
  </user>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<users>\n${rows}\n</users>`;
  }, [profiles]);

  const exportXML = () => {
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Users exported to XML.' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm opacity-70">Loading admin panel…</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to view this page. {currentEmail && `(${currentEmail})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/')}> <Home className="mr-2" size={16}/> Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-200 via-green-100 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <Card className="bg-white/95 dark:bg-gray-800/95 shadow-2xl border-2 border-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="text-yellow-500" />
                    Admin Panel – User Management
                  </CardTitle>
                  <CardDescription>Manage users and export data</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/')}> <Home className="mr-2" size={16}/> Home</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={exportJSON}>
                    <Download className="mr-2" size={16} /> Export JSON
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={exportXML}>
                    <Download className="mr-2" size={16} /> Export XML
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </header>

        <section>
          <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-2 border-green-500">
            <CardHeader>
              <CardTitle className="text-xl">Users ({profiles.length})</CardTitle>
              <CardDescription>List of registered profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Minecraft</th>
                      <th className="text-left p-2">Full name</th>
                      <th className="text-left p-2">Grade</th>
                      <th className="text-left p-2">Admin</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-b last:border-none">
                        <td className="p-2">{p.email}</td>
                        <td className="p-2">{p.minecraft_username || '-'}</td>
                        <td className="p-2">{p.full_name || '-'}</td>
                        <td className="p-2">{p.grade || '-'}</td>
                        <td className="p-2">{p.is_admin ? 'Yes' : 'No'}</td>
                        <td className="p-2">{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default AdminPage;
