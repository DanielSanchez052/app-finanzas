# 💰 Control Financiero Personal (Web, Privacy-First)

Aplicación web **offline-first** para el control de finanzas personales, diseñada con un enfoque **privacy-first**:  
los datos **nunca salen del dispositivo del usuario** y no existe backend ni almacenamiento en servidores externos.

---

## 🎯 Objetivos del proyecto

- Controlar ingresos, gastos y presupuestos mensuales
- Analizar gastos por categoría y transacciones
- Funcionar **100% offline**
- Mantener los datos **solo del lado del cliente**
- Ser usable tanto en **mobile como en desktop**
- Evitar dependencias innecesarias y frameworks pesados

---

## ✨ Características principales

- 📊 Dashboard con KPIs y gráficos de ingresos/gastos por categoría
- ➕ Registro de ingresos y gastos con categorización
- 📅 Control por mes con selector dinámico
- 📈 Presupuestos por categoría con alertas de exceso
- 🚨 Alertas automáticas:
  - ⚠️ Mes en rojo (gastos > ingresos)
  - ⚠️ Ahorro bajo (< 10% del ingreso)
  - ⚠️ Categoría cerca del presupuesto (80%)
  - 🔴 Exceso de presupuesto por categoría
- 📂 Análisis de gastos por categoría con resumen
- 📋 Tabla de transacciones del mes actual
- 🌙 Tema oscuro (dark mode) nativo
- 🗂️ Navegación por tabs (Dashboard, Registro, Presupuestos, Análisis, Configuración)
- 💾 Persistencia local con **IndexedDB**
- 📦 Sistema de backups local:
  - Exportar en **JSON** o **CSV**
  - Exportar todo / solo ingresos / solo gastos / solo presupuestos
  - Importar backups completos en JSON
- ☁️ Backups en la nube (opcional):
  - Proveedor **Google Drive** configurable por el propio usuario (Client ID + API Key)
  - Los backups se guardan en una carpeta `app-finanzas/backup-YYYY.json`
- 🧹 Limpieza manual de la base de datos local con confirmación

---

## 🔐 Privacidad y seguridad

- ❌ No backend
- ❌ No cuentas de usuario
- ❌ No tracking
- ❌ No cookies
- ✅ Datos almacenados únicamente en el navegador (IndexedDB)
- ✅ Backups bajo control explícito del usuario (JSON)

El usuario es **dueño total de sus datos**.

---

## 🧱 Arquitectura

La aplicación sigue una arquitectura **modular, reactiva y escalable**:

```text
appFinanzas/
├── index.html              # Punto de entrada HTML
├── css/
│   └── main.css            # Estilos (dark theme con variables CSS)
│
└── js/
    ├── app.js              # Bootstrap: inicializa la app
    │
    ├── core/               # Núcleo: lógica y persistencia
    │   ├── state.js        # Estado global (reactivo)
    │   ├── events.js       # Sistema de notificaciones
    │   ├── alerts.js       # Lógica de cálculo de alertas
    │   ├── budgets.js      # Lógica de presupuestos
    │   ├── utils.js        # Utilidades (formateo, etc.)
    │   ├── backup/         # Sistema de backup local (JSON/CSV)
    │   │   ├── index.js    # Orquestador de formatos y secciones
    │   │   ├── json.js     # Export/Import formato JSON
    │   │   └── csv.js      # Export formato CSV
    │   └── persistence/
    │       ├── db.js       # Configuración IndexedDB
    │       ├── repository.js      # Operaciones CRUD (incomes, expenses, budgets)
    │       └── cloud/             # Proveedores de backup en la nube
    │           ├── index.js       # Orquestador de proveedores (google-drive, ...)
    │           └── googleDrive/   # Proveedor Google Drive
    │               ├── index.js         # Interfaz común (authenticate, uploadBackup, downloadBackup)
    │               ├── config.js        # Gestión de Client ID / API Key (localStorage)
    │               ├── authenticate.js  # Integración con Google Identity Services
    │               ├── uploadBackup.js  # Subida de backup-YYYY.json a carpeta app-finanzas
    │               ├── downloadBackup.js# Lectura del backup más reciente
    │               └── utils.js         # Helpers de carpeta/archivos
    │
    ├── features/           # Funcionalidades visuales
    │   ├── dashboard/
    │   │   ├── dashboard.js        # Render KPIs y balance
    │   │   └── charts.js           # Canvas: gráficos de barras
    │   ├── incomes/
    │   │   └── incomes.js          # Formulario y lógica de ingresos
    │   ├── expenses/
    │   │   └── expenses.js         # Formulario y lógica de gastos
    │   ├── budgets/
    │   │   └── budgets.js          # Tabla y edición de presupuestos
    │   ├── analysis/
    │   │   ├── categoriesSummary.js  # Resumen gastos por categoría
    │   │   └── transactionsTable.js  # Listado de transacciones
    │   ├── alerts/
    │   │   └── alerts.js           # Render de alertas
    │   └── settings/
    │       ├── index.js            # Orquesta secciones de Configuración
    │       ├── backup.js           # UI de backup local + nube + zona de peligro
    │       └── storage/
    │           ├── index.js        # Selección de proveedor de almacenamiento
    │           └── googleDrive.js  # UI específica de configuración de Google Drive
    │
    └── ui/                 # Interfaz de usuario
        ├── tabs.js         # Navegación por tabs
        ├── monthSelector.js# Selector de mes
        └── render.js       # Render principal (dashboard, settings, etc.)
```

### 🏗️ Arquitectura de capas

```
┌─────────────────────────────────────────┐
│  UI Layer (features/ + ui/)             │  Renderizado y manejo de eventos
├─────────────────────────────────────────┤
│  Business Logic (core/)                 │  State, alerts, budgets, utils
├─────────────────────────────────────────┤
│  Persistence Layer (core/persistence/)  │  IndexedDB operations
├─────────────────────────────────────────┤
│  Browser Storage (IndexedDB)            │  Almacenamiento físico
└─────────────────────────────────────────┘
```

### 🔄 Flujo de datos

1. **Usuario interactúa** con formularios/botones en `features/`
2. **Se actualiza** `state.js` (estado global)
3. **Se persiste** en IndexedDB vía `repository.js`
4. **Se notifica** a través de `events.js` (patrón Observer)
5. **Se re-renderiza** el UI con los nuevos datos

### 📋 Principios clave

- **Repository Pattern** → Abstracción de persistencia (fácil cambiar IndexedDB por otra fuente)
- **Event-driven UI** → Reactividad sin frameworks (patrón Observer simple)
- **Single Responsibility** → Cada módulo tiene una responsabilidad clara
- **State Management** → Estado centralizado y predecible
- **No dependencias externas** → Vanilla JavaScript ES Modules

---

## 🗃️ Persistencia de datos

- **Fuente de verdad:** IndexedDB
- **Almacenes:** incomes, expenses, budgets
- **Backups locales:**
  - Módulo `core/backup` con proveedores de formato (JSON, CSV)
  - Exportar:
    - Todo (`incomes`, `expenses`, `budgets`)
    - Solo gastos
    - Solo ingresos
    - Solo presupuestos
  - Importar backups completos desde JSON
- **Backups en la nube (opcional):**
  - Proveedor Google Drive configurado por el usuario
  - Los backups se almacenan en la carpeta `app-finanzas/` de su Drive
  - Un archivo por año: `backup-YYYY.json` (por ejemplo `backup-2026.json`)
  - La restauración toma el backup más reciente disponible
- **Identificadores:** Auto-incrementales para transacciones, categoría como clave para presupuestos

---

## 🛠️ Estructura de datos

```javascript
// Ingreso
{
  id: <auto>,
  date: "2026-01-15",
  month: "2026-01",
  type: "Salario",
  amount: 2000000
}

// Gasto
{
  id: <auto>,
  date: "2026-01-15",
  month: "2026-01",
  category: "Alimentación",
  description: "Mercado",
  amount: 150000
}

// Presupuesto
{
  category: "Arriendo",
  amount: 900000
}
```

---

## 🚀 Cómo usar la app

1. Abrir `index.html` en el navegador
2. Registrar ingresos y gastos
3. Navegar por tabs para análisis y control
4. Exportar backup JSON periódicamente (recomendado)
5. (Opcional) Limpiar la base de datos local desde la UI

> No requiere instalación ni servidor.

---

## 📱 Compatibilidad

- Chrome / Edge
- Firefox
- Safari (desktop y mobile)
- Compatible con navegadores modernos que soporten IndexedDB

---

## � Categorías de gastos

Las categorías de gastos están predefinidas en el formulario:
- **Arriendo**
- **Alimentación**
- **Servicios**
- **Moto**
- **Ocio**

---

## 🧭 Navegación de la app

La interfaz está organizada en 5 tabs principales:

1. **Dashboard** - KPIs, balance y gráficos de ingresos vs gastos
2. **Registro** - Formularios para agregar ingresos y gastos
3. **Presupuestos** - Tabla de presupuestos por categoría y alertas
4. **Análisis** - Resumen por categoría y tabla detallada de transacciones
5. **Configuración** - 
   - Sección **Backup**: backups locales (JSON/CSV), restauración y zona de peligro.
   - Sección **Persistencia de datos**: selección y configuración de proveedor de almacenamiento (Google Drive).

---

- HTML5
- CSS (variables, dark theme)
- JavaScript (ES Modules)
- IndexedDB (persistencia)
- Canvas API (gráficos)

---

## 🧠 Estado del proyecto

✔ Funcional  
✔ Estable  
✔ Pensado para uso personal  
✔ Listo para futuras mejoras (PWA, cifrado, sync opcional)

---

## 📌 Mejoras pendientes

- 🔐 Cifrado client-side (opcional)
- 📱 PWA instalable
- ✏️ Edición/eliminación de transacciones registradas
- 🔍 Filtros y búsqueda avanzada
- 🌗 Toggle light/dark theme
- 📝 Edición de categorías personalizadas
- 🧪 Tests automatizados

---

## ☁️ Configurar backup en la nube con Google Drive

La integración con Google Drive es **opcional** y se configura 100% en el navegador.

### 1. Crear un proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com/).
2. Crear un proyecto nuevo (por ejemplo `app-finanzas`).
3. En **APIs & Services → Library**, habilitar la **Google Drive API**.

### 2. Crear credenciales

En **APIs & Services → Credentials**:

1. Crear una **API Key**.
2. Crear un **OAuth 2.0 Client ID** de tipo **Web application**.
   - Añadir el origen autorizado correspondiente a donde sirves la app
     (por ejemplo `http://localhost:4173` o la URL de Vercel).

Guarda:

- `Client ID` (formato `xxxxx.apps.googleusercontent.com`).
- `API Key`.

### 3. Configurar pantalla de consentimiento (OAuth consent screen)

En **APIs & Services → OAuth consent screen**:

1. Seleccionar tipo de usuario `External` (para uso personal está bien en modo Testing).
2. Completar los campos mínimos (nombre de la app, mail de soporte, etc.).
3. Añadir tu(s) cuenta(s) de Google como **Test users**.

> Mientras el proyecto esté en modo Testing, solo los correos añadidos como Test users
> podrán autorizar la app.

### 4. Conectar Google Drive desde la app

En la aplicación `app-finanzas`:

1. Ir a la pestaña **Configuración → Persistencia de Datos**.
2. En "Almacenamiento" seleccionar **Google Drive**.
3. Rellenar:
   - **Client ID** (copiado de Google Cloud).
   - **API Key**.
4. Pulsar el botón **"Configurar proveedor"**.
   - Se abrirá el popup de Google para elegir la cuenta y autorizar la app.
   - Si todo va bien, verás un mensaje del tipo:
     - `Conectado a Google Drive como tu-correo@ejemplo.com`.

### 5. Usar los backups en la nube

Con el proveedor configurado:

1. Ir a **Configuración → Backup**.
2. Usar los botones:
   - **"Guardar backup en la nube"** → sube un backup completo a tu Drive.
   - **"Restaurar desde la nube"** → restaura el backup más reciente.

Los archivos se guardan en tu Google Drive en una carpeta `app-finanzas/`, con un
archivo por año:

- `backup-2025.json`, `backup-2026.json`, etc.

> La app nunca envía tus credenciales ni tus datos financieros a ningún servidor.  
> Las claves y el estado de autenticación se guardan únicamente en tu navegador (localStorage).

---

## 📄 Licencia

Uso personal / educativo.  
El usuario es responsable de la gestión y respaldo de sus datos.
