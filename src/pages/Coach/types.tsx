import { BookmarkBorder, ThumbUp, Chat, Description } from '@mui/icons-material';

export interface Recommendation {
  id: string;
  type: 'bookmark' | 'like' | 'chat' | 'document';
  text: string;
  date: string;
  read: boolean;
  links?: Array<{
    text: string;
    url: string;
  }>;
  sender?: string;
}

export const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'bookmark':
      return <BookmarkBorder />;
    case 'like':
      return <ThumbUp />;
    case 'chat':
      return <Chat />;
    case 'document':
      return <Description />;
    default:
      return <Chat />;
  }
};

// Sample data
export const sampleRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'bookmark',
    text: 'Explore the new Lean Startup Methodology card added for you!',
    date: '12.04.',
    read: false,
    links: [{ text: 'Lean Startup Methodology', url: '#' }],
    sender: 'Klaus Sailer',
  },
  {
    id: '2',
    type: 'bookmark',
    text: 'You have 3 open cards to complete. Keep up the momentum!',
    date: '10.04.',
    read: false,
    links: [{ text: '3 open cards', url: '#' }],
  },
  {
    id: '3',
    type: 'like',
    text: 'New read on Top 5 Marketing Strategies for Startups. Check it out!',
    date: '31.03.',
    read: true,
    links: [{ text: 'Top 5 Marketing Strategies for Startups', url: '#' }],
  },
  // ... more recommendations
];
