import { Admin } from '../models/types';
import { readFile, resolveFilePath } from '../utils/fileUtils';
import { config } from '../config/config';

export const getAllAdmins = (): Admin[] => {
  const filePath = resolveFilePath(config.adminDetailsFilePath || "");
  const admins: Admin[] = JSON.parse(readFile(filePath));
  return admins;
};

export const getAdminById = (id: string): Admin | undefined => {
  const admins = getAllAdmins();
  return admins.find(admin => admin.id === id);
};
