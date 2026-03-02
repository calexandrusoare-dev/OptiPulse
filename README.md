# OptiPulse - Enterprise Management System

Modern, modulară și scalabilă aplicație enterprise pentru gestionarea resurselor organizaționale cu sistem **RBAC (Role-Based Access Control)** complet.

## 🎯 Caracteristici Principale

- ✅ **Autentificare securizată** via Supabase
- ✅ **Sistem RBAC normalizat** cu module și permisiuni
- ✅ **CRUD complet** pentru fiecare modul
- ✅ **TypeScript strict** pentru type safety
- ✅ **Protecție de rute** cu verificare permisiuni
- ✅ **Design responsive** și modern (SaaS enterprise)
- ✅ **Modulari și extensibil** pentru viitoare funcționalități

---

## 📁 Structura Proiectului

```
src/
├── api/                 # API Layer (Supabase)
│   └── supabaseClient.ts
├── auth/               # Autentificare & Autorizare
│   ├── AuthProvider.tsx
│   └── ProtectedRoute.tsx
├── layout/             # Layout Components
│   ├── MainLayout.tsx
│   └── Sidebar.tsx
├── lib/               # Utility Functions
│   └── rbac.ts       # Permission checking logic
├── modules/           # Feature Modules
│   ├── hr/           # Human Resources
│   │   ├── LeaveRequests.tsx
│   │   ├── LeavePlanning.tsx
│   │   ├── Overtime.tsx
│   │   └── TimeEntries.tsx
│   ├── finance/      # Finance Management
│   │   ├── ExpenseRequests.tsx
│   │   ├── Budgets.tsx
│   │   └── KPI.tsx
│   └── admin/        # Administration
│       └── Users.tsx
├── pages/            # Page Components
│   ├── Dashboard.tsx
│   └── LoginPage.tsx
├── router/           # Route Configuration
│   └── AppRouter.tsx
├── types/            # TypeScript Definitions
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css         # Global Styles

```

---

## 🔐 Sistem RBAC

### Model Normalizat

OptiPulse folosește un model de permisiuni **enterprise-normalized**:

```
core.modules          → Module definitions (hr, finance, admin)
core.permissions      → Permission types (view, create, edit, delete, approve)
core.module_permission_definitions → Many-to-Many link
core.user_permissions → User-module-permission assignments
core.v_user_permissions → View normalized (user_id, module_code, permission_code)
```

### Verificare Permisiuni

Folosiți funcțiile utile din `lib/rbac.ts`:

```typescript
import { hasPermission, canCreate, canEdit, canDelete, canApprove } from "@/lib/rbac"

// Check specific permission
hasPermission(permissions, "hr", "approve")  // true/false

// Check common permissions
canCreate(permissions, "finance")             // Can create in Finance
canEdit(permissions, "admin")                 // Can edit in Admin
canDelete(permissions, "hr")                  // Can delete in HR
canApprove(permissions, "finance")            // Can approve in Finance

// Get user modules
const modules = getUserModules(permissions)   // ["hr", "finance"]

// Get permission matrix
const matrix = getPermissionMatrix(permissions) 
// { hr: ["view", "create"], finance: ["view", "approve"] }
```

---

## 🚀 Setup Initial

### Prerequisite
- Node.js 18+
- Supabase account cu:
  - Tabel `auth.users` (default Supabase)
  - Tabele business: `core.modules`, `core.permissions`, `core.module_permission_definitions`, `core.user_permissions`
  - View: `core.v_user_permissions` (see `db/migrations/20260227_create_v_user_permissions.sql`)

> **Migrations**: the `db/migrations` folder contains SQL files that must be
> executed against the database when initializing or updating the schema. If
> you enable the Supabase GitHub integration, these scripts will be executed
> automatically on each push to `main`. Otherwise run them manually via the
> SQL editor or `psql`.

### Instalare

1. **Clone & Install**
```bash
npm install
```

2. **Environment Setup**
Creați `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
```

---

## 📐 Arhitectura

### Auth Flow

```
1. User logs in (LoginPage) → Supabase Auth
2. AuthProvider loads session + permissions from v_user_permissions
3. ProtectedRoute validates module_code + permission_code
4. Components use useAuth() hook + RBAC functions
```

### Component Architecture

```
App.tsx
└── AuthProvider
    └── AppRouter
        ├── /login → LoginPage
        ├── / → ProtectedRoute (MainLayout)
        │   ├── Sidebar (shows modules user has access to)
        │   └── Outlet
        │       ├── /hr/leave-requests → LeaveRequests
        │       ├── /finance/expenses → ExpenseRequests
        │       └── /admin/users → Users
```

---

## 🎨 Design System

### CSS Variables
Toate componentele folosesc design tokens din `index.css`:

```css
--primary-color: #2563eb
--success-color: #16a34a
--error-color: #dc2626
--gray-100 ... --gray-900
```

### Componente UI Reutilizabile

- **Cards**: `.card` - Container principal
- **Tabele**: `.data-table`, `.table-container`
- **Statusuri**: `.table-status.status-*` (pending, approved, rejected)
- **Butoane**: `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`
- **Forme**: `.login-form`, `.form-grid`
- **Alerte**: `.alert.alert-*` (success, error, warning, info)

---

## 📝 Modul HR

**Rute**: `/hr/leave-requests`, `/hr/leave-planning`, `/hr/overtime`, `/hr/time-entries`

**Permisiuni necesare**: `module_code="hr"`

### LeaveRequests
- ✅ Create leave request
- ✅ View own requests
- ✅ Approve/Reject (cu permission "approve")
- ✅ Delete (cu permission "delete")

### Data Model
```typescript
LeaveRequest {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days: number
  status: "pending" | "approved" | "rejected"
  reason?: string
}
```

---

## 💰 Modul Finance

**Rute**: `/finance/expenses`, `/finance/budgets`, `/finance/kpi`

**Permisiuni necesare**: `module_code="finance"`

### ExpenseRequests
- ✅ Submit expense claim
- ✅ Approve/Reject expenses
- ✅ Track reimbursement status
- ✅ Receipt upload support

### Budgets
- ✅ View budget allocation
- ✅ Track spending vs budget
- ✅ Visualize progress bars

### KPI Dashboard
- ✅ Define key metrics
- ✅ Track actual vs target
- ✅ Color-coded status indicator

---

## ⚙️ Modul Admin

**Rută**: `/admin/users`

**Permisiuni necesare**: `module_code="admin"` + `permission_code="view"`

### Funcționalități
- ✅ Create users (Supabase Auth)
- ✅ List all users
- ✅ Manage user permissions (grant/revoke)
- ✅ Delete users
- ✅ View permission matrix

---

## 🔧 Extindere cu Noi Module

### 1. Creați Tipuri TypeScript

```typescript
// src/types/index.ts
export interface MyEntity {
  id: string
  title: string
  status: "active" | "inactive"
}
```

### 2. Creați Componenta Modul

```typescript
// src/modules/mymodule/MyModule.tsx
import { useAuth } from "@/auth/AuthProvider"
import { canCreate, canEdit, canDelete } from "@/lib/rbac"

export default function MyModule() {
  const { permissions } = useAuth()
  const moduleCode = "mymodule"
  
  const canCreateItem = canCreate(permissions, moduleCode)
  // ... rest of component
}
```

### 3. Adăugați Ruta

```typescript
// src/router/AppRouter.tsx
<Route path="mymodule">
  <Route
    path="items"
    element={
      <ProtectedRoute moduleCode="mymodule">
        <MyModule />
      </ProtectedRoute>
    }
  />
</Route>
```

### 4. Update Sidebar

```typescript
// src/layout/Sidebar.tsx
const navItems: NavItem[] = [
  // ... existing
  {
    label: "My Items",
    to: "/mymodule/items",
    module: "mymodule",
    icon: "📦",
  },
]
```

---

## 🛡️ Security Best Practices

1. **Frontend Validation**: Verificare permisiuni în ProtectedRoute
2. **RLS Policy**: Implementați RLS în Supabase pentru fiecare tabel
3. **API Secrets**: Nu stocați chei sensibile în frontend
4. **Type Safety**: Utilizați TypeScript strict
5. **Error Handling**: Catch și log errors în console

### RLS Policy Exemplu

```sql
-- users_permissions table
CREATE POLICY "Users can only view own permissions"
  ON public.user_permissions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can modify permissions"
  ON public.user_permissions
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_permissions
    WHERE user_id = auth.uid() 
    AND module_id = 3 
    AND permission_id = 5
  ));
```

---

## 📚 API Integration

### Supabase Client

```typescript
// src/api/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Query Example

```typescript
const { data, error } = await supabase
  .from("leave_requests")
  .select("*")
  .eq("employee_id", userId)
  .order("created_at", { ascending: false })

if (error) throw error
setRequests(data || [])
```

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [TypeScript](https://www.typescriptlang.org)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev)

---

## 📞 Support & Contribution

Această aplicație este production-ready și extensibilă.

**Pentru adăugarea de noi funcționalități:**
1. Follow the architecture patterns
2. Use TypeScript strict mode
3. Implement proper error handling
4. Add RBAC checks
5. Test with different user roles

---

## 📄 License

Proprietary - Enterprise Use Only

---

**Build date**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
