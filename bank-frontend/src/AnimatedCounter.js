import React from 'react';
import CountUp from 'react-countup';
import { Typography } from '@mui/material';

const AnimatedCounter = ({ end, ...props }) => {
  return (
    <CountUp
      end={end}
      duration={1.5}
      separator=","
      decimals={2}
      // --- CHANGE SYMBOL HERE ---
      prefix="₹" 
    >
      {({ countUpRef }) => (
        <Typography {...props} ref={countUpRef} />
      )}
    </CountUp>
  );
};

export default AnimatedCounter;