import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Search, Plus, ShoppingBag, X, ArrowUpDown, Check, ShoppingCart, MoreVertical, Upload, Download, AlertCircle } from 'lucide-react'
import ProductCard from './components/ProductCard'
import ProductModal from './components/ProductModal'
import CartSheet from './components/CartSheet'
import EmptyState from './components/EmptyState'
import Toast from './components/Toast'

const STORAGE_KEY = 'lista-compras-v1'

const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Sony WH-1000XM5',
    price: 1799.0,
    category: 'Eletrônicos',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    link: 'https://www.amazon.com.br/s?k=sony+wh1000xm5',
    description: 'Cancelamento de ruído líder do setor, 30h de bateria e qualidade de áudio Hi-Res.',
    createdAt: Date.now() - 5000,
  },
  {
    id: '2',
    name: 'Creme Facial La Mer',
    price: 890.0,
    category: 'Beleza',
    brand: 'La Mer',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    link: 'https://www.sephora.com.br',
    description: 'Hidratação intensa com tecnologia Miracle Broth. Para todos os tipos de pele.',
    createdAt: Date.now() - 4000,
  },
  {
    id: '3',
    name: 'Vela Aromática Diptyque',
    price: 320.0,
    category: 'Casa & Decoração',
    brand: 'Diptyque',
    image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=80',
    link: 'https://www.diptyqueparis.com',
    description: 'Fragrância Baies com notas de groselha negra e rosas. 70g, ~50h de queima.',
    createdAt: Date.now() - 3000,
  },
  {
    id: '4',
    name: 'Tênis New Balance 990v6',
    price: 1299.0,
    category: 'Roupas',
    brand: 'New Balance',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    link: 'https://www.newbalance.com.br',
    description: 'Amortecimento ENCAP, cabedal de camurça e mesh. Made in USA.',
    createdAt: Date.now() - 2000,
  },
]

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

const SORT_LABELS = {
  default:      'Mais recentes',
  name:         'Nome (A–Z)',
  'price-asc':  'Menor preço',
  'price-desc': 'Maior preço',
}

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : SAMPLE_PRODUCTS
    } catch {
      return SAMPLE_PRODUCTS
    }
  })

  const [search, setSearch]                 = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortOrder, setSortOrder]           = useState('default')
  const [showSort, setShowSort]             = useState(false)
  const [isModalOpen, setIsModalOpen]       = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteId, setDeleteId]             = useState(null)
  const [selectedIds, setSelectedIds]       = useState(new Set())
  const [isCartOpen, setIsCartOpen]         = useState(false)
  const [showBackupMenu, setShowBackupMenu] = useState(false)
  const [importData, setImportData]         = useState(null) // produtos pendentes de confirmação
  const [toasts, setToasts]                 = useState([])
  const importInputRef                      = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  )

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + (p.price || 0), 0),
    [products]
  )

  const filtered = useMemo(() => {
    let result = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory)
    }
    switch (sortOrder) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'name':       result.sort((a, b) => a.name.localeCompare(b.name)); break
      default:           result.sort((a, b) => b.createdAt - a.createdAt)
    }
    return result
  }, [products, search, activeCategory, sortOrder])

  // Selection derived state
  const selectedCount = selectedIds.size
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id))

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.has(p.id)),
    [selectedIds, products]
  )

  const selectedTotal = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0),
    [selectedProducts]
  )

  // Handlers
  const handleSave = useCallback((data) => {
    setProducts((prev) =>
      editingProduct
        ? prev.map((p) => (p.id === editingProduct.id ? { ...editingProduct, ...data } : p))
        : [{ ...data, id: crypto.randomUUID(), createdAt: Date.now() }, ...prev]
    )
    setIsModalOpen(false)
    setEditingProduct(null)
  }, [editingProduct])

  const handleEdit   = useCallback((product) => { setEditingProduct(product); setIsModalOpen(true) }, [])
  const handleDelete = useCallback((id) => setDeleteId(id), [])
  const openAddModal = useCallback(() => { setEditingProduct(null); setIsModalOpen(true) }, [])
  const closeModal   = useCallback(() => { setIsModalOpen(false); setEditingProduct(null) }, [])

  const confirmDelete = () => {
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(deleteId); return next })
    setProducts((prev) => prev.filter((p) => p.id !== deleteId))
    setDeleteId(null)
  }

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (filtered.every((p) => prev.has(p.id))) {
        // deselect all filtered
        const next = new Set(prev)
        filtered.forEach((p) => next.delete(p.id))
        return next
      }
      // select all filtered
      return new Set([...prev, ...filtered.map((p) => p.id)])
    })
  }, [filtered])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  // ── Toast helpers ──
  const showToast = useCallback((message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Export ──
  const handleExport = useCallback(() => {
    const json = JSON.stringify(products, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `lista-compras-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowBackupMenu(false)
    showToast(`${products.length} ${products.length === 1 ? 'produto exportado' : 'produtos exportados'}`)
  }, [products, showToast])

  // ── Import — leitura e validação do arquivo ──
  const handleImportFile = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    setShowBackupMenu(false)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)

        if (!Array.isArray(parsed)) throw new Error('O arquivo deve conter um array de produtos.')
        if (parsed.length === 0) throw new Error('O arquivo está vazio.')

        const valid = parsed.every(
          (p) => p && typeof p === 'object' && typeof p.name === 'string' && p.name.trim()
        )
        if (!valid) throw new Error('Alguns produtos não possuem o campo "name".')

        // normaliza campos opcionais em falta
        const normalized = parsed.map((p) => ({
          id:          p.id || crypto.randomUUID(),
          name:        p.name.trim(),
          price:       typeof p.price === 'number' ? p.price : 0,
          category:    p.category  || '',
          brand:       p.brand     || '',
          description: p.description || '',
          image:       p.image     || '',
          link:        p.link      || '',
          createdAt:   p.createdAt || Date.now(),
        }))

        setImportData(normalized)
      } catch (err) {
        showToast(err.message, 'error')
      }
    }
    reader.onerror = () => showToast('Não foi possível ler o arquivo.', 'error')
    reader.readAsText(file)
  }, [showToast])

  // ── Import — aplica substituição ou mesclagem ──
  const applyImport = useCallback((mode) => {
    if (!importData) return
    if (mode === 'replace') {
      setProducts(importData)
      showToast(`Lista substituída com ${importData.length} produtos.`)
    } else {
      // mescla: mantém existentes, adiciona novos por id
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const toAdd = importData.filter((p) => !existingIds.has(p.id))
        showToast(`${toAdd.length} produto(s) adicionado(s) à lista.`)
        return [...prev, ...toAdd]
      })
    }
    setImportData(null)
  }, [importData, showToast])

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 space-y-3">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-stone-900 rounded-2xl flex items-center justify-center shadow-sm">
                <ShoppingBag size={17} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-stone-900 leading-none">
                  Lista de Compras
                </h1>
                <p className="text-xs text-stone-400 mt-0.5">
                  {products.length} {products.length === 1 ? 'item' : 'itens'} · {formatPrice(totalValue)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Backup menu */}
              <div className="relative">
                <button
                  onClick={() => setShowBackupMenu((v) => !v)}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-900 active:scale-95 transition-[background-color,color,transform] duration-100"
                  aria-label="Backup da lista"
                >
                  <MoreVertical size={17} />
                </button>

                {showBackupMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowBackupMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-scale-in">
                      <button
                        onClick={handleExport}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors duration-100"
                      >
                        <Download size={15} className="text-stone-400" />
                        Exportar lista
                      </button>
                      <div className="h-px bg-stone-100 mx-4" />
                      <button
                        onClick={() => { importInputRef.current?.click() }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors duration-100"
                      >
                        <Upload size={15} className="text-stone-400" />
                        Importar lista
                      </button>
                    </div>
                  </>
                )}

                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>

              {/* Cart icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 active:scale-95 transition-[background-color,color,transform] duration-100"
                aria-label="Abrir carrinho"
              >
                <ShoppingCart size={17} />
                {selectedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {selectedCount > 9 ? '9+' : selectedCount}
                  </span>
                )}
              </button>

              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 bg-stone-900 text-white pl-3.5 pr-4 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-[background-color,transform] duration-100 shadow-md shadow-stone-900/10"
              >
                <Plus size={15} strokeWidth={2.5} />
                Adicionar
              </button>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-stone-100 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-stone-200 transition-[background-color,box-shadow] duration-150"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors duration-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort((v) => !v)}
                className={`h-full px-3 rounded-xl border flex items-center gap-1.5 text-sm active:scale-95 transition-[background-color,border-color,color,transform] duration-100 ${
                  sortOrder !== 'default'
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-white text-stone-500 hover:text-stone-700'
                }`}
              >
                <ArrowUpDown size={14} />
                <span className="hidden sm:inline">{SORT_LABELS[sortOrder]}</span>
              </button>

              {showSort && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-scale-in">
                    {Object.entries(SORT_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setSortOrder(key); setShowSort(false) }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors duration-100 ${
                          sortOrder === key
                            ? 'bg-stone-900 text-white font-medium'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="max-w-2xl mx-auto px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Pill active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
                Todos
              </Pill>
              {categories.map((cat) => (
                <Pill key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </Pill>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <main className={`max-w-2xl mx-auto px-4 py-6 transition-[padding] duration-300 ${selectedCount > 0 ? 'pb-28' : ''}`}>
        {filtered.length === 0 && products.length === 0 ? (
          <EmptyState onAdd={openAddModal} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Search size={32} className="mx-auto mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-sm font-medium">Nenhum produto encontrado</p>
            <p className="text-xs mt-1">Tente buscar por outro nome ou categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSelected={selectedIds.has(product.id)}
                onSelect={handleToggleSelect}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Selection bar ── */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center px-4 pb-4 pointer-events-none">
          <div className="w-full max-w-2xl bg-stone-900 text-white rounded-2xl shadow-2xl shadow-stone-900/30 pointer-events-auto animate-slide-up">
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Count + select-all toggle */}
              <button
                onClick={handleToggleAll}
                className="flex items-center gap-2 flex-shrink-0 active:scale-95 transition-transform duration-100"
                aria-label={allFilteredSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-100 ${
                  allFilteredSelected
                    ? 'bg-white border-white'
                    : 'border-stone-500 hover:border-stone-300'
                }`}>
                  {allFilteredSelected && <Check size={12} strokeWidth={3} className="text-stone-900" />}
                </div>
                <span className="text-sm font-medium">
                  {allFilteredSelected ? 'Desmarcar' : 'Selecionar'} todos
                </span>
              </button>

              {/* Divider */}
              <div className="h-4 w-px bg-stone-700 mx-1 flex-shrink-0" />

              {/* Count */}
              <span className="text-sm text-stone-400 flex-shrink-0">
                {selectedCount} {selectedCount === 1 ? 'item' : 'itens'}
              </span>

              {/* Total + Ver carrinho */}
              <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-[11px] text-stone-400 leading-none mb-0.5">Total</p>
                  <p className="text-base font-bold leading-none">{formatPrice(selectedTotal)}</p>
                </div>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-1.5 bg-white text-stone-900 text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-stone-100 active:scale-95 transition-[background-color,transform] duration-100"
                >
                  <ShoppingCart size={13} />
                  Carrinho
                </button>
              </div>

              {/* Clear */}
              <button
                onClick={clearSelection}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white active:scale-90 transition-[background-color,color,transform] duration-100"
                aria-label="Limpar seleção"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import confirmation modal ── */}
      {importData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setImportData(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Upload size={22} className="text-blue-500" strokeWidth={1.75} />
            </div>

            <h3 className="text-base font-semibold text-stone-900 mb-1">
              Importar {importData.length} {importData.length === 1 ? 'produto' : 'produtos'}
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              Como deseja importar esses produtos?
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => applyImport('merge')}
                className="w-full py-3 rounded-2xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 active:scale-95 transition-[background-color,transform] duration-100"
              >
                Mesclar com lista atual
              </button>
              <button
                onClick={() => applyImport('replace')}
                className="w-full py-3 rounded-2xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 active:scale-95 transition-[background-color,transform] duration-100"
              >
                Substituir lista atual
              </button>
              <button
                onClick={() => setImportData(null)}
                className="w-full py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors duration-100"
              >
                Cancelar
              </button>
            </div>

            {/* Preview */}
            <div className="mt-5 pt-4 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-2">Prévia dos produtos</p>
              <ul className="space-y-1 max-h-28 overflow-y-auto">
                {importData.slice(0, 5).map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="text-stone-700 truncate flex-1 mr-2">{p.name}</span>
                    <span className="text-stone-400 flex-shrink-0">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                    </span>
                  </li>
                ))}
                {importData.length > 5 && (
                  <li className="text-xs text-stone-400">+{importData.length - 5} mais…</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Cart Sheet ── */}
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        products={selectedProducts}
        total={selectedTotal}
      />

      {/* ── Product Modal ── */}
      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onSave={handleSave}
        onClose={closeModal}
      />

      {/* ── Delete Confirmation ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-stone-900 mb-1">Excluir produto?</h3>
            <p className="text-sm text-stone-500 mb-6">Essa ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 active:scale-95 transition-[background-color,transform] duration-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 active:scale-95 transition-[background-color,transform] duration-100"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Toasts ── */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-4 z-[60] flex flex-col gap-2 items-end pointer-events-none">
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => dismissToast(t.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium active:scale-95 transition-[background-color,color,transform] duration-100 ${
        active
          ? 'bg-stone-900 text-white'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      }`}
    >
      {children}
    </button>
  )
}
