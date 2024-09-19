// src/components/visitPage/VisitView.tsx
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/data/dataSelectors";
import VisitCard from "./VisitCard";
import EditVisitForm from "./EditVisitForm";

interface VisitViewProps {
  visitId: string;
  onDeselectVisit: () => void;
}

const VisitView: React.FC<VisitViewProps> = ({ visitId, onDeselectVisit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditClose = () => {
    setIsEditing(false);
  };

  const handleDeselectClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmDeselect = () => {
    setOpenConfirm(false);
    onDeselectVisit();
  };

  const handleCancelDeselect = () => {
    setOpenConfirm(false);
  };

  // Fetch the visit data from the store
  const visits = useAppSelector(selectVisits);

  const visit = visits.find((v) => v._id === visitId);

  if (!visit) return null;

  return (
    <Box sx={{ m: 2 }}>
      <VisitCard
        clientId={visit.clientId}
        type={visit.type}
        reason={visit.visitReason}
        date={visit.date ? dayjs(visit.date) : null}
        notePublic={visit.notePublic || "N/A"}
        notePrivate={visit.notePrivate}
        pending={visit.pending}
        completed={visit.completed}
        visitIssuedBy={visit.visitIssuedBy}
        isNew={false} // Set this based on your logic, e.g., comparing dates
      />

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Tooltip title="Edit Visit">
          <IconButton
            onClick={handleEditClick}
            sx={{
              backgroundColor: "blue",
              color: "white",
              "&:hover": { backgroundColor: "darkblue" },
              borderRadius: "50%",
              width: 48,
              height: 48,
            }}
            aria-label="Edit Visit"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Deselect Visit">
          <IconButton
            onClick={handleDeselectClick}
            sx={{
              backgroundColor: "red",
              color: "white",
              "&:hover": { backgroundColor: "darkred" },
              borderRadius: "50%",
              width: 48,
              height: 48,
            }}
            aria-label="Deselect Visit"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Confirmation Dialog for Deselecting Visit */}
      <Dialog
        open={openConfirm}
        onClose={handleCancelDeselect}
        aria-labelledby="confirm-deselect-title"
        aria-describedby="confirm-deselect-description"
      >
        <DialogTitle id="confirm-deselect-title">Deselect Visit</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-deselect-description">
            Are you sure you want to deselect this visit? Any unsaved changes
            will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeselect} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeselect} color="error" autoFocus>
            Deselect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Visit Form */}
      {isEditing && <EditVisitForm visit={visit} onClose={handleEditClose} />}
    </Box>
  );
};

export default VisitView;
