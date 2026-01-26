'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  services: string[];
  date: string;
  time: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL'
        ? '/api/bookings'
        : `/api/bookings?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError('Error al cargar las reservas');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        ));
      } else {
        alert('Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error al actualizar la reserva');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
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
    };
    return labels[status] || status;
  };

  const serviceLabels: Record<string, string> = {
    vehiculos: 'Vehículos',
    entradas: 'Entradas',
    ventanas: 'Ventanas',
    pack: 'Pack Completo',
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Gestión de Reservas
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por estado</InputLabel>
          <Select
            value={filter}
            label="Filtrar por estado"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="ALL">Todas</MenuItem>
            <MenuItem value="PENDING">Pendientes</MenuItem>
            <MenuItem value="CONFIRMED">Confirmadas</MenuItem>
            <MenuItem value="COMPLETED">Completadas</MenuItem>
            <MenuItem value="CANCELLED">Canceladas</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : bookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No hay reservas{filter !== 'ALL' ? ' con este estado' : ''}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Contacto</strong></TableCell>
                    <TableCell><strong>Servicios</strong></TableCell>
                    <TableCell><strong>Fecha/Hora</strong></TableCell>
                    <TableCell><strong>Dirección</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {booking.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {booking.services.map((service, idx) => (
                            <Chip
                              key={idx}
                              label={serviceLabels[service] || service}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(booking.date).toLocaleDateString('es-ES')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ maxWidth: 150, display: 'block' }}>
                          {booking.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(booking.status)}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="PENDING">Pendiente</MenuItem>
                          <MenuItem value="CONFIRMED">Confirmar</MenuItem>
                          <MenuItem value="COMPLETED">Completar</MenuItem>
                          <MenuItem value="CANCELLED">Cancelar</MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
