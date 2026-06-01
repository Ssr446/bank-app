import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: '#000', // Black text for high contrast
  fontWeight: 'bold',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  padding: '10px 20px',
  boxShadow: `0 0 10px rgba(5, 255, 158, 0.3)`,
  '&:hover': {
    boxShadow: `0 0 25px rgba(5, 255, 158, 0.7)`,
    transform: 'scale(1.02)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    boxShadow: 'none',
  },
}));

export default GradientButton;