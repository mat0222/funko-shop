// Variables globales
        let cartCount = 0;
        const cartCountElement = document.querySelector('.cart-count');
        let cartItems = [];
        let isCartPage = false;
        let isCheckoutPage = false;
        let currentProductId = null;
        let stripe;
        let elements;
        let cardElement;

        // Inicializar Stripe (usando clave pública de prueba)
        // En producción, reemplaza con tu clave pública real
        const STRIPE_PUBLIC_KEY = 'pk_test_51234567890abcdef'; // Clave de prueba
        
        // Simular inicialización de Stripe para demo
        function initializeStripe() {
            // En un entorno real, usarías: stripe = Stripe(STRIPE_PUBLIC_KEY);
            console.log('Stripe inicializado (modo demo)');
            
            // Simular elementos de Stripe
            setupStripeElements();
        }

        function setupStripeElements() {
            // En un entorno real, esto sería:
            // elements = stripe.elements();
            // cardElement = elements.create('card');
            // cardElement.mount('#card-element');
            
            // Para demo, creamos un campo simulado
            const cardElementDiv = document.getElementById('card-element');
            cardElementDiv.innerHTML = `
                <input type="text" placeholder="1234 5678 9012 3456" style="border: none; outline: none; width: 100%; background: transparent;" readonly>
                <div style="font-size: 0.8rem; color: #6b7280; margin-top: 5px;">
                    💡 Modo demo - Los pagos son simulados
                </div>
            `;
        }

        // Datos de productos
        const productData = {
            'all-for-one': {
                title: 'POP! GOD OF WAR: DRAUGR',
                description: 'El Funko Pop de Draugr de la serie de God of War 2018 captura a uno de los enemigos más comunes y distintivos del juego. El diseño es el de una figura esquelética, con un aspecto no-muerto. Suelen mostrarlo con un casco que parece estar incrustado o fusionado con su cráneo, a menudo con un cuerno roto.',
                collection: 'God Of War',
                price: '$12',
                image: 'imagenes/draugr caja.png'
            },
            'all-might': {
                title: 'POP! GOD OF WAR: KRATOS',
                description: 'La figura viste su icónica armadura nórdica, que incluye los detalles de las hombreras y los protectores de brazo. Un elemento clave es la inclusión del Hacha del Leviatán en una de sus manos, su arma principal en esta aventura. La figura también tiene un diseño de cicatrices rojas que recorren su cuerpo, un detalle característico que se mantiene en todas sus representaciones. En general, este Funko Pop captura la esencia del "Fantasma de Esparta" como un padre y guerrero más reflexivo, pero igual de imponente.',
                collection: 'God Of War',
                price: '$18',
                image: 'imagenes/kratos caja.png'
            },
            'momo': {
                title: 'POP! FIVE NIGHT AT FREDDY: WITHERED GOLDEN FREDDY',
                description: 'El Funko Pop de Withered Golden Freddy captura la esencia aterradora de este animatrónico misterioso del juego. El diseño presenta un Freddy desgastado y deteriorado, con su pelaje dorado descolorido y rasgado en varias partes, lo que expone el endoesqueleto que hay debajo.',
                collection: 'Five Night At Freddy',
                price: '$20',
                image: 'imagenes/golden freddy caja.jpg'
            },
            'tokoyami': {
                title: 'POP! FUTBOL: LIONEL MESSI',
                description: 'El Funko Pop de Lionel Messi del Inter de Miami captura al famoso futbolista en su nuevo equipo de la Major League Soccer (MLS). La figura viste el uniforme del Inter de Miami, que es predominantemente rosa o negro, dependiendo de la versión (de local o visitante).',
                collection: 'Futbol',
                price: '$10',
                image: 'imagenes/messi caja.jpg'
            },
            'spider-man': {
                title: 'POP! SONY: VENOM',
                description: 'Este Funko Pop es una representación visualmente impactante de la simbiosis entre Eddie Brock y el simbionte Venom. La figura captura la dualidad de los personajes, mostrando a Venom emergiendo del cuerpo de Eddie Brock.',
                collection: 'Sony',
                price: '$14',
                image: 'imagenes/venom caja.jpg'
            },
            'batman': {
                title: 'POP! DRAGON BALL SUPER: BROLY',
                description: 'El Funko Pop de Broly Super Saiyan Legendario se basa en su aparición en la película Dragon Ball Super: Broly. Esta figura captura la inmensa y poderosa transformación de Broly, conocida por su increíble fuerza.',
                collection: 'Dragon Ball Super',
                price: '$23',
                image: 'imagenes/broly caja.jpg'
            }
        };

        // Referencias del modal
        const modal = document.getElementById('productModal');
        const modalClose = document.querySelector('.modal-close');

        // Función para mostrar la página principal
        function showMainPage() {
            document.querySelector('.hero').style.display = 'block';
            document.querySelector('.products').style.display = 'block';
            document.getElementById('cartPage').classList.remove('show');
            document.getElementById('checkoutPage').classList.remove('show');
            isCartPage = false;
            isCheckoutPage = false;
        }

        // Función para mostrar la página del carrito
        function showCartPage() {
            document.querySelector('.hero').style.display = 'none';
            document.querySelector('.products').style.display = 'none';
            document.getElementById('cartPage').classList.add('show');
            document.getElementById('checkoutPage').classList.remove('show');
            isCartPage = true;
            isCheckoutPage = false;
            renderCart();
        }

        // Función para mostrar la página de checkout
        function showCheckoutPage() {
            document.querySelector('.hero').style.display = 'none';
            document.querySelector('.products').style.display = 'none';
            document.getElementById('cartPage').classList.remove('show');
            document.getElementById('checkoutPage').classList.add('show');
            isCartPage = false;
            isCheckoutPage = true;
            renderCheckout();
        }

        // Función para agregar producto al carrito
        function addToCart(productId) {
            const product = productData[productId];
            if (!product) return;

            const existingItem = cartItems.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({
                    id: productId,
                    title: product.title,
                    collection: product.collection,
                    price: parseFloat(product.price.replace('$', '')),
                    image: product.image,
                    quantity: 1
                });
            }
            
            updateCartCount();
        }

        // Función para actualizar el contador del carrito
        function updateCartCount() {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            
            // Animación del contador
            cartCountElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
            }, 200);
        }

        // Función para renderizar el carrito
        function renderCart() {
            const cartContent = document.getElementById('cartContent');
            const emptyCart = document.getElementById('emptyCart');
            
            if (cartItems.length === 0) {
                cartContent.style.display = 'none';
                emptyCart.style.display = 'block';
                return;
            }
            
            cartContent.style.display = 'grid';
            emptyCart.style.display = 'none';
            
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal > 25 ? 0 : 5.99;
            const total = subtotal + shipping;
            
            cartContent.innerHTML = `
                <div class="cart-items">
                    ${cartItems.map(item => `
                        <div class="cart-item">
                            <div class="cart-item-image">
                                <img src="${item.image}" alt="${item.title}">
                            </div>
                            <div class="cart-item-info">
                                <h3>${item.title}</h3>
                                <div class="cart-item-collection">${item.collection}</div>
                            </div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                            </div>
                            <button class="remove-item" onclick="removeFromCart('${item.id}')">Eliminar</button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="cart-summary">
                    <h2 class="summary-title">Resumen del Pedido</h2>
                    <div class="summary-row">
                        <span>Subtotal (${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Envío</span>
                        <span>${shipping === 0 ? 'Gratis' : '$' + shipping.toFixed(2)}</span>
                    </div>
                    ${shipping === 0 ? '<div class="summary-row"><small style="color: #10b981;">🎉 ¡Envío gratis por compra mayor a $25!</small></div>' : ''}
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <button class="checkout-btn" onclick="showCheckoutPage()">💳 Proceder al Pago</button>
                </div>
            `;
        }

        // Función para renderizar el checkout
        function renderCheckout() {
            const checkoutItems = document.getElementById('checkout-items');
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal > 25 ? 0 : 5.99;
            const total = subtotal + shipping;

            checkoutItems.innerHTML = cartItems.map(item => `
                <div class="summary-item">
                    <div class="summary-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="summary-item-info">
                        <div class="summary-item-title">${item.title}</div>
                        <div class="summary-item-details">Cantidad: ${item.quantity}</div>
                    </div>
                    <div class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('');

            document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
            document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
        }

        // Función para procesar el pago
        async function processPayment(event) {
            event.preventDefault();

            const submitButton = document.getElementById('submit-payment');
            const buttonText = document.getElementById('button-text');
            const spinner = document.getElementById('spinner');

            // Mostrar loading
            submitButton.disabled = true;
            buttonText.style.display = 'none';
            spinner.style.display = 'inline-block';

            // Simular procesamiento de pago
            setTimeout(() => {
                // Calcular total
                const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const shipping = subtotal > 25 ? 0 : 5.99;
                const total = subtotal + shipping;
                
                // Mostrar modal de éxito
                showSuccessModal(total);
                
                // Limpiar carrito
                cartItems = [];
                updateCartCount();

                // Restaurar botón
                submitButton.disabled = false;
                buttonText.style.display = 'inline';
                spinner.style.display = 'none';
            }, 2000);
        }

        // Función para mostrar el modal de éxito
        function showSuccessModal(total) {
            const successModal = document.getElementById('successModal');
            const successItems = document.getElementById('successItems');
            const successTotal = document.getElementById('successTotal');
            
            // Poblar items
            successItems.innerHTML = cartItems.map(item => `
                <div class="purchase-item">
                    <div>
                        <div class="purchase-item-name">${item.title}</div>
                        <div class="purchase-item-qty">Cantidad: ${item.quantity}</div>
                    </div>
                    <div class="purchase-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('');
            
            // Mostrar total
            successTotal.textContent = `Total: $${total.toFixed(2)}`;
            
            // Mostrar modal
            successModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Reproducir sonido de éxito (opcional)
            playSuccessSound();
        }

        // Función para cerrar el modal de éxito
        function closeSuccessModal() {
            const successModal = document.getElementById('successModal');
            successModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            showMainPage();
        }

        // Función para descargar recibo (simulada)
        function downloadReceipt() {
            alert('📄 Descargando recibo...\n\n¡Gracias por tu compra en Funko Shop!');
        }

        // Función para reproducir sonido de éxito (opcional)
        function playSuccessSound() {
            // En un entorno real, podrías reproducir un sonido
            console.log('🔊 ¡Sonido de éxito!');
        }

        // Función para actualizar cantidad
        function updateQuantity(productId, change) {
            const item = cartItems.find(item => item.id === productId);
            if (!item) return;
            
            item.quantity += change;
            
            if (item.quantity <= 0) {
                removeFromCart(productId);
                return;
            }
            
            updateCartCount();
            renderCart();
        }

        // Función para eliminar del carrito
        function removeFromCart(productId) {
            cartItems = cartItems.filter(item => item.id !== productId);
            updateCartCount();
            renderCart();
        }

        // Función para cerrar modal
        function closeModal() {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            currentProductId = null;
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar Stripe
            initializeStripe();

            // Botones de explorar productos
            document.querySelectorAll('.btn-explore').forEach(button => {
                button.addEventListener('click', function() {
                    const productCard = this.closest('.product-card');
                    const productId = productCard.getAttribute('data-product');
                    const product = productData[productId];

                    if (product) {
                        currentProductId = productId;
                        
                        document.getElementById('modalTitle').textContent = product.title;
                        document.getElementById('modalDescription').textContent = product.description;
                        document.getElementById('modalCollection').textContent = product.collection;
                        document.getElementById('modalPrice').textContent = product.price;
                        document.getElementById('modalImage').src = product.image;
                        document.getElementById('modalImage').alt = product.title;

                        modal.classList.add('show');
                        document.body.style.overflow = 'hidden';
                    }
                });
            });

            // Cerrar modal
            modalClose.addEventListener('click', closeModal);
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Botón de añadir al carrito en el modal
            document.querySelector('.btn-add-to-cart').addEventListener('click', function() {
                if (currentProductId) {
                    addToCart(currentProductId);
                    
                    // Feedback visual
                    this.style.background = '#10b981';
                    this.textContent = '✓ AGREGADO AL CARRITO';
                    
                    setTimeout(() => {
                        this.style.background = '#1f2937';
                        this.textContent = '🛒 AÑADIR AL CARRITO';
                    }, 2000);
                }
            });

            // Funcionalidad de pestañas
            document.querySelectorAll('.tab-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    
                    this.classList.add('active');
                    document.getElementById(tabId + '-tab').classList.add('active');
                });
            });

            // Event listener del carrito en el header
            document.querySelector('.icon-cart').parentElement.addEventListener('click', function() {
                showCartPage();
            });

            // Funcionalidad de búsqueda
            document.querySelector('.icon-search').parentElement.addEventListener('click', function() {
                const searchTerm = prompt('¿Qué Funko Pop estás buscando?');
                if (searchTerm) {
                    alert(`Buscando: "${searchTerm}"`);
                }
            });

            // Form de pago
            document.getElementById('payment-form').addEventListener('submit', processPayment);

            // Cerrar modal con ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    if (modal.classList.contains('show')) {
                        closeModal();
                    }
                    if (document.getElementById('successModal').classList.contains('show')) {
                        closeSuccessModal();
                    }
                }
            });
        });