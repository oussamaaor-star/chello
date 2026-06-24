import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

// Normalize a Supabase auth user → { id, name, email }
function normalizeUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    id:    supabaseUser.id,
    name:  supabaseUser.user_metadata?.name ?? supabaseUser.email?.split('@')[0] ?? '',
    email: supabaseUser.email,
  };
}

// Validation fichier avatar
const AVATAR_MAX_BYTES  = 5 * 1024 * 1024; // 5 Mo
const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [role, setRole]           = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    // Attendre le profil (et donc le rôle) avant de lever le loading.
    // Sans ce await, AdminLayout voit role=null pendant un bref instant et
    // redirige l'admin vers "/" avant que le rôle ne soit confirmé.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = normalizeUser(session?.user ?? null);
      setUser(u);
      if (u) await loadProfile(u.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = normalizeUser(session?.user ?? null);
      setUser(u);
      if (u) {
        loadProfile(u.id);
      } else {
        setAvatarUrl(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Charger le profil (avatar + rôle) depuis la table profiles ──

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setAvatarUrl(data?.avatar_url ?? null);
    setRole(data?.role ?? null);
  };

  const isAuthenticated = !!user;

  // ── Auth actions ───────────────────────────────────────────────

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    setUser(normalizeUser(data.user));
    // Charger le profil (et le rôle) avant de retourner le succès,
    // sinon AdminLayout reçoit role=null et redirige vers "/" après login.
    if (data.user) await loadProfile(data.user.id);
    return { success: true };
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { success: false, error: error.message };
    // If session is null, email confirmation is required — don't set user yet
    if (data.session && data.user) {
      setUser(normalizeUser(data.user));
      await loadProfile(data.user.id);
    }
    return {
      success: true,
      needsConfirmation: !data.session,
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvatarUrl(null);
    setRole(null);
  };

  const updateProfile = async (name, email) => {
    const { data, error } = await supabase.auth.updateUser({
      email,
      data: { name },
    });
    if (error) return { success: false, error: error.message };

    // Sync to profiles table
    await supabase.from('profiles').upsert(
      { id: data.user.id, full_name: name, email, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

    setUser(normalizeUser(data.user));
    return { success: true };
  };

  // ── Upload avatar ──────────────────────────────────────────────
  //
  // Convention : un seul fichier par utilisateur → bucket/avatars/{userId}/avatar
  // (sans extension pour simplifier le remplacement via upsert)

  const updateAvatar = async (file) => {
    if (!user) return { success: false, error: 'Non connecté' };

    // Validation côté client
    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      return { success: false, error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' };
    }
    if (file.size > AVATAR_MAX_BYTES) {
      return { success: false, error: 'Fichier trop volumineux. Taille maximale : 5 Mo.' };
    }

    const storagePath = `${user.id}/avatar`;

    // Upload (upsert = true remplace le fichier existant)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, file, {
        upsert:      true,
        contentType: file.type,
      });

    if (uploadError) return { success: false, error: uploadError.message };

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(storagePath);

    // Ajouter un timestamp pour invalider le cache navigateur
    const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Mettre à jour la table profiles
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: freshUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (dbError) return { success: false, error: dbError.message };

    setAvatarUrl(freshUrl);
    return { success: true, url: freshUrl };
  };

  // ── Supprimer avatar ───────────────────────────────────────────

  const deleteAvatar = async () => {
    if (!user) return { success: false, error: 'Non connecté' };

    // Lister tous les fichiers du dossier utilisateur pour tout supprimer
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(user.id);

    if (files?.length > 0) {
      await supabase.storage
        .from('avatars')
        .remove(files.map((f) => `${user.id}/${f.name}`));
    }

    // Remettre avatar_url à null dans profiles
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { success: false, error: error.message };

    setAvatarUrl(null);

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      user,
      avatarUrl,
      role,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateAvatar,
      deleteAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
