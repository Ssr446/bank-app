import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

const GlassPanel = styled(Paper)(({ theme }) => ({
  background: 'rgba(10, 25, 41, 0.7)', // Dark blue-black glass
  backdropFilter: 'blur(12px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  overflow: 'hidden', // Ensures content respects the border radius
}));

export default GlassPanel;