const StatusTracker = (
  previousData,
  message,
  statusName,
  statusId,
  createdBy,
  employeeName,
  employeePhone,
  arrivalDate = null,
) => {
  const newEntry = {
    message,
    status: statusName,
    statusId,
    employeeName,
    employeePhone,
    changedBy: createdBy,
    timestamp: new Date().toISOString(),
    ...(arrivalDate && { arrivalDate }),
  };

  let historyDataArray = [];

  try {
    if (previousData) {
      const parsed =
        typeof previousData === 'string'
          ? JSON.parse(previousData)
          : previousData;

      historyDataArray = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (error) {
    console.warn('Invalid status_tracker data:', error);
    historyDataArray = [];
  }

  historyDataArray.push(newEntry);
  return JSON.stringify(historyDataArray);
};

export default StatusTracker;
