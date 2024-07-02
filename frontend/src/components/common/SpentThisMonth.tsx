
//src/components/common/SpentThisMonth.tsx
import React from 'react';
import { Typography, Paper, Box, Avatar, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

interface SpentThisMonthProps {
  amount: string;
}

const SpentThisMonth: React.FC<SpentThisMonthProps> = ({ amount }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #ffebee 30%, #ffcdd2 100%)',
        color: '#000',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: theme.palette.secondary.main,
          borderRadius: '50%',
          top: -85,
          right: -95
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: theme.palette.secondary.main,
          borderRadius: '50%',
          top: -125,
          right: -15,
          opacity: 0.5
        }
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column">
          <Grid item>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: '#000',
                    mt: 1
                  }}
                >
                  <img src="/money.svg" alt="Spent Icon" style={{ width: '100%', height: '100%' }} />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <Typography sx={{ fontSize: '2.7rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                  €{amount}
                </Typography>
              </Grid>
              <Grid item>
                <Avatar
                  sx={{
                    cursor: 'pointer',
                    bgcolor: theme.palette.secondary.light,
                    color: '#000'
                  }}
                >
                  <ArrowUpwardIcon fontSize="inherit" sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 1.25 }}>
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 500,
                color: '#000'
              }}
            >
              Spent This Month
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SpentThisMonth;
