# OptiPulse - Ghiduri pentru Dezvoltatori

## 1. Sistem de Traduceri (i18n) - Cum Funcționează

### Ce sunt "componentele stub" și traducerile?

**Componentele UI "stub"** sunt componente minimaliste din `/src/components/ui/` (card.tsx, button.tsx, badge.tsx, etc.). Ele:
- Renderează HTML puțin stilizat (fără props grozave, fără variante)
- Se bazează pe clase CSS din `src/index.css` pentru styling
- Sunt "stubs" = placeholder-uri funcționale, dar simple

**Traducerile** sunt șiruri de text care se schimbă în funcție de limba aleasă.

### Structura i18n în OptiPulse

```
src/locales/
├── en/
│   └── translation.json    (English translation keys & values)
└── ro/
    └── translation.json    (Romanian translation keys & values)
```

**Exemplu: translation.json (RO)**
```json
{
  "appTitle": "OptiPulse Dashboard",
  "dashboard": "Dashboard",
  "dashboardSubtitle": "Bine ai venit înapoi! Iată raportul tău de astăzi.",
  "concedii": "Concedii",
  "navLeaveRequests": "Cereri Concediu",
  "navExpenses": "Cheltuieli",
  "hrModule": "Resurse Umane",
  ...
}
```

### Cum se folosește? - Exemplu

**Fără traduceri (RĂU ❌):**
```tsx
function Dashboard() {
  return <h1>Dashboard</h1>;  // Hardcoded!
}
```

**Cu traduceri (BUN ✅):**
```tsx
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation();
  return <h1>{t('dashboard')}</h1>;  // Traducere dinamică!
}
```

### Ce s-a schimbat în build-ul de acum?

Am adăugat **27 noi chei de traducere** în ambele fișiere `translation.json`:

**RO-uri noi adăugate:**
```
activityVacationApproved      "Cerere concediu aprobată"
taskExpenseReview             "Revizuire cheltuieli"
navLeaveRequests              "Cereri Concediu"
navExpenses                   "Cheltuieli"
navBudgets                    "Bugete"
navKPI                        "KPI"
navUsers                      "Utilizatori"
navTimeEntries                "Pontaj"
navLeavePlanning              "Planificarea Concediilor"
navOvertime                   "Ore Suplimentare"
hrModule                      "Resurse Umane"
financeModule                 "Finanțe"
adminModule                   "Administrație"
backToDashboard               "← Înapoi la Dashboard"
accessDenied                  "Acces Refuzat"
accessDeniedMessage           "Nu ai permisiunea de a accesa această pagină."
expenseRequestsSubtitle       "Gestionează cheltuielile și cererile de rambursare"
... și altele
```

### Componente actualizate să folosească traduceri:

1. **src/pages/Dashboard.tsx**
   - Activity titles acum folosesc `t('activityVacationApproved')` etc.
   - Task titles acum folosesc `t('taskVacationApproval')` etc.

2. **src/layout/Sidebar.tsx**
   - Nav item labels: `t('navLeaveRequests')`, `t('navExpenses')`, etc.
   - Module titles: `t('hrModule')`, `t('financeModule')`, etc.

3. **src/auth/ProtectedRoute.tsx**
   - Page title: `t('accessDenied')`
   - Error message: `t('accessDeniedMessage')`
   - Back link: `t('backToDashboard')`

4. **src/modules/finance/ExpenseRequests.tsx**
   - Subtitle: `t('expenseRequestsSubtitle')`

### Cum adaug o nouă traducere?

1. **Adaug cheia în ambele fișiere de traducere:**
```json
// src/locales/ro/translation.json
{ "myNewKey": "Textul meu în Română" }

// src/locales/en/translation.json
{ "myNewKey": "My text in English" }
```

2. **Folosesc în componentă:**
```tsx
const { t } = useTranslation();
<h1>{t('myNewKey')}</h1>
```

3. **Build-ul va inlocui automat textul cu variantă RO sau EN** din selector limbă.

---

## 2. Sistem de Permisiuni (RBAC) - Cum Funcționează

### Concepte de bază

**RBAC** = Role-Based Access Control (Control Acces Bazat pe Roluri)

**Fluxul permisiunilor în OptiPulse:**
```
┌─────────────────┐
│ Utilizator (RO)│
└────────┬────────┘
         │
         ├─→ Are rol: "Employee", "Manager", "Admin"
         │
         ├─→ După rol, are PERMISIUNI pe:
         │   - modules: "hr", "finance", "admin"
         │   - actions: "view", "create", "edit", "delete"
         │
         └─→ Frontend-ul FILTREAZĂ ce vede pe baza acestor permisiuni
```

### Tabele în Supabase (Database)

```sql
-- 1. Utilizatori
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT
);

-- 2. Roluri
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  code TEXT (e.g., "admin", "employee", "manager"),
  name TEXT
);

-- 3. Utilizator → Rol
CREATE TABLE user_roles (
  user_id UUID,
  role_id UUID,
  FOREIGN KEY (user_id) REFERENCES users
  FOREIGN KEY (role_id) REFERENCES roles
);

-- 4. Module (componente ale appului)
CREATE TABLE modules (
  id UUID PRIMARY KEY,
  code TEXT (e.g., "hr", "finance", "admin"),
  name TEXT
);

-- 5. Permisiuni pe Modul
CREATE TABLE module_permissions (
  id UUID PRIMARY KEY,
  role_id UUID,
  module_id UUID,
  permission TEXT (e.g., "view", "create", "edit", "delete")
);

-- 6. VIEW pentru frontend
CREATE VIEW v_user_permissions AS
SELECT DISTINCT
  u.id as user_id,
  m.code as module_code,
  mp.permission
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN module_permissions mp ON ur.role_id = mp.role_id
JOIN modules m ON mp.module_id = m.id
```

### Fluxul în Aplicație

**1. La login (AuthProvider.tsx):**
```tsx
async loadPermissions() {
  // 1. Fetch user din Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Fetch permissions din view-ul v_user_permissions
  const { data: permissions } = await supabase
    .from('v_user_permissions')
    .select('*')
    .eq('user_id', user.id);
  
  // 3. Salvez în auth context
  setPermissions(permissions);  // [{user_id, module_code: "hr", permission: "view"}, ...]
}
```

**2. La filtrare pagini (ProtectedRoute.tsx):**
```tsx
<ProtectedRoute moduleCode="hr">
  <LeaveRequests />
</ProtectedRoute>

// ProtectedRoute checks: does user have permission for module "hr"?
const hasAccess = hasModuleAccess(permissions, "hr");
if (!hasAccess) return <Navigate to="/access-denied" />
```

**3. La filtrare meniuri (Sidebar.tsx):**
```tsx
const userModules = getUserModules(permissions);  
// Extrage module codes: ["hr", "finance"]

// Doar modulele pe care le are permisiunea
const groupedItems = navItems.filter(item => 
  userModules.includes(item.module)
);
```

### Funcții helper în `src/lib/rbac.ts`

```tsx
export function getUserModules(permissions: any[]) {
  // Returns: ["hr", "finance"] - module codes for this user
  return [...new Set(permissions.map(p => p.module_code))];
}

export function hasModuleAccess(permissions: any[], moduleCode: string) {
  // Returns: true/false - can user access this module?
  return permissions.some(p => p.module_code === moduleCode);
}

export function hasPermission(permissions: any[], moduleCode: string, action: string) {
  // Returns: true/false - can user do this action on this module?
  // Example: hasPermission(perms, "finance", "edit")
  return permissions.some(
    p => p.module_code === moduleCode && p.permission === action
  );
}
```

### Exemple: Cum se folosesc?

**Exemplu 1: Sidebar - Arată doar modulele pentru care are acces**

```tsx
const userModules = getUserModules(permissions);
// Result pentru "Maria" (HR employee): ["hr"]
// Result pentru "Admin": ["hr", "finance", "admin"]

const navItems = [
  { label: "Cereri Concediu", module: "hr" },      // Maria o vede
  { label: "Cheltuieli", module: "finance" },       // Maria NU o vede
  { label: "Utilizatori", module: "admin" },        // Maria NU o vede
];

navItems.filter(item => userModules.includes(item.module));
// Maria: [{ label: "Cereri Concediu", module: "hr" }]
```

**Exemplu 2: Route protection - Blochează acces neautorizat**

```tsx
// În AppRouter.tsx
<Route path="/finance/budgets" element={
  <ProtectedRoute moduleCode="finance">
    <Budgets />
  </ProtectedRoute>
} />

// Dacă Maria (HR only) încearcă să intre, o redirecționez la /access-denied
```

### Cum adaug permisioni pentru un utilizator?

**Pas 1: Identific utilizatorul și modulele dorite**

```sql
-- Maria Popescu, HR employee
SELECT id FROM users WHERE email = 'maria@company.com';
-- Result: user_id = '123abc'

-- Ce permisiuni vrei să-i dai?
-- Module: hr (view, create, edit)
```

**Pas 2: Asign rolle existentă sau crează noua**

```sql
-- Opțiunea A: Role existentă
INSERT INTO user_roles (user_id, role_id)
VALUES ('123abc', <role_id of 'Employee'>);

-- Opțiunea B: Dacă trebuie role nouă
INSERT INTO roles (code, name) VALUES ('hr_manager', 'HR Manager');
INSERT INTO user_roles (user_id, role_id) 
VALUES ('123abc', <new_role_id>);
```

**Pas 3: Definiți permisiuni pe role**

```sql
-- HR Manager role poate: view, create, edit pe module "hr"
INSERT INTO module_permissions (role_id, module_id, permission)
VALUES (
  <role_id of 'hr_manager'>,
  <module_id of 'hr'>,
  'view'
), (
  <role_id of 'hr_manager'>,
  <module_id of 'hr'>,
  'create'
), (
  <role_id of 'hr_manager'>,
  <module_id of 'hr'>,
  'edit'
);
```

**Pas 4: Verify**

```sql
-- Verific ce permisiuni are Maria
SELECT * FROM v_user_permissions 
WHERE user_id = '123abc';

-- Result:
-- user_id='123abc', module_code='hr', permission='view'
-- user_id='123abc', module_code='hr', permission='create'
-- user_id='123abc', module_code='hr', permission='edit'
```

---

## 3. Layout CSS Helpers - Cum Funcționează

### Ce sunt "layout helpers"?

Sunt clase CSS reutilizabile în `src/index.css` care controleaza:
- Dimensiuni și spacing
- Grile responsive
- Alignare și distribution

### Existing helpers în index.css

```css
/* Page container - constrain max width */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Content grid - responsive layout */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Card grid - specific for card collections */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Section title - typography helper */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

/* Divider - visual separator */
.divider {
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
}

/* Utility classes from Tailwind (via index.css) */
.space-y-6 { margin-bottom: 1.5rem; }
.flex { display: flex; }
.grid { display: grid; }
```

### Unde sunt definite astea?

```
src/index.css  (linia ~150-200)
```

### Cum se folosesc?

**Example 1: Dashboard page layout**

```tsx
// Without helpers (verbose)
<div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
  <h1>Dashboard</h1>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
    <Card>Stats</Card>
    <Card>Activity</Card>
    <Card>Tasks</Card>
  </div>
</div>

// With helpers (clean)
<div className="page-container space-y-6">
  <h1 className="section-title">Dashboard</h1>
  <div className="card-grid">
    <Card>Stats</Card>
    <Card>Activity</Card>
    <Card>Tasks</Card>
  </div>
</div>
```

**Example 2: Three-column layout**

```tsx
<div className="page-container">
  <h2 className="section-title">Budget Overview</h2>
  <div className="content-grid">
    {budgets.map(budget => (
      <Card key={budget.id}>
        <h3>{budget.name}</h3>
        <Progress value={budget.spent / budget.total * 100} />
      </Card>
    ))}
  </div>
</div>
```

Example 3: HR Module with sections

```tsx
<div className="page-container">
  <h1 className="section-title">Leave Requests</h1>
  
  <div className="space-y-6">
    <Card>
      <h3>Pending Requests</h3>
      <Table>...</Table>
    </Card>
    
    <div className="divider" />
    
    <Card>
      <h3>Approved Leaves</h3>
      <Table>...</Table>
    </Card>
  </div>
</div>
```

### Unde mai sunt clase?

- `main-sidebar` - Sidebar styling
- `sidebar-logo` - Logo container
- `sidebar-section` - Navigation section
- `sidebar-item` - Nav link styling
- `sidebar-logout` - Logout button
- `card`, `card-header`, `card-title`, `card-content` - Card components
- `btn`, `btn-primary` - Button styling
- `badge` - Badge component

Toate sunt în `src/index.css`, cautând `/* Component classes` sau `/* Sidebar`.

---

## 4. Tema Roșu + Alb - Design Minimal și Elegant

### Color Palette curentă

```css
:root {
  /* Primary Colors - Red theme */
  --primary-color: #dc2626;        /* Vibrant red (buttons, accents) */
  --primary-dark: #991b1b;         /* Deep red (sidebar, hover states) */
  
  /* Background & Surface */
  --bg-primary: #ffffff;           /* Pure white (cards, content) */
  --bg-secondary: #ffffff;         /* White (secondary bg) */
  --bg-light: #f9fafb;             /* Very light gray (page bg) */
  
  /* Text & Borders */
  --text-primary: #1f2937;         /* Dark gray (headings, body) */
  --text-secondary: #6b7280;       /* Medium gray (muted text) */
  --border: #e5e7eb;               /* Light gray (dividers) */
}
```

### Unde se folosesc?

```css
/* Buttons */
button.primary {
  background-color: var(--primary-color);  /* Red button */
  color: white;
}
button.primary:hover {
  background-color: var(--primary-dark);   /* Darker red on hover */
}

/* Sidebar */
.main-sidebar {
  background-color: var(--primary-dark);   /* Deep red sidebar */
  color: white;
}

/* Accent elements */
.badge {
  background-color: #fee2e2;        /* Light red background */
  color: var(--primary-color);      /* Red text */
}

/* Cards */
.card {
  background-color: var(--bg-primary);  /* White card */
  border: 1px solid var(--border);
}
```

### Cum modific culorile?

1. **Schimb variabila în `:root` din `src/index.css`:**

```css
:root {
  --primary-color: #ef4444;        /* Mai bright red */
  --primary-dark: #7f1d1d;         /* Darker red */
}
```

2. **Build-ul se actualizeaza automat:**

```bash
npm run build
# Toate componentele care folosesc var(--primary-color) vor arăta nouă culoare
```

### Recomandări pentru design minimal și elegant

**1. Contrast bun - Roșu (DC2626) pe Alb (FFFFFF)**
- Text alb pe roșu: 21:1 contrast ratio ✅
- Citibil pe dispozitivele mobile ✅

**2. Accent colors secundari (optional upgrades)**

Dacă vrei mai mult polish, poti adăuga culori secundare:

```css
:root {
  /* Existing */
  --primary-color: #dc2626;
  --primary-dark: #991b1b;
  
  /* NEW: Secondary accent (teal/blue) for diversity */
  --accent-color: #0891b2;         /* Cyan accent for positive states */
  
  /* Status colors */
  --success: #10b981;              /* Green for approved */
  --warning: #f59e0b;              /* Orange for pending */
  --danger: #ef4444;               /* Red for errors/deleted */
  --info: #3b82f6;                 /* Blue for informational */
}
```

**3. Usage example sa secondary accent:**

```tsx
<Badge variant="success">Aprobat</Badge>      // Green badge
<Badge variant="warning">În așteptare</Badge> // Orange badge
<Badge variant="danger">Respins</Badge>       // Red badge
<Badge variant="info">Info</Badge>            // Blue badge
```

**4. Typography pairings - Minimal & Elegant**

Pastrezi font-uri simple:

```css
/* Headings: Bold, clean lines */
h1, h2, h3 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 700;
  line-height: 1.2;
}

/* Body: Readable, with good spacing */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 0.9375rem;   /* 15px */
  line-height: 1.6;
  color: var(--text-primary);
}
```

**5. Spacing pairings - Minimal feels spacious**

```css
/* Use consistent spacing scale */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */

/* Apply to components */
.card {
  padding: var(--spacing-lg);      /* 24px all sides */
  gap: var(--spacing-md);          /* 16px between elements */
}
```

**6. Visual hierarchy - Red + White only**

```
↑ Most important: Primary red (#dc2626) on white
  - Main CTAs (Create button, actions)
  - Highlights, alerts
  - Active states

Middle: Dark gray text (#1f2937) on white
  - Headings, labels
  - Main content

Less important: Medium gray text (#6b7280)
  - Secondary text, descriptions
  - Muted labels

↓ Least important: Light gray borders (#e5e7eb)
  - Dividers, subtle borders
  - Inactive states
```

### Visual example - Sidebar (Deep Red) + Card (White) + Red Button

```
┌─────────────────────────────┐
│  [RED SIDEBAR]  [WHITE PAGE]│
│  ░░░░░░░░░░░  ┌──────────┐ │
│  ░ Dashboard░  │ Welcome! │ │
│  ░ Expenses ░  │          │ │
│  ░ Budget   ░  └──────────┘ │
│  ░           │ ┌──────────┐ │
│  ░ [RED BTN] │ │ Stats    │ │
│               └──────────┘ │
└─────────────────────────────┘

Sidebar: #991b1b (deep red)
Page BG: #f9fafb (off-white)
Cards: #ffffff (pure white)
Buttons: #dc2626 (bright red)
Text: #1f2937 (dark gray)
```

### Actualizări în build curent

✅ Sidebar background: Deep red (#991b1b)
✅ Card backgrounds: White (#ffffff)
✅ Button color: Primary red (#dc2626)
✅ Text colors: Gray palette
✅ Build size: 464KB JS / 132KB gzip (optimized)

---

## Unde sunt fișierele importante?

```
/workspaces/OptiPulse/
├── src/
│   ├── locales/
│   │   ├── en/translation.json     ← English translations (27 keys)
│   │   └── ro/translation.json     ← Romanian translations (27 keys)
│   ├── pages/
│   │   ├── Dashboard.tsx           ← UPDATED: Uses t() for activities & tasks
│   │   └── LoginPage.tsx           ← Authentication
│   ├── layout/
│   │   ├── Sidebar.tsx             ← UPDATED: Uses t() for nav labels
│   │   └── MainLayout.tsx          ← Main wrapper
│   ├── modules/
│   │   ├── finance/
│   │   │   └── ExpenseRequests.tsx ← UPDATED: Uses t() for subtitle
│   │   ├── hr/
│   │   │   ├── LeaveRequests.tsx
│   │   │   ├── LeavePlanning.tsx
│   │   │   ├── Overtime.tsx
│   │   │   └── TimeEntries.tsx
│   │   └── admin/
│   │       └── Users.tsx
│   ├── auth/
│   │   ├── AuthProvider.tsx        ← Loads permissions from Supabase
│   │   └── ProtectedRoute.tsx      ← UPDATED: Uses t() for access denied
│   ├── lib/
│   │   ├── rbac.ts                 ← Permission helper functions
│   │   └── utils.ts
│   ├── components/ui/
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   └── [other UI stubs]
│   ├── index.css                   ← Theme colors, layout helpers, component styles
│   └── main.tsx                    ← Entry point (i18n initialized)
├── README.md
├── GUIDES.md                       ← THIS FILE
├── AUDIT_i18n.txt                  ← Hardcoded strings audit
├── vite.config.ts
└── package.json                    ← Dependencies
```

---

## Next Steps - Ce poți face acum?

1. **Test o schimbare de limbă:**
   - Apasă pe selectorul de limbă (RO/EN) din MainLayout
   - Verifica dacă Dashboard acum afiseaza text in EN dacă selectezi English

2. **Adaug mai multe traduceri:**
   - Cauta alte hardcoded string-uri în componente
   - Adaug cheia în translation.json (RO + EN)
   - Inlocuiesc stringul cu `t('keyName')`

3. **Test RBAC:**
   - Mergi in Supabase → Insert user test data
   - Assign role + permissions
   - Login cu user-ul nou
   - Verifica dacă sidebar și route-uri sunt filtrate corect

4. **Incearca varia tema:**
   - Modifica `--primary-color` in `src/index.css`
   - Modifica `--primary-dark`
   - Ruleaza `npm run build` și verifica rezultatul

---

**Dacă ai întrebări sau vrei detalii suplimentare, verifica comentariile în fișierele sursă sau rulează `npm run dev` pentru a testa live!**
