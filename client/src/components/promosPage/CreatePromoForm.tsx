// src/components/promosPage/CreatePromoForm.tsx

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import usePromos from "../../hooks/usePromos";
import { Promo } from "../../models/dataModels";
import EligibleClientsGrid from "./EligibleClientsGrid";

interface CreatePromoFormProps {
  onClose: () => void;
}

const CreatePromoForm: React.FC<CreatePromoFormProps> = ({ onClose }) => {
  const { clients, userId, handleCreatePromo } = usePromos();

  const [promoType, setPromoType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const handlePromoTypeChange = (event: SelectChangeEvent<string>) => {
    setPromoType(event.target.value);
    // Clear discount if promo type does not require it
    if (event.target.value !== "Sale") {
      setDiscount("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!promoType || !name || !startDate || !endDate) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (endDate.isBefore(startDate)) {
      setSnackbarMessage("End Date cannot be before Start Date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Prepare promo data
    const promoData: Omit<Promo, "_id"> = {
      name,
      promoType,
      discount: promoType === "Sale" ? discount : "", // Only set discount if promoType is "Sale"
      clientsId: selectedClients,
      createdAt: new Date(),
      startDate: dayjs(startDate).set("hour", 8).set("minute", 0).toDate(), // Convert Dayjs to Date
      endDate: dayjs(endDate).set("hour", 23).set("minute", 59).toDate(), // Convert Dayjs to Date
      promoIssuedBy: userId || "unknown", // Use "unknown" as a fallback if userId is undefined
    };

    try {
      await handleCreatePromo(promoData); // Use the hook function
      setSnackbarMessage("Promo created successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Reset form fields
      setPromoType("");
      setName("");
      setDiscount("");
      setStartDate(dayjs());
      setEndDate(dayjs());
      setSelectedClients([]);
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create promo.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2, color: "#4d4b5f" }}
        >
          Create New Promo
        </Typography>

        <Grid container spacing={2}>
          {/* Promo Type Selector */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="promo-type-label">Promo Type</InputLabel>
              <Select
                labelId="promo-type-label"
                id="promo-type"
                value={promoType}
                label="Promo Type *"
                onChange={handlePromoTypeChange}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Sale">Sale</MenuItem>
                <MenuItem value="Extra">Extra</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Promo Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Promo Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{
                borderRadius: 2,
              }}
            />
          </Grid>

          {/* Discount - Conditionally Rendered */}
          {promoType === "Sale" && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount (%)"
                name="discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                fullWidth
                required
                variant="outlined"
                type="number"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                sx={{
                  borderRadius: 2,
                }}
              />
            </Grid>
          )}

          {/* Start Date */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Start Date</Typography>

            <StaticDatePicker
              value={startDate}
              disablePast={true}
              onAccept={(newValue: Dayjs | null) => {
                setStartDate(newValue);
              }}
              onChange={(newValue: Dayjs | null) => {
                setStartDate(newValue);
              }}
              slotProps={{
                toolbar: {
                  hidden: true,
                },
              }}
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">End Date</Typography>
            <StaticDatePicker
              value={endDate}
              disablePast={true}
              onAccept={(newValue: Dayjs | null) => {
                setEndDate(newValue);
              }}
              onChange={(newValue: Dayjs | null) => {
                setEndDate(newValue);
              }}
              slotProps={{
                toolbar: {
                  hidden: true,
                },
              }}
            />
          </Grid>

          {/* Eligible Clients Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="eligible-clients-label">
                Eligible Clients
              </InputLabel>
              <Select
                labelId="eligible-clients-label"
                id="eligible-clients"
                multiple
                value={selectedClients}
                onChange={(e: SelectChangeEvent<string[]>) => {
                  const {
                    target: { value },
                  } = e;
                  setSelectedClients(
                    typeof value === "string" ? value.split(",") : value
                  );
                }}
                input={<OutlinedInput label="Eligible Clients" />}
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
                {Object.values(clients).map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Eligible Clients Grid */}
          <Grid item xs={12} >
            <EligibleClientsGrid
              selectedClients={selectedClients}
              setSelectedClients={setSelectedClients}
            />
          </Grid>
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
          <Tooltip title="Create Promo">
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
              }}
              aria-label="Create Promo"
            >
              <AddIcon />
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
              }}
              aria-label="Cancel"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CreatePromoForm;
