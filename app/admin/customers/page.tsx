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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { Search, User, Calendar, ShoppingBag } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalBookings: number;
  lastBooking: {
    createdAt: string;
    status: string;
  } | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchQuery = '') => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/api/admin/customers?search=${encodeURIComponent(searchQuery)}`
        : '/api/admin/customers';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
      } else {
        setError('Error al cargar los clientes');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
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

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Base de Datos de Clientes
        </Typography>

        <Box component="form" onSubmit={handleSearch}>
          <TextField
            size="small"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#05966915' }}>
              <User size={24} color="#059669" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {customers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Clientes
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0891b215' }}>
              <ShoppingBag size={24} color="#0891b2" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {customers.reduce((sum, c) => sum + c.totalBookings, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reservas
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#6366f115' }}>
              <Calendar size={24} color="#6366f1" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {customers.filter(c => {
                  if (!c.createdAt) return false;
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nuevos este mes
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : customers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <User size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
              <Typography color="text.secondary">
                {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Fecha Registro</strong></TableCell>
                    <TableCell><strong>Total Reservas</strong></TableCell>
                    <TableCell><strong>Última Reserva</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: '#059669',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {customer.name.charAt(0).toUpperCase()}
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {customer.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {customer.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(customer.createdAt).toLocaleDateString('es-ES')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer.totalBookings}
                          size="small"
                          color={customer.totalBookings > 0 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {customer.lastBooking ? (
                          <Box>
                            <Typography variant="caption" display="block">
                              {new Date(customer.lastBooking.createdAt).toLocaleDateString('es-ES')}
                            </Typography>
                            <Chip
                              label={getStatusLabel(customer.lastBooking.status)}
                              color={getStatusColor(customer.lastBooking.status) as any}
                              size="small"
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin reservas
                          </Typography>
                        )}
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
