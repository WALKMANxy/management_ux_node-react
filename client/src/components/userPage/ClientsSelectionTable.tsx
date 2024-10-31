// src/components/userPage/ClientsSelectionTable.tsx
import {
  Box,
  Checkbox,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import useManageEntities from "../../hooks/useManageEntities";
import { Client } from "../../models/entityModels";

interface ClientsSelectionTableProps {
  selectedClients: {
    id: string;
    colour?: string;
  }[];
  setSelectedClients: React.Dispatch<
    React.SetStateAction<{ id: string; colour?: string }[]>
  >;
}

const ClientsSelectionTable: React.FC<ClientsSelectionTableProps> = ({
  selectedClients,
  setSelectedClients,
}) => {
  const { t } = useTranslation();
  const {
    sortedClients: clients,
    handleEntitySearch,
    entitySearchText,
    loadingEntities,
    visibleRows,
    entityOptions,
    ref,
  } = useManageEntities();

  const isSelected = (id: string) =>
    selectedClients.some((client) => client.id === id);

  const handleSelect = (client: Client) => {
    if (isSelected(client.id)) {
      setSelectedClients((prev) => prev.filter((c) => c.id !== client.id));
    } else {
      setSelectedClients((prev) => [...prev, { id: client.id }]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelections = clients.map((client) => ({
        id: client.id,
        colour: "",
      }));
      setSelectedClients(newSelections);
    } else {
      setSelectedClients([]);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("clientsSelection.title", "Select Clients")}
      </Typography>
      {/* Search Field */}
      <TextField
        label={t(
          "clientsSelection.searchPlaceholder",
          "Search Clients by Name or ID"
        )}
        value={entitySearchText}
        onChange={(e) => handleEntitySearch(e.target.value)}
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
      />

      {/* Clients Table */}
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedClients.length > 0 &&
                    selectedClients.length < clients.length
                  }
                  checked={
                    clients.length > 0 &&
                    selectedClients.length === clients.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>{t("clientsSelection.name", "Name")}</TableCell>
              <TableCell>{t("clientsSelection.id", "ID")}</TableCell>
              <TableCell>{t("clientsSelection.agentId", "Agent ID")}</TableCell>
              {/* New Column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingEntities ? (
              Array.from({ length: visibleRows }).map((_, index) => (
                <TableRow
                  key={index}
                  className="animate__animated animate__fadeOut" 
                >
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                </TableRow>
              ))
            ) : entityOptions.length > 0 ? (
              entityOptions.map((entity, index) => (
                <TableRow key={index} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(entity.id)}
                      onChange={() => handleSelect(entity as Client)}
                    />
                  </TableCell>
                  <TableCell>{entity.name}</TableCell>
                  <TableCell>{entity.id}</TableCell>
                  <TableCell>
                    {(entity as Client).agent ||
                      t("clientsSelection.noAgent", "N/A")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t("clientsSelection.noResults", "No clients found.")}
                </TableCell>
              </TableRow>
            )}

            {/* Sentinel Element for Infinite Scrolling */}
            <TableRow ref={ref}>
              <TableCell colSpan={4} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Display Selected Clients */}
      {selectedClients.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
          {selectedClients.map(({ id }) => {
            const client = clients.find((c) => c.id === id);
            return (
              <Chip
                key={id}
                label={
                  client?.name ||
                  t("clientsSelection.unknownClient", "Unknown Client")
                }
                onDelete={() =>
                  setSelectedClients((prev) => prev.filter((c) => c.id !== id))
                }
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ClientsSelectionTable;
