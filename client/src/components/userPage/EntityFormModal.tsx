// src/components/userPage/EntityFormModal.tsx

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  styled,
  TextField,
  Tooltip,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ClientReference, ServerAgent } from "../../models/dataSetTypes";
import { Admin, Agent, Employee } from "../../models/entityModels"; // Ensure Client is imported
import { showToast } from "../../services/toastMessage";
import ClientsSelectionTable from "./ClientsSelectionTable";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
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

interface EntityFormModalProps {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  entityType: "client" | "agent" | "admin" | "employee";
  entity?: Admin | Agent | Employee | null;
  onSave: () => void;
  onCreate: (entityData: Partial<Admin | Agent | Employee>) => Promise<void>;
  onUpdate: (
    id: string,
    updatedData: Partial<Admin | Agent | Employee>
  ) => Promise<void>;
}

interface FormValues {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients?: { id: string; colour?: string }[];
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({
  open,
  onClose,
  isEditing,
  entityType,
  entity,
  onSave,
  onCreate,
  onUpdate,
}) => {
  const { t } = useTranslation();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      id: entity?.id || "",
      name: entity?.name || "",
      email: (entity as Agent | Employee)?.email || " ",
      phone: (entity as Agent)?.phone || "",
      clients:
        entityType === "agent" && isEditing && (entity as Agent)?.clients
          ? (entity as Agent).clients.map((client) => ({
              id: client.id,
              colour: client.colour,
            }))
          : [],
    },
  });

  // Local state for Agent's clients
  // Change the type of selectedClients to { id: string; colour?: string }[]
  const [selectedClients, setSelectedClients] = useState<
    { id: string; colour?: string }[]
  >(
    entityType === "agent" && isEditing && (entity as Agent)?.clients
      ? (entity as Agent).clients.map((client) => ({
          id: client.id,
          colour: client.colour ?? "",
        }))
      : []
  );

  useEffect(() => {
    if (entity) {
      reset({
        id: entity.id,
        name: entity.name,
        email: (entity as Agent | Employee).email || "",
        phone: (entity as Agent).phone || "",
        clients:
          entityType === "agent" && (entity as Agent)?.clients
            ? (entity as Agent).clients.map((client) => ({
                id: client.id,
                colour: client.colour,
              }))
            : [],
      });
      if (entityType === "agent") {
        setSelectedClients(
          (entity as Agent).clients?.map((client) => ({
            id: client.id,
            colour: client.colour ?? "",
          })) || []
        );
      }
    } else {
      reset({
        id: "",
        name: "",
        email: "",
        phone: "",
        clients: [],
      });
      setSelectedClients([]);
    }
  }, [entity, entityType, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Validation: Ensure required fields based on entityType
    if (!data.id || !data.name) {
      showToast.error(
        t(
          "entityFormModal.fillRequiredFields",
          "Please fill out all required fields."
        )
      );
      return;
    }

    let newEntity: Partial<Admin | ServerAgent | Employee>;

    // Construct the new entity object based on entityType
    if (entityType === "admin") {
      // Type newEntity as Partial<Admin>
      newEntity = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
      };

      if (!newEntity.email) {
        showToast.error(
          t("entityFormModal.emailRequired", "Email is required for Admins.")
        );
        return;
      }
    } else if (entityType === "agent") {
      newEntity = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        clients: selectedClients.map((client) => ({
          CODICE: client.id,
          colour: client.colour ?? "",
        })) as ClientReference[],
      };
    } else if (entityType === "employee") {
      // Type newEntity as Partial<Employee>
      newEntity = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
      };
    } else {
      // Handle unknown entityType
      showToast.error(
        t("entityFormModal.unknownEntityType", "Unknown entity type.")
      );
      return;
    }

    try {
      if (isEditing && entity) {
        await onUpdate(entity.id, newEntity);
        showToast.success(
          t("entityFormModal.updateSuccess", "Entity updated successfully.")
        );
      } else {
        await onCreate(newEntity);
        showToast.success(
          t("entityFormModal.addSuccess", "Entity added successfully.")
        );
      }
      onSave();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          isEditing
            ? t("entityFormModal.updateError", "Failed to update entity.")
            : t("entityFormModal.addError", "Failed to add entity.")
        );
        console.error(error.message);
      } else {
        showToast.error(
          isEditing
            ? t("entityFormModal.updateError", "Failed to update entity.")
            : t("entityFormModal.addError", "Failed to add entity.")
        );
        console.error(error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditing
          ? t("entityFormModal.editTitle", "Edit Entity")
          : t("entityFormModal.addTitle", "Add Entity")}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* ID Field */}
            <Controller
              name="id"
              control={control}
              rules={{
                required: t("entityFormModal.idRequired", "ID is required."),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("entityFormModal.idLabel", "ID")}
                  fullWidth
                  required
                  disabled={isEditing}
                  error={!!errors.id}
                  helperText={errors.id ? errors.id.message : ""}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Name Field */}
            <Controller
              name="name"
              control={control}
              rules={{
                required: t(
                  "entityFormModal.nameRequired",
                  "Name is required."
                ),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("entityFormModal.nameLabel", "Name")}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name ? errors.name.message : ""}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Email Field */}
            {(entityType === "admin" ||
              entityType === "agent" ||
              entityType === "employee") && (
              <Controller
                name="email"
                control={control}
                rules={
                  entityType === "admin"
                    ? {
                        required: t(
                          "entityFormModal.emailRequired",
                          "Email is required."
                        ),
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: t(
                            "entityFormModal.invalidEmail",
                            "Invalid email format."
                          ),
                        },
                      }
                    : {
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: t(
                            "entityFormModal.invalidEmail",
                            "Invalid email format."
                          ),
                        },
                      }
                }
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("entityFormModal.emailLabel", "Email")}
                    fullWidth
                    required={entityType === "admin"}
                    error={!!errors.email}
                    helperText={
                      errors.email ? (errors.email.message as string) : ""
                    }
                    sx={{ mb: 2 }}
                  />
                )}
              />
            )}

            {/* Phone Field for Agent */}
            {entityType === "agent" && (
              <Controller
                name="phone"
                control={control}
                rules={{
                  pattern: {
                    value: /^\+?\d{10,15}$/,
                    message: t(
                      "entityFormModal.invalidPhone",
                      "Invalid phone number."
                    ),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("entityFormModal.phoneLabel", "Phone")}
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone ? errors.phone.message : ""}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            )}

            {/* Clients Selection for Agent */}
            {entityType === "agent" && (
              <Box sx={{ mt: 2 }}>
                <ClientsSelectionTable
                  selectedClients={selectedClients}
                  setSelectedClients={setSelectedClients}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            {/* Save or Add Button */}
            <Tooltip
              title={
                isEditing
                  ? t("entityFormModal.saveTooltip", "Save")
                  : t("entityFormModal.addTooltip", "Add")
              }
              arrow
            >
              <StyledIconButton
                type="submit"
                aria-label={
                  isEditing
                    ? t("entityFormModal.saveButton", "Save")
                    : t("entityFormModal.addButton", "Add")
                }
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : <SaveIcon />}
              </StyledIconButton>
            </Tooltip>

            {/* Cancel Button */}
            <Tooltip title={t("entityFormModal.cancelTooltip", "Cancel")} arrow>
              <StyledCloseButton
                color="error"
                onClick={onClose}
                aria-label={t("entityFormModal.cancelButton", "Cancel")}
                disabled={isSubmitting}
              >
                <CloseIcon />
              </StyledCloseButton>
            </Tooltip>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EntityFormModal;
