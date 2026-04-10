export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'up':
    case 'active':
      return '#10b981';
    case 'down':
    case 'inactive':
      return '#ef4444';
    case 'warning':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};
