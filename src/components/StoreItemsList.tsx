import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { StoreItemCreationForm } from "./StoreItemCreationForm";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

interface StoreItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const StoreItemsList = () => {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Estados dos filtros
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState<string>('');
  
  const { toast } = useToast();

  const fetchStoreItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setStoreItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens da loja:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da loja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreItems();
  }, []);

  // Aplicar filtros sempre que os itens ou filtros mudarem
  useEffect(() => {
    let filtered = [...storeItems];

    // Filtro por status
    if (statusFilter === 'available') {
      filtered = filtered.filter(item => item.is_available);
    } else if (statusFilter === 'unavailable') {
      filtered = filtered.filter(item => !item.is_available);
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filtro por nome
    if (nameFilter) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [storeItems, statusFilter, categoryFilter, nameFilter]);

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setNameFilter('');
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item da loja?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('store_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item da loja excluído com sucesso!",
      });

      fetchStoreItems(); // Atualizar a lista
    } catch (error) {
      console.error('Erro ao excluir item da loja:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir item da loja",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: StoreItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleUpdateItem = async (data: any) => {
    if (!editingItem) return;

    try {
      let imageUrl = editingItem.image_url;

      // Upload da nova imagem se fornecida
      if (data.image) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fileExt = data.image.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('store-items')
            .upload(fileName, data.image);

          if (uploadError) {
            console.error('Erro ao fazer upload da imagem:', uploadError);
            toast({
              title: "Erro",
              description: "Erro ao fazer upload da imagem: " + uploadError.message,
              variant: "destructive",
            });
            return;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('store-items')
            .getPublicUrl(fileName);
          
          imageUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('store_items')
        .update({
          title: data.name,
          description: data.description,
          price: data.cost,
          category: 'general',
          is_available: true,
          image_url: imageUrl,
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item da loja atualizado com sucesso!",
      });

      setShowEditDialog(false);
      setEditingItem(null);
      fetchStoreItems(); // Atualizar a lista
    } catch (error) {
      console.error('Erro ao atualizar item da loja:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item da loja",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(storeItems.map(item => item.category))];
    return categories;
  };

  if (loading) {
    return (
      <div className="pixel-border p-6 mt-8">
        <h3 className="text-2xl text-yellow-400 mb-4">Carregando itens da loja...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="pixel-border p-6 mt-8">
        {isExpanded ? (
          <>
            <div className="flex justify-between items-center mb-6 border-b-4 border-yellow-400 pb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  title="Recolher lista"
                >
                  <ChevronUp size={20} />
                </button>
                <h3 className="text-2xl text-yellow-400">
                  Itens da Loja ({filteredItems.length} de {storeItems.length})
                </h3>
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>
            </div>

            {/* Seção de Filtros */}
            {showFilters && (
              <div className="bg-slate-800/30 border border-cyan-400/30 rounded p-4 mb-6">
                <h4 className="text-lg text-cyan-400 mb-4">Filtros</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por Status */}
                  <div>
                    <label className="text-white/80 block mb-2">Status</label>
                    <Select value={statusFilter} onValueChange={(value: 'all' | 'available' | 'unavailable') => setStatusFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="available">Disponíveis</SelectItem>
                        <SelectItem value="unavailable">Indisponíveis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Categoria */}
                  <div>
                    <label className="text-white/80 block mb-2">Categoria</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {getUniqueCategories().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Nome */}
                  <div>
                    <label className="text-white/80 block mb-2">Nome do Item</label>
                    <Input
                      type="text"
                      placeholder="Digite o nome do item"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="bg-slate-800 border-cyan-400/30"
                    />
                  </div>
                </div>

                {/* Botão para limpar filtros */}
                <div className="mt-4">
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    size="sm"
                    className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
            
            {storeItems.length === 0 ? (
              <p className="text-cyan-400/80 text-center py-8">
                Nenhum item da loja criado ainda. Crie seu primeiro item usando o botão acima!
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="text-cyan-400/80 text-center py-8">
                Nenhum item encontrado com os filtros selecionados.
              </p>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 border-2 border-cyan-400/30 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl text-cyan-400 font-bold">{item.title}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Editar item"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="text-white/80 mb-3">{item.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-yellow-400">Preço:</span>
                        <p className="text-white">{item.price} moedas</p>
                      </div>
                      <div>
                        <span className="text-yellow-400">Categoria:</span>
                        <p className="text-white">{item.category}</p>
                      </div>
                      <div>
                        <span className="text-yellow-400">Criado em:</span>
                        <p className="text-white">{formatDate(item.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-yellow-400">Status:</span>
                        <p className="text-white">{item.is_available ? 'Disponível' : 'Indisponível'}</p>
                      </div>
                    </div>

                    {/* Imagem do item */}
                    {item.image_url && (
                      <div className="mt-3">
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-32 h-24 object-cover border-2 border-cyan-400/30 rounded" 
                        />
                      </div>
                    )}
                    
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-sm px-2 py-1 rounded ${
                        item.is_available 
                          ? 'bg-green-600/20 text-green-400 border border-green-400/30' 
                          : 'bg-red-600/20 text-red-400 border border-red-400/30'
                      }`}>
                        {item.is_available ? 'Disponível' : 'Indisponível'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Versão recolhida - apenas cabeçalho compacto
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                title="Expandir lista"
              >
                <ChevronDown size={20} />
              </button>
              <h3 className="text-lg text-yellow-400">
                Loja ({filteredItems.length} de {storeItems.length})
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Dialog para editar item */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Item da Loja</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <StoreItemCreationForm 
              onSubmit={handleUpdateItem}
              initialData={{
                name: editingItem.title,
                description: editingItem.description || '',
                cost: editingItem.price,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};