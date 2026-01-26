'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import { Calendar, MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface DashboardStats {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  contacts: {
    total: number;
    new: number;
  };
  recentBookings: any[];
  recentContacts: any[];
  serviceStats: Record<string, number>;
  bookingsTrend: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Extract hash from pathname for hash-aware navigation
  const currentHash = pathname.match(/^\/([a-zA-Z0-9_-]{8})/)?.[1] || '';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No se pudieron cargar las estadísticas
        </Typography>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Reservas',
      value: stats.bookings.total,
      icon: Calendar,
      color: '#059669',
      subtitle: `${stats.bookings.pending} pendientes`,
    },
    {
      title: 'Mensajes',
      value: stats.contacts.total,
      icon: MessageSquare,
      color: '#0891b2',
      subtitle: `${stats.contacts.new} nuevos`,
    },
    {
      title: 'Confirmadas',
      value: stats.bookings.confirmed,
      icon: CheckCircle,
      color: '#10b981',
      subtitle: 'Reservas confirmadas',
    },
    {
      title: 'Completadas',
      value: stats.bookings.completed,
      icon: Clock,
      color: '#6366f1',
      subtitle: 'Servicios realizados',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'NEW':
        return 'error';
      case 'READ':
        return 'info';
      case 'REPLIED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      NEW: 'Nuevo',
      READ: 'Leído',
      REPLIED: 'Respondido',
      ARCHIVED: 'Archivado',
    };
    return labels[status] || status;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                      }}
                    >
                      <Icon size={24} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Reservas Recientes
              </Typography>
              {stats.recentBookings.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay reservas todavía
                </Typography>
              ) : (
                <List>
                  {stats.recentBookings.map((booking) => (
                    <ListItem
                      key={booking.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1,
                      }}
                      onClick={() => router.push(currentHash ? `/${currentHash}/admin/bookings` : '/admin/bookings')}
                    >
                      <ListItemText
                        primary={booking.name}
                        secondary={`${new Date(booking.date).toLocaleDateString('es-ES')} - ${Array.isArray(booking.services) ? booking.services.join(', ') : booking.services}`}
                      />
                      <Chip
                        label={getStatusLabel(booking.status)}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Contacts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Mensajes Recientes
              </Typography>
              {stats.recentContacts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay mensajes todavía
                </Typography>
              ) : (
                <List>
                  {stats.recentContacts.map((contact) => (
                    <ListItem
                      key={contact.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1,
                      }}
                      onClick={() => router.push(currentHash ? `/${currentHash}/admin/contacts` : '/admin/contacts')}
                    >
                      <ListItemText
                        primary={contact.name}
                        secondary={contact.message.substring(0, 60) + '...'}
                      />
                      <Chip
                        label={getStatusLabel(contact.status)}
                        color={getStatusColor(contact.status) as any}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
