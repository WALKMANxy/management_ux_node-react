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
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import usePromoForm from "../../hooks/usePromoForm";
import { Promo } from "../../models/dataModels";
import EligibleClientsGrid from "./EligibleClientsGrid";

interface CreatePromoFormProps {
  onClose: () => void;
  promoData?: Promo;
  isCreating: boolean;
  onSubmit: (promoData: Promo) => Promise<void>;
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
    errors,
    setValue,
  } = usePromoForm({
    promoData,
    isCreating,
    onSubmit,
    onClose,
  });

  const { t } = useTranslation();
  const memoizedLocale = useMemo(() => selectedLocale, [selectedLocale]);
  const isGlobal = watch("global");
  const selectedClients = watch("selectedClients");
  const excludedClients = watch("excludedClients");
  const isMobile = useMediaQuery("(max-width:600px)");

  const setSelectedClients = (clients: string[]) =>
    setValue("selectedClients", clients);
  const setExcludedClients = (clients: string[]) =>
    setValue("excludedClients", clients);
  const setGlobal = (global: boolean) => setValue("global", global);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={memoizedLocale.adapterLocale}
      localeText={memoizedLocale.localeText}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          pt: 2,
          px: 1,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          height: "auto",
          mx: 1,
        }}
      >
        {isCreating && (
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600, mb: 4, color: "#4d4b5f", mt: 1, ml: 2 }}
          >
            {t("createPromoForm.createTitle")}
          </Typography>
        )}

        <Grid
          container
          spacing={2}
          justifyContent={isMobile ? "center" : "flex-start"}
          alignItems={isMobile ? "center" : "flex-start"}
        >
          {/* Promo Type Selector */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="promoType"
              control={control}
              rules={{ required: t("createPromoForm.promoTypeRequired") }}
              render={({ field }) => (
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="promo-type-label">
                    {t("createPromoForm.promoTypeLabel")}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="promo-type-label"
                    id="promo-type"
                    label={t("createPromoForm.promoTypeLabel")}
                    sx={{
                      borderRadius: "20px",
                    }}
                  >
                    <MenuItem value="Contract">
                      {t("createPromoForm.promoTypeContract")}
                    </MenuItem>
                    <MenuItem value="Sale">
                      {t("createPromoForm.promoTypeSale")}
                    </MenuItem>
                    <MenuItem value="Extra">
                      {t("createPromoForm.promoTypeExtra")}
                    </MenuItem>
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
              rules={{ required: t("createPromoForm.promoNameRequired") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("createPromoForm.promoNameLabel")}
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
              rules={{ required: t("createPromoForm.startDateRequired") }}
              render={({ field }) => (
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
                    toolbarTitle: t("createPromoForm.startDateLabel"),
                  }}
                />
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
                required: t("createPromoForm.endDateRequired"),
                validate: (value) => {
                  const startDate = watch("startDate");
                  if (value && startDate && value.isBefore(startDate)) {
                    return t("createPromoForm.endDateValidation");
                  }
                  return true;
                },
              }}
              render={({ field }) => (
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
                    toolbarTitle: t("createPromoForm.endDateLabel"),
                  }}
                />
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
              rules={{ required: t("createPromoForm.discountRequired") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("createPromoForm.discountLabel")}
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
                      : t("createPromoForm.discountHelperText")
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
              {isGlobal
                ? t("createPromoForm.excludedClientsLabel")
                : t("createPromoForm.eligibleClientsLabel")}
            </InputLabel>
            <Select
              labelId="clients-label"
              id="clients"
              multiple
              value={isGlobal ? excludedClients : selectedClients}
              input={
                <OutlinedInput
                  label={
                    isGlobal
                      ? t("createPromoForm.excludedClientsLabel")
                      : t("createPromoForm.eligibleClientsLabel")
                  }
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
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2.5,
              pb: 2,
            }}
          >
            <Tooltip
              title={
                isCreating
                  ? t("createPromoForm.createPromo")
                  : t("createPromoForm.updatePromo")
              }
            >
              <IconButton
                type="submit"
                color="primary"
                sx={{
                  backgroundColor: "success.main",
                  color: "white",
                  "&:hover": { backgroundColor: "success.dark" },
                  borderRadius: "50%",
                  width: 56,
                  height: 56,
                  transition: "transform 0.2s",
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
                aria-label={
                  isCreating
                    ? t("createPromoForm.createPromo")
                    : t("createPromoForm.updatePromo")
                }
              >
                {isCreating ? <AddIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t("createPromoForm.cancel")}>
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
                aria-label={t("createPromoForm.cancel")}
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
