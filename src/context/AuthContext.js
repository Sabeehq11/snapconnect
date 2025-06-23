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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await setUserFromSupabaseUser(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await setUserFromSupabaseUser(session.user);
        } else {
          setUser(null);
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
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - user might not exist in users table yet
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

    // Create user record in the users table
    if (data.user) {
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
        console.error('Error creating user record:', insertError);
        throw new Error('Failed to create user profile. Please try again.');
      }
    }

    return data.user;
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