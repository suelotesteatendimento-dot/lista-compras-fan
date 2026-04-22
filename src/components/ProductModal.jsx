import { useState, useEffect, useRef } from 'react'
import { X, Upload, Trash2, ImageOff } from 'lucide-react'

const CATEGORIES = [
  'Alimentação',
  'Beleza',
  'Casa & Decoração',
  'Eletrônicos',
  'Esportes',
  'Livros',
  'Roupas',
  'Saúde',
]

const EMPTY_FORM = {
  name: '',
  price: '',
  category: '',
  brand: '',
  description: '',
  image: '',
  link: '',
}

function parsePriceToBRL(raw) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const cents = parseInt(digits, 10)
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function brlToNumber(formatted) {
  const clean = formatted.replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

function compressImage(file, maxPx = 900, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round((height / width) * maxPx); width = maxPx }
          else { width = Math.round((width / height) * maxPx); height = maxPx }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ProductModal({ isOpen, product, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [displayPrice, setDisplayPrice] = useState('')
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const nameRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setForm({
          name: product.name || '',
          price: String(product.price || ''),
          category: product.category || '',
          brand: product.brand || '',
          description: product.description || '',
          image: product.image || '',
          link: product.link || '',
        })
        setDisplayPrice(
          product.price
            ? new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(product.price)
            : ''
        )
      } else {
        setForm(EMPTY_FORM)
        setDisplayPrice('')
      }
      setErrors({})
      setIsDragging(false)
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [isOpen, product])

  const handlePriceChange = (e) => {
    const formatted = parsePriceToBRL(e.target.value)
    setDisplayPrice(formatted)
    setForm((f) => ({ ...f, price: String(brlToNumber(formatted)) }))
  }

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setIsCompressing(true)
    try {
      const base64 = await compressImage(file)
      setForm((f) => ({ ...f, image: base64 }))
    } finally {
      setIsCompressing(false)
    }
  }

  const handleFileChange = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  const removeImage = () => {
    setForm((f) => ({ ...f, image: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.price || brlToNumber(displayPrice) <= 0) e.price = 'Informe um preço válido'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name: form.name.trim(),
      price: brlToNumber(displayPrice),
      category: form.category.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      image: form.image,
      link: form.link.trim(),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl animate-slide-up sm:animate-scale-in flex flex-col max-h-[92dvh] will-change-transform">
        {/* Handle (mobile) */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-900">
            {product ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 active:scale-90 transition-[background-color,color,transform] duration-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Image upload */}
            <Field label="Imagem do produto">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {form.image ? (
                <div className="relative group/img rounded-2xl overflow-hidden aspect-video bg-stone-100">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1.5 bg-white text-stone-800 text-xs font-medium px-3 py-2 rounded-full shadow-md hover:bg-stone-50 active:scale-95 transition-[background-color,transform] duration-100"
                    >
                      <Upload size={12} />
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex items-center gap-1.5 bg-white text-red-500 text-xs font-medium px-3 py-2 rounded-full shadow-md hover:bg-red-50 active:scale-95 transition-[background-color,transform] duration-100"
                    >
                      <Trash2 size={12} />
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  disabled={isCompressing}
                  className={[
                    'w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all',
                    isDragging
                      ? 'border-stone-400 bg-stone-100 scale-[0.99]'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100',
                    isCompressing ? 'opacity-60 cursor-wait' : 'cursor-pointer active:scale-[0.98]',
                  ].join(' ')}
                >
                  {isCompressing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-stone-400">Processando...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-400">
                        <Upload size={18} strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-stone-600">
                          {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, WEBP — comprimida automaticamente</p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </Field>

            {/* Name */}
            <Field label="Nome do produto" error={errors.name} required>
              <input
                ref={nameRef}
                type="text"
                placeholder="Ex: iPhone 15 Pro"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputCls(errors.name)}
              />
            </Field>

            {/* Price */}
            <Field label="Preço" error={errors.price} required>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm font-medium select-none">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={displayPrice}
                  onChange={handlePriceChange}
                  className={`${inputCls(errors.price)} pl-10`}
                />
              </div>
            </Field>

            {/* Category */}
            <Field label="Categoria">
              <input
                type="text"
                list="categories-list"
                placeholder="Ex: Eletrônicos"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={inputCls()}
              />
              <datalist id="categories-list">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>

            {/* Brand */}
            <Field label="Marca">
              <input
                type="text"
                placeholder="Ex: Sony, Nike, Apple..."
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className={inputCls()}
              />
            </Field>

            {/* Description */}
            <Field label="Descrição">
              <textarea
                rows={3}
                placeholder="Detalhes, observações, especificações..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`${inputCls()} resize-none`}
              />
            </Field>

            {/* Link */}
            <Field label="Link para comprar">
              <input
                type="url"
                placeholder="https://..."
                value={form.link}
                onChange={(e) => handleChange('link', e.target.value)}
                className={inputCls()}
              />
            </Field>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-stone-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 active:scale-95 transition-[background-color,transform] duration-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="flex-1 py-3 rounded-2xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 active:scale-95 transition-[background-color,transform] duration-100 shadow-lg shadow-stone-900/15 disabled:opacity-60"
            >
              {product ? 'Salvar alterações' : 'Adicionar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children, error, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  )
}

function inputCls(error) {
  return [
    'w-full px-4 py-3 rounded-xl text-sm text-stone-900 placeholder:text-stone-400',
    'bg-stone-50 border transition-all outline-none',
    error
      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
      : 'border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:bg-white',
  ].join(' ')
}
