export const getLandingRoute = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/dashboard';
    case 'TECHNICIAN':
      return '/tickets';
    case 'USER':
    case 'STUDENT':
    default:
      return '/resources'; // Default page after login
  }
};