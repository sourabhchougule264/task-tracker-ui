import type { User } from '../types';

/**
 * Permission utility functions for role-based access control
 */

/**
 * Check if user has Admin role
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role =>
    role.toLowerCase() === 'admin' ||
    role.toLowerCase() === 'administrator'
  );
};

/**
 * Check if user has TASK_CREATOR role (can create projects and tasks)
 * This includes Admin, Manager, and TASK_CREATOR roles
 */
export const isTaskCreator = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => {
    const lowerRole = role.toLowerCase();
    return lowerRole === 'admin' ||
           lowerRole === 'administrator' ||
           lowerRole === 'manager' ||
           lowerRole === 'task_creator' ||
           lowerRole === 'taskcreator';
  });
};

/**
 * Check if user has READ_ONLY role (cannot create or edit)
 */
export const isReadOnly = (user: User | null): boolean => {
  if (!user || !user.roles) return true; // Default to read-only if no roles
  return user.roles.some(role =>
    role.toLowerCase() === 'read_only' ||
    role.toLowerCase() === 'readonly'
  ) && !isTaskCreator(user); // If they have both roles, task creator takes precedence
};

/**
 * Check if user can create projects
 * Admin and TASK_CREATOR: Yes
 * READ_ONLY: No
 */
export const canCreateProject = (user: User | null): boolean => {
  return isTaskCreator(user);
};

/**
 * Check if user can update a project
 * Admin: Yes (any project)
 * TASK_CREATOR: Yes (their own projects)
 * READ_ONLY: No
 */
export const canUpdateProject = (user: User | null): boolean => {
  return isTaskCreator(user);
};

/**
 * Check if user can delete a project
 * Admin: Yes (any project)
 * TASK_CREATOR: Yes (their own projects)
 * READ_ONLY: No
 */
export const canDeleteProject = (user: User | null): boolean => {
  return isTaskCreator(user);
};

/**
 * Check if user can create tasks
 * Admin and TASK_CREATOR: Yes
 * READ_ONLY: No
 */
export const canCreateTask = (user: User | null): boolean => {
  return isTaskCreator(user);
};

/**
 * Check if user can update a task
 * Admin: Yes (any task)
 * TASK_CREATOR: Yes (their own tasks or assigned tasks)
 * READ_ONLY: No (except status updates for assigned tasks)
 */
export const canUpdateTask = (user: User | null): boolean => {
  return isTaskCreator(user);
};

/**
 * Check if user can delete a task
 * Admin: Yes (any task)
 * TASK_CREATOR: Yes (their own tasks)
 * READ_ONLY: No
 */
export const canDeleteTask = (user: User | null): boolean => {
  return isTaskCreator(user);
};

/**
 * Check if user can manage other users (assign roles, delete)
 * Only Admin: Yes
 * Others: No
 */
export const canManageUsers = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Check if user can assign tasks to other users
 * Admin and TASK_CREATOR: Yes
 * READ_ONLY: No
 */
export const canAssignTask = (user: User | null): boolean => {
  return isTaskCreator(user);
};

/**
 * Get user role display name
 */
export const getUserRoleDisplayName = (user: User | null): string => {
  if (!user || !user.roles || user.roles.length === 0) return 'No Role';
  if (isAdmin(user)) return 'Admin';
  if (isReadOnly(user)) return 'Read Only';
  if (isTaskCreator(user)) return 'Task Creator';
  return user.roles[0]; // Return first role if none match
};

