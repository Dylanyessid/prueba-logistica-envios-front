import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, ArrowLeft, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { seaShipmentService, type SeaShipment } from '@/services/seaShipmentService';
import { productoService, type Product } from '@/services/productService';
import { portService, type Port } from '@/services/portService';
import authService from '@/services/authService';

interface SeaShipmentFormData {
  clientId: number;
  productId: number;
  destinationPortId: number;
  productQuantity: number;
  shippingPrice: number;
  fleetNumber: string;
  trackingNumber: string;
  registrationDate: string;
  deliveryDate: string;
}

export default function SeaShipmentsPage() {
  const [shipments, setShipments] = useState<SeaShipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<SeaShipment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<SeaShipment | null>(null);
  const clientId = authService.getClientId();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SeaShipmentFormData>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [shipmentsData, productsData, portsData] = await Promise.all([
          seaShipmentService.getAll(),
          productoService.getAll(),
          portService.getAll()
        ]);
        setShipments(shipmentsData);
        setProducts(productsData);
        setPorts(portsData);
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
      const data = await seaShipmentService.getAll();
      setShipments(data);
    } catch (error) {
      console.error('Error reloading shipments:', error);
    }
  };

  const onSubmit = async (data: SeaShipmentFormData) => {
    try {
      const payload = { ...data, clientId: clientId || 0 };
      if (editingShipment) {
        await seaShipmentService.update(editingShipment.id, payload);
      } else {
        await seaShipmentService.create(payload);
      }
      reloadShipments();
      closeModal();
    } catch (error) {
      console.error('Error saving shipment:', error);
    }
  };

  const handleEdit = (shipment: SeaShipment) => {
    setEditingShipment(shipment);
    reset({
      clientId: shipment.clientId,
      productId: shipment.productId,
      destinationPortId: shipment.destinationPortId,
      productQuantity: shipment.productQuantity,
      shippingPrice: shipment.shippingPrice,
      fleetNumber: shipment.fleetNumber,
      trackingNumber: shipment.trackingNumber,
      registrationDate: shipment.registrationDate.split('T')[0],
      deliveryDate: shipment.deliveryDate.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este envío?')) {
      try {
        await seaShipmentService.delete(id);
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
      destinationPortId: 0,
      productQuantity: 0,
      shippingPrice: 0,
      fleetNumber: '',
      trackingNumber: '',
      registrationDate: '',
      deliveryDate: ''
});
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
          <h2 className="text-2xl font-semibold">Gestión de Envíos Marítimos</h2>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Envío
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Envíos Marítimos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : shipments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay envíos marítimos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Guía</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Puerto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell>{shipment.trackingNumber}</TableCell>
                    <TableCell>{shipment.clientName}</TableCell>
                    <TableCell>{shipment.productName}</TableCell>
                    <TableCell>{shipment.productQuantity}</TableCell>
                    <TableCell>{shipment.destinationPortName}</TableCell>
                    <TableCell className="font-medium text-green-600">${Number(shipment.finalPrice).toFixed(2)}</TableCell>
                    <TableCell>{new Date(shipment.registrationDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(shipment.deliveryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedShipment(shipment); setDetailModalOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
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
              {editingShipment ? 'Editar Envío' : 'Nuevo Envío Marítimo'}
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
                <Label>Puerto de Destino</Label>
                <select 
                  className="w-full mt-1 h-9 px-3 rounded-md border border-input bg-transparent"
                  {...register('destinationPortId', { valueAsNumber: true, required: 'El puerto es requerido' })}
                >
                  <option value={0}>Seleccionar puerto</option>
                  {ports.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.destinationPortId && <p className="text-sm text-destructive mt-1">{errors.destinationPortId.message}</p>}
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
                  <Label>Número de Flota (AAA1234A)</Label>
                  <Input 
                    placeholder="AAA1234A" 
                    className="mt-1" 
                    {...register('fleetNumber', { 
                      required: 'El número de flota es requerido',
                      pattern: {
                        value: /^[A-Z]{3}[0-9]{4}[A-Z]$/,
                        message: 'Formato: 3 letras mayúsculas + 4 números + 1 letra mayúscula (ej: AAA1234A)'
                      }
                    })}
                  />
                  {errors.fleetNumber && <p className="text-sm text-destructive mt-1">{errors.fleetNumber.message}</p>}
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

      {detailModalOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setDetailModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Detalles del Envío Marítimo</h2>
              <p className="text-sm opacity-90">ID: #{selectedShipment.id}</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">N° Guía</p>
                  <p className="font-medium">{selectedShipment.trackingNumber}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Número de Flota</p>
                  <p className="font-medium">{selectedShipment.fleetNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                  <p className="font-medium">{selectedShipment.clientName}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Documento</p>
                  <p className="font-medium">{selectedShipment.clientDocument}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Producto</p>
                  <p className="font-medium">{selectedShipment.productName}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Cantidad</p>
                  <p className="font-medium">{selectedShipment.productQuantity} unidades</p>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Puerto de Destino</p>
                <p className="font-medium">{selectedShipment.destinationPortName}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Precio Original</p>
                  <p className="font-medium">${Number(selectedShipment.shippingPrice).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Descuento</p>
                  <p className="font-medium text-orange-600">
                    {selectedShipment.discountPercentage > 0 
                      ? `${selectedShipment.discountPercentage}% ($${Number(selectedShipment.discountAmount).toFixed(2)})`
                      : 'Sin descuento'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Precio Final</p>
                  <p className="font-medium text-green-600 text-lg">${Number(selectedShipment.finalPrice).toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Fecha de Registro</p>
                  <p className="font-medium">{new Date(selectedShipment.registrationDate).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Fecha de Entrega</p>
                  <p className="font-medium">{new Date(selectedShipment.deliveryDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>Creado: {selectedShipment.createdAt ? new Date(selectedShipment.createdAt).toLocaleString() : 'N/A'}</div>
                <div>Actualizado: {selectedShipment.updatedAt ? new Date(selectedShipment.updatedAt).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}