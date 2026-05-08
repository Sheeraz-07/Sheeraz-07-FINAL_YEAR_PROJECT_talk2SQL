import type { UserRole } from '@/types';

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function canAccessSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === 'super_admin';
}

export function canValidateUsers(role: UserRole | null | undefined): boolean {
  return canAccessAdmin(role);
}

export function canManageAdmins(role: UserRole | null | undefined): boolean {
  return role === 'super_admin';
}

export function canChangeRoles(role: UserRole | null | undefined): boolean {
  return role === 'super_admin';
}

export function hasPermission(
  userRole: UserRole | null | undefined,
  requiredRoles: UserRole | UserRole[]
): boolean {
  if (!userRole) {
    return false;
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
}

export function getDefaultRoute(role: UserRole | null | undefined): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin/users';
    case 'user':
    default:
      return '/dashboard';
  }
}

export function formatRole(role: UserRole | null | undefined): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'user':
    default:
      return 'User';
  }
}
