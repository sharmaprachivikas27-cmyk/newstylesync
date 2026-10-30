import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_user_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authUser) => {
    if (!authUser) return null;
    try {
      // 1. Fetch user profile from Supabase
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const userRole = profile?.role || authUser.user_metadata?.role || 'customer';

      // 2. If user is a shopkeeper, fetch their dedicated boutique from Supabase
      let shopId = null;
      let shopName = null;
      let shopData = null;

      if (userRole === 'shopkeeper') {
        const { data: shop } = await supabase
          .from('shops')
          .select('*')
          .eq('shopkeeper_id', authUser.id)
          .maybeSingle();

        if (shop) {
          shopId = shop.id;
          shopName = shop.name;
          shopData = shop;
        }
      }

      const fullUser = {
        id: authUser.id,
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        email: authUser.email,
        role: userRole,
        phone: profile?.phone || authUser.user_metadata?.phone || '',
        shopId,
        shopName,
        shop: shopData,
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      };

      setUser(fullUser);
      localStorage.setItem('stylesync_user_auth', JSON.stringify(fullUser));
      return fullUser;
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
      return null;
    }
  };

  // Sync Supabase Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user).finally(() => setLoading(false));
      } else {
        setUser(null);
        localStorage.removeItem('stylesync_user_auth');
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        localStorage.removeItem('stylesync_user_auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('stylesync_user_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('stylesync_user_auth');
    }
  }, [user]);

  // Real Supabase login
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please check your .env credentials.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;
      if (!data?.user) throw new Error('No user returned from Supabase.');

      const fullUser = await fetchUserProfile(data.user);
      return fullUser || { id: data.user.id, email: data.user.email, role: 'customer' };
    } finally {
      setLoading(false);
    }
  };

  // Real Supabase signup
  const signup = async ({
    name,
    email,
    password,
    phone = '',
    role = 'customer',
    shopName = '',
    shopAddress = '',
    shopDescription = '',
    logoUrl = ''
  }) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please check your .env credentials.');
      }

      const targetRole = role === 'shopkeeper' ? 'shopkeeper' : 'customer';

      // 1. Create auth user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
            role: targetRole
          }
        }
      });

      if (error) throw error;
      const createdUser = data?.user;
      if (!createdUser) throw new Error('Failed to create account in Supabase.');

      // 2. Ensure profile exists in profiles table
      try {
        await supabase.from('profiles').upsert({
          id: createdUser.id,
          email: createdUser.email,
          full_name: name.trim(),
          phone: phone.trim(),
          role: targetRole
        });
      } catch (profErr) {
        console.warn('Profile upsert notice:', profErr);
      }

      // 3. If Shopkeeper, automatically create their boutique in the shops table
      if (targetRole === 'shopkeeper') {
        const boutiqueName = shopName.trim() || `${name}'s Boutique`;
        const boutiqueAddress = shopAddress.trim() || 'Fashion District';

        const { data: newShop, error: shopErr } = await supabase
          .from('shops')
          .insert([
            {
              shopkeeper_id: createdUser.id,
              name: boutiqueName,
              address: boutiqueAddress,
              phone: phone.trim(),
              description: shopDescription.trim() || 'Exclusive fashion boutique on StyleSync.',
              logo: logoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
              banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
              enabled: true,
              owner_name: name.trim(),
              email: email.trim(),
              city: 'New York',
              state: 'NY',
              pincode: '10001'
            }
          ])
          .select()
          .single();

        if (shopErr) {
          console.error('Failed to create shop for shopkeeper:', shopErr);
        }
      }

      // If session is immediately active (email auto-confirm is enabled)
      if (data.session) {
        const fullProfile = await fetchUserProfile(createdUser);
        return { user: fullProfile || createdUser, requiresConfirmation: false };
      }

      return { user: createdUser, requiresConfirmation: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('stylesync_user_auth');
    }
  };

  const refreshProfile = async () => {
    if (user?.id && isSupabaseConfigured()) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        return fetchUserProfile(authUser);
      }
    }
    return null;
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isShopkeeper = user?.role === 'shopkeeper';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAuthenticated,
        isAdmin,
        isShopkeeper,
        isCustomer,
        loading,
        login,
        signup,
        logout,
        setUser,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
