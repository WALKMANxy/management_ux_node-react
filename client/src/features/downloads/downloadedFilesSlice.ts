// src/features/downloadedFiles/downloadedFilesSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Attachment } from "../../models/dataModels";

interface DownloadedFilesState {
  files: Attachment[];
}

const initialState: DownloadedFilesState = {
  files: [],
};

const downloadedFilesSlice = createSlice({
  name: "downloadedFiles",
  initialState,
  reducers: {
    addDownloadedFile(state, action: PayloadAction<Attachment>) {
      console.debug(`Adding downloaded file: ${action.payload.fileName}`);
      const existingFile = state.files.find(
        (file) =>
          file.fileName === action.payload.fileName &&
          file.size === action.payload.size &&
          file.chatId === action.payload.chatId &&
          file.messageId === action.payload.messageId
      );

      if (!existingFile) {
        state.files.push(action.payload);
      }
    },
    removeDownloadedFile(
      state,
      action: PayloadAction<{
        fileName: string;
        chatId: string;
        messageId: string;
      }>
    ) {
      console.debug(`Removing downloaded file: ${action.payload.fileName}`);
      state.files = state.files.filter(
        (file) =>
          file.fileName !== action.payload.fileName ||
          file.chatId !== action.payload.chatId ||
          file.messageId !== action.payload.messageId
      );
    },

    clearDownloadedFiles(state) {
      console.debug("Clearing all downloaded files");
      // Clear all files
      state.files = [];
    },
  },
});

export const { addDownloadedFile, removeDownloadedFile, clearDownloadedFiles } =
  downloadedFilesSlice.actions;

export default downloadedFilesSlice.reducer;

export const selectDownloadedFiles = (state: RootState) =>
  state.downloadedFiles.files;
