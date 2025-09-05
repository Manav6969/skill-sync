"use client"

import { useParams, useRouter } from 'next/navigation';
import TeamChatBox from '@/components/TeamChatBox';

export default function ChatPage() {
  const { teamId } = useParams();
  if (!teamId) return <p>Loading...</p>;
  return <TeamChatBox teamId={teamId} />;
}