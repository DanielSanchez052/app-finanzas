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
- 🗂️ Navegación por tabs (Dashboard, Registro, Presupuestos, Análisis, Backup)
- 💾 Persistencia local con **IndexedDB**
- 📦 Importación / exportación de backups en JSON
- 📊 Exportación de ingresos y gastos en CSV
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

```
appFinanzas/
├── index.html              # Punto de entrada HTML
├── css/
│   └── main.css            # Estilos (dark theme con variables CSS)
│
└── js/
    ├── app.js              # Bootstrap: inicializa la app
    │
    ├── core/               # Núcleo: lógica y persistencia
    │   ├── state.js        # Estado global (reactive)
    │   ├── events.js       # Sistema de notificaciones
    │   ├── alerts.js       # Lógica de cálculo de alertas
    │   ├── budgets.js      # Lógica de presupuestos
    │   ├── utils.js        # Utilidades (formateo, etc)
    │   ├── export.js       # Exportar JSON/CSV
    │   │
    │   └── persistence/
    │       ├── db.js       # Configuración IndexedDB
    │       └── repository.js # Operaciones CRUD (incomes, expenses, budgets)
    │
    ├── features/           # Funcionalidades visuales
    │   ├── dashboard/
    │   │   ├── dashboard.js    # Render KPIs y balance
    │   │   └── charts.js       # Canvas: gráficos de barras
    │   ├── incomes/
    │   │   └── incomes.js      # Formulario y lógica de ingresos
    │   ├── expenses/
    │   │   └── expenses.js     # Formulario y lógica de gastos
    │   ├── budgets/
    │   │   └── budgets.js      # Tabla y edición de presupuestos
    │   ├── analysis/
    │   │   ├── categoriesSummary.js  # Resumen gastos por categoría
    │   │   └── transactionsTable.js  # Listado de transacciones
    │   ├── alerts/
    │   │   └── alerts.js       # Render de alertas
    │   └── backup/
    │       └── backup.js       # Importar/exportar/limpiar
    │
    └── ui/                 # Interfaz de usuario
        ├── tabs.js         # Navegación por tabs
        ├── monthSelector.js # Selector de mes
        └── render.js       # Funciones de render comunes
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
- **Backups:** Archivos JSON exportables/importables completos
- **Exportaciones:** CSV separado por tipo (ingresos/gastos)
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
5. **Backup** - Importar/exportar datos y limpiar base de datos

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

## 📄 Licencia

Uso personal / educativo.  
El usuario es responsable de la gestión y respaldo de sus datos.
