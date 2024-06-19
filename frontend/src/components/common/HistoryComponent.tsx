// src/components/common/HistoryComponent.tsx
import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";

interface HistoryProps {
  history: { [key: string]: any }[];
}

const HistoryComponent: React.FC<HistoryProps> = ({ history }) => {
  return (
    <List>
      {history.map((item, index) => (
        <ListItem key={index}>
          {Object.keys(item).map((key) => (
            <ListItemText key={key} primary={`${key}: ${item[key]}`} />
          ))}
        </ListItem>
      ))}
    </List>
  );
};

export default HistoryComponent;
