// src/components/userPage/EntityFormModal.tsx

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../app/hooks";
import { Admin, Agent, Client, Employee } from "../../models/entityModels";
import { showToast } from "../../services/toastMessage";

interface EntityFormModalProps {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  entityType: "client" | "agent" | "admin" | "employee";
  entity?: Client | Agent | Admin | Employee | null;
  onSave: () => void;
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({
  open,
  onClose,
  isEditing,
  entityType,
  entity,
  onSave,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [id, setId] = useState(entity?.id || "");
  const [name, setName] = useState(entity?.name || "");

  useEffect(() => {
    if (entity) {
      setId(entity.id);
      setName(entity.name);
    } else {
      setId("");
      setName("");
    }
  }, [entity]);

  const handleSave = () => {
    if (!id || !name) {
      showToast.error(
        t(
          "entityFormModal.fillRequiredFields",
          "Please fill out all required fields."
        )
      );
      return;
    }

    const newEntity = { id, name };

    if (isEditing) {
      dispatch(updateEntity({ entityType, entity: newEntity }))
        .then(() => {
          showToast.success(
            t("entityFormModal.updateSuccess", "Entity updated successfully.")
          );
          onSave();
        })
        .catch((error) => {
          showToast.error(
            t("entityFormModal.updateError", "Failed to update entity.")
          );
          console.error(error);
        });
    } else {
      dispatch(addEntity({ entityType, entity: newEntity }))
        .then(() => {
          showToast.success(
            t("entityFormModal.addSuccess", "Entity added successfully.")
          );
          onSave();
        })
        .catch((error) => {
          showToast.error(
            t("entityFormModal.addError", "Failed to add entity.")
          );
          console.error(error);
        });
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isEditing
          ? t("entityFormModal.editTitle", "Edit Entity")
          : t("entityFormModal.addTitle", "Add Entity")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label={t("entityFormModal.idLabel", "ID")}
            value={id}
            onChange={(e) => setId(e.target.value)}
            fullWidth
            required
            disabled={isEditing} // ID should not be editable when editing
            sx={{ mb: 2 }}
          />
          <TextField
            label={t("entityFormModal.nameLabel", "Name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave}>
          {isEditing
            ? t("entityFormModal.saveButton", "Save")
            : t("entityFormModal.addButton", "Add")}
        </Button>
        <Button onClick={onClose}>
          {t("entityFormModal.cancelButton", "Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityFormModal;
