'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { User, Mail, Lock, Save, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } else {
        setError('Error al cargar el perfil');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password change
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (!currentPassword) {
        setError('Debes proporcionar tu contraseña actual');
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          ...(newPassword && { currentPassword, newPassword }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        if (data.user) {
          setProfile(data.user);
        }
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      STAFF: 'Empleado',
      CUSTOMER: 'Cliente',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'STAFF':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Configuración
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Profile Info Card */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 24,
                }}
              >
                {profile?.name.charAt(0).toUpperCase()}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {profile?.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={14} />
                  <Chip
                    label={getRoleLabel(profile?.role || '')}
                    color={getRoleColor(profile?.role || '') as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Miembro desde {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : ''}
            </Typography>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Editar Perfil
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* Name Field */}
                <TextField
                  label="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <User size={20} style={{ marginRight: 8, color: '#9ca3af' }} />,
                  }}
                />

                {/* Email Field */}
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#9ca3af' }} />,
                  }}
                />

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" color="text.secondary">
                  Cambiar contraseña (opcional)
                </Typography>

                {/* Current Password */}
                <TextField
                  label="Contraseña actual"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#9ca3af' }} />,
                  }}
                />

                {/* New Password */}
                <TextField
                  label="Nueva contraseña"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  helperText="Mínimo 6 caracteres"
                  InputProps={{
                    startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#9ca3af' }} />,
                  }}
                />

                {/* Confirm Password */}
                <TextField
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  error={confirmPassword !== '' && newPassword !== confirmPassword}
                  helperText={confirmPassword !== '' && newPassword !== confirmPassword ? 'Las contraseñas no coinciden' : ''}
                  InputProps={{
                    startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#9ca3af' }} />,
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <Save size={20} />}
                    sx={{
                      bgcolor: '#059669',
                      '&:hover': { bgcolor: '#047857' },
                    }}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
