## Address Manager

Simple Next.js 16 dashboard for importing Canadian addresses, assigning routes, and previewing what each driver should cover. The current build focuses on fast data entry and lightweight admin controls; Google Maps optimization will plug into these routes next.

### What works now
- **Clients** page: Paste thousands of addresses at once, normalize them, and clear everything with a single click when needed.
- **Admin** page: Manage team members (admin / developer / driver), link senior staff as reviewers, and build routes by ordering existing addresses.
- **Driver** page: Impersonate a user (`/driver?userId=...`) to see the routes they need to complete, including any they review for junior teammates.

### Coming soon
- Route optimization with Google Maps Routes API using the saved address list as input.
- Authentication + role-aware navigation so admins, developers, and drivers automatically land on the correct views.
- Mobile-friendly driver workflow with completion tracking and offline sync.

### Local setup
```bash
npm install
npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/202410291700_clients_only/migration.sql
npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/202410291730_roles_routes/migration.sql
npx prisma generate
npm run dev
```

Optionally seed a few example addresses:
```bash
npm run prisma:seed
```

Open http://localhost:3000 to use the UI. `npm run lint` and `npm run build` stay green after every change.
