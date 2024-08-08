// src/services/api/admins.ts

import { Admin } from '../../models/models';
import { apiCall } from './apiUtils'; // Assuming you have a utility file for common API call functions

export const loadAdminDetailsData = async (): Promise<any[]> => {
  return apiCall<any[]>('admins', 'GET');
};

export const getAdminById = async (id: string): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, 'GET');
};

