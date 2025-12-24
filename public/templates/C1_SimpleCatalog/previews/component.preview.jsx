const { useState, useEffect } = React;

const C1_SimpleCatalog = ({ entityData }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState(null);

  const bloqueB = entityData?.bloque_B_contexto_comercial || {};
  const { identity = {}, contacto = {}, catalogo = {} } = bloqueB;

  const nombreComercio = identity.nombre_comercio || 'Comercio';
  const whatsappNumber = contacto.whatsapp_number || '';
  const categorias = catalogo.categorias || [];
  const items = catalogo.items || [];

  useEffect(() => {
    if (categorias.length && !activeTab) setActiveTab(categorias[0]);
  }, [categorias, activeTab]);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  const addToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
    setToast(`✓ ${item.nombre} agregado`);
    setTimeout(() => setToast(null), 1500);
  };

  const total = cart.reduce((s, i) => s + i.precio_final, 0);
  const itemsActivos = items.filter(i => i.categoria === activeTab);

  const waLink = () => {
    const msg =
      `Hola! Mi pedido:\n\n` +
      cart.map(i => `• ${i.nombre} - $${i.precio_final}`).join('\n') +
      `\n\nTOTAL: $${total}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded text-xs z-50">
          {toast}
        </div>
      )}

      <div className="sticky top-0 bg-slate-800 text-white">
        <div className="flex justify-between p-2">
          <h1 className="font-bold text-sm">{nombreComercio}</h1>
          <button onClick={() => setShowCart(true)} className="flex gap-1 bg-amber-600 px-3 py-1 rounded-full">
            <i data-lucide="shopping-cart" className="w-4 h-4"></i>
            {cart.length}
          </button>
        </div>

        <div className="flex overflow-x-auto bg-slate-700">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-2 text-xs font-bold ${activeTab === cat ? 'bg-white text-slate-800' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {itemsActivos.map(item => (
          <div key={item.id} className="bg-white rounded shadow">
            <img src={item.imagen} className="h-40 w-full object-cover" />
            <div className="p-2">
              <h3 className="font-bold text-sm">{item.nombre}</h3>
              <div className="flex justify-between mt-2">
                <span className="font-bold text-amber-600">${item.precio_final}</span>
                <button onClick={() => addToCart(item)} className="bg-amber-600 text-white px-2 py-1 rounded">
                  <i data-lucide="plus" className="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/50" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white p-3 rounded-t-xl">
            <h2 className="font-bold mb-2">Tu pedido</h2>
            {cart.map(i => (
              <div key={i.cartId} className="flex justify-between text-sm">
                <span>{i.nombre}</span>
                <span>${i.precio_final}</span>
              </div>
            ))}
            <a href={waLink()} target="_blank" className="block mt-3 bg-green-600 text-white text-center py-2 rounded">
              <i data-lucide="send" className="inline w-4 h-4 mr-1"></i>
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

window.C1_SimpleCatalog = C1_SimpleCatalog;
