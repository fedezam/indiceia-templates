/* Preview-safe version: NO imports, NO require */

const { useState, useEffect } = React;

// Lucide desde UMD
const { ShoppingCart, Plus, Trash2, Send } = window.lucide;

const C1_SimpleCatalog = ({ entityData }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);

  const bloqueB = entityData?.bloque_B_contexto_comercial || {};
  const { identity = {}, contacto = {}, catalogo = {} } = bloqueB;

  const nombreComercio = identity.nombre_comercio || 'Comercio';
  const whatsappNumber = contacto.whatsapp_number || '';
  const categorias = catalogo.categorias || [];
  const items = catalogo.items || [];

  useEffect(() => {
    if (categorias.length > 0 && !activeTab) {
      setActiveTab(categorias[0]);
    }
  }, [categorias, activeTab]);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (item, size = null) => {
    const precio = size
      ? item[`precio_${size}`]
      : item.precio_final || item.precio;

    const newItem = {
      ...item,
      size,
      precio,
      cartId: Date.now() + Math.random()
    };

    setCart([...cart, newItem]);
    setToast(`✓ ${item.nombre}${size ? ` (${size})` : ''} agregado`);
    setTimeout(() => setToast(null), 2000);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 500);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getTotal = () =>
    cart.reduce((sum, item) => sum + item.precio, 0);

  const generateWhatsAppMessage = () => {
    let mensaje = `Hola! Vengo desde ÍndiceIA. Este es mi pedido:\n\n`;
    cart.forEach(item => {
      mensaje += `• ${item.nombre}${item.size ? ` (${item.size})` : ''} - $${item.precio.toLocaleString()}\n`;
    });
    mensaje += `\nTOTAL: $${getTotal().toLocaleString()}\n\nGracias!`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
  };

  const itemsActivos = items.filter(i => i.categoria === activeTab);

  return (
    <div className="min-h-screen bg-slate-100">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded text-xs z-50">
          {toast}
        </div>
      )}

      <div className="sticky top-0 bg-slate-800 text-white z-40">
        <div className="flex justify-between items-center p-2">
          <h1 className="text-sm font-bold">{nombreComercio}</h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className={`bg-amber-600 px-3 py-1 rounded-full flex items-center gap-1 ${
              cartBounce ? 'scale-125' : ''
            }`}
          >
            <ShoppingCart size={14} />
            {cart.length}
          </button>
        </div>

        <div className="flex overflow-x-auto bg-slate-700">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => changeTab(cat)}
              className={`px-3 py-2 text-xs font-bold whitespace-nowrap ${
                activeTab === cat ? 'bg-white text-slate-800' : ''
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {itemsActivos.map(item => (
          <div key={item.id} className="bg-white rounded shadow">
            <img
              src={item.imagen}
              alt={item.nombre}
              className="h-40 w-full object-cover"
            />
            <div className="p-2">
              <h3 className="font-bold text-sm">{item.nombre}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-amber-600">
                  ${item.precio_final.toLocaleString()}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="bg-amber-600 text-white px-2 py-1 rounded text-xs"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white p-3 rounded-t-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold mb-2">Tu pedido</h2>
            {cart.map(item => (
              <div key={item.cartId} className="flex justify-between text-sm">
                <span>{item.nombre}</span>
                <span>${item.precio.toLocaleString()}</span>
              </div>
            ))}
            <a
              href={generateWhatsAppMessage()}
              target="_blank"
              className="block mt-3 bg-green-600 text-white text-center py-2 rounded"
            >
              <Send size={16} /> Enviar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

window.C1_SimpleCatalog = C1_SimpleCatalog;
