import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Search, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { warehouseService, type Warehouse } from '@/services/warehouseService';

interface WarehouseFormData {
  name: string;
  address: string;
  country: string;
  city: string;
  capacity: number;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WarehouseFormData>();

  useEffect(() => {
    warehouseService.getAll()
      .then(data => setWarehouses(data))
      .catch(error => console.error('Error loading warehouses:', error))
      .finally(() => setLoading(false));
  }, []);

  const reloadWarehouses = () => {
    warehouseService.getAll()
      .then(data => setWarehouses(data))
      .catch(error => console.error('Error reloading warehouses:', error));
  };

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      if (editingWarehouse) {
        await warehouseService.update(editingWarehouse.id, data);
      } else {
        await warehouseService.create(data);
      }
      reloadWarehouses();
      closeModal();
    } catch (error) {
      console.error('Error saving warehouse:', error);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    reset({
      name: warehouse.name,
      address: warehouse.address,
      country: warehouse.country,
      city: warehouse.city,
      capacity: warehouse.capacity
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta bodega?')) {
      try {
        await warehouseService.delete(id);
        reloadWarehouses();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
    reset({ name: '', address: '', country: '', city: '', capacity: 0 });
  };

  const filteredWarehouses = warehouses.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">Gestión de Bodegas</h2>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Bodega
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Bodegas</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay bodegas registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>{warehouse.id}</TableCell>
                    <TableCell>{warehouse.name}</TableCell>
                    <TableCell>{warehouse.address}</TableCell>
                    <TableCell>{warehouse.country}</TableCell>
                    <TableCell>{warehouse.city}</TableCell>
                    <TableCell>{warehouse.capacity} m³</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(warehouse)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(warehouse.id)}>
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
              {editingWarehouse ? 'Editar Bodega' : 'Nueva Bodega'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input 
                  placeholder="Nombre de la bodega" 
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
                <label className="text-sm font-medium">Dirección</label>
                <Input 
                  placeholder="Dirección" 
                  className="mt-1" 
                  {...register('address', { 
                    required: 'La dirección es requerida',
                    minLength: { value: 5, message: 'La dirección debe tener al menos 5 caracteres' },
                    maxLength: { value: 255, message: 'La dirección debe tener máximo 255 caracteres' }
                  })}
                />
                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      maxLength: { value: 20, message: 'Máximo 20 caracteres' }
                    })}
                  />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Capacidad (m³)</label>
                <Input 
                  type="number" 
                  placeholder="Capacidad" 
                  className="mt-1" 
                  {...register('capacity', { 
                    required: 'La capacidad es requerida',
                    valueAsNumber: true,
                    min: { value: 1, message: 'La capacidad debe ser mayor a 0' }
                  })}
                />
                {errors.capacity && <p className="text-sm text-destructive mt-1">{errors.capacity.message}</p>}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                <Button type="submit">{editingWarehouse ? 'Actualizar' : 'Guardar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}