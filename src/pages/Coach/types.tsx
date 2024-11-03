import {
  Chat,
  Pattern as PatternIcon,
  Link,
  FileDownload,
  Person,
  Description,
} from '@mui/icons-material';

export const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'pattern':
      return <PatternIcon />;
    case 'link':
      return <Link />;
    case 'file':
      return <FileDownload />;
    case 'contact':
      return <Person />;
    case 'document':
      return <Description />;
    default:
      return <Chat />;
  }
};
