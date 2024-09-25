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
  Stack,
  styled,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/data/dataSelectors";
import EditVisitForm from "./EditVisitForm";
import VisitCard from "./VisitCard";

interface VisitViewProps {
  visitId: string;
  onDeselectVisit: () => void;
}

// Styled IconButton for Actions
const StyledActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

// Styled Close Button
const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

const VisitView: React.FC<VisitViewProps> = ({ visitId, onDeselectVisit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const selectedVisitId = useAppSelector((state) => state.data.selectedVisitId);

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

  // useEffect to close the edit form when selectedVisitId changes
  useEffect(() => {
    if (isEditing) {
      handleEditClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVisitId]);

  // Fetch the visit data from the store
  const visits = useAppSelector(selectVisits);

  const visit = visits.find((v) => v._id === visitId);

  if (!visit) return null;

  return (
    <Box>
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
      <Box sx={{ mt: 2 }}>
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent="flex-end"
          sx={{ pr: 1.2, pt: 1 }} // Adjust padding-right or padding-left to align
        >
          <Tooltip title="Edit Visit" arrow>
            <StyledActionButton
              onClick={handleEditClick}
              aria-label="Edit Visit"
            >
              <EditIcon />
            </StyledActionButton>
          </Tooltip>

          <Tooltip title="Deselect Visit" arrow>
            <StyledCloseButton
              onClick={handleDeselectClick}
              aria-label="Deselect Visit"
            >
              <CloseIcon />
            </StyledCloseButton>
          </Tooltip>
        </Stack>
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
