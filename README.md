# Vista Companies API

TypeScript/Express API for managing companies and their services.

## Requirements

- Node.js 20+
- MySQL 8+

## Setup

```bash
npm install
copy .env.example .env
```

Set `DATABASE_URL` in `.env`, then create the database schema:

```bash
npx prisma migrate dev --name init
npm run dev
```

The API runs at `http://localhost:3000`. Swagger documentation is available at
`http://localhost:3000/docs`.

## Endpoints

- `POST /companies` - create a company with `name` and `registrationNumber`
- `GET /companies` - list companies including their services
- `POST /services` - create a service with `companyId`, `name`, `description`, and `price`
- `GET /services/:id` - retrieve a service and its company
- `GET /health` - health check

Run validation:

```bash
npm run build
npm test
```

## Run the frontend

In a second terminal:

```bash
cd ../front-end-test-vista
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
```

For an Android emulator, use `http://10.0.2.2:3000` as the API URL.
