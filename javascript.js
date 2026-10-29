

const products = [
    { id: "1", name: "Dinuguan", price: 60 },
    { id: "2", name: "Igado", price: 50 },
    { id: 3, name: "Lechon Paksiw", price: 60 },
    { id: 4, name: "Binagoongan Meal", price: 50 },
    { id: 5, name: "Chopsuey", price: 50 },
    { id: 6, name: "Giniling", price: 50 },
    { id: 7, name: "Goto Mami", price: 70 }
];

const productsById = new Map(products.map(function(product) {
    return [String(product.id), product];
}));
const cart = Object.create(null);

// 3. Kunin ang HTML elements
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartMessage = document.getElementById("cart-message");

const clearCartButton = document.getElementById("clear-cart");
const checkoutButton = document.getElementById("checkout-btn");

function restoreCart() {
    if (!cartItems) {
        return;
    }

    try {
        const savedCart = sessionStorage.getItem("marquez-eatery-cart");
        if (!savedCart) {
            return;
        }

        const parsedCart = JSON.parse(savedCart);
        if (!parsedCart || typeof parsedCart !== "object" || Array.isArray(parsedCart)) {
            throw new TypeError("Saved cart must be an object.");
        }

        Object.entries(parsedCart).forEach(function(entry) {
            const id = entry[0];
            const quantity = entry[1];
            if (!productsById.has(id) || !Number.isSafeInteger(quantity) || quantity < 1) {
                throw new TypeError("Saved cart contains an invalid item.");
            }

            cart[id] = quantity;
        });
    } catch (error) {
        console.error("Hindi maibalik ang cart mula sa session storage.", error);
        if (cartMessage) {
            cartMessage.textContent =
                "Hindi maibalik ang dating laman ng cart. Nagsimula ang bagong cart.";
        }
        Object.keys(cart).forEach(function(id) {
            delete cart[id];
        });
    }
}


function formatPrice(amount) {
    return "₱" + amount.toFixed(2);
}

restoreCart();


document.querySelectorAll(".add-btn").forEach(function(button) {
    button.addEventListener("click", function() {
        const id = button.dataset.id;
        const product = productsById.get(id);

        if (!product || !cartItems) {
            return;
        }

        if (cart[id]) {
            cart[id]++;
        } else {
            cart[id] = 1;
        }

        cartMessage.textContent =
            product.name + " ay naidagdag sa iyong cart!";

        updateCart();
    });
});


function updateCart() {
    if (!cartItems || !cartCount || !cartTotal || !clearCartButton || !checkoutButton) {
        return;
    }

    cartItems.replaceChildren();

    let total = 0;
    let itemCount = 0;
    let hasItems = false;

    Object.keys(cart).forEach(function(id) {
        const quantity = cart[id];
        const product = productsById.get(id);

        if (!product || quantity <= 0) {
            return;
        }

        hasItems = true;
        itemCount += quantity;
        total += product.price * quantity;

        
        const row = document.createElement("div");
        row.className = "cart-item";

        const info = document.createElement("div");

        const name = document.createElement("h4");
        name.textContent = product.name;

        const price = document.createElement("small");
        price.textContent =
            formatPrice(product.price) + " bawat isa";

        const subtotal = document.createElement("p");
        subtotal.textContent =
            "Subtotal: " + formatPrice(product.price * quantity);

        info.append(name, price, subtotal);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        // Minus button
        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Bawasan ang quantity ng " + product.name);
        minus.addEventListener("click", function() {
            cart[id]--;

            if (cart[id] <= 0) {
                delete cart[id];
            }

            cartMessage.textContent = "";
            updateCart();
        });

       
        const quantityText = document.createElement("span");
        quantityText.textContent = quantity;

       
        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Dagdagan ang quantity ng " + product.name);
        plus.addEventListener("click", function() {
            cart[id]++;
            cartMessage.textContent = "";
            updateCart();
        });

       
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.className = "remove-btn";

        remove.addEventListener("click", function() {
            delete cart[id];
            cartMessage.textContent =
                product.name + " ay inalis sa cart.";
            updateCart();
        });

        controls.append(minus, quantityText, plus, remove);
        row.append(info, controls);
        cartItems.appendChild(row);
    });

    
    if (!hasItems) {
        const empty = document.createElement("p");
        empty.className = "empty-cart";
        empty.textContent = "Wala pang laman ang iyong cart.";
        cartItems.appendChild(empty);
    }

    
    cartCount.textContent = itemCount;
    cartTotal.textContent = formatPrice(total);

    clearCartButton.disabled = !hasItems;
    checkoutButton.disabled = !hasItems;

    try {
        sessionStorage.setItem("marquez-eatery-cart", JSON.stringify(cart));
    } catch (error) {
        console.error("Hindi ma-save ang cart sa session storage.", error);
        cartMessage.textContent =
            "Hindi mase-save ang cart kapag lumipat sa ibang pahina.";
    }
}

// 7. Burahin lahat ng item sa cart
if (clearCartButton) {
    clearCartButton.addEventListener("click", function() {
        Object.keys(cart).forEach(function(id) {
            delete cart[id];
        });

        cartMessage.textContent = "Na-clear na ang iyong cart.";
        updateCart();
    });
}


if (checkoutButton) {
    checkoutButton.addEventListener("click", function() {
        const ids = Object.keys(cart);

        if (ids.length === 0) {
            cartMessage.textContent =
                "Magdagdag muna ng pagkain bago mag-order.";
            return;
        }

        let total = 0;
        ids.forEach(function(id) {
            total += productsById.get(id).price * cart[id];
        });

        const confirmed = window.confirm(
            "Marquez Eatery Order\n\n" +
            "Kabuuang bayad: " + formatPrice(total) +
            "\n\nKumpirmahin ang sample order?"
        );

        if (confirmed) {
            Object.keys(cart).forEach(function(id) {
                delete cart[id];
            });

            updateCart();
            cartMessage.textContent =
                "Salamat! Matagumpay ang sample order mo.";
        }
    });
}


const contactForm = document.getElementById("contact-form");
const contactMessage = document.getElementById("contact-message");

if (contactForm && contactMessage) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const nameField = document.getElementById("contact-name");
        if (!nameField) {
            return;
        }
        const name = nameField.value.trim();

        contactMessage.textContent =
            "Salamat, " + name +
            "! Natanggap ang iyong mensahe sa demo website.";

        contactForm.reset();
    });
}


updateCart();
