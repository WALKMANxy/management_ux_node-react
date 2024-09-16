// InputBox.tsx
import SendIcon from "@mui/icons-material/Send";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../features/auth/authSlice"; // Assuming the selector is defined in the auth slice
import useChatLogic from "../../hooks/useChatsLogic";

const InputBox: React.FC = () => {
  const [messageInput, setMessageInput] = useState("");
  const [messageType, setMessageType] = useState<
    "message" | "alert" | "promo" | "visit"
  >("message");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const { handleSendMessage } = useChatLogic();
  const userRole = useSelector(selectUserRole); // Get the user role from Redux

  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input to retain focus
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSend = () => {
    if (messageInput.trim()) {
      handleSendMessage(messageInput, messageType);
      setMessageInput(""); // Clear the input field
      inputRef.current?.focus(); // Keep focus on the input field
    }
  };

  // Handler for opening the message type dropdown
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handler for closing the dropdown menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        borderRadius: isMobile  ? "0px" : "1.5em", // Rounded corners for the paper
        mt: 0,
      }}
    >
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Type a message..."
        value={messageInput}
        inputRef={inputRef} // Attach the ref to keep focus
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && handleSend()}
        autoComplete="off" // Keep this for desktop browsers
        type="search"
        aria-label="Chat input box"
        role="textbox"
        inputProps={{
          type: "search",
          //WE HAVE TO FUCKING USE THE SEARCH TYPE BECAUSE SOME CUNT AT FUCKING GOOGLE DECIDED TO SHOW CREDIT CARD, ADDRESS AND PASSWORD AUTOFILL INSIDE OF GBOARD FOR LITERALLY EVERY FUCKING INPUT TYPE EXCEPT SEARCH, JESUS FUCKING CHRIST
          inputMode: "text",
          enterKeyHint: "send",
          autoCorrect: "on",
          autoCapitalize: "on",
          spellCheck: "true",
          "data-form-type": "other",
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "1.5em",
            height: "2.9em",
            padding: "0.5em 0.875em",
          },
          "& .MuiInputBase-input": {
            height: "1.25em",
            // Add appearance styles properly within the input selector
            WebkitAppearance: "none", // Safari and Chrome
            MozAppearance: "none", // Firefox
          },
        }}
      />
      <Divider
        sx={{ height: "1em", marginLeft: 1, marginRight: 1 }}
        orientation="vertical"
      />

      {userRole !== "client" && ( // Show the TuneIcon only if the user is not a client
        <IconButton color="primary" onClick={handleMenuOpen}>
          <TuneIcon />
        </IconButton>
      )}
      <IconButton color="primary" onClick={handleSend}>
        <SendIcon />
      </IconButton>

      {/* Dropdown Menu for setting message type */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            borderRadius: "1em", // Rounded corners for the menu
            padding: "0.5em",
          },
        }}
      >
        <Grid container spacing={1} sx={{ padding: 1 }}>
          <Grid item xs={6}>
            <MenuItem
              onClick={() => {
                setMessageType("message");
                handleMenuClose();
              }}
              sx={{ justifyContent: "center" }}
            >
              Message
            </MenuItem>
          </Grid>
          <Grid item xs={6}>
            <MenuItem
              onClick={() => {
                setMessageType("alert");
                handleMenuClose();
              }}
              sx={{ justifyContent: "center" }}
            >
              Alert
            </MenuItem>
          </Grid>
          <Grid item xs={6}>
            <MenuItem
              onClick={() => {
                setMessageType("promo");
                handleMenuClose();
              }}
              sx={{ justifyContent: "center" }}
            >
              Promo
            </MenuItem>
          </Grid>
          <Grid item xs={6}>
            <MenuItem
              onClick={() => {
                setMessageType("visit");
                handleMenuClose();
              }}
              sx={{ justifyContent: "center" }}
            >
              Visit
            </MenuItem>
          </Grid>
        </Grid>
      </Menu>
    </Paper>
  );
};

export default InputBox;
