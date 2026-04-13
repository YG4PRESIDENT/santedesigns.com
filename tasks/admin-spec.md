# Sante Designs -- Firebase Admin Panel: Technical Spec

**Date:** 2026-04-13
**Status:** Spec (not started)
**Scope:** One HTML file. No framework. No build step. Firebase SDK from CDN.

---

## 0. Context & Constraints

The existing site is vanilla HTML/CSS/JS hosted on GitHub Pages. Products are currently hardcoded in `archive.html` as static `<a class="c-product-card">` blocks and in `product.html` as a static template. Snipcart handles checkout via `data-item-*` attributes on buttons.

This admin replaces the "Yahir edits HTML" workflow. Sante opens a URL, signs in with Google, manages products. The public site reads from Firestore and renders dynamically.

**Non-goals:**
- No order management (Snipcart dashboard handles that)
- No inventory sync (Snipcart owns inventory counts)
- No analytics dashboard
- No multi-user roles (Sante is the only admin)

---

## 1. Firebase Setup

### 1.1 Firebase Project

Create one Firebase project: `sante-designs` (or similar). Enable three services:

| Service | Plan | Cost |
|---------|------|------|
| Firebase Authentication | Spark (free) | $0 |
| Cloud Firestore | Spark (free) | $0 up to 1 GiB storage, 50K reads/day |
| Firebase Storage | Spark (free) | $0 up to 5 GB, 1 GB/day downloads |

The Spark plan is more than sufficient for a small clothing brand. The entire product catalog (text + metadata) will be under 100 KB of Firestore data. Images at ~500 KB each, 50 products = ~25 MB storage. Nowhere near limits.

### 1.2 Authentication Config

- Enable **Google** as the sole sign-in provider in Firebase Console > Authentication > Sign-in method.
- Whitelist exactly one email: Sante's Google account (e.g., `sante@gmail.com`).
- No other providers needed. No anonymous auth. No email/password.

The whitelist is enforced in Firestore security rules (not in Auth itself -- Firebase Auth lets anyone sign in with Google, but security rules reject writes from non-whitelisted UIDs).

### 1.3 Firestore Collection Structure

One collection. Flat. No subcollections.

```
Collection: products
  Document ID: auto-generated (Firestore .doc() ID)
  Fields:
    name          : string    — "Resurrection Hoodie"
    slug          : string    — "resurrection-hoodie" (auto-generated from name, used for URL)
    price         : number    — 85 (in dollars, not cents -- Snipcart uses dollars)
    description   : string    — "Artist statement copy..."
    sizes         : array     — ["S", "M", "L", "XL"] (only checked sizes)
    soldOut       : boolean   — false
    images        : array     — ["https://firebasestorage.googleapis.com/...image1.jpg", "...image2.jpg"]
    sortOrder     : number    — 0 (lower = appears first in grid)
    visible       : boolean   — true (false = hidden from public site, still in admin)
    createdAt     : timestamp — server timestamp on create
    updatedAt     : timestamp — server timestamp on every save
```

**Why this structure:**
- Flat array of image URLs (not references) -- simplest to render on public site with a plain `<img src="">`.
- `slug` enables pretty URLs: `product.html?p=resurrection-hoodie`.
- `sortOrder` lets Sante reorder products without renaming them.
- `visible` is a soft-delete / draft mechanism.
- `soldOut` is separate from Snipcart inventory -- this is a visual flag Sante can toggle from his phone to show "SOLD OUT" on the card. Snipcart still controls actual purchasability.

### 1.4 Storage Bucket Structure

```
sante-designs.appspot.com/
  products/
    {productId}/
      0.jpg
      1.jpg
      2.jpg
      ...
```

Organized by product document ID. Files named by index (0, 1, 2...) to keep it simple. Original filenames are discarded (they're usually `IMG_4392.HEIC` anyway).

Images are resized client-side before upload (see Section 5).

### 1.5 Security Rules

**Firestore rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: anyone can read, only Sante can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == 'SANTE_EMAIL@gmail.com';
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Storage rules:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Product images: anyone can read (public site needs them), only Sante can write
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == 'SANTE_EMAIL@gmail.com'
                   && request.resource.size < 10 * 1024 * 1024  // 10 MB max
                   && request.resource.contentType.matches('image/.*');
    }

    // Deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**Why email-based rules instead of UID:** If Sante ever needs to re-create his Google account or we need to swap the Firebase project, we don't have to hunt down a UID. Email is human-readable and Sante will never change his email.

---

## 2. The Admin HTML Page

One file: `admin/index.html` (served at `santedesigns.com/admin/`).

This page is NOT linked from the public site. No nav link, no footer link, no sitemap entry. Sante bookmarks it or adds it to his home screen.

### 2.1 Page States

The page has three states, shown/hidden with CSS classes:

```
STATE 1: Sign-In Screen
  - Centered vertically
  - "Sante" in Impact font (matches site logo)
  - "Admin" in Inconsolata below it
  - One button: "Sign in with Google"
  - Shown when: no Firebase auth session

STATE 2: Product List
  - Top bar: "Sante Admin" left, "Sign Out" right
  - Below top bar: "+ Add Product" button (full width, prominent)
  - Below button: vertical list of product cards
  - Each card shows: thumbnail (first image) | name | price | "SOLD OUT" badge if applicable
  - Tapping a card opens the edit form (State 3) for that product
  - Shown when: signed in, no product selected for editing

STATE 3: Product Editor (Add / Edit)
  - Top bar: "< Back" left, "Delete" right (only for existing products)
  - Form fields (top to bottom):
      1. Photo upload area (drag-and-drop zone + tap to select)
         - Shows thumbnail previews of uploaded/existing images
         - Each thumbnail has an X to remove
         - Drag to reorder (stretch goal -- defer if complex)
      2. Product Name (text input)
      3. Price (number input, step 0.01)
      4. Description (textarea, 4 rows)
      5. Sizes (checkboxes: S, M, L, XL, XXL, One Size)
      6. Sold Out (toggle switch)
      7. Visible on Site (toggle switch)
      8. Sort Order (number input)
  - "Save" button at bottom (full width, lime green accent)
  - Shown when: signed in AND (tapped "Add Product" OR tapped existing product)
```

### 2.2 UI Elements in Detail

**Sign-in screen:**
- White background, centered content
- Logo: `font-family: Impact; font-size: 3rem; text-transform: uppercase;`
- Subtitle: `font-family: Inconsolata; font-size: 0.875rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5;`
- Google sign-in button: use Firebase UI's default styled button OR a custom black button with the Google "G" icon. Custom is simpler (one `<button>`, no extra SDK).

**Product list:**
- Each product row: `display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #e5e5e5;`
- Thumbnail: 56x56px, `object-fit: cover; border-radius: 4px;`
- Name: Inconsolata bold, uppercase, small
- Price: Inconsolata, opacity 0.6
- Sold-out badge: tiny red pill if `soldOut === true`
- Hidden badge: tiny gray pill if `visible === false`

**Product editor form:**
- Photo drop zone: dashed border, 120px height, "Tap or drag photos" text centered
- `<input type="file" multiple accept="image/*">` hidden, triggered by tapping the zone
- Image previews: horizontal scroll row of 80x80 thumbnails
- All text inputs: full width, minimal border (bottom-border only), Inconsolata font
- Toggle switches: CSS-only (checkbox + label with `appearance: none` and pseudo-elements)
- Save button: `background: #4cff16; color: #000; font-weight: 700; padding: 16px; width: 100%; border: none; font-family: Inconsolata;`

### 2.3 No External Dependencies (Besides Firebase)

The admin page loads:
- Firebase App SDK (compat or modular from CDN)
- Firebase Auth SDK
- Firebase Firestore SDK
- Firebase Storage SDK
- Google Fonts (same as main site: Inconsolata, Inter)
- That is it. No GSAP, no Snipcart, no other libraries.

---

## 3. The JavaScript

All JS lives in a single `<script>` tag at the bottom of `admin/index.html`. No separate files. This is intentional -- keeps it one file, easy to reason about, no module import issues on GitHub Pages.

### 3.1 Firebase Initialization

```javascript
// Firebase config (these are public -- security comes from rules, not hiding keys)
const firebaseConfig = {
  apiKey: "...",
  authDomain: "sante-designs.firebaseapp.com",
  projectId: "sante-designs",
  storageBucket: "sante-designs.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
```

Using the **compat** SDK (not modular) because:
- No build step = no tree-shaking benefit from modular SDK
- Compat SDK works with simple `<script>` tags
- Simpler API for a single-file project

CDN script tags (order matters):

```html
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js"></script>
```

### 3.2 Auth Flow

```javascript
const provider = new firebase.auth.GoogleAuthProvider();

// Listen for auth state changes (handles page refresh, returning sessions)
auth.onAuthStateChanged(user => {
  if (user) {
    showProductList();
    loadProducts();
  } else {
    showSignIn();
  }
});

function signIn() {
  auth.signInWithPopup(provider).catch(err => {
    // Show error to user (e.g., popup blocked)
    showError('Sign-in failed. Allow popups for this site.');
  });
}

function signOut() {
  auth.signOut();
}
```

**Edge cases handled:**
- Popup blocked on mobile: show a message telling Sante to allow popups. Alternative: use `signInWithRedirect` instead of `signInWithPopup`. Redirect is more reliable on mobile Safari. **Decision: use `signInWithRedirect` as the primary method**, with `signInWithPopup` as fallback on desktop. Firebase handles the redirect result automatically via `onAuthStateChanged`.
- Session persistence: Firebase Auth defaults to `LOCAL` persistence (survives browser close). Sante stays signed in until he explicitly signs out. Good.
- Wrong Google account: Sante signs in with a different account. The Firestore write will fail (security rules reject it). The admin should check `user.email` after sign-in and show "Access denied" if it's not the whitelisted email. This is a UX guard -- the security rules are the real enforcement.

```javascript
const ADMIN_EMAIL = 'SANTE_EMAIL@gmail.com';

auth.onAuthStateChanged(user => {
  if (user && user.email === ADMIN_EMAIL) {
    showProductList();
    loadProducts();
  } else if (user) {
    // Signed in but wrong account
    showAccessDenied();
    auth.signOut();
  } else {
    showSignIn();
  }
});
```

### 3.3 CRUD Operations

**Load all products (real-time):**

```javascript
function loadProducts() {
  db.collection('products')
    .orderBy('sortOrder', 'asc')
    .onSnapshot(snapshot => {
      const products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      renderProductList(products);
    }, err => {
      showError('Failed to load products.');
      console.error(err);
    });
}
```

Using `onSnapshot` (real-time listener) instead of `get()` so the list updates automatically if Sante has two tabs open or makes changes from another device. It also means the initial load is a single call, and subsequent updates are incremental.

**Save product (create or update):**

```javascript
async function saveProduct(productId, data) {
  showSaving(); // disable button, show spinner

  try {
    // Upload any new images first
    const imageUrls = await uploadNewImages(productId, data.newFiles);
    const allImages = [...data.existingImages, ...imageUrls];

    const productData = {
      name: data.name,
      slug: generateSlug(data.name),
      price: parseFloat(data.price),
      description: data.description,
      sizes: data.sizes,
      soldOut: data.soldOut,
      visible: data.visible,
      images: allImages,
      sortOrder: parseInt(data.sortOrder) || 0,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (productId) {
      // Update existing
      await db.collection('products').doc(productId).update(productData);
    } else {
      // Create new
      productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(productData);
    }

    showProductList(); // go back to list
  } catch (err) {
    showError('Save failed. Try again.');
    console.error(err);
  } finally {
    hideSaving();
  }
}
```

**Delete product:**

```javascript
async function deleteProduct(productId) {
  if (!confirm('Delete this product permanently?')) return;

  try {
    // Delete images from Storage
    const storageRef = storage.ref(`products/${productId}`);
    const files = await storageRef.listAll();
    await Promise.all(files.items.map(item => item.delete()));

    // Delete Firestore document
    await db.collection('products').doc(productId).delete();

    showProductList();
  } catch (err) {
    showError('Delete failed.');
    console.error(err);
  }
}
```

**Generate slug:**

```javascript
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

### 3.4 State Management

No framework, so state is managed with simple variables and DOM manipulation:

```javascript
let currentView = 'signin'; // 'signin' | 'list' | 'editor'
let editingProductId = null; // null = new product, string = editing existing
let existingImages = [];     // URLs of already-uploaded images
let newFiles = [];           // File objects not yet uploaded

function showSignIn() {
  currentView = 'signin';
  document.getElementById('view-signin').style.display = '';
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-editor').style.display = 'none';
}

function showProductList() {
  currentView = 'list';
  editingProductId = null;
  document.getElementById('view-signin').style.display = 'none';
  document.getElementById('view-list').style.display = '';
  document.getElementById('view-editor').style.display = 'none';
}

function showEditor(product = null) {
  currentView = 'editor';
  editingProductId = product ? product.id : null;
  existingImages = product ? [...product.images] : [];
  newFiles = [];
  populateForm(product);
  document.getElementById('view-signin').style.display = 'none';
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-editor').style.display = '';
}
```

---

## 4. How the Public Site Reads Products

### 4.1 Changes to `archive.html`

The static product cards in `archive.html` (lines 41-88) are replaced with an empty container and a `<script>` that fetches from Firestore.

**Before (static):**
```html
<div class="c-product-grid" data-animate-group>
  <a href="product.html" class="c-product-card" data-animate="fade-up">
    <div class="c-product-card__image-wrap placeholder">[PRODUCT IMAGE]</div>
    ...
  </a>
  <!-- 5 more static cards -->
</div>
```

**After (dynamic):**
```html
<div class="c-product-grid" data-animate-group id="product-grid">
  <!-- Rendered by JS from Firestore -->
</div>

<!-- Firebase (only App + Firestore needed for reads) -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
<script>
  firebase.initializeApp({
    apiKey: "...",
    authDomain: "sante-designs.firebaseapp.com",
    projectId: "sante-designs"
  });

  const db = firebase.firestore();

  db.collection('products')
    .where('visible', '==', true)
    .orderBy('sortOrder', 'asc')
    .get()
    .then(snapshot => {
      const grid = document.getElementById('product-grid');
      snapshot.forEach(doc => {
        const p = doc.data();
        const card = document.createElement('a');
        card.href = `product.html?p=${p.slug}`;
        card.className = 'c-product-card';
        card.setAttribute('data-animate', 'fade-up');
        card.innerHTML = `
          <div class="c-product-card__image-wrap">
            ${p.images.length > 0
              ? `<img class="c-product-card__image" src="${p.images[0]}" alt="${p.name}" loading="lazy">`
              : `<div class="placeholder">[NO IMAGE]</div>`
            }
            ${p.soldOut ? '<span class="c-product-card__badge">SOLD OUT</span>' : ''}
          </div>
          <div class="c-product-card__info">
            <p class="c-product-card__title">${p.name}</p>
            <p class="c-product-card__price">$${p.price}</p>
          </div>
        `;
        grid.appendChild(card);
      });

      // Re-trigger GSAP fade animations after dynamic content loads
      if (typeof initFadeReveals === 'function') initFadeReveals();
    })
    .catch(err => {
      console.error('[Sante] Failed to load products:', err);
      document.getElementById('product-grid').innerHTML =
        '<p style="padding: var(--s-8); opacity: 0.5;">Products unavailable. Try refreshing.</p>';
    });
</script>
```

**Why `get()` instead of `onSnapshot()` on the public site:** The public site doesn't need real-time updates. A visitor loads the page, sees products, done. `get()` is a single read, saves Firestore quota, and avoids the overhead of a persistent WebSocket connection on every visitor's browser.

### 4.2 Changes to `product.html`

`product.html` becomes a dynamic template that reads the `?p=` query parameter and fetches the matching product.

```javascript
const slug = new URLSearchParams(window.location.search).get('p');

if (!slug) {
  window.location.href = 'archive.html';
}

db.collection('products')
  .where('slug', '==', slug)
  .where('visible', '==', true)
  .limit(1)
  .get()
  .then(snapshot => {
    if (snapshot.empty) {
      window.location.href = 'archive.html';
      return;
    }
    const product = snapshot.docs[0].data();
    renderProductPage(product);
  });
```

The `renderProductPage` function fills in:
- `<h1>` with `product.name`
- Price display with `product.price`
- Description with `product.description`
- Image gallery with `product.images`
- Snipcart `data-item-*` attributes dynamically:
  - `data-item-id` = slug
  - `data-item-name` = name
  - `data-item-price` = price
  - `data-item-url` = `/product.html?p=${slug}` (Snipcart validates this URL)
  - `data-item-image` = first image URL
  - `data-item-custom1-options` = sizes joined with `|`
- "SOLD OUT" state disables the add-to-cart button

### 4.3 Firestore Index

Firestore needs one composite index for the public site query:

```
Collection: products
Fields: visible ASC, sortOrder ASC
```

Also:

```
Collection: products
Fields: slug ASC, visible ASC
```

Firestore will prompt you to create these the first time the queries run (clickable link in the browser console error). Follow the link and it auto-creates.

### 4.4 Snipcart Compatibility

Snipcart validates products by crawling the `data-item-url`. The product page at that URL must contain a matching `snipcart-add-item` button with the same `data-item-id` and `data-item-price`. Since `product.html?p=resurrection-hoodie` will dynamically render the correct attributes, Snipcart's crawler will find them.

**Important caveat:** Snipcart's crawler is a bot -- it may not execute JavaScript. If it doesn't, validation will fail. Two solutions:

1. **Use Snipcart's JSON crawler endpoint** instead of HTML scraping. Add `data-item-url="/api/products.json"` and serve a static JSON file generated on save. This is more complex than needed for MVP.

2. **Disable Snipcart's product validation** in the Snipcart dashboard (Settings > Cart Validation > OFF). This is the simplest approach for MVP. The only risk is price tampering, which Snipcart itself warns about -- but for a small brand, this is negligible. Re-enable later if needed.

**Recommendation:** Disable validation for launch. Revisit if/when it matters.

---

## 5. Image Handling

### 5.1 Upload Flow

1. Sante taps the drop zone or "Add Photos" button
2. Native file picker opens (on phone, this includes camera roll)
3. `accept="image/*"` filters to images only
4. Selected files are added to `newFiles[]` array
5. Thumbnail previews are generated client-side using `URL.createObjectURL(file)`
6. On "Save", each file is:
   a. Resized client-side to max 1200px on longest edge (using `<canvas>`)
   b. Compressed to JPEG at 80% quality
   c. Uploaded to `products/{productId}/{index}.jpg`
   d. Download URL is retrieved via `getDownloadURL()`
   e. URL is added to the product's `images` array

### 5.2 Client-Side Resize

This is critical. Phone photos are 4000x3000+ pixels, 5+ MB. We resize before upload.

```javascript
function resizeImage(file, maxSize = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', 0.80);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

**Result:** ~4 MB phone photo becomes ~150-300 KB JPEG. Uploads in 1-2 seconds on LTE.

### 5.3 Upload Function

```javascript
async function uploadNewImages(productId, files) {
  // If creating new product, we need a doc ID first
  if (!productId) {
    const docRef = db.collection('products').doc();
    productId = docRef.id;
  }

  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const blob = await resizeImage(files[i]);
    const index = existingImages.length + i;
    const ref = storage.ref(`products/${productId}/${index}.jpg`);
    await ref.put(blob, { contentType: 'image/jpeg' });
    const url = await ref.getDownloadURL();
    urls.push(url);
  }
  return urls;
}
```

### 5.4 Image Display on Public Site

Firebase Storage download URLs are long-lived (they contain an auth token). They look like:

```
https://firebasestorage.googleapis.com/v0/b/sante-designs.appspot.com/o/products%2FaBC123%2F0.jpg?alt=media&token=abc-123-xyz
```

These are used directly in `<img src="...">` tags. No CDN layer needed (Firebase Storage is backed by Google Cloud's CDN). Performance is good globally.

### 5.5 Image Removal

When Sante removes an existing image (taps the X on a thumbnail):
- Remove the URL from `existingImages[]` array
- On save, delete the corresponding file from Storage
- Update the Firestore document's `images` array

```javascript
async function removeImage(url, productId) {
  // Remove from local state
  existingImages = existingImages.filter(u => u !== url);
  renderImagePreviews();

  // The actual Storage delete happens on save (not immediately)
  // This prevents orphaned state if Sante cancels the edit
}
```

---

## 6. Mobile Experience

This admin is built for mobile-first. Sante will use it on his phone 95% of the time.

### 6.1 Viewport & Layout

```css
/* Already in the <meta> tag */
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

The entire admin uses a single-column layout. No side-by-side panels, no multi-column grids. Stack everything vertically.

### 6.2 Key CSS for Mobile

```css
/* Admin-specific styles (inside admin/index.html, in a <style> tag) */

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inconsolata', monospace;
  background: #fff;
  color: #000;
  -webkit-font-smoothing: antialiased;
}

/* Top bar */
.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
  background: #fff;
}

/* Product list items — large tap targets */
.admin-product-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.admin-product-row:active {
  background: #f5f5f5;
}

/* Thumbnail */
.admin-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  background: #f0f0f0;
  flex-shrink: 0;
}

/* Form inputs — big enough for thumbs */
.admin-input {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid #e5e5e5;
  font-family: inherit;
  font-size: 16px; /* CRITICAL: prevents iOS zoom on focus */
  outline: none;
}

.admin-input:focus {
  border-bottom-color: #4cff16;
}

/* Photo drop zone */
.admin-dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  margin: 16px;
  transition: border-color 0.2s;
}

.admin-dropzone.dragover {
  border-color: #4cff16;
  background: rgba(76, 255, 22, 0.05);
}

/* Image preview row */
.admin-image-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 16px;
  -webkit-overflow-scrolling: touch;
}

.admin-image-preview {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.admin-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-image-preview__remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Size checkboxes — pill-style for easy thumb tapping */
.admin-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px;
}

.admin-size-pill {
  display: flex;
}

.admin-size-pill input {
  display: none;
}

.admin-size-pill label {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.admin-size-pill input:checked + label {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Toggle switch */
.admin-toggle {
  position: relative;
  width: 48px;
  height: 28px;
}

.admin-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.admin-toggle-track {
  position: absolute;
  inset: 0;
  background: #ccc;
  border-radius: 14px;
  transition: background 0.2s;
  cursor: pointer;
}

.admin-toggle-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.admin-toggle input:checked + .admin-toggle-track {
  background: #4cff16;
}

.admin-toggle input:checked + .admin-toggle-track::after {
  transform: translateX(20px);
}

/* Save button */
.admin-btn-save {
  display: block;
  width: calc(100% - 32px);
  margin: 24px 16px;
  padding: 16px;
  background: #4cff16;
  color: #000;
  border: none;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.admin-btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Add Product button */
.admin-btn-add {
  display: block;
  width: calc(100% - 32px);
  margin: 16px;
  padding: 14px;
  background: #000;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

/* Delete button */
.admin-btn-delete {
  background: none;
  border: none;
  color: #ff3333;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
}

/* Loading & error states */
.admin-loading {
  text-align: center;
  padding: 48px 16px;
  opacity: 0.4;
}

.admin-error {
  background: #ff3333;
  color: #fff;
  padding: 12px 16px;
  font-size: 14px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  text-align: center;
}

/* Safe area padding for phones with notch/home indicator */
.admin-bottom-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

### 6.3 Mobile-Specific Concerns

| Concern | Solution |
|---------|----------|
| iOS zoom on input focus | `font-size: 16px` on all inputs (iOS zooms at < 16px) |
| File picker on iOS | `accept="image/*"` triggers camera roll + camera option |
| Popup blocked (sign-in) | Use `signInWithRedirect` on mobile, detect via `navigator.userAgent` or window width |
| Keyboard pushing layout up | `position: sticky` on top bar keeps navigation visible |
| Slow upload on cellular | Show per-image progress bar; resize images client-side to ~200 KB |
| Fat finger on delete | `confirm()` dialog before delete |
| Safe areas (notch, home bar) | `viewport-fit=cover` + `env(safe-area-inset-bottom)` padding |

---

## 7. PWA Potential (Home Screen Install)

Yes, we can make this installable. Requires two files alongside `admin/index.html`:

### 7.1 `admin/manifest.json`

```json
{
  "name": "Sante Admin",
  "short_name": "Sante",
  "start_url": "/admin/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/admin/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/admin/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7.2 Link in HTML

```html
<link rel="manifest" href="/admin/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/admin/icon-192.png">
```

### 7.3 Service Worker (Optional)

A service worker is NOT required for "Add to Home Screen" on iOS. The manifest + meta tags are enough. On Android, Chrome will show the install prompt if there's a valid manifest + a service worker.

For MVP: skip the service worker. Sante can still add it to his home screen on iOS (Share > Add to Home Screen). It will open as a standalone app without Safari's address bar.

If we want the Android install banner too, add a minimal service worker:

```javascript
// admin/sw.js
self.addEventListener('fetch', () => {}); // no-op, just satisfies Chrome's requirement
```

And register it:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/admin/sw.js');
}
```

### 7.4 The Result

Sante taps "Add to Home Screen" on his iPhone. A "Sante Admin" icon appears. He taps it, it opens full-screen (no Safari chrome), he's already signed in (Firebase persistence), he sees his products. Feels like a native app.

---

## 8. File Inventory (What Gets Created)

```
admin/
  index.html      — The entire admin (HTML + CSS + JS, single file)
  manifest.json   — PWA manifest
  icon-192.png    — Home screen icon (192x192)
  icon-512.png    — Home screen icon (512x512)
  sw.js           — Service worker (4 lines, optional)
```

Plus modifications to existing files:

```
archive.html      — Replace static product cards with Firestore fetch
product.html      — Replace static content with Firestore fetch by slug
```

---

## 9. Build Estimate

| Task | Hours | Notes |
|------|-------|-------|
| **Firebase project setup** | 0.5 | Console clicks: create project, enable Auth/Firestore/Storage, deploy rules |
| **Admin HTML structure** | 1.0 | Three views, form layout, all HTML elements |
| **Admin CSS** | 1.5 | Mobile-first styling, toggles, drop zone, image previews, pill checkboxes |
| **Auth flow** | 1.0 | Google sign-in, redirect handling, email whitelist check, sign-out, error states |
| **Product list (admin)** | 0.5 | Real-time listener, render rows, tap to edit |
| **Product editor (admin)** | 2.0 | Form population, validation, save logic, create vs. update paths |
| **Image upload** | 2.0 | Client-side resize, upload to Storage, progress indication, remove existing images |
| **Delete product** | 0.5 | Confirmation, Storage cleanup, Firestore delete |
| **Public site: archive.html** | 1.0 | Replace static HTML with Firestore fetch, render cards, GSAP re-init |
| **Public site: product.html** | 1.5 | Slug-based fetch, dynamic Snipcart attributes, sold-out state, image gallery |
| **PWA setup** | 0.5 | manifest.json, icons, meta tags, optional service worker |
| **Mobile testing & polish** | 2.0 | iOS Safari, Android Chrome, image upload on phone, sign-in redirect edge cases |
| **Error handling & edge cases** | 1.0 | Network failures, empty states, loading indicators, concurrent edits |
| **Snipcart integration testing** | 0.5 | Verify dynamic `data-item-*` attributes work, disable validation if needed |
| **TOTAL** | **15.5 hours** | |

### Confidence Breakdown

- **12 hours** if everything goes smoothly (no surprises)
- **15.5 hours** realistic (includes debugging mobile sign-in, image upload edge cases, Snipcart validation issues)
- **20 hours** worst case (iOS Safari has a breaking quirk with redirect auth, HEIC images don't resize properly, Snipcart refuses dynamic products)

### Biggest Risk Factors

1. **Firebase Auth redirect on iOS Safari:** Safari's ITP (Intelligent Tracking Prevention) can interfere with `signInWithRedirect`. May need to use `signInWithPopup` and handle the popup blocker case instead. Budget 1-2 hours debugging this.

2. **HEIC image handling:** iPhones shoot in HEIC format. When selected through `<input type="file">`, iOS usually auto-converts to JPEG. But this isn't guaranteed on all iOS versions. If HEIC files arrive, `<canvas>` can't draw them. Fallback: detect HEIC and ask Sante to re-select as JPEG, or use a tiny HEIC decoding library (adds complexity).

3. **Snipcart dynamic product validation:** If Snipcart can't validate dynamically-rendered products, we either disable validation or add a server-side product JSON endpoint. Disabling validation is the fastest path.

---

## 10. What This Replaces

The existing plan (`tasks/admin-and-payments-plan.md`) estimated:
- Sanity.io: 11 hours, $0/mo
- Firebase custom: 25 hours, $0/mo
- Recommendation: Sanity.io

This spec brings the Firebase option down to **15.5 hours** by:
- Single HTML file (no build step, no CMS framework to learn)
- No subcollections, no complex data model
- Client-side image resize (no Cloud Functions)
- Compat SDK (no module bundler needed)
- Minimal feature set (no inventory sync, no order management, no analytics)

**Tradeoff vs. Sanity:** Sanity gives a polished, maintained admin UI. This Firebase admin is custom-built and maintained by Yahir. If Yahir disappears, the admin might need fixes. But: it is simpler (one HTML file vs. a Sanity project with schemas and GROQ queries), it is faster to build (15.5 vs. 11 hours, but Sanity's 11 hours assumed familiarity), and Sante owns everything (no third-party dependency).

---

## 11. Decision Points Before Building

These need answers before writing code:

1. **Sante's Google email address** -- needed for security rules and auth whitelist.
2. **Firebase project name** -- does Yahir have an existing Firebase account, or create new?
3. **Size options** -- is `S, M, L, XL, XXL, One Size` the correct set, or does Sante use different sizing?
4. **Snipcart vs. other checkout** -- the public site integration assumes Snipcart stays. If switching to Shopify Buy Button or something else, the product.html integration changes.
5. **Domain situation** -- is `santedesigns.com` purchased and pointing to GitHub Pages yet? The admin URL depends on this.
