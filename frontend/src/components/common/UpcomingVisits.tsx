import React from 'react';
import { List, ListItem, ListItemText, Typography, Box, Button, Skeleton } from '@mui/material';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Client, Visit } from '../../models/models';

interface UpcomingVisitsProps {
    selectedClient?: Client | null;
    agentDetails?: { clients: Client[] } | null;
  }

const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ selectedClient, agentDetails }) => {
  const visits = selectedClient ? selectedClient.visits : agentDetails?.clients.flatMap(client => client.visits);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        {selectedClient ? `Upcoming Visits for ${selectedClient.name}` : agentDetails ? 'Your Upcoming Visits' : <Skeleton width="50%" />}
      </Typography>
      <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
        {agentDetails ? (
          <List>
            {visits ? (
              visits.map((visit, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${visit.note} on ${visit.date}`} />
                </ListItem>
              ))
            ) : (
              <>
                <ListItem>
                  <ListItemText primary="Visit 1" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Visit 2" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Visit 3" />
                </ListItem>
              </>
            )}
          </List>
        ) : (
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '12px' }} />
        )}
      </Box>
      <Button variant="contained" color="primary" sx={{ mt: 3, borderRadius: '8px' }}>
        Plan Visit
      </Button>
    </Box>
  );
};

export default UpcomingVisits;
