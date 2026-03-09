window.C1_SimpleCatalog = function SimpleCatalog({ entityData }) {

  const goods =
    entityData?.goods || []

  const categories = [...new Set(goods.map(g => g.categoria || "General"))]

  const [activeCategory,setActiveCategory] = React.useState(categories[0])

  const [cart,setCart] = React.useState([])

  const addToCart = (item,variant=null) => {

    const price = variant ? variant.precio : item.precio_final
    const variantId = variant?.id || null

    const key = item.id + "_" + (variantId || "base")

    setCart(prev => {

      const existing = prev.find(i => i.key === key)

      if(existing){

        return prev.map(i =>
          i.key === key
            ? { ...i, qty: i.qty + 1 }
            : i
        )

      }

      return [
        ...prev,
        {
          key,
          id:item.id,
          nombre:item.nombre,
          variante:variant?.label || null,
          precio:price,
          qty:1
        }
      ]
    })
  }

  const removeFromCart = (key) => {

    setCart(prev => {

      const item = prev.find(i=>i.key===key)

      if(!item) return prev

      if(item.qty === 1){
        return prev.filter(i=>i.key!==key)
      }

      return prev.map(i =>
        i.key===key
          ? {...i,qty:i.qty-1}
          : i
      )
    })
  }

  const total = cart.reduce(
    (acc,i)=>acc+(i.precio*i.qty),
    0
  )

  const itemsCount = cart.reduce(
    (acc,i)=>acc+i.qty,
    0
  )

  return (

    <div className="min-h-screen bg-amber-50 pb-32">

      <header className="bg-white shadow p-4 text-center font-bold text-lg">
        Catálogo
      </header>

      <CategoryTabs
        categories={categories}
        active={activeCategory}
        setActive={setActiveCategory}
      />

      <main className="p-4 grid gap-4">

        {goods
          .filter(g => (g.categoria || "General") === activeCategory)
          .map(item => (
            <ProductCard
              key={item.id}
              item={item}
              addToCart={addToCart}
            />
        ))}

      </main>

      <Cart
        cart={cart}
        total={total}
        itemsCount={itemsCount}
        removeFromCart={removeFromCart}
      />

    </div>
  )
}



function CategoryTabs({ categories,active,setActive }){

  if(categories.length <= 1) return null

  return(

    <div className="flex gap-2 overflow-x-auto p-3 bg-white border-b">

      {categories.map(cat=>(
        <button
          key={cat}
          onClick={()=>setActive(cat)}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap
          ${
            cat===active
              ? "bg-amber-500 text-white"
              : "bg-gray-100"
          }`}
        >
          {cat}
        </button>
      ))}

    </div>
  )
}



function ProductCard({ item,addToCart }){

  const hasVariants =
    item.variantes && item.variantes.length>0

  const [selected,setSelected] = React.useState(
    hasVariants ? item.variantes[0] : null
  )

  const price =
    selected ? selected.precio : item.precio_final

  return(

    <div className="bg-white rounded-xl shadow p-4">

      {item.imagen && (
        <img
          src={item.imagen}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}

      <h3 className="font-bold text-lg">
        {item.nombre}
      </h3>

      {item.descripcion && (
        <p className="text-sm text-gray-500 mb-3">
          {item.descripcion}
        </p>
      )}

      {hasVariants && (
        <VariantSelector
          variantes={item.variantes}
          selected={selected}
          setSelected={setSelected}
        />
      )}

      <div className="flex items-center justify-between mt-3">

        <span className="text-lg font-bold text-amber-600">
          ${price?.toLocaleString()}
        </span>

        <button
          onClick={()=>addToCart(item,selected)}
          className="bg-amber-600 text-white px-3 py-1 rounded-lg text-sm"
        >
          Agregar
        </button>

      </div>

    </div>
  )
}



function VariantSelector({variantes,selected,setSelected}){

  return(

    <div className="flex gap-2 flex-wrap mb-2">

      {variantes.map(v=>(
        <button
          key={v.id}
          onClick={()=>setSelected(v)}
          className={`px-3 py-1 rounded border text-sm
          ${
            selected?.id===v.id
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white border-gray-300"
          }`}
        >
          {v.label}
        </button>
      ))}

    </div>
  )
}



function Cart({cart,total,itemsCount,removeFromCart}){

  const [open,setOpen] = React.useState(false)

  if(cart.length===0) return null

  return(

    <div className="fixed bottom-0 left-0 right-0">

      {!open && (

        <button
          onClick={()=>setOpen(true)}
          className="w-full bg-amber-600 text-white p-3 font-bold"
        >
          Ver pedido ({itemsCount}) • ${total.toLocaleString()}
        </button>

      )}

      {open && (

        <div className="bg-white shadow-xl p-4 border-t">

          <div className="flex justify-between mb-3 font-bold">

            <span>Pedido</span>

            <button
              onClick={()=>setOpen(false)}
              className="text-sm"
            >
              cerrar
            </button>

          </div>

          <div className="space-y-2 max-h-60 overflow-auto">

            {cart.map(i=>(
              <div
                key={i.key}
                className="flex justify-between items-center text-sm"
              >

                <div>

                  <div>
                    {i.nombre}
                    {i.variante && (
                      <span className="text-gray-500">
                        {" "}({i.variante})
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    ${i.precio.toLocaleString()}
                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    onClick={()=>removeFromCart(i.key)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    -
                  </button>

                  <span>{i.qty}</span>

                </div>

              </div>
            ))}

          </div>

          <div className="flex justify-between mt-4 font-bold">

            <span>Total</span>
            <span>${total.toLocaleString()}</span>

          </div>

        </div>

      )}

    </div>
  )
}
