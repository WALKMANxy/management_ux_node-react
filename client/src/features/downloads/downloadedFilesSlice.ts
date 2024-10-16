// src/features/downloadedFiles/downloadedFilesSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attachment } from '../../models/dataModels';
import { RootState } from '../../app/store';

interface DownloadedFilesState {
  files: Attachment[];
}

const initialState: DownloadedFilesState = {
  files: [],
};

const downloadedFilesSlice = createSlice({
  name: 'downloadedFiles',
  initialState,
  reducers: {
    addDownloadedFile(state, action: PayloadAction<Attachment>) {
      console.debug(
        `Adding downloaded file: ${action.payload.fileName}`
      );
      // Avoid duplicates
      const existingFile = state.files.find(
        (file) => file.fileName === action.payload.fileName
      );
      if (!existingFile) {
        state.files.push(action.payload);
      }
    },
    removeDownloadedFile(state, action: PayloadAction<string>) {
      console.debug(`Removing downloaded file: ${action.payload}`);
      // Remove by fileName
      state.files = state.files.filter(
        (file) => file.fileName !== action.payload
      );
    },
    clearDownloadedFiles(state) {
      console.debug('Clearing all downloaded files');
      // Clear all files
      state.files = [];
    },
  },

});

export const {
  addDownloadedFile,
  removeDownloadedFile,
  clearDownloadedFiles,
} = downloadedFilesSlice.actions;

export default downloadedFilesSlice.reducer;


export const selectDownloadedFiles = (state: RootState) => state.downloadedFiles.files;
