# Guía de Despliegue (Hostinger / VPS)

Para que tu proyecto funcione en internet, es importante entender que tu sitio tiene **dos partes**:

1.  **Frontend (Lo que se ve):** `index.html`, `shop.html`, `admin.html`, `style.css`, `script.js`.
2.  **Backend (El cerebro y base de datos):** `server.js`, `database.js`, `database.sqlite` (Node.js).

## ¿Cómo subirlo a Hostinger?

Dependiendo del plan que tengas en Hostinger, hay dos formas:

### Opción A: Tienes un plan "VPS" (Servidor Virtual)
Esta es la opción recomendada porque este proyecto usa **Node.js** y **SQLite**.
1.  **Subir todo:** Subes TODOS los archivos (HTML, CSS, JS, y SERVER.JS) al servidor.
2.  **Instalar Node.js:** En el servidor VPS, instalas Node.js.
3.  **Encender el Servidor:** Ejecutas el comando `node server.js` (o usas una herramienta como PM2 para que se quede encendido por siempre).
4.  **Configurar Dominio:** Apuntas tu dominio a la carpeta donde están los archivos HTML.

### Opción B: Hostinger "Setup Node.js App" (Probable)
Muchos planes de Hostinger ahora incluyen una herramienta para Node.js.
1. **Startup File:** Asegúrate de que apunte a `app.js` (lo acabamos de crear).
2. **Package.json:** Hemos ajustado el archivo para que sea compatible.
3. **Instalación:**
   - Sube todos los archivos (excepto `node_modules`).
   - Ve a la sección Node.js y haz clic en "Install Dependencies" (NPM Install).

### Opción C: Tienes un plan "Web Hosting" Antiguo (Sin Node.js)
Estos planes normalmente **NO permiten correr servidores Node.js** (el comando `node server.js` no funcionará o se apagará). Solo sirven para archivos estáticos.

**Solución Híbrida:**
1.  **Frontend en Hostinger:** Subes `index.html`, `shop.html`, `admin.html`, `style.css`, `script.js` a tu "File Manager" en Hostinger (carpeta `public_html`).
2.  **Backend en otro lado:** Subes la parte del servidor (`server.js`, `package.json`, `database.js`) a un servicio gratuito o barato de Node.js como **Render.com**, **Railway.app** o **Heroku**.
3.  **Conectarlos:**
    *   Una vez que tu servidor esté en Render/Railway, te darán una URL (ej: `https://milo-api.onrender.com`).
    *   Vas a tu archivo `script.js` y `admin.html` (que están en Hostinger) y cambias `http://localhost:3000` por esa nueva URL.

---

## Preguntas Frecuentes

### ¿Son páginas separadas?
No necesariamente. Son parte del mismo "sitio web", pero el **Admin** y la **Tienda** necesitan que el archivo `server.js` esté encendido en algún lugar del mundo para poder guardar y leer los productos de la base de datos.

### ¿Puedo subir solo el HTML?
Si subes solo el HTML sin el servidor:
*   La página se verá bien (diseño).
*   **PERO** no saldrán los productos (porque `shop.html` intenta pedírselos al servidor).
*   El `admin.html` no funcionará.
*   Los pagos de Mercado Pago no funcionarán.

### ¿Qué archivos subo?
Si usas VPS (Opción A): **Todo**.
Si usas Hosting Básico (Opción B):
*   A Hostinger: Solo los `.html`, `.css`, `.js` (cliente), imágenes.
*   A Render/Railway: `server.js`, `database.js`, `package.json`.

---

## Seguridad y Pagos

Si te preocupa la seguridad para los pagos, es importante saber:

1.  **SSL (El candado verde):**
    *   **Namecheap:** Incluye certificado SSL Gratis "PositiveSSL" el primer año. Esto encripta los datos de tus usuarios.
    *   **Hostinger:** También incluye SSL gratis ilimitado.
    *   **IMPORTANTE:** Nunca lances la tienda sin SSL. Asegúrate de activarlo en el panel de tu hosting (se llama "Namecheap SSL" o "Lets Encrypt").

2.  **Seguridad de Pagos (Mercado Pago):**
    *   Tu página web **NO toca ni guarda** los números de tarjeta de crédito.
    *   Cuando el usuario paga, es redirigido a **Mercado Pago**.
    *   Mercado Pago es quien cumple con todas las certificaciones bancarias (PCI DSS).
    *   Esto hace que tu responsabilidad de seguridad sea mucho menor, ya que los datos sensibles se procesan en los servidores seguros de Mercado Pago, no en tu hosting barato.

