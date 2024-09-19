// src/components/visitPage/VisitsTable.tsx
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
  const clientVisits = visits
    .filter((visit) => visit.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date ascending

  // Function to determine the row background color based on visit status
  const getRowBackgroundColor = (
    completed: boolean,
    pending: boolean
  ): string => {
    if (completed && !pending) {
      return "#e6f4ea"; // Faint Green
    } else if (!completed && !pending) {
      return "#fdecea"; // Faint Red
    } else if (pending && !completed) {
      return "#fff4e5"; // Faint Orange
    } else {
      return "inherit"; // Default
    }
  };

  const handleRowClick = (visitId: string) => {
    dispatch(selectVisit(visitId));
  };

  return (
    <TableContainer component={Paper} sx={{ m: 0, p: 2, mt: 2, mb: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {/* Removed Agent Name Column */}
            <TableCell>Type</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Completed</TableCell>
            {/* Added Pending Column */}
            <TableCell>Pending</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clientVisits.map((visit) => (
            <TableRow
              key={visit._id}
              hover
              onClick={() => handleRowClick(visit._id ?? "")}
              sx={{
                cursor: "pointer",
                backgroundColor: getRowBackgroundColor(
                  visit.completed,
                  visit.pending
                ),
              }}
            >
              {/* Removed Agent Name Cell */}
              <TableCell>{visit.type}</TableCell>
              <TableCell>{visit.visitReason}</TableCell>
              <TableCell>
                {new Date(visit.date).toLocaleString()}
              </TableCell>
              <TableCell>{visit.completed ? "Yes" : "No"}</TableCell>
              {/* Added Pending Cell */}
              <TableCell>{visit.pending ? "Yes" : "No"}</TableCell>
              <TableCell>
                {new Date(visit.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VisitsTable;
