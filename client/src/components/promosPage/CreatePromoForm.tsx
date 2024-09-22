// src/components/promosPage/CreatePromoForm.tsx

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import React from "react";
import EligibleClientsGrid from "./EligibleClientsGrid";

import { Controller } from "react-hook-form";
import usePromoForm from "../../hooks/usePromoForm";
import { Promo } from "../../models/dataModels";

interface CreatePromoFormProps {
  onClose: () => void;
  promoData?: Promo; // For editing
  isCreating: boolean; // True for creation, false for editing
  onSubmit: (promoData: Promo) => Promise<void>; // Submit handler
}

const CreatePromoForm: React.FC<CreatePromoFormProps> = ({
  onClose,
  promoData,
  isCreating,
  onSubmit,
}) => {
  const {
    handleSubmit,
    watch,
    control,
    selectedLocale,
    clients,
    t,
    errors,
    setValue, // Destructure setValue from usePromoForm
  } = usePromoForm({
    promoData,
    isCreating,
    onSubmit,
    onClose,
  });

  // Extract form values using watch
  const isGlobal = watch("global");
  const selectedClients = watch("selectedClients");
  const excludedClients = watch("excludedClients");

  // Setter functions to update the values
  const setSelectedClients = (clients: string[]) =>
    setValue("selectedClients", clients);
  const setExcludedClients = (clients: string[]) =>
    setValue("excludedClients", clients);
  const setGlobal = (global: boolean) => setValue("global", global);

  console.log("re rendering component");

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={selectedLocale.adapterLocale}
      localeText={selectedLocale.localeText}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {isCreating && (
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 600, mb: 4, color: "#4d4b5f", mt: 1, ml: 2 }}
          >
            Create New Promo
          </Typography>
        )}

        <Grid container spacing={2}>
          {/* Promo Type Selector */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="promoType"
              control={control}
              rules={{ required: "Promo Type is required" }}
              render={({ field }) => (
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="promo-type-label">Promo Type</InputLabel>
                  <Select
                    {...field}
                    labelId="promo-type-label"
                    id="promo-type"
                    label="Promo Type *"
                    sx={{
                      borderRadius: "20px",
                    }}
                  >
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Sale">Sale</MenuItem>
                    <MenuItem value="Extra">Extra</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            {errors.promoType && (
              <Typography color="error" variant="body2">
                {errors.promoType.message}
              </Typography>
            )}
          </Grid>

          {/* Promo Name */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Promo Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Promo Name"
                  fullWidth
                  required
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "20px",
                    },
                  }}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>

          {/* Start Date */}
          <Grid item xs={10} sm={6}>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Start Date is required" }}
              render={({ field }) => (
                <Paper elevation={1} sx={{ p: 2, borderRadius: 6 }}>
                  <StaticDatePicker
                    {...field}
                    value={field.value}
                    disablePast={true}
                    onChange={(date) => field.onChange(date)}
                    slotProps={{
                      toolbar: {
                        hidden: false,
                      },
                      actionBar: {
                        hidden: true,
                      },
                    }}
                    localeText={{
                      toolbarTitle: t("datePicker.startDateLabel"),
                    }}
                  />
                </Paper>
              )}
            />
            {errors.startDate && (
              <Typography color="error" variant="body2">
                {errors.startDate.message}
              </Typography>
            )}
          </Grid>

          {/* End Date */}
          <Grid item xs={10} sm={6}>
            <Controller
              name="endDate"
              control={control}
              rules={{
                required: "End Date is required",
                validate: (value) => {
                  const startDate = watch("startDate");
                  if (value && startDate && value.isBefore(startDate)) {
                    return "End Date cannot be before Start Date.";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <Paper elevation={1} sx={{ p: 2, borderRadius: 6 }}>
                  <StaticDatePicker
                    {...field}
                    value={field.value}
                    disablePast={true}
                    onChange={(date) => field.onChange(date)}
                    slotProps={{
                      toolbar: {
                        hidden: false,
                      },
                      actionBar: {
                        hidden: true,
                      },
                    }}
                    localeText={{
                      toolbarTitle: t("datePicker.endDateLabel"),
                    }}
                  />
                </Paper>
              )}
            />
            {errors.endDate && (
              <Typography color="error" variant="body2">
                {errors.endDate.message}
              </Typography>
            )}
          </Grid>

          {/* Discount Description */}
          <Grid item xs={12} sm={12} sx={{ mb: 2 }}>
            <Controller
              name="discount"
              control={control}
              rules={{ required: "Discount Description is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Discount Description"
                  fullWidth
                  required
                  variant="outlined"
                  multiline
                  rows={3}
                  InputProps={{
                    style: {
                      borderRadius: "20px",
                      width: "100%",
                      marginTop: 5,
                    },
                  }}
                  helperText={
                    errors.discount
                      ? errors.discount.message
                      : 'e.g., "Every 100 euros spent, you get a 10 euros coupon"'
                  }
                  error={!!errors.discount}
                />
              )}
            />
          </Grid>
        </Grid>

        {/* Unified Clients Selector - Read-Only Selector */}
        <Grid item xs={12}>
          <FormControl fullWidth disabled variant="outlined">
            <InputLabel id="clients-label">
              {isGlobal ? "Excluded Clients" : "Eligible Clients"}
            </InputLabel>
            <Select
              labelId="clients-label"
              id="clients"
              multiple
              value={isGlobal ? excludedClients : selectedClients}
              input={
                <OutlinedInput
                  label={isGlobal ? "Excluded Clients" : "Eligible Clients"}
                />
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((clientId) => (
                    <Chip
                      key={clientId}
                      label={clients[clientId]?.name || clientId}
                    />
                  ))}
                </Box>
              )}
            >
              {/* Empty, since this is read-only */}
            </Select>
          </FormControl>
        </Grid>

        {/* Eligible Clients Grid */}
        <Grid item xs={12}>
          <EligibleClientsGrid
            selectedClients={selectedClients}
            setSelectedClients={setSelectedClients}
            global={isGlobal}
            setGlobal={setGlobal}
            excludedClients={excludedClients}
            setExcludedClients={setExcludedClients}
            isViewing={false}
          />
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 4,
            }}
          >
            <Tooltip title={isCreating ? "Create Promo" : "Update Promo"}>
              <IconButton
                type="submit"
                color="primary"
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": { backgroundColor: "primary.dark" },
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  transition: "transform 0.2s",
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
                aria-label={isCreating ? "Create Promo" : "Update Promo"}
              >
                {isCreating ? <AddIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Cancel">
              <IconButton
                color="error"
                onClick={onClose}
                sx={{
                  backgroundColor: "error.main",
                  color: "white",
                  "&:hover": { backgroundColor: "error.dark" },
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  transition: "transform 0.2s",
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
                aria-label="Cancel"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default React.memo(CreatePromoForm);
