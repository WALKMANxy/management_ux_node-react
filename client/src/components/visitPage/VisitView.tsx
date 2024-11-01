// src/components/visitPage/VisitView.tsx
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Stack, styled, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/promoVisits/promoVisitsSelectors";
import EditVisitForm from "./EditVisitForm";
import VisitCard from "./VisitCard";
import { selectCurrentUser } from "../../features/users/userSlice";

interface VisitViewProps {
  visitId: string;
  onDeselectVisit: () => void;
}

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

  const selectedVisitId = useAppSelector((state) => state.data.selectedVisitId);

  const editVisitRef = useRef<HTMLDivElement | null>(null);

  const userRole = useAppSelector(selectCurrentUser)?.role

  useEffect(() => {
    if (isEditing && editVisitRef.current) {
      editVisitRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditClose = () => {
    setIsEditing(false);
  };

  const handleDeselectClick = () => {
    onDeselectVisit();
  };

  useEffect(() => {
    if (isEditing) {
      handleEditClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVisitId]);

  const visits = useAppSelector(selectVisits);
  const visit = visits.find((v) => v._id === visitId);

  if (!visit) return null;

  return (
    <Box sx={{ height: "100%" }}>
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
        isNew={false}
      />

      {/* Action Buttons */}
      <Box sx={{ mt: 1 }}>
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent="flex-end"
          sx={{ pr: 1.2, pt: 0.5 }} 
        >
          {/* Conditionally render the Edit button if userRole is not "client" */}
          {userRole !== "client" && (
            <Tooltip title="Edit Visit" arrow>
              <StyledActionButton
                onClick={handleEditClick}
                aria-label="Edit Visit"
              >
                <EditIcon />
              </StyledActionButton>
            </Tooltip>
          )}

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

      {/* Edit Visit Form */}
      {isEditing && (
        <Box ref={editVisitRef}>
          <EditVisitForm visit={visit} onClose={handleEditClose} />
        </Box>
      )}
    </Box>
  );
};

export default VisitView;
