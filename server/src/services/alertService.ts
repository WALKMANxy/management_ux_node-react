import { Alert } from "../models/Alert";

export const getAllAlerts = async () => {
  return await Alert.find();
};

export const getAlertsByEntity = async (
  entityRole: string,
  entityCode: string
) => {
  return await Alert.find({ entityRole, entityCode });
};

export const createAlert = async (alertData: any) => {
  const alert = new Alert(alertData);
  await alert.save();
  return alert;
};

export const updateAlert = async (id: string, alertData: any) => {
  const alert = await Alert.findByIdAndUpdate(id, alertData, {
    new: true,
    runValidators: true,
  });
  return alert;
};
