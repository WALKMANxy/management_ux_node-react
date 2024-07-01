import React from 'react';
import { List, ListItem, ListItemText, Typography, Box, Button, Skeleton } from '@mui/material';
import { Client } from '../../models/models';

interface ActivePromotionsProps {
    selectedClient?: Client | null;
    agentDetails?: { clients: Client[] } | null;
  }

const ActivePromotions: React.FC<ActivePromotionsProps> = ({ selectedClient, agentDetails }) => {
  const promos = selectedClient ? selectedClient.promos : agentDetails?.clients.flatMap(client => client.promos);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {selectedClient ? `Active Promotions for ${selectedClient.name}` : agentDetails ? 'Active Promotions with Your Clients' : <Skeleton width="50%" />}
      </Typography>
      <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
        {agentDetails ? (
          <List>
            {promos ? (
              promos.map((promo, index) => (
                <ListItem key={promo.id}>
                  <ListItemText primary={promo.name} />
                </ListItem>
              ))
            ) : (
              <>
                <ListItem>
                  <ListItemText primary="Promo 1" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Promo 2" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Promo 3" />
                </ListItem>
              </>
            )}
          </List>
        ) : (
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '12px' }} />
        )}
      </Box>
      <Button variant="contained" color="primary" sx={{ mt: 3, borderRadius: '8px' }}>
        View More
      </Button>
    </Box>
  );
};

export default ActivePromotions;
