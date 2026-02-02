import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  name: string;
  role: string;
  initials: string;
}

interface UserContextType {
  currentUser: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'Admin User',
  role: 'Project Manager',
  initials: 'AD'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dyad-user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  useEffect(() => {
    localStorage.setItem('dyad-user', JSON.stringify(currentUser));
  }, [currentUser]);

  const updateUser = (data: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
  };

  return (
    <UserContext.Provider value={{ currentUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};