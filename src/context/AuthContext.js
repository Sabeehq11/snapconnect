import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await setUserFromSupabaseUser(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await setUserFromSupabaseUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await setUserFromSupabaseUser(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const setUserFromSupabaseUser = async (supabaseUser) => {
    // Get additional user data from the users table
    let { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User not found in users table - create the profile
      console.log('User profile not found, creating...');
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: supabaseUser.id,
              email: supabaseUser.email,
              display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
              username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || `user_${supabaseUser.id.slice(0, 8)}`,
              created_at: new Date().toISOString(),
              friends: [],
              snap_score: 0
            }
          ]);

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('User profile created successfully');
          // Fetch the newly created user data
          const { data: newUserData } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
          
          if (newUserData) {
            userData = newUserData;
          }
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    } else if (error) {
      console.error('Error fetching user data:', error);
    }

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      username: userData?.username || supabaseUser.user_metadata?.username || '',
      displayName: userData?.display_name || supabaseUser.user_metadata?.display_name || '',
      photoURL: userData?.photo_url || supabaseUser.user_metadata?.photo_url || null,
      createdAt: userData?.created_at || supabaseUser.created_at,
      friends: userData?.friends || [],
      snapScore: userData?.snap_score || 0,
      ...userData
    });
  };

  const signup = async (email, password, displayName, username) => {
    // First check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new Error('Username already taken. Please choose another one.');
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: username,
        }
      }
    });

    if (error) {
      throw error;
    }

    // If signup was successful (even if email confirmation is pending)
    if (data.user) {
      // Only try to create user record if the user was actually created
      // Don't throw error if it fails here - the signup itself was successful
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              display_name: displayName,
              username: username,
              created_at: new Date().toISOString(),
              friends: [],
              snap_score: 0
            }
          ]);

        if (insertError) {
          console.log('User profile will be created after email confirmation:', insertError);
        }
      } catch (profileError) {
        console.log('User profile will be created after email confirmation');
      }
      
      // Return success object with confirmation status
      return {
        user: data.user,
        needsEmailConfirmation: !data.session // If no session, email confirmation is needed
      };
    }

    throw new Error('Signup failed for unknown reason');
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 