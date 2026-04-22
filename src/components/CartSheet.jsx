import { memo, useState } from 'react'
import { X, ShoppingCart, ExternalLink, ImageOff, ShoppingBag } from 'lucide-react'

const formatPrice = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

function CartItem({ product }) {
  const [imgError, setImgError] = useState(false)

  return (
    <li className="flex items-center gap-3 px-6 py-4">
      {/* Thumbnail */}
      <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
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
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ImageOff size={18} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {product.brand && (
          <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide leading-none mb-0.5">
            {product.brand}
          </p>
        )}
        <p className="text-sm font-medium text-stone-900 leading-snug line-clamp-2">
          {product.name}
        </p>
        <p className="text-sm font-bold text-stone-900 mt-1">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* Buy button */}
      {product.link ? (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 bg-stone-900 text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-stone-800 active:scale-95 transition-[background-color,transform] duration-100"
        >
          <ExternalLink size={12} />
          Comprar
        </a>
      ) : (
        <span className="flex-shrink-0 text-xs text-stone-300 px-3">Sem link</span>
      )}
    </li>
  )
}

const CartSheet = memo(function CartSheet({ isOpen, onClose, products, total }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl animate-slide-up sm:animate-scale-in flex flex-col max-h-[88dvh] will-change-transform">
        {/* Handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={18} className="text-stone-700" />
            <h2 className="text-base font-semibold text-stone-900">Carrinho</h2>
            <span className="text-xs font-medium bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
              {products.length} {products.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 active:scale-90 transition-[background-color,color,transform] duration-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-stone-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-stone-500">Carrinho vazio</p>
              <p className="text-xs text-stone-400 mt-1">Selecione produtos nos cards para adicioná-los</p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {products.map((product) => (
                <CartItem key={product.id} product={product} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer total */}
        {products.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Total estimado</span>
              <span className="text-xl font-bold text-stone-900">{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default CartSheet
