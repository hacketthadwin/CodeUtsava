export const COLORS = {
  primary: '#311B92',
  secondary: '#880E4F',
  tertiary: '#1B5E20',
  danger: '#B71C1C',
  darkBlue: '#0047AB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  lightBlue: '#87CEEB',
  orange: '#FF8C00',
};

export const getStockColor = (quantity, expiry) => {
  const expiryDate = new Date(expiry);
  const today = new Date();
  
  if (expiryDate < today) {
    return COLORS.danger;
  }
  
  if (quantity < 10) {
    return COLORS.danger;
  } else if (quantity >= 10 && quantity <= 50) {
    return COLORS.orange;
  } else {
    return COLORS.tertiary;
  }
};
