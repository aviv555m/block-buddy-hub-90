
import { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import RegistrationForm from '@/components/RegistrationForm';
import ServerHomepage from '@/components/ServerHomepage';
import LanguageSelector from '@/components/LanguageSelector';

const Index = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleRegistrationComplete = (data: any) => {
    setUserData(data);
    setIsRegistered(true);
  };

  return (
    <LanguageProvider>
      <div className="relative">
        <LanguageSelector />
        
        {isRegistered && userData ? (
          <ServerHomepage userData={userData} />
        ) : (
          <RegistrationForm onRegistrationComplete={handleRegistrationComplete} />
        )}
      </div>
    </LanguageProvider>
  );
};

export default Index;
