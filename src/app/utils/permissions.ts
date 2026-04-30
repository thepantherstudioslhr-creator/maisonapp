import { UserRole } from '../types';

export type PermissionType =
  | 'view_dashboard'
  | 'create_booking'
  | 'edit_booking'
  | 'delete_booking'
  | 'checkout_booking'
  | 'add_room'
  | 'remove_room'
  | 'view_reports'
  | 'view_analytics'
  | 'manage_users'
  | 'access_settings'
  | 'change_theme'
  | 'view_financial_reports'
  | 'export_data';

const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionType, boolean>> = {
  admin: {
    view_dashboard: true,
    create_booking: true,
    edit_booking: true,
    delete_booking: true,
    checkout_booking: true,
    add_room: true,
    remove_room: true,
    view_reports: true,
    view_analytics: true,
    manage_users: true,
    access_settings: true,
    change_theme: true,
    view_financial_reports: true,
    export_data: true,
  },
  manager: {
    view_dashboard: true,
    create_booking: true,
    edit_booking: true,
    delete_booking: false,
    checkout_booking: true,
    add_room: false,
    remove_room: false,
    view_reports: true,
    view_analytics: true,
    manage_users: false,
    access_settings: false,
    change_theme: false,
    view_financial_reports: false,
    export_data: true,
  },
  staff: {
    view_dashboard: true,
    create_booking: true,
    edit_booking: false,
    delete_booking: false,
    checkout_booking: true,
    add_room: false,
    remove_room: false,
    view_reports: false,
    view_analytics: false,
    manage_users: false,
    access_settings: false,
    change_theme: true,
    view_financial_reports: false,
    export_data: false,
  },
};

export function hasPermission(role: UserRole, permission: PermissionType): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

export function canAccessPage(role: UserRole, page: string): boolean {
  const pagePermissions: Record<string, PermissionType> = {
    dashboard: 'view_dashboard',
    booking: 'create_booking',
    reports: 'view_reports',
    settings: 'access_settings',
    users: 'manage_users',
    rooms: 'add_room',
  };

  const permission = pagePermissions[page];
  return permission ? hasPermission(role, permission) : false;
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Hotel Manager',
    staff: 'Staff Member',
  };
  return displayNames[role] || role;
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-red-500',
    manager: 'bg-blue-500',
    staff: 'bg-green-500',
  };
  return colors[role] || 'bg-gray-500';
}
