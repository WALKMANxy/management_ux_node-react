import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/data/dataSelectors";
import { selectVisit } from "../../features/data/dataSlice";

interface VisitsTableProps {
  clientId: string;
}

const VisitsTable: React.FC<VisitsTableProps> = ({ clientId }) => {
  const dispatch = useAppDispatch();
  const visits = useAppSelector(selectVisits);

  // Filter visits for the selected client
  const clientVisits = visits.filter((visit) => visit.clientId === clientId);

  const handleRowClick = (visitId: string) => {
    dispatch(selectVisit(visitId));
  };
  return (
    <TableContainer component={Paper} sx={{ m: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Completed</TableCell>
            {/* If agentName is available, display it */}
            <TableCell>Agent Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clientVisits.map((visit) => (
            <TableRow
              key={visit._id}
              hover
              onClick={() => handleRowClick(visit._id ?? "")}
              sx={{ cursor: "pointer" }}
            >
              <TableCell>{visit.clientId}</TableCell>
              <TableCell>{visit.type}</TableCell>
              <TableCell>{visit.visitReason}</TableCell>
              <TableCell>
                {new Date(visit.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>{visit.completed ? "Yes" : "No"}</TableCell>
              <TableCell>{visit.agentName || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VisitsTable;
