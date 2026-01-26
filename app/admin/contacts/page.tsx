'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Mail, Phone, Calendar } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  service?: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL'
        ? '/api/contacts'
        : `/api/contacts?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts);
      } else {
        setError('Error al cargar los mensajes');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setContacts(contacts.map(c =>
          c.id === contactId ? { ...c, status: newStatus } : c
        ));
        if (selectedContact?.id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      } else {
        alert('Error al actualizar el mensaje');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Error al actualizar el mensaje');
    }
  };

  const handleContactClick = async (contact: Contact) => {
    setSelectedContact(contact);
    setDialogOpen(true);

    // Mark as read if it's new
    if (contact.status === 'NEW') {
      await updateContactStatus(contact.id, 'READ');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedContact(null), 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'error';
      case 'READ':
        return 'info';
      case 'REPLIED':
        return 'success';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: 'Nuevo',
      READ: 'Leído',
      REPLIED: 'Respondido',
      ARCHIVED: 'Archivado',
    };
    return labels[status] || status;
  };

  const serviceLabels: Record<string, string> = {
    vehiculos: 'Vehículos',
    entradas: 'Entradas',
    ventanas: 'Ventanas',
    pack: 'Pack Completo',
    otro: 'Otro',
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Bandeja de Mensajes
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por estado</InputLabel>
          <Select
            value={filter}
            label="Filtrar por estado"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="NEW">Nuevos</MenuItem>
            <MenuItem value="READ">Leídos</MenuItem>
            <MenuItem value="REPLIED">Respondidos</MenuItem>
            <MenuItem value="ARCHIVED">Archivados</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : contacts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No hay mensajes{filter !== 'ALL' ? ' con este estado' : ''}
              </Typography>
            </Box>
          ) : (
            <List>
              {contacts.map((contact, index) => (
                <Box key={contact.id}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      py: 2,
                      px: 3,
                    }}
                    onClick={() => handleContactClick(contact)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={contact.status === 'NEW' ? 700 : 600}>
                            {contact.name}
                          </Typography>
                          {contact.service && (
                            <Chip
                              label={serviceLabels[contact.service] || contact.service}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {contact.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(contact.createdAt).toLocaleString('es-ES')}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={getStatusLabel(contact.status)}
                      color={getStatusColor(contact.status) as any}
                      size="small"
                    />
                  </ListItem>
                  {index < contacts.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedContact && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  Mensaje de {selectedContact.name}
                </Typography>
                <Chip
                  label={getStatusLabel(selectedContact.status)}
                  color={getStatusColor(selectedContact.status) as any}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Mail size={16} />
                  <Typography variant="body2" fontWeight={600}>
                    Email:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedContact.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Phone size={16} />
                  <Typography variant="body2" fontWeight={600}>
                    Teléfono:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedContact.phone}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Calendar size={16} />
                  <Typography variant="body2" fontWeight={600}>
                    Fecha:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedContact.createdAt).toLocaleString('es-ES')}
                  </Typography>
                </Box>
                {selectedContact.service && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Servicio:
                    </Typography>
                    <Chip
                      label={serviceLabels[selectedContact.service] || selectedContact.service}
                      size="small"
                    />
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Mensaje:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedContact.message}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedContact.status}
                  onChange={(e) => updateContactStatus(selectedContact.id, e.target.value)}
                >
                  <MenuItem value="NEW">Nuevo</MenuItem>
                  <MenuItem value="READ">Leído</MenuItem>
                  <MenuItem value="REPLIED">Respondido</MenuItem>
                  <MenuItem value="ARCHIVED">Archivar</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={handleCloseDialog}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
