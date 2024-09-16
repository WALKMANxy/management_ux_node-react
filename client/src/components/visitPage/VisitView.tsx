import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/data/dataSelectors";

interface VisitViewProps {
  visitId: string;
}

const VisitView: React.FC<VisitViewProps> = ({ visitId }) => {
  const visits = useAppSelector(selectVisits);

  const visit = visits.find((v) => v._id === visitId);

  if (!visit) return null;

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h5">
          {visit.visitReason} | {visit.clientId}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Agent: {visit.agentName || "N/A"}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {visit.notePublic}
        </Typography>
        {visit.notePrivate && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {visit.notePrivate}
          </Typography>
        )}
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Typography color="textSecondary" sx={{ mr: 2 }}>
            Date: {new Date(visit.date).toLocaleDateString()}
          </Typography>
          <Typography color="textSecondary">
            Completed: {visit.completed ? "Yes" : "No"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VisitView;
