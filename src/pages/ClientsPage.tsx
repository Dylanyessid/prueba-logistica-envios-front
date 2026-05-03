import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import clientService, { type Client, type CreateClientDto, type UpdateClientDto } from '@/services/clientService';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<CreateClientDto>({
    email: '',
    name: '',
    password: '',
    phone: '',
    document: '',
    address: '',
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    clientService.getAll().then((data) => {
      if (!ignore) {
        setClients(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!ignore) {
        setLoading(false);
      }
    });
    return () => { ignore = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        const updateData: UpdateClientDto = {
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          document: formData.document,
          address: formData.address,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await clientService.update(editingClient.id, updateData);
      } else {
        await clientService.create(formData);
      }
      setIsModalOpen(false);
      setEditingClient(null);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      email: client.email,
      name: client.name,
      password: '',
      phone: client.phone,
      document: client.document,
      address: client.address,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        await clientService.delete(id);
        loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      phone: '',
      document: '',
      address: '',
    });
  };

  const openModal = () => {
    resetForm();
    setEditingClient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">Gestión de Clientes</h2>
        </div>
        <Button onClick={openModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay clientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.document}</TableCell>
                    <TableCell>{client.address}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Nombre completo"
                  className="mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="mt-1"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {editingClient ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                </label>
                <Input
                  type="password"
                  placeholder={editingClient ? '••••••••' : 'Contraseña'}
                  className="mt-1"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingClient}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  placeholder="Teléfono"
                  className="mt-1"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Documento</label>
                <Input
                  placeholder="Documento"
                  className="mt-1"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dirección</label>
                <Input
                  placeholder="Dirección"
                  className="mt-1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClient ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}