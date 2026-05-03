import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { portService, type Port } from '@/services/portService';

interface PortFormData {
  name: string;
  country: string;
  city: string;
  type: 'national' | 'international';
}

export default function PortsPage() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [editingPort, setEditingPort] = useState<Port | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PortFormData>();

  useEffect(() => {
    portService.getAll()
      .then(data => setPorts(data))
      .catch(error => console.error('Error loading ports:', error))
      .finally(() => setLoading(false));
  }, []);

  const reloadPorts = () => {
    portService.getAll()
      .then(data => setPorts(data))
      .catch(error => console.error('Error reloading ports:', error));
  };

  const onSubmit = async (data: PortFormData) => {
    try {
      if (editingPort) {
        await portService.update(editingPort.id, data);
      } else {
        await portService.create(data);
      }
      reloadPorts();
      closeModal();
    } catch (error) {
      console.error('Error saving port:', error);
    }
  };

  const handleEdit = (port: Port) => {
    setEditingPort(port);
    reset({
      name: port.name,
      country: port.country,
      city: port.city,
      type: port.type
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este puerto?')) {
      try {
        await portService.delete(id);
        reloadPorts();
      } catch (error) {
        console.error('Error deleting port:', error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPort(null);
    reset({ name: '', country: '', city: '', type: 'national' });
};
  const getTypeLabel = (type: string) => {
    return type === 'national' ? 'Nacional' : 'Internacional';
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
          <h2 className="text-2xl font-semibold">Gestión de Puertos</h2>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Puerto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Puertos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : ports.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay puertos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ports.map((port) => (
                  <TableRow key={port.id}>
                    <TableCell>{port.id}</TableCell>
                    <TableCell>{port.name}</TableCell>
                    <TableCell>{port.country}</TableCell>
                    <TableCell>{port.city}</TableCell>
                    <TableCell>{getTypeLabel(port.type)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(port)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(port.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">
              {editingPort ? 'Editar Puerto' : 'Nuevo Puerto'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input 
                  placeholder="Nombre del puerto" 
                  className="mt-1" 
                  {...register('name', { 
                    required: 'El nombre es requerido',
                    minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                    maxLength: { value: 150, message: 'El nombre debe tener máximo 150 caracteres' }
                  })}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">País</label>
                <Input 
                  placeholder="País" 
                  className="mt-1" 
                  {...register('country', { 
                    required: 'El país es requerido',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                  })}
                />
                {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Ciudad</label>
                <Input 
                  placeholder="Ciudad" 
                  className="mt-1" 
                  {...register('city', { 
                    required: 'La ciudad es requerida',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    maxLength: { value: 255, message: 'Máximo 255 caracteres' }
                  })}
                />
                {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select 
                  className="w-full mt-1 h-9 px-3 rounded-md border border-input bg-transparent"
                  {...register('type', { required: 'El tipo es requerido' })}
                >
                  <option value="national">Nacional</option>
                  <option value="international">Internacional</option>
                </select>
                {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                <Button type="submit">{editingPort ? 'Actualizar' : 'Guardar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}