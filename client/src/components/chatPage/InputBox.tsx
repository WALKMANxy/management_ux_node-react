// InputBox.tsx
import SendIcon from "@mui/icons-material/Send";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Box,
  IconButton,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import useChatLogic from "../../hooks/useChatsLogic";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

const InputBox: React.FC = () => {
  const [messageInput, setMessageInput] = useState("");
  const [messageType, setMessageType] = useState<
    "message" | "alert" | "promo" | "visit"
  >("message");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSendMessage } = useChatLogic();

  const handleSend = () => {
    console.log("handleSend called"); // Debug: Log function call
    if (messageInput.trim()) {
      console.log("Message input is valid, calling handleSendMessage"); // Debug: Message input validation
      handleSendMessage(messageInput, messageType);
      setMessageInput(""); // Clear the input field
    } else {
      console.log("Message input is empty, not sending message"); // Debug: Empty input case
    }
  };

  const currentChatId = useSelector((state: RootState) => state.chats.currentChat?._id);
  console.log(currentChatId)

  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Type a message..."
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
      />
      <IconButton color="primary" onClick={() => setIsModalOpen(true)}>
        <TuneIcon />
      </IconButton>
      <IconButton color="primary" onClick={handleSend}>
        <SendIcon />
      </IconButton>

      {/* Modal for setting message type */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            p: 3,
            bgcolor: "#ffffff",
            borderRadius: 1,
            mx: "auto",
            my: "20%",
            maxWidth: 300,
          }}
        >
          <Typography variant="h6" mb={2}>
            Select Message Type
          </Typography>
          <Select
            fullWidth
            value={messageType || "message"}
            onChange={(e) =>
              setMessageType(
                e.target.value as "message" | "alert" | "promo" | "visit"
              )
            }
          >
            <MenuItem value="message">Message</MenuItem>
            <MenuItem value="alert">Alert</MenuItem>
            <MenuItem value="promo">Promo</MenuItem>
            <MenuItem value="visit">Visit</MenuItem>
          </Select>
        </Box>
      </Modal>
    </Box>
  );
};

export default InputBox;
