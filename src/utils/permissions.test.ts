import { describe, it, expect } from 'vitest';
import {
    isAdmin,
    isTaskCreator,
    isReadOnly,
    canCreateProject,
    canManageUsers,
    getUserRoleDisplayName
} from './permissions';
import type { User } from '../types';

describe('Permission Utilities', () => {
    const createUser = (roles: string[]): User => ({
        username: 'testuser',
        email: 'test@test.com',
        roles,
    });

    describe('isAdmin', () => {
        it('should return true for "Admin" or "Administrator" (case-insensitive)', () => {
            expect(isAdmin(createUser(['Admin']))).toBe(true);
            expect(isAdmin(createUser(['administrator']))).toBe(true);
        });

        it('should return false for other roles or null users', () => {
            expect(isAdmin(createUser(['Manager']))).toBe(false);
            expect(isAdmin(null)).toBe(false);
            expect(isAdmin(createUser([]))).toBe(false);
        });
    });

    describe('isTaskCreator', () => {
        it('should return true for Admin, Manager, and Task_Creator roles', () => {
            expect(isTaskCreator(createUser(['Manager']))).toBe(true);
            expect(isTaskCreator(createUser(['task_creator']))).toBe(true);
            expect(isTaskCreator(createUser(['taskcreator']))).toBe(true);
            expect(isTaskCreator(createUser(['Admin']))).toBe(true);
        });

        it('should return false for Read_Only or guest users', () => {
            expect(isTaskCreator(createUser(['read_only']))).toBe(false);
        });
    });

    describe('isReadOnly', () => {
        it('should return true if user ONLY has "read_only" role', () => {
            expect(isReadOnly(createUser(['read_only']))).toBe(true);
        });

        it('should return false if user has "read_only" BUT also "manager"', () => {
            const mixedUser = createUser(['read_only', 'manager']);
            expect(isReadOnly(mixedUser)).toBe(false);
        });
    });

    describe('Action Permissions (Mapped Functions)', () => {
        const manager = createUser(['Manager']);
        const readOnly = createUser(['ReadOnly']);

        it('canCreateProject: should allow task creators and block read only', () => {
            expect(canCreateProject(manager)).toBe(true);
            expect(canCreateProject(readOnly)).toBe(false);
        });

        it('canManageUsers: should ONLY allow Admin', () => {
            expect(canManageUsers(createUser(['Admin']))).toBe(true);
            expect(canManageUsers(manager)).toBe(false);
            expect(canManageUsers(readOnly)).toBe(false);
        });
    });

    describe('getUserRoleDisplayName', () => {
        it('should prioritize the highest role for display', () => {
            expect(getUserRoleDisplayName(createUser(['Admin', 'Manager']))).toBe('Admin');
            expect(getUserRoleDisplayName(createUser(['Manager', 'ReadOnly']))).toBe('Task Creator');
            expect(getUserRoleDisplayName(createUser(['ReadOnly']))).toBe('Read Only');
        });

        it('should return "No Role" for empty users', () => {
            expect(getUserRoleDisplayName(null)).toBe('No Role');
        });

        it('should return the first role if it does not match known categories', () => {
            expect(getUserRoleDisplayName(createUser(['Specialist']))).toBe('Specialist');
        });
    });
});