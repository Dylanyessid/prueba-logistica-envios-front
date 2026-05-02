import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Search, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { landShipmentService, type LandShipment } from '@/services/landShipmentService';
import { productoService, type Product } from '@/services/productService';
import { warehouseService, type Warehouse } from '@/services/warehouseService';
import authService from '@/services/authService';

interface LandShipmentFormData {
  clientId: number;
  productId: number;
  destinationWarehouseId: number;
  productQuantity: number;
  shippingPrice: number;
  vehiclePlate: string;
  trackingNumber: string;
  registrationDate: string;
  deliveryDate: string;
}

export default function LandShipmentsPage() {
  const [shipments, setShipments] = useState<LandShipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<LandShipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const clientId = authService.getClientId();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LandShipmentFormData>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [shipmentsData, productsData, warehousesData] = await Promise.all([
          landShipmentService.getAll(),
          productoService.getAll(),
          warehouseService.getAll()
        ]);
        console.log('Products loaded:', productsData);
        console.log('Warehouses loaded:', warehousesData);
        setShipments(shipmentsData);
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const reloadShipments = async () => {
    try {
      const data = await landShipmentService.getAll();
      setShipments(data);
    } catch (error) {
      console.error('Error reloading shipments:', error);
    }
  };

  const onSubmit = async (data: LandShipmentFormData) => {
    try {
      const payload = { ...data, clientId: clientId || 0 };
      if (editingShipment) {
        await landShipmentService.update(editingShipment.id, payload);
      } else {
        await landShipmentService.create(payload);
      }
      reloadShipments();
      closeModal();
    } catch (error) {
      console.error('Error saving shipment:', error);
    }
  };

  const handleEdit = (shipment: LandShipment) => {
    setEditingShipment(shipment);
    reset({
      clientId: shipment.clientId,
      productId: shipment.productId,
      destinationWarehouseId: shipment.destinationWarehouseId,
      productQuantity: shipment.productQuantity,
      shippingPrice: shipment.shippingPrice,
      vehiclePlate: shipment.vehiclePlate,
      trackingNumber: shipment.trackingNumber,
      registrationDate: shipment.registrationDate.split('T')[0],
      deliveryDate: shipment.deliveryDate.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este envío?')) {
      try {
        await landShipmentService.delete(id);
        reloadShipments();
      } catch (error) {
        console.error('Error deleting shipment:', error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShipment(null);
    reset({
      clientId: 0,
      productId: 0,
      destinationWarehouseId: 0,
      productQuantity: 0,
      shippingPrice: 0,
      vehiclePlate: '',
      trackingNumber: '',
      registrationDate: '',
      deliveryDate: ''
    });
  };

  const filteredShipments = shipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductName = (id: number) => products.find(p => p.id === id)?.name || id.toString();
  const getWarehouseName = (id: number) => warehouses.find(w => w.id === id)?.name || id.toString();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">Gestión de Envíos Terrestres</h2>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Envío
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Envíos Terrestres</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por guía o placa..." 
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
          ) : filteredShipments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay envíos terrestres registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Guía</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell>{shipment.trackingNumber}</TableCell>
                    <TableCell>{getProductName(shipment.productId)}</TableCell>
                    <TableCell>{shipment.productQuantity}</TableCell>
                    <TableCell>{getWarehouseName(shipment.destinationWarehouseId)}</TableCell>
                    <TableCell>${shipment.shippingPrice.toFixed(2)}</TableCell>
                    <TableCell>{shipment.vehiclePlate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(shipment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(shipment.id)}>
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">
              {editingShipment ? 'Editar Envío' : 'Nuevo Envío Terrestre'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('clientId')} value={clientId || 0} />
              <div>
                <Label>Producto</Label>
                <select 
                  className="w-full mt-1 h-9 px-3 rounded-md border border-input bg-transparent"
                  {...register('productId', { valueAsNumber: true, required: 'El producto es requerido' })}
                >
                  <option value={0}>Seleccionar producto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.productId && <p className="text-sm text-destructive mt-1">{errors.productId.message}</p>}
              </div>
              <div>
                <Label>Bodega de Entrega</Label>
                <select 
                  className="w-full mt-1 h-9 px-3 rounded-md border border-input bg-transparent"
                  {...register('destinationWarehouseId', { valueAsNumber: true, required: 'La bodega es requerida' })}
                >
                  <option value="">Seleccionar bodega</option>
                  {warehouses?.map((w) => (
                    <option key={w.id} value={String(w.id)}>{w.name}</option>
                  ))}
                </select>
                {errors.destinationWarehouseId && <p className="text-sm text-destructive mt-1">{errors.destinationWarehouseId.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cantidad</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="Cantidad" 
                    className="mt-1" 
                    {...register('productQuantity', { 
                      valueAsNumber: true,
                      required: 'La cantidad es requerida',
                      min: { value: 1, message: 'La cantidad debe ser mayor a 0' }
                    })}
                  />
                  {errors.productQuantity && <p className="text-sm text-destructive mt-1">{errors.productQuantity.message}</p>}
                </div>
                <div>
                  <Label>Precio Envío</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Precio" 
                    className="mt-1" 
                    {...register('shippingPrice', { 
                      valueAsNumber: true,
                      required: 'El precio es requerido',
                      min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                    })}
                  />
                  {errors.shippingPrice && <p className="text-sm text-destructive mt-1">{errors.shippingPrice.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Registro</Label>
                  <Input 
                    type="date" 
                    className="mt-1" 
                    {...register('registrationDate', { required: 'La fecha es requerida' })}
                  />
                  {errors.registrationDate && <p className="text-sm text-destructive mt-1">{errors.registrationDate.message}</p>}
                </div>
                <div>
                  <Label>Fecha de Entrega</Label>
                  <Input 
                    type="date" 
                    className="mt-1" 
                    {...register('deliveryDate', { required: 'La fecha es requerida' })}
                  />
                  {errors.deliveryDate && <p className="text-sm text-destructive mt-1">{errors.deliveryDate.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placa Vehículo (AAA123)</Label>
                  <Input 
                    placeholder="AAA123" 
                    className="mt-1" 
                    {...register('vehiclePlate', { 
                      required: 'La placa es requerida',
                      pattern: {
                        value: /^[A-Z]{3}[0-9]{3}$/,
                        message: 'Formato: 3 letras mayúsculas + 3 números (ej: AAA123)'
                      }
                    })}
                  />
                  {errors.vehiclePlate && <p className="text-sm text-destructive mt-1">{errors.vehiclePlate.message}</p>}
                </div>
                <div>
                  <Label>Número de Guía (10 dígitos)</Label>
                  <Input 
                    placeholder="ABC1234567" 
                    className="mt-1" 
                    {...register('trackingNumber', { 
                      required: 'El número de guía es requerido',
                      pattern: {
                        value: /^[A-Za-z0-9]{10}$/,
                        message: 'Debe tener exactamente 10 caracteres alfanuméricos'
                      }
                    })}
                  />
                  {errors.trackingNumber && <p className="text-sm text-destructive mt-1">{errors.trackingNumber.message}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                <Button type="submit">{editingShipment ? 'Actualizar' : 'Guardar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}