//src/components/userPage/ManageUsers.tsx
import InfoIcon from "@mui/icons-material/Info";
import {
  Box,
  Button,
  ButtonGroup,
  debounce,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "animate.css";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getAllUsersThunk,
  selectAllUsers,
  selectUsersLoading,
} from "../../features/users/userSlice";
import { User, UserRole } from "../../models/entityModels";
import { showToast } from "../../services/toastMessage";
import { ExtendedManageUsersSkeleton } from "./Skeletons";

const UserDetails = React.lazy(() => import("./UserDetails"));

type Order = "asc" | "desc";

// Define role colors
const roleColors: Record<
  "all" | "admin" | "guest" | "client" | "agent" | "employee",
  { color: string; hoverColor: string }
> = {
  all: { color: "black", hoverColor: "gray" },
  client: { color: "green", hoverColor: "darkgreen" },
  agent: { color: "blue", hoverColor: "darkblue" },
  admin: { color: "purple", hoverColor: "darkpurple" },
  employee: { color: "orange", hoverColor: "darkorange" },
  guest: { color: "red", hoverColor: "darkred" }, // Assuming 'guest' uses red
};

const ManageUsers: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const loading = useAppSelector(selectUsersLoading);

  const [visibleRows, setVisibleRows] = useState<number>(20);

  // Sorting state
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof User>("email");

  // Filter states
  const [roleFilter, setRoleFilter] = useState<
    "admin" | "guest" | "client" | "agent" | "employee" | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch all users when the component mounts
  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  // Handle lazy loading with Intersection Observer
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  // Filtering users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by role if not 'all'
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.role?.toLowerCase() === roleFilter
      );
    }

    // Filter by search term (email or entityName)
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
          (user.entityName &&
            user.entityName.toLowerCase().includes(lowerSearch))
      );
    }

    return filtered;
  }, [users, roleFilter, searchTerm]);

  useEffect(() => {
    if (inView && visibleRows < filteredUsers.length) {
      setVisibleRows((prev) => prev + 20);
    }
  }, [inView, filteredUsers.length, visibleRows]);

  // Reset visible rows when filters change
  useEffect(() => {
    setVisibleRows(20);
  }, [roleFilter, searchTerm]);

  // Handle row double click to select a user
  const handleRowDoubleClick = useCallback(
    (user: Partial<User>) => {
      setSelectedUser(user);
      showToast.success(
        t("manageUsers.selectedUser", "Selected user: ") + user.email
      );
    },
    [t]
  );

  // Reset selected user to null
  const handleBackToList = useCallback(() => {
    setSelectedUser(null);
    showToast.info(t("manageUsers.userDeselected", "User deselected"));
    dispatch(getAllUsersThunk());
  }, [dispatch, t]);

  // Handle sorting request
  const handleRequestSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Comparator function
  const comparator = useCallback(
    (a: Partial<User>, b: Partial<User>) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (aValue === bValue) return 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      // For dates or other types, convert to comparable values
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      return order === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    },
    [orderBy, order]
  );

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort(comparator);
  }, [filteredUsers, comparator]);

  const visibleUsers = useMemo(() => {
    return sortedUsers.slice(0, visibleRows);
  }, [sortedUsers, visibleRows]);

  // Define columns with desired order
  const columns: { id: keyof User; label: string; minWidth: number }[] = [
    {
      id: "email",
      label: t("manageUsers.columns.email", "Email"),
      minWidth: 150,
    },
    { id: "role", label: t("manageUsers.columns.role", "Role"), minWidth: 100 },
    {
      id: "entityCode",
      label: t("manageUsers.columns.entityCode", "Entity Code"),
      minWidth: 100,
    },
    {
      id: "entityName",
      label: t("manageUsers.columns.entityName", "Entity Name"),
      minWidth: 150,
    },
    {
      id: "authType",
      label: t("manageUsers.columns.authType", "Auth Type"),
      minWidth: 100,
    },
    {
      id: "isEmailVerified",
      label: t("manageUsers.columns.emailVerified", "Email Verified"),
      minWidth: 120,
    },
    {
      id: "createdAt",
      label: t("manageUsers.columns.createdAt", "Created At"),
      minWidth: 150,
    },
  ];

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <Box sx={{ px: 0, pb: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t("manageUsers.title", "Manage Users")}
      </Typography>

      {/* Information Tooltip */}
      {!selectedUser && (
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <Tooltip
            title={
              <Typography variant="body2">
                {t(
                  "manageUsers.infoTooltip",
                  "In order for a user to use the app, they need to be assigned an entity. You can use the table below to select a user by double-clicking on the email, and then proceed with the entity assignment."
                )}
              </Typography>
            }
            arrow
            placement="right"
          >
            <InfoIcon color="info" sx={{ mr: 1, fontSize: "1.2rem" }} />
          </Tooltip>
          <Typography variant="subtitle1">
            {t(
              "manageUsers.selectUserPrompt",
              "Select a user to assign an entity"
            )}
          </Typography>
        </Box>
      )}

      {/* Filter Bar */}
      <Box sx={{ mb: 2 }}>
        {/* Role Selection Buttons */}
        <ButtonGroup
          variant="contained"
          aria-label={t("manageEntities.roleSelection", "Role selection")}
          sx={{
            boxShadow: "none",
            gap: 2,
            transform: isMobile ? "scale(0.75)" : "none",
            transformOrigin: "top left",
            width: isMobile ? "133.33%" : "100%",
            mb: 2.5,
          }}
        >
          {["all", "client", "agent", "admin", "employee", "guest"].map(
            (role) => (
              <Button
                key={role}
                onClick={() => setRoleFilter(role as UserRole)}
                sx={{
                  backgroundColor:
                    roleFilter === role ? roleColors[role].color : "black",
                  "&:hover": {
                    backgroundColor:
                      roleFilter === role
                        ? roleColors[role].hoverColor
                        : "gray",
                  },
                  textTransform: "capitalize",
                }}
              >
                {t(
                  `manageUsers.${role}`,
                  role.charAt(0).toUpperCase() + role.slice(1)
                )}
              </Button>
            )
          )}
        </ButtonGroup>

        {/* Search Field */}
        <TextField
          label={t(
            "manageUsers.searchPlaceholder",
            "Search by Email or Entity Name"
          )}
          onChange={handleSearchChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Render User Details with fadeIn animation */}
      {selectedUser ? (
        <Box sx={{ px: 1 }} className="animate__animated animate__fadeIn">
          <Suspense fallback={<ExtendedManageUsersSkeleton />}>
            <UserDetails user={selectedUser} onBack={handleBackToList} />
          </Suspense>
        </Box>
      ) : (
        <Box className="animate__animated animate__fadeIn">
          <TableContainer
            sx={{
              maxHeight: "50dvh",
              overflow: "auto",
            }}
          >
            <Table
              stickyHeader
              aria-label={t("manageUsers.userTable", "User Table")}
            >
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{
                        minWidth: column.minWidth,
                        whiteSpace: "nowrap",
                        fontWeight: "bold",
                        backgroundColor: theme.palette.action.hover,
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                      sortDirection={orderBy === column.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: visibleRows }).map((_, index) => (
                    <TableRow
                      key={index}
                      className="animate__animated animate__fadeOut"
                    >
                      {columns.map((column) => (
                        <TableCell key={column.id}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : visibleUsers.length > 0 ? (
                  visibleUsers.map((user) => (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={user._id}
                      onDoubleClick={() => handleRowDoubleClick(user)}
                      sx={{
                        cursor: "pointer",
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                      className="animate__animated animate__fadeIn"
                    >
                      <TableCell sx={{ color: "primary.main" }}>
                        {user.email}
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.entityCode}</TableCell>
                      <TableCell>
                        {user.entityName || t("manageUsers.na", "N/A")}
                      </TableCell>
                      <TableCell>{user.authType}</TableCell>
                      <TableCell>
                        {user.isEmailVerified
                          ? t("manageUsers.yes", "Yes")
                          : t("manageUsers.no", "No")}
                      </TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : t("manageUsers.na", "N/A")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      {t("manageUsers.noUsersFound", "No users found.")}
                    </TableCell>
                  </TableRow>
                )}
                {/* Sentinel row for Intersection Observer */}
                <TableRow ref={ref}>
                  <TableCell colSpan={columns.length} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default ManageUsers;
