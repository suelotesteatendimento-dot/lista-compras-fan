import { memo, useState } from 'react'
import { Pencil, Trash2, ShoppingCart, ImageOff, Check } from 'lucide-react'

const CATEGORY_COLORS = {
  'Eletrônicos':      'bg-blue-50 text-blue-600',
  'Roupas':           'bg-violet-50 text-violet-600',
  'Alimentação':      'bg-amber-50 text-amber-600',
  'Beleza':           'bg-pink-50 text-pink-600',
  'Casa & Decoração': 'bg-teal-50 text-teal-600',
  'Esportes':         'bg-green-50 text-green-600',
  'Livros':           'bg-orange-50 text-orange-600',
  'Saúde':            'bg-red-50 text-red-600',
}

const getCategoryColor = (cat) =>
  cat ? (CATEGORY_COLORS[cat] ?? 'bg-stone-100 text-stone-600') : 'bg-stone-100 text-stone-500'

const formatPrice = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const ProductCard = memo(function ProductCard({ product, onEdit, onDelete, isSelected, onSelect }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col ${
        isSelected ? 'ring-2 ring-stone-900' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-300">
            <ImageOff size={28} strokeWidth={1.5} />
            <span className="text-xs">Sem imagem</span>
          </div>
        )}

        {/* Checkbox — top-left */}
        <button
          onClick={() => onSelect(product.id)}
          aria-label={isSelected ? 'Desmarcar' : 'Selecionar'}
          className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center shadow transition-[background-color,border-color,opacity,transform] duration-100 active:scale-90 z-10 ${
            isSelected
              ? 'bg-stone-900 border-2 border-stone-900'
              : 'bg-white/90 border-2 border-stone-300 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
        </button>

        {/* Category badge */}
        {product.category && (
          <span className={`absolute top-3 text-xs font-medium px-2.5 py-1 rounded-full transition-[left] duration-150 ${
            isSelected ? 'left-11' : 'left-3'
          } ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
        )}

        {/* Edit / Delete — top-right */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-sm active:scale-90 transition-[color,transform] duration-100"
            aria-label="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center text-stone-600 hover:text-red-500 shadow-sm active:scale-90 transition-[color,transform] duration-100"
            aria-label="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-1">
            {product.brand}
          </p>
        )}

        <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-stone-400 leading-relaxed line-clamp-2 mt-1">
            {product.description}
          </p>
        )}

        <p className="text-xl font-bold text-stone-900 mt-auto pt-3">
          {formatPrice(product.price)}
        </p>

        {product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full bg-stone-900 text-white text-xs font-medium py-2.5 rounded-xl hover:bg-stone-800 active:scale-95 transition-[background-color,transform] duration-100"
          >
            <ShoppingCart size={13} />
            Comprar
          </a>
        )}
      </div>
    </div>
  )
})

export default ProductCard
