/**
 * Household API Endpoints
 * 
 * Functions for managing households, members, and invitations.
 */

import { apiClient } from '../client'
import type {
  HouseholdCreate,
  HouseholdUpdate,
  MemberInvite,
  MemberRoleUpdate,
  Household,
  HouseholdDetail,
  HouseholdList,
  InviteResponse,
  SuccessResponse,
} from '../types'

// ============================================================================
// Household Management
// ============================================================================

/**
 * Create a new household
 */
export async function createHousehold(data: HouseholdCreate): Promise<Household> {
  return apiClient.post<Household>('/households', { body: data })
}

/**
 * Get all households for the current user
 */
export async function getHouseholds(): Promise<HouseholdList> {
  return apiClient.get<HouseholdList>('/households')
}

/**
 * Get a specific household by ID
 */
export async function getHousehold(householdId: string): Promise<HouseholdDetail> {
  return apiClient.get<HouseholdDetail>(`/households/${householdId}`)
}

/**
 * Update a household
 */
export async function updateHousehold(
  householdId: string,
  data: HouseholdUpdate
): Promise<Household> {
  return apiClient.patch<Household>(`/households/${householdId}`, { body: data })
}

/**
 * Delete a household (admin only)
 */
export async function deleteHousehold(householdId: string): Promise<void> {
  await apiClient.delete(`/households/${householdId}`)
}

// ============================================================================
// Member Management
// ============================================================================

/**
 * Invite a member to a household
 */
export async function inviteMember(
  householdId: string,
  data: MemberInvite
): Promise<InviteResponse> {
  return apiClient.post<InviteResponse>(`/households/${householdId}/invite`, { body: data })
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  householdId: string,
  memberId: string,
  data: MemberRoleUpdate
): Promise<SuccessResponse> {
  return apiClient.patch<SuccessResponse>(
    `/households/${householdId}/members/${memberId}`,
    { body: data }
  )
}

/**
 * Remove a member from a household
 */
export async function removeMember(
  householdId: string,
  memberId: string
): Promise<SuccessResponse> {
  return apiClient.delete<SuccessResponse>(`/households/${householdId}/members/${memberId}`)
}

// ============================================================================
// Invitation Management
// ============================================================================

/**
 * Create an invitation for a household
 */
export async function createInvitation(
  householdId: string,
  data: { email: string; role: 'member' | 'admin' }
): Promise<any> {
  return apiClient.post<any>(`/households/${householdId}/invitations`, { body: data })
}

/**
 * Get all invitations for a household
 */
export async function getHouseholdInvitations(householdId: string): Promise<any> {
  return apiClient.get<any>(`/households/${householdId}/invitations`)
}

/**
 * Get invitation details by token (public endpoint)
 */
export async function getInvitationByToken(token: string): Promise<any> {
  return apiClient.get<any>(`/invitations/${token}`, { skipAuth: true })
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<any> {
  return apiClient.post<any>('/invitations/accept', { body: { token } })
}
