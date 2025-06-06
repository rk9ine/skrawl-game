/**
 * Profile Setup Test Utilities
 * Helper functions to test and debug profile setup functionality
 */

import { supabase } from '../services/supabase';

export interface ProfileTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * Test if a user profile exists in the database
 */
export async function testUserProfileExists(userId: string): Promise<ProfileTestResult> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          message: 'User profile does not exist in database',
          error
        };
      }
      return {
        success: false,
        message: `Database error: ${error.message}`,
        error
      };
    }

    return {
      success: true,
      message: 'User profile found',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: `Exception: ${error}`,
      error
    };
  }
}

/**
 * Test creating a user profile manually
 */
export async function testCreateUserProfile(userId: string, email: string): Promise<ProfileTestResult> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        has_completed_profile_setup: false,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Failed to create profile: ${error.message}`,
        error
      };
    }

    return {
      success: true,
      message: 'User profile created successfully',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: `Exception creating profile: ${error}`,
      error
    };
  }
}

/**
 * Test updating a user profile
 */
export async function testUpdateUserProfile(
  userId: string, 
  displayName: string, 
  avatar: string
): Promise<ProfileTestResult> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        display_name: displayName,
        avatar_data: avatar,
        has_completed_profile_setup: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Failed to update profile: ${error.message}`,
        error
      };
    }

    return {
      success: true,
      message: 'User profile updated successfully',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: `Exception updating profile: ${error}`,
      error
    };
  }
}

/**
 * Test the complete profile setup flow
 */
export async function testCompleteProfileFlow(
  userId: string, 
  email: string, 
  displayName: string, 
  avatar: string
): Promise<ProfileTestResult> {
  console.log('🧪 Testing complete profile flow...');

  // Step 1: Check if profile exists
  const existsResult = await testUserProfileExists(userId);
  console.log('Step 1 - Profile exists:', existsResult);

  // Step 2: Create profile if it doesn't exist
  if (!existsResult.success) {
    const createResult = await testCreateUserProfile(userId, email);
    console.log('Step 2 - Create profile:', createResult);
    
    if (!createResult.success) {
      return createResult;
    }
  }

  // Step 3: Update profile with display name and avatar
  const updateResult = await testUpdateUserProfile(userId, displayName, avatar);
  console.log('Step 3 - Update profile:', updateResult);

  if (!updateResult.success) {
    return updateResult;
  }

  // Step 4: Verify final state
  const finalResult = await testUserProfileExists(userId);
  console.log('Step 4 - Final verification:', finalResult);

  if (finalResult.success && finalResult.data?.has_completed_profile_setup) {
    return {
      success: true,
      message: 'Complete profile flow test passed',
      data: finalResult.data
    };
  }

  return {
    success: false,
    message: 'Profile flow completed but verification failed',
    data: finalResult.data
  };
}

/**
 * Test auth trigger functionality
 */
export async function testAuthTrigger(): Promise<ProfileTestResult> {
  try {
    // Check if the trigger function exists
    const { data, error } = await supabase
      .rpc('handle_new_user')
      .then(() => ({ data: true, error: null }))
      .catch((err) => ({ data: null, error: err }));

    if (error) {
      return {
        success: false,
        message: 'Auth trigger function not found or not accessible',
        error
      };
    }

    return {
      success: true,
      message: 'Auth trigger function is accessible'
    };
  } catch (error) {
    return {
      success: false,
      message: `Exception testing auth trigger: ${error}`,
      error
    };
  }
}

/**
 * Run all profile tests
 */
export async function runAllProfileTests(userId?: string, email?: string): Promise<void> {
  console.log('🧪 Running all profile tests...');
  
  // Use current user or test data
  const testUserId = userId || 'test-user-id';
  const testEmail = email || 'test@example.com';
  const testDisplayName = 'TestUser';
  const testAvatar = 'test-avatar';

  console.log('Test parameters:', { testUserId, testEmail, testDisplayName, testAvatar });

  // Test 1: Auth trigger
  const triggerResult = await testAuthTrigger();
  console.log('🔧 Auth Trigger Test:', triggerResult);

  // Test 2: Profile existence
  const existsResult = await testUserProfileExists(testUserId);
  console.log('👤 Profile Exists Test:', existsResult);

  // Test 3: Complete flow (only if using test data)
  if (userId === undefined) {
    const flowResult = await testCompleteProfileFlow(testUserId, testEmail, testDisplayName, testAvatar);
    console.log('🔄 Complete Flow Test:', flowResult);
  }

  console.log('✅ All profile tests completed');
}
