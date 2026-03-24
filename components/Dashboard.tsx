import React from 'react';
import { User } from '../types';
import MentorDashboard from './MentorDashboard';
import MenteeDashboard from './MenteeDashboard';

const Dashboard: React.FC<{
  user: User | null;
  onTabChange: (tab: string) => void;
  onSelectConnection: (id: string) => void;
}> = ({ user, onTabChange, onSelectConnection }) => {
  if (user?.role === 'mentor') {
    return <MentorDashboard user={user} onTabChange={onTabChange} onSelectConnection={onSelectConnection} />;
  }

  return <MenteeDashboard user={user} onTabChange={onTabChange} onSelectConnection={onSelectConnection} />;
};

export default Dashboard;
