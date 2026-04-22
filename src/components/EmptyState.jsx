export default function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-stone-100 rounded-3xl flex items-center justify-center">
          <svg
            className="w-12 h-12 text-stone-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-stone-200 rounded-full" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-stone-100 rounded-full border-2 border-stone-50" />
      </div>

      <h2 className="text-lg font-semibold text-stone-800 mb-2">
        Sua lista está vazia
      </h2>
      <p className="text-sm text-stone-400 leading-relaxed max-w-xs mb-8">
        Adicione produtos que deseja comprar e organize sua lista com preços, categorias e links.
      </p>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-2xl text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all shadow-lg shadow-stone-900/10"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Adicionar primeiro produto
      </button>
    </div>
  )
}
