// Season status constants
export const SEASON_STATUS = {
  PRESEASON: 'preseason',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type SeasonStatus = typeof SEASON_STATUS[keyof typeof SEASON_STATUS];

// Helper functions for season status
export const getSeasonStatusLabel = (status: SeasonStatus): string => {
  switch (status) {
    case SEASON_STATUS.PRESEASON:
      return 'Preseason';
    case SEASON_STATUS.IN_PROGRESS:
      return 'In Progress';
    case SEASON_STATUS.COMPLETED:
      return 'Completed';
    case SEASON_STATUS.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

export const getSeasonStatusColor = (status: SeasonStatus): string => {
  switch (status) {
    case SEASON_STATUS.PRESEASON:
      return 'text-blue-600 bg-blue-50';
    case SEASON_STATUS.IN_PROGRESS:
      return 'text-green-600 bg-green-50';
    case SEASON_STATUS.COMPLETED:
      return 'text-gray-600 bg-gray-50';
    case SEASON_STATUS.CANCELLED:
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};
