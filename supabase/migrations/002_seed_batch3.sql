-- Seed batch 3: devops-infra (12) + communication-protocols (12) + marketing-growth (12)
-- 36 skills total

INSERT INTO skills (slug, title, tagline, description, category, difficulty, is_free, price_inr, pack_id, tags, steps, video_url, trending_score, is_featured, published) VALUES

-- ============================================================
-- DEVOPS / INFRA (12)
-- ============================================================
('docker-compose-generator',
 'Docker Compose Generator',
 'Production-ready docker-compose.yml for any stack in seconds',
 'Describe your application stack and get a complete docker-compose.yml with service definitions, health checks, volume mounts, network configuration, and environment variable management.',
 'devops-infra', 'intermediate', false, 1299, null,
 ARRAY['Docker','docker-compose','containers','devops','infrastructure'],
 '[
   {"step":1,"title":"Describe your stack","language":"typescript","code":"const compose = await runSkill(''docker-compose-gen'', {\n  services: [\"Next.js app\", \"PostgreSQL 16\", \"Redis 7\", \"Nginx reverse proxy\"],\n  environment: \"production\",\n  requiresSSL: true,\n  portMapping: { nextjs: 3000, postgres: 5432, redis: 6379 }\n})"},
   {"step":2,"title":"Generated docker-compose.yml","language":"yaml","code":"version: ''3.9''\nservices:\n  app:\n    build: .\n    restart: always\n    environment:\n      - NODE_ENV=production\n      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/app\n      - REDIS_URL=redis://redis:6379\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_started\n    networks: [internal]\n\n  db:\n    image: postgres:16-alpine\n    restart: always\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    environment:\n      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}\n      - POSTGRES_DB=app\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 10s\n      retries: 5\n    networks: [internal]\n\n  redis:\n    image: redis:7-alpine\n    restart: always\n    volumes:\n      - redisdata:/data\n    networks: [internal]\n\n  nginx:\n    image: nginx:alpine\n    ports: [\"80:80\", \"443:443\"]\n    volumes:\n      - ./nginx.conf:/etc/nginx/nginx.conf\n      - ./certs:/etc/letsencrypt\n    depends_on: [app]\n    networks: [internal]\n\nvolumes:\n  pgdata:\n  redisdata:\n\nnetworks:\n  internal:"}
 ]'::jsonb,
 null, 880, false, true),

('github-actions-ci',
 'GitHub Actions CI/CD Pipeline',
 'Complete CI/CD workflow: test, build, deploy to Vercel/Railway',
 'Generate a GitHub Actions workflow for your project: lint, type-check, test, build, and deploy. Supports Vercel, Railway, and Docker Registry deployments with environment-based secrets.',
 'devops-infra', 'intermediate', false, 1299, 'iot-developer-pack',
 ARRAY['GitHub-Actions','CI/CD','DevOps','Vercel','Railway'],
 '[
   {"step":1,"title":"Generate workflow","language":"typescript","code":"const workflow = await runSkill(''github-actions-ci'', {\n  projectType: \"Next.js\",\n  testRunner: \"jest\",\n  deployTarget: \"vercel\",\n  branches: { ci: \"feature/*\", deploy: \"main\" },\n  nodeVersion: 20\n})"},
   {"step":2,"title":".github/workflows/ci.yml","language":"yaml","code":"name: CI/CD\n\non:\n  push:\n    branches: [main, ''feature/**'']\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run type-check\n      - run: npm test -- --ci\n\n  deploy:\n    needs: test\n    if: github.ref == ''refs/heads/main''\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm run build\n      - uses: amondnet/vercel-action@v25\n        with:\n          vercel-token: ${{ secrets.VERCEL_TOKEN }}\n          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}\n          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}\n          vercel-args: ''--prod''"}
 ]'::jsonb,
 null, 910, true, true),

('terraform-aws-scaffold',
 'Terraform AWS Infrastructure Scaffold',
 'VPC, RDS, ECS, and ALB — production AWS infra in one apply',
 'Generate a complete Terraform configuration for a production-ready AWS infrastructure: VPC with public/private subnets, RDS PostgreSQL, ECS Fargate cluster, Application Load Balancer, and IAM roles.',
 'devops-infra', 'advanced', false, 2999, null,
 ARRAY['Terraform','AWS','IaC','ECS','VPC','RDS'],
 '[
   {"step":1,"title":"Define infrastructure","language":"typescript","code":"const tf = await runSkill(''terraform-aws'', {\n  appName: \"invoicebot\",\n  region: \"ap-south-1\",\n  services: [\"ECS Fargate\", \"RDS PostgreSQL\", \"ElastiCache Redis\", \"ALB\"],\n  environment: \"production\",\n  dbInstanceClass: \"db.t3.micro\"\n})"},
   {"step":2,"title":"main.tf","language":"hcl","code":"terraform {\n  required_providers {\n    aws = { source = \"hashicorp/aws\", version = \"~> 5.0\" }\n  }\n  backend \"s3\" {\n    bucket = \"invoicebot-tfstate\"\n    key    = \"prod/terraform.tfstate\"\n    region = \"ap-south-1\"\n  }\n}\n\nmodule \"vpc\" {\n  source  = \"terraform-aws-modules/vpc/aws\"\n  version = \"5.0.0\"\n  name    = \"invoicebot-prod\"\n  cidr    = \"10.0.0.0/16\"\n  azs             = [\"ap-south-1a\", \"ap-south-1b\"]\n  private_subnets = [\"10.0.1.0/24\", \"10.0.2.0/24\"]\n  public_subnets  = [\"10.0.101.0/24\", \"10.0.102.0/24\"]\n  enable_nat_gateway = true\n}\n\nmodule \"ecs\" {\n  source  = \"terraform-aws-modules/ecs/aws\"\n  cluster_name = \"invoicebot-prod\"\n}"}
 ]'::jsonb,
 null, 850, false, true),

('kubernetes-deployment',
 'Kubernetes Deployment Manifests',
 'k8s Deployment, Service, Ingress, and HPA for your app',
 'Generate production Kubernetes manifests: Deployment with rolling update strategy, Service, Ingress with TLS, HorizontalPodAutoscaler, and ConfigMap. Includes resource requests/limits and liveness probes.',
 'devops-infra', 'advanced', false, 1999, null,
 ARRAY['Kubernetes','k8s','deployment','Ingress','HPA','containers'],
 '[
   {"step":1,"title":"Generate k8s manifests","language":"typescript","code":"const k8s = await runSkill(''k8s-manifests'', {\n  appName: \"invoicebot\",\n  image: \"ghcr.io/addonweb/invoicebot:latest\",\n  replicas: { min: 2, max: 10 },\n  port: 3000,\n  domain: \"app.invoicebot.io\",\n  resources: { cpu: \"250m\", memory: \"512Mi\" }\n})"},
   {"step":2,"title":"deployment.yaml","language":"yaml","code":"apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: invoicebot\n  namespace: production\nspec:\n  replicas: 2\n  selector:\n    matchLabels: { app: invoicebot }\n  strategy:\n    type: RollingUpdate\n    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }\n  template:\n    metadata:\n      labels: { app: invoicebot }\n    spec:\n      containers:\n        - name: invoicebot\n          image: ghcr.io/addonweb/invoicebot:latest\n          ports: [{ containerPort: 3000 }]\n          resources:\n            requests: { cpu: 250m, memory: 512Mi }\n            limits: { cpu: 500m, memory: 1Gi }\n          livenessProbe:\n            httpGet: { path: /api/health, port: 3000 }\n            initialDelaySeconds: 15\n            periodSeconds: 10"}
 ]'::jsonb,
 null, 820, false, true),

('nginx-config-generator',
 'Nginx Config Generator',
 'Reverse proxy, rate limiting, SSL termination, and caching config',
 'Generate a production Nginx configuration for your application: reverse proxy to Node.js/Next.js, SSL termination with Let''s Encrypt, gzip compression, rate limiting, and static file caching.',
 'devops-infra', 'intermediate', false, 799, null,
 ARRAY['Nginx','reverse-proxy','SSL','rate-limiting','DevOps'],
 '[
   {"step":1,"title":"Generate nginx.conf","language":"typescript","code":"const nginx = await runSkill(''nginx-config'', {\n  domain: \"app.invoicebot.io\",\n  upstreamPort: 3000,\n  ssl: true,\n  rateLimit: { zone: \"api\", rate: \"10r/s\", burst: 20 },\n  staticPaths: [\"/static\", \"/_next\"],\n  gzip: true\n})"},
   {"step":2,"title":"nginx.conf","language":"nginx","code":"upstream app {\n  server 127.0.0.1:3000;\n  keepalive 64;\n}\n\nlimit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\n\nserver {\n  listen 80;\n  server_name app.invoicebot.io;\n  return 301 https://$server_name$request_uri;\n}\n\nserver {\n  listen 443 ssl http2;\n  server_name app.invoicebot.io;\n\n  ssl_certificate /etc/letsencrypt/live/app.invoicebot.io/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/app.invoicebot.io/privkey.pem;\n\n  gzip on;\n  gzip_types text/plain application/json application/javascript text/css;\n\n  location /_next/static/ {\n    expires 1y;\n    add_header Cache-Control \"public, immutable\";\n    proxy_pass http://app;\n  }\n\n  location / {\n    limit_req zone=api burst=20 nodelay;\n    proxy_pass http://app;\n    proxy_http_version 1.1;\n    proxy_set_header Upgrade $http_upgrade;\n    proxy_set_header Connection ''upgrade'';\n    proxy_set_header Host $host;\n  }\n}"}
 ]'::jsonb,
 null, 800, false, true),

('env-secrets-manager',
 'Environment Secrets Manager',
 'Audit, rotate, and document all your .env secrets safely',
 'Audit your environment variables for security issues: exposed secrets, missing values, deprecated patterns. Generate a .env.example template and a secrets rotation checklist for each provider.',
 'devops-infra', 'beginner', true, 0, null,
 ARRAY['secrets','environment-variables','security','DevOps','.env'],
 '[
   {"step":1,"title":"Audit your .env","language":"typescript","code":"const audit = await runSkill(''env-auditor'', {\n  envFile: [\n    \"DATABASE_URL=postgres://user:password@localhost/db\",\n    \"NEXT_PUBLIC_API_KEY=sk_live_abc123\",\n    \"SECRET_KEY=dev\",\n    \"CLERK_SECRET_KEY=sk_test_...\"\n  ],\n  framework: \"Next.js\"\n})"},
   {"step":2,"title":"Security report","language":"json","code":"{\n  \"issues\": [\n    { \"var\": \"NEXT_PUBLIC_API_KEY\", \"severity\": \"CRITICAL\", \"issue\": \"NEXT_PUBLIC_ prefix exposes this to the browser\", \"fix\": \"Remove NEXT_PUBLIC_ prefix — keep server-side only\" },\n    { \"var\": \"SECRET_KEY\", \"severity\": \"HIGH\", \"issue\": \"Weak value ''dev'' — guessable\", \"fix\": \"Generate with: openssl rand -hex 32\" },\n    { \"var\": \"DATABASE_URL\", \"severity\": \"MEDIUM\", \"issue\": \"Contains plaintext password in URL\", \"fix\": \"Use connection pooler URL or separate host/user/pass vars\" }\n  ],\n  \"envExample\": \"DATABASE_URL=\\n SECRET_KEY=\\n CLERK_SECRET_KEY=\\n\"\n}"}
 ]'::jsonb,
 null, 870, false, true),

('vercel-deployment-config',
 'Vercel Deployment Config',
 'vercel.json + environment setup for any Next.js project',
 'Generate a complete Vercel deployment configuration: vercel.json with build settings, environment variable checklist for each environment (preview/production), and edge function routing rules.',
 'devops-infra', 'beginner', true, 0, null,
 ARRAY['Vercel','deployment','Next.js','edge','config'],
 '[
   {"step":1,"title":"Generate Vercel config","language":"typescript","code":"const config = await runSkill(''vercel-config'', {\n  framework: \"Next.js 15\",\n  hasEdgeFunctions: false,\n  buildCommand: \"npm run build\",\n  installCommand: \"npm install --legacy-peer-deps\",\n  rootDirectory: \"products/01-claude-reseller/app\"\n})"},
   {"step":2,"title":"vercel.json","language":"json","code":"{\n  \"buildCommand\": \"npm run build\",\n  \"outputDirectory\": \".next\",\n  \"framework\": \"nextjs\",\n  \"installCommand\": \"npm install --legacy-peer-deps\"\n}\n\n// Environment variables to add in Vercel dashboard:\n// Production:\n//   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\n//   CLERK_SECRET_KEY\n//   NEXT_PUBLIC_SUPABASE_URL\n//   NEXT_PUBLIC_SUPABASE_ANON_KEY\n//   SUPABASE_SERVICE_ROLE_KEY\n//   RAZORPAY_KEY_ID  RAZORPAY_KEY_SECRET  RAZORPAY_WEBHOOK_SECRET\n//   ADMIN_API_KEY\n//   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app"}
 ]'::jsonb,
 null, 860, false, true),

('monitoring-setup',
 'Production Monitoring Setup',
 'Sentry + Axiom + health endpoint in 15 minutes',
 'Set up production monitoring: Sentry for error tracking, Axiom for log aggregation, and a /api/health endpoint. Includes alert rules, performance monitoring, and structured logging patterns.',
 'devops-infra', 'intermediate', false, 1299, null,
 ARRAY['Sentry','monitoring','observability','health-check','logging'],
 '[
   {"step":1,"title":"Install monitoring stack","language":"bash","code":"npm install @sentry/nextjs @axiomhq/nextjs\nnpx @sentry/wizard@latest -i nextjs\n# Add to .env:\n# SENTRY_DSN=https://...@sentry.io/...\n# NEXT_PUBLIC_AXIOM_TOKEN=xaat-...\n# NEXT_PUBLIC_AXIOM_DATASET=production"},
   {"step":2,"title":"Health endpoint","language":"typescript","code":"// app/api/health/route.ts\nimport { createClient } from ''@supabase/supabase-js''\n\nexport async function GET() {\n  const checks = await Promise.allSettled([\n    // DB check\n    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)\n      .from(''skills'').select(''count'').limit(1)\n  ])\n  \n  const healthy = checks.every(c => c.status === ''fulfilled'')\n  return Response.json(\n    { status: healthy ? ''ok'' : ''degraded'', timestamp: new Date().toISOString() },\n    { status: healthy ? 200 : 503 }\n  )\n}"},
   {"step":3,"title":"Structured logging","language":"typescript","code":"// lib/logger.ts\nexport const logger = {\n  info: (msg: string, meta?: Record<string, unknown>) =>\n    console.log(JSON.stringify({ level: ''info'', msg, ...meta, ts: Date.now() })),\n  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) =>\n    console.error(JSON.stringify({ level: ''error'', msg, error: String(err), ...meta, ts: Date.now() }))\n}"}
 ]'::jsonb,
 null, 830, false, true),

('database-backup-script',
 'Database Backup & Restore Scripts',
 'Automated pg_dump with S3 upload and point-in-time restore',
 'Generate database backup scripts for PostgreSQL: scheduled pg_dump to S3 with compression and encryption, retention policy, and restore procedure. Works with Supabase, Neon, and self-hosted Postgres.',
 'devops-infra', 'intermediate', false, 999, null,
 ARRAY['PostgreSQL','backup','S3','pg_dump','disaster-recovery'],
 '[
   {"step":1,"title":"Backup script","language":"bash","code":"#!/bin/bash\n# backup-db.sh — run via cron: 0 2 * * * /scripts/backup-db.sh\n\nset -euo pipefail\n\nDB_URL=\"${DATABASE_URL}\"\nS3_BUCKET=\"invoicebot-backups\"\nDATE=$(date +%Y-%m-%d-%H%M)\nFILE=\"backup-${DATE}.sql.gz\"\n\necho \"[backup] Starting backup ${FILE}\"\n\n# Dump + compress\npg_dump \"${DB_URL}\" | gzip > \"/tmp/${FILE}\"\n\n# Upload to S3\naws s3 cp \"/tmp/${FILE}\" \"s3://${S3_BUCKET}/daily/${FILE}\" \\\n  --server-side-encryption AES256\n\n# Cleanup local\nrm \"/tmp/${FILE}\"\n\n# Delete backups older than 30 days\naws s3 ls \"s3://${S3_BUCKET}/daily/\" | \\\n  awk ''{print $4}'' | \\\n  while read f; do\n    age=$(( ($(date +%s) - $(date -d \"${f:7:10}\" +%s)) / 86400 ))\n    [ $age -gt 30 ] && aws s3 rm \"s3://${S3_BUCKET}/daily/$f\"\n  done\n\necho \"[backup] Done\""}
 ]'::jsonb,
 null, 800, false, true),

('fly-io-deployment',
 'Fly.io Deployment Config',
 'fly.toml + Dockerfile for Node.js/Next.js on Fly.io',
 'Generate a complete Fly.io deployment configuration: fly.toml with regions, scaling, health checks, and a multi-stage Dockerfile optimized for Node.js/Next.js production builds.',
 'devops-infra', 'intermediate', false, 799, null,
 ARRAY['Fly.io','deployment','Docker','Node.js','edge'],
 '[
   {"step":1,"title":"Install Fly CLI and generate config","language":"bash","code":"curl -L https://fly.io/install.sh | sh\nfly auth login\nfly launch --no-deploy  # generates fly.toml"},
   {"step":2,"title":"fly.toml","language":"toml","code":"app = ''invoicebot''\nprimary_region = ''bom''  # Mumbai\n\n[build]\n  dockerfile = ''Dockerfile''\n\n[http_service]\n  internal_port = 3000\n  force_https = true\n  auto_stop_machines = true\n  auto_start_machines = true\n  min_machines_running = 1\n\n[[vm]]\n  cpu_kind = ''shared''\n  cpus = 1\n  memory_mb = 512\n\n[checks]\n  [checks.health]\n    grace_period = ''30s''\n    interval = ''15s''\n    method = ''get''\n    path = ''/api/health''\n    port = 3000\n    timeout = ''10s''"},
   {"step":3,"title":"Multi-stage Dockerfile","language":"dockerfile","code":"FROM node:20-alpine AS base\n\nFROM base AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --legacy-peer-deps\n\nFROM base AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\n\nFROM base AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app/.next/standalone ./\nCOPY --from=builder /app/.next/static ./.next/static\nCOPY --from=builder /app/public ./public\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]"}
 ]'::jsonb,
 null, 810, false, true),

('redis-cache-patterns',
 'Redis Caching Patterns',
 'Cache-aside, write-through, and TTL patterns for Node.js',
 'Implement production Redis caching patterns: cache-aside for API responses, write-through for user data, cache invalidation strategies, and a typed Redis client wrapper for TypeScript.',
 'devops-infra', 'intermediate', false, 1299, null,
 ARRAY['Redis','caching','Node.js','performance','TypeScript'],
 '[
   {"step":1,"title":"Install Redis client","language":"bash","code":"npm install ioredis\n# Add to .env: REDIS_URL=redis://localhost:6379"},
   {"step":2,"title":"Typed Redis wrapper","language":"typescript","code":"// lib/cache.ts\nimport Redis from ''ioredis''\n\nconst redis = new Redis(process.env.REDIS_URL!)\n\nexport async function getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {\n  const cached = await redis.get(key)\n  if (cached) return JSON.parse(cached) as T\n  \n  const fresh = await fetcher()\n  await redis.setex(key, ttlSeconds, JSON.stringify(fresh))\n  return fresh\n}\n\nexport async function invalidate(pattern: string) {\n  const keys = await redis.keys(pattern)\n  if (keys.length) await redis.del(...keys)\n}\n\n// Usage:\nconst skill = await getOrSet(\n  `skill:${slug}`,\n  3600, // 1 hour TTL\n  () => supabase.from(''skills'').select(''*'').eq(''slug'', slug).single().then(r => r.data)\n)"}
 ]'::jsonb,
 null, 840, false, true),

('ssl-certificate-setup',
 'SSL Certificate Setup with Let''s Encrypt',
 'Auto-renewing SSL for Nginx with Certbot in 5 commands',
 'Set up free SSL certificates with Let''s Encrypt and Certbot. Includes automated renewal cron job, Nginx configuration update, and a renewal test procedure.',
 'devops-infra', 'beginner', true, 0, null,
 ARRAY['SSL','TLS','Let''s-Encrypt','Certbot','Nginx','HTTPS'],
 '[
   {"step":1,"title":"Install Certbot","language":"bash","code":"# Ubuntu/Debian\nsudo apt install certbot python3-certbot-nginx -y\n\n# Get certificate\nsudo certbot --nginx -d yourdomain.com -d www.yourdomain.com \\\n  --non-interactive --agree-tos --email admin@yourdomain.com\n\n# Test auto-renewal\nsudo certbot renew --dry-run\n\n# Renewal cron (auto-added by Certbot, verify it exists)\nsudo crontab -l | grep certbot"},
   {"step":2,"title":"Verify SSL","language":"bash","code":"# Check certificate details\nopenssl s_client -connect yourdomain.com:443 -showcerts 2>/dev/null | \\\n  openssl x509 -noout -dates\n\n# Expected output:\n# notBefore=Apr 28 00:00:00 2026 GMT\n# notAfter=Jul 27 23:59:59 2026 GMT\n\n# Check SSL grade (should be A)\necho | openssl s_client -connect yourdomain.com:443 2>/dev/null | \\\n  openssl x509 -noout -text | grep -E ''Subject:|DNS:''"}
 ]'::jsonb,
 null, 790, false, true),

-- ============================================================
-- COMMUNICATION PROTOCOLS (12)
-- ============================================================
('mqtt-iot-setup',
 'MQTT IoT Setup with Mosquitto',
 'Broker config, topic design, and Node.js client for IoT fleets',
 'Set up an MQTT broker with Mosquitto: broker configuration, TLS setup, ACL rules for device authentication, and a typed Node.js client. Includes topic hierarchy design for IoT fleets.',
 'communication-protocols', 'intermediate', false, 1999, 'iot-developer-pack',
 ARRAY['MQTT','IoT','Mosquitto','Node.js','broker','embedded'],
 '[
   {"step":1,"title":"Mosquitto config","language":"conf","code":"# /etc/mosquitto/mosquitto.conf\nlistener 1883\nlistener 8883\ncafile /etc/mosquitto/certs/ca.crt\ncertfile /etc/mosquitto/certs/server.crt\nkeyfile /etc/mosquitto/certs/server.key\nrequire_certificate true\n\nallow_anonymous false\nacl_file /etc/mosquitto/acl\npassword_file /etc/mosquitto/passwd\n\n# ACL file: /etc/mosquitto/acl\n# user device_esp32_001\n# topic readwrite devices/esp32_001/#\n# topic read commands/esp32_001/#"},
   {"step":2,"title":"Node.js typed client","language":"typescript","code":"import mqtt from ''mqtt''\nimport fs from ''fs''\n\nconst TOPICS = {\n  telemetry: (deviceId: string) => `devices/${deviceId}/telemetry`,\n  commands:  (deviceId: string) => `commands/${deviceId}/set`,\n  status:    (deviceId: string) => `devices/${deviceId}/status`\n} as const\n\nconst client = mqtt.connect(''mqtts://broker.example.com:8883'', {\n  key:  fs.readFileSync(''./certs/client.key''),\n  cert: fs.readFileSync(''./certs/client.crt''),\n  ca:   fs.readFileSync(''./certs/ca.crt'')\n})\n\nclient.on(''connect'', () => {\n  client.subscribe(TOPICS.telemetry(''esp32_001''), { qos: 1 })\n})\n\nclient.on(''message'', (topic, payload) => {\n  const data: { temp: number; humidity: number } = JSON.parse(payload.toString())\n  console.log(`[${topic}] temp=${data.temp}°C`)\n})"}
 ]'::jsonb,
 null, 940, true, true),

('websocket-server',
 'WebSocket Server with Authentication',
 'Production WebSocket server in Node.js with JWT auth and rooms',
 'Build a production WebSocket server: JWT authentication on connection, rooms for multi-tenant isolation, heartbeat/reconnect logic, and a typed client hook for React.',
 'communication-protocols', 'intermediate', false, 1499, null,
 ARRAY['WebSocket','Node.js','JWT','real-time','rooms'],
 '[
   {"step":1,"title":"WebSocket server (Fastify)","language":"typescript","code":"import fastify from ''fastify''\nimport websocket from ''@fastify/websocket''\nimport jwt from ''jsonwebtoken''\n\nconst app = fastify()\nawait app.register(websocket)\n\nconst rooms = new Map<string, Set<WebSocket>>()\n\napp.get(''/ws'', { websocket: true }, (socket, req) => {\n  const token = new URL(req.url, ''ws://x'').searchParams.get(''token'')\n  \n  let userId: string\n  try {\n    const payload = jwt.verify(token!, process.env.JWT_SECRET!) as { sub: string; orgId: string }\n    userId = payload.sub\n    \n    // Join org room\n    if (!rooms.has(payload.orgId)) rooms.set(payload.orgId, new Set())\n    rooms.get(payload.orgId)!.add(socket)\n    \n    socket.on(''close'', () => rooms.get(payload.orgId)?.delete(socket))\n  } catch {\n    socket.close(4001, ''Unauthorized'')\n    return\n  }\n  \n  socket.on(''message'', (msg) => {\n    // Broadcast to room\n    rooms.get(userId)?.forEach(s => s !== socket && s.send(msg.toString()))\n  })\n})"},
   {"step":2,"title":"React useWebSocket hook","language":"typescript","code":"export function useWebSocket(orgId: string, token: string) {\n  const [messages, setMessages] = useState<unknown[]>([])\n  const ws = useRef<WebSocket | null>(null)\n\n  useEffect(() => {\n    const connect = () => {\n      ws.current = new WebSocket(`${WS_URL}/ws?token=${token}`)\n      ws.current.onmessage = e => setMessages(prev => [...prev, JSON.parse(e.data)])\n      ws.current.onclose = () => setTimeout(connect, 3000) // auto-reconnect\n    }\n    connect()\n    return () => ws.current?.close()\n  }, [token])\n\n  const send = (data: unknown) => ws.current?.send(JSON.stringify(data))\n  return { messages, send }\n}"}
 ]'::jsonb,
 null, 870, false, true),

('grpc-service-scaffold',
 'gRPC Service Scaffold',
 '.proto definition + Node.js server + TypeScript client in minutes',
 'Generate a gRPC service: .proto file, Node.js server implementation with @grpc/grpc-js, TypeScript client, and health check service. Includes TLS setup for production.',
 'communication-protocols', 'advanced', false, 1999, null,
 ARRAY['gRPC','protobuf','Node.js','microservices','TypeScript'],
 '[
   {"step":1,"title":"Define your service","language":"typescript","code":"const grpc = await runSkill(''grpc-scaffold'', {\n  serviceName: \"InvoiceService\",\n  methods: [\n    { name: \"CreateInvoice\", input: \"CreateInvoiceRequest\", output: \"Invoice\" },\n    { name: \"GetInvoice\", input: \"GetInvoiceRequest\", output: \"Invoice\" },\n    { name: \"ListInvoices\", input: \"ListInvoicesRequest\", output: \"ListInvoicesResponse\", streaming: \"server\" }\n  ]\n})"},
   {"step":2,"title":"invoice.proto","language":"protobuf","code":"syntax = \"proto3\";\npackage invoice;\n\nservice InvoiceService {\n  rpc CreateInvoice (CreateInvoiceRequest) returns (Invoice);\n  rpc GetInvoice (GetInvoiceRequest) returns (Invoice);\n  rpc ListInvoices (ListInvoicesRequest) returns (stream Invoice);\n}\n\nmessage Invoice {\n  string id = 1;\n  string org_id = 2;\n  string invoice_number = 3;\n  double total_amount = 4;\n  string status = 5;\n  int64 created_at = 6;\n}\n\nmessage CreateInvoiceRequest {\n  string org_id = 1;\n  repeated LineItem line_items = 2;\n}\n\nmessage LineItem {\n  string description = 1;\n  double quantity = 2;\n  double rate = 3;\n  double gst_rate = 4;\n}"}
 ]'::jsonb,
 null, 810, false, true),

('sse-server-sent-events',
 'Server-Sent Events Stream',
 'Real-time server push in Next.js — no WebSocket needed',
 'Implement Server-Sent Events (SSE) in Next.js for real-time server-to-client updates: streaming responses, event types, reconnection handling, and a useSSE React hook.',
 'communication-protocols', 'intermediate', false, 799, null,
 ARRAY['SSE','real-time','Next.js','streaming','events'],
 '[
   {"step":1,"title":"SSE route handler","language":"typescript","code":"// app/api/events/route.ts\nexport async function GET(req: Request) {\n  const { searchParams } = new URL(req.url)\n  const orgId = searchParams.get(''orgId'') ?? ''''\n\n  const stream = new ReadableStream({\n    start(controller) {\n      const send = (event: string, data: unknown) => {\n        controller.enqueue(`event: ${event}\\ndata: ${JSON.stringify(data)}\\n\\n`)\n      }\n\n      // Send initial state\n      send(''connected'', { orgId, ts: Date.now() })\n\n      // Subscribe to DB changes (Supabase Realtime)\n      const channel = supabase\n        .channel(`org:${orgId}`)\n        .on(''postgres_changes'', { event: ''INSERT'', schema: ''public'', table: ''invoices'' }, (payload) => {\n          send(''invoice.created'', payload.new)\n        })\n        .subscribe()\n\n      req.signal.addEventListener(''abort'', () => {\n        void supabase.removeChannel(channel)\n        controller.close()\n      })\n    }\n  })\n\n  return new Response(stream, {\n    headers: {\n      ''Content-Type'': ''text/event-stream'',\n      ''Cache-Control'': ''no-cache'',\n      ''Connection'': ''keep-alive''\n    }\n  })\n}"},
   {"step":2,"title":"useSSE hook","language":"typescript","code":"export function useSSE<T>(url: string) {\n  const [events, setEvents] = useState<T[]>([])\n\n  useEffect(() => {\n    const es = new EventSource(url)\n    es.onmessage = e => setEvents(prev => [...prev, JSON.parse(e.data)])\n    es.onerror = () => es.close()\n    return () => es.close()\n  }, [url])\n\n  return events\n}"}
 ]'::jsonb,
 null, 830, false, true),

('coap-iot-protocol',
 'CoAP Protocol for IoT Devices',
 'Constrained Application Protocol implementation for ESP32',
 'Implement CoAP (Constrained Application Protocol) for low-power IoT devices: Node.js CoAP server, ESP32 C++ client, resource observation, and gateway bridge to HTTP REST.',
 'communication-protocols', 'advanced', false, 2499, 'iot-developer-pack',
 ARRAY['CoAP','IoT','ESP32','embedded','constrained-devices'],
 '[
   {"step":1,"title":"Node.js CoAP server","language":"typescript","code":"import coap from ''coap-packet''\nimport dgram from ''dgram''\n\nconst server = dgram.createSocket(''udp4'')\n\nserver.on(''message'', (msg, rinfo) => {\n  const packet = coap.parse(msg)\n  const path = packet.options?.find(o => o.name === ''Uri-Path'')?.value?.toString()\n\n  if (path === ''/telemetry'' && packet.code === ''0.02'') { // POST\n    const payload: { temp: number; humidity: number } = JSON.parse(packet.payload?.toString() ?? ''{}'')\n    console.log(`[CoAP] ${rinfo.address} → temp=${payload.temp}°C`)\n\n    // Respond 2.04 Changed\n    const response = coap.generate({\n      code: ''2.04'',\n      messageId: packet.messageId,\n      token: packet.token,\n      ack: true\n    })\n    server.send(response, rinfo.port, rinfo.address)\n  }\n})\n\nserver.bind(5683, () => console.log(''CoAP server listening on :5683''))"},
   {"step":2,"title":"ESP32 C++ CoAP client","language":"cpp","code":"#include <Arduino.h>\n#include <WiFiUdp.h>\n\n// CoAP POST /telemetry every 60 seconds\nvoid sendTelemetry(float temp, float humidity) {\n  // CoAP packet format: Ver=1, T=0(CON), Code=0.02(POST)\n  uint8_t packet[] = {\n    0x40, 0x02, 0x00, 0x01, // Header: CON POST MID=1\n    0xB9, 0x74, 0x65, 0x6C, 0x65, 0x6D, 0x65, 0x74, 0x72, 0x79, // Uri-Path: telemetry\n    0xFF // Payload marker\n  };\n  \n  char payload[64];\n  snprintf(payload, sizeof(payload), \"{\\\"temp\\\":%.1f,\\\"h\\\":%.1f}\", temp, humidity);\n  \n  udp.beginPacket(COAP_SERVER, 5683);\n  udp.write(packet, sizeof(packet));\n  udp.write((uint8_t*)payload, strlen(payload));\n  udp.endPacket();\n}"}
 ]'::jsonb,
 null, 850, false, true),

('modbus-rtu-tcp',
 'Modbus RTU/TCP for Industrial IoT',
 'Read sensor registers from PLCs and industrial equipment',
 'Implement Modbus RTU (serial) and Modbus TCP communication in Node.js for industrial IoT: read holding registers, coils, and input registers from PLCs, VFDs, and energy meters.',
 'communication-protocols', 'advanced', false, 2999, 'iot-developer-pack',
 ARRAY['Modbus','industrial','PLC','IoT','serial','TCP'],
 '[
   {"step":1,"title":"Install modbus library","language":"bash","code":"npm install jsmodbus serialport\n# For RTU (serial): npm install @serialport/parser-byte-length\n# For TCP: standard Node.js net module"},
   {"step":2,"title":"Modbus TCP client","language":"typescript","code":"import jsmodbus from ''jsmodbus''\nimport net from ''net''\n\nconst socket = new net.Socket()\nconst client = new jsmodbus.client.TCP(socket)\n\nsocket.connect(502, ''192.168.1.10'', async () => {\n  // Read 10 holding registers starting at address 0\n  // (energy meter: V, A, W, Hz, PF, kWh etc.)\n  const response = await client.readHoldingRegisters(0, 10)\n  \n  const registers = response.response.body.valuesAsArray\n  const voltage   = registers[0] / 10  // 0.1V resolution\n  const current   = registers[1] / 100 // 0.01A resolution\n  const power     = registers[2]       // Watts\n  \n  console.log(`Voltage: ${voltage}V, Current: ${current}A, Power: ${power}W`)\n  socket.destroy()\n})"},
   {"step":3,"title":"Polling loop with storage","language":"typescript","code":"async function pollEnergyMeter(deviceId: string, ip: string) {\n  setInterval(async () => {\n    const readings = await readModbusTCP(ip)\n    await supabase.from(''energy_readings'').insert({\n      device_id: deviceId,\n      voltage: readings.voltage,\n      current: readings.current,\n      power_w: readings.power,\n      recorded_at: new Date().toISOString()\n    })\n  }, 30_000) // Every 30 seconds\n}"}
 ]'::jsonb,
 null, 820, false, true),

('http-rest-api-design',
 'REST API Design Guide',
 'URL structure, versioning, status codes, and error format standards',
 'Generate a REST API design guide for your product: URL naming conventions, HTTP method usage, status code standards, error response format, pagination pattern, and versioning strategy.',
 'communication-protocols', 'beginner', true, 0, null,
 ARRAY['REST','API-design','HTTP','versioning','OpenAPI'],
 '[
   {"step":1,"title":"Get API design guide","language":"typescript","code":"const guide = await runSkill(''rest-api-design'', {\n  product: \"Invoice SaaS API\",\n  resources: [\"organizations\", \"invoices\", \"customers\", \"payments\"],\n  versioning: \"url\",\n  auth: \"Bearer JWT\"\n})"},
   {"step":2,"title":"URL conventions","language":"text","code":"# Resource URLs (plural nouns, no verbs)\nGET    /v1/invoices              # List (paginated)\nPOST   /v1/invoices              # Create\nGET    /v1/invoices/:id          # Get one\nPATCH  /v1/invoices/:id          # Partial update\nDELETE /v1/invoices/:id          # Soft delete\n\n# Nested resources (max 2 levels)\nGET    /v1/invoices/:id/line-items\nPOST   /v1/invoices/:id/send      # Action as sub-resource\n\n# Pagination\nGET    /v1/invoices?page=2&limit=20&sort=-created_at\n\n# Consistent error format:\n# { \"error\": { \"code\": \"INVOICE_NOT_FOUND\", \"message\": \"Invoice 123 not found\", \"status\": 404 } }"},
   {"step":3,"title":"Status codes","language":"json","code":"{\n  \"200\": \"GET/PATCH success\",\n  \"201\": \"POST (resource created) — include Location header\",\n  \"204\": \"DELETE success (no body)\",\n  \"400\": \"Validation error — include field-level errors\",\n  \"401\": \"Missing or invalid token\",\n  \"403\": \"Valid token, insufficient permissions\",\n  \"404\": \"Resource not found\",\n  \"409\": \"Conflict (duplicate invoice number)\",\n  \"422\": \"Unprocessable entity (business rule violation)\",\n  \"429\": \"Rate limit exceeded — include Retry-After header\",\n  \"500\": \"Internal server error — never expose stack trace\"\n}"}
 ]'::jsonb,
 null, 890, true, true),

('graphql-schema-generator',
 'GraphQL Schema Generator',
 'Type-safe SDL schema + resolvers from your data model',
 'Generate a GraphQL schema (SDL) from your data model description: type definitions, queries, mutations, subscriptions, and resolver stubs with DataLoader for N+1 prevention.',
 'communication-protocols', 'intermediate', false, 1499, null,
 ARRAY['GraphQL','SDL','Apollo','resolvers','TypeScript'],
 '[
   {"step":1,"title":"Generate schema","language":"typescript","code":"const schema = await runSkill(''graphql-schema'', {\n  entities: [\"Invoice\", \"Customer\", \"LineItem\", \"Organization\"],\n  relationships: [\n    \"Invoice belongs to Organization\",\n    \"Invoice has many LineItems\",\n    \"Invoice belongs to Customer\"\n  ],\n  includeSubscriptions: true\n})"},
   {"step":2,"title":"Generated SDL","language":"graphql","code":"type Invoice {\n  id: ID!\n  invoiceNumber: String!\n  organization: Organization!\n  customer: Customer!\n  lineItems: [LineItem!]!\n  totalAmount: Float!\n  status: InvoiceStatus!\n  createdAt: DateTime!\n}\n\nenum InvoiceStatus { DRAFT SENT PAID OVERDUE }\n\ntype Query {\n  invoice(id: ID!): Invoice\n  invoices(orgId: ID!, status: InvoiceStatus, page: Int, limit: Int): InvoiceConnection!\n}\n\ntype Mutation {\n  createInvoice(input: CreateInvoiceInput!): Invoice!\n  sendInvoice(id: ID!): Invoice!\n}\n\ntype Subscription {\n  invoiceUpdated(orgId: ID!): Invoice!\n}"}
 ]'::jsonb,
 null, 820, false, true),

('esp32-firmware-scaffold',
 'ESP32 Firmware Scaffold',
 'FreeRTOS tasks, MQTT, OTA update, and sensor polling boilerplate',
 'Generate ESP32 firmware boilerplate in C/C++: FreeRTOS task architecture, WiFi + MQTT connection management, OTA update via HTTPS, sensor reading with circular buffer, and low-power sleep modes.',
 'communication-protocols', 'advanced', false, 2999, 'iot-developer-pack',
 ARRAY['ESP32','firmware','FreeRTOS','MQTT','OTA','C++','embedded'],
 '[
   {"step":1,"title":"FreeRTOS task architecture","language":"cpp","code":"// main.cpp — ESP32 FreeRTOS multi-task pattern\n#include <Arduino.h>\n#include <freertos/FreeRTOS.h>\n#include <freertos/task.h>\n\n// Task handles\nTaskHandle_t sensorTask, mqttTask, otaTask;\n\nvoid TaskSensor(void* pvParameters) {\n  for (;;) {\n    float temp = readDHT22Temperature();\n    float humidity = readDHT22Humidity();\n    pushToBuffer({ temp, humidity, millis() });\n    vTaskDelay(pdMS_TO_TICKS(5000)); // 5s sample rate\n  }\n}\n\nvoid TaskMQTT(void* pvParameters) {\n  for (;;) {\n    if (mqttClient.connected()) {\n      auto sample = popFromBuffer();\n      char payload[128];\n      snprintf(payload, sizeof(payload),\n        \"{\\\"temp\\\":%.1f,\\\"humidity\\\":%.1f,\\\"ts\\\":%lu}\",\n        sample.temp, sample.humidity, sample.ts);\n      mqttClient.publish(TELEMETRY_TOPIC, payload);\n    }\n    vTaskDelay(pdMS_TO_TICKS(1000));\n  }\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  connectWiFi();\n  connectMQTT();\n  xTaskCreatePinnedToCore(TaskSensor, \"Sensor\", 4096, NULL, 1, &sensorTask, 0);\n  xTaskCreatePinnedToCore(TaskMQTT, \"MQTT\",  4096, NULL, 2, &mqttTask,  1);\n}"},
   {"step":2,"title":"OTA update handler","language":"cpp","code":"#include <HTTPUpdate.h>\n#include <WiFiClientSecure.h>\n\nvoid checkAndApplyOTA(const char* updateUrl) {\n  WiFiClientSecure client;\n  client.setCACert(AWS_CERT_CA); // Pin CA for security\n\n  t_httpUpdate_return ret = httpUpdate.update(client, updateUrl);\n  switch (ret) {\n    case HTTP_UPDATE_FAILED:\n      Serial.printf(\"OTA failed: %s\\n\", httpUpdate.getLastErrorString().c_str());\n      break;\n    case HTTP_UPDATE_OK:\n      // Device reboots automatically\n      break;\n  }\n}"}
 ]'::jsonb,
 null, 930, true, true),

('bluetooth-ble-setup',
 'Bluetooth BLE Peripheral Setup',
 'GATT server for ESP32 + Web Bluetooth API client',
 'Implement a BLE GATT server on ESP32 for wireless sensor data, and a Web Bluetooth API client in JavaScript to connect and read characteristics from a browser.',
 'communication-protocols', 'advanced', false, 2499, 'iot-developer-pack',
 ARRAY['BLE','Bluetooth','ESP32','GATT','Web-Bluetooth','IoT'],
 '[
   {"step":1,"title":"ESP32 BLE GATT server","language":"cpp","code":"#include <BLEDevice.h>\n#include <BLEServer.h>\n\n#define SERVICE_UUID        \"12345678-1234-1234-1234-123456789012\"\n#define TEMP_CHAR_UUID      \"12345678-1234-1234-1234-123456789013\"\n\nvoid setupBLE() {\n  BLEDevice::init(\"SensorNode-001\");\n  BLEServer* server = BLEDevice::createServer();\n  BLEService* service = server->createService(SERVICE_UUID);\n  \n  BLECharacteristic* tempChar = service->createCharacteristic(\n    TEMP_CHAR_UUID,\n    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY\n  );\n  \n  service->start();\n  BLEAdvertising* adv = BLEDevice::getAdvertising();\n  adv->addServiceUUID(SERVICE_UUID);\n  adv->start();\n}\n\nvoid loop() {\n  float temp = readTemperature();\n  char buf[8];\n  dtostrf(temp, 4, 1, buf);\n  tempChar->setValue(buf);\n  tempChar->notify(); // Push to connected clients\n  delay(2000);\n}"},
   {"step":2,"title":"Web Bluetooth client","language":"javascript","code":"async function connectToSensor() {\n  const device = await navigator.bluetooth.requestDevice({\n    filters: [{ services: [''12345678-1234-1234-1234-123456789012''] }]\n  })\n  \n  const server = await device.gatt.connect()\n  const service = await server.getPrimaryService(''12345678-1234-1234-1234-123456789012'')\n  const tempChar = await service.getCharacteristic(''12345678-1234-1234-1234-123456789013'')\n  \n  await tempChar.startNotifications()\n  tempChar.addEventListener(''characteristicvaluechanged'', (event) => {\n    const temp = new TextDecoder().decode(event.target.value)\n    document.getElementById(''temp'').textContent = `${temp}°C`\n  })\n}"}
 ]'::jsonb,
 null, 840, false, true),

('webhook-signature-validator',
 'Webhook Signature Validator',
 'HMAC-SHA256 validation for Razorpay, Stripe, GitHub, and Clerk',
 'Implement webhook signature validation for major providers: HMAC-SHA256 for Razorpay and Stripe, SHA-256 for GitHub, and Svix for Clerk. Includes timing-safe comparison to prevent timing attacks.',
 'communication-protocols', 'beginner', true, 0, null,
 ARRAY['webhook','HMAC','security','signature','Razorpay','GitHub'],
 '[
   {"step":1,"title":"Universal validator","language":"typescript","code":"import crypto from ''crypto''\n\n// Timing-safe comparison (prevents timing attacks)\nfunction safeCompare(a: string, b: string): boolean {\n  const bufA = Buffer.from(a)\n  const bufB = Buffer.from(b)\n  if (bufA.length !== bufB.length) return false\n  return crypto.timingSafeEqual(bufA, bufB)\n}\n\nexport function validateRazorpay(body: string, signature: string, secret: string): boolean {\n  const expected = crypto.createHmac(''sha256'', secret).update(body).digest(''hex'')\n  return safeCompare(signature, expected)\n}\n\nexport function validateStripe(body: string, signature: string, secret: string): boolean {\n  const ts = signature.split('','').find(p => p.startsWith(''t=''))?.slice(2) ?? ''''\n  const sig = signature.split('','').find(p => p.startsWith(''v1=''))?.slice(3) ?? ''''\n  const payload = `${ts}.${body}`\n  const expected = crypto.createHmac(''sha256'', secret).update(payload).digest(''hex'')\n  return safeCompare(sig, expected)\n}\n\nexport function validateGitHub(body: string, signature: string, secret: string): boolean {\n  const expected = ''sha256='' + crypto.createHmac(''sha256'', secret).update(body).digest(''hex'')\n  return safeCompare(signature, expected)\n}"}
 ]'::jsonb,
 null, 880, false, true),

-- ============================================================
-- MARKETING / GROWTH (12)
-- ============================================================
('seo-meta-tags',
 'SEO Meta Tags Generator',
 'Title, description, OG, Twitter Card — complete head tags',
 'Generate complete SEO meta tags for any page: title tag, meta description, Open Graph tags for social sharing, Twitter Card tags, canonical URL, and JSON-LD structured data. Optimized for CTR.',
 'marketing-growth', 'beginner', true, 0, null,
 ARRAY['SEO','meta-tags','Open-Graph','Twitter-Card','JSON-LD'],
 '[
   {"step":1,"title":"Generate for a page","language":"typescript","code":"const meta = await runSkill(''seo-meta'', {\n  pageType: \"product\",\n  title: \"InvoiceBot — WhatsApp GST Invoices in 10 Seconds\",\n  description: \"Create GST-compliant invoices via WhatsApp voice notes. Used by 200+ Indian traders. No app download required.\",\n  url: \"https://invoicebot.io\",\n  image: \"https://invoicebot.io/og-image.png\",\n  product: { price: 299, currency: \"INR\", availability: \"in_stock\" }\n})"},
   {"step":2,"title":"Next.js generateMetadata","language":"typescript","code":"// app/layout.tsx\nexport const metadata: Metadata = {\n  title: ''InvoiceBot — WhatsApp GST Invoices in 10 Seconds'',\n  description: ''Create GST-compliant invoices via WhatsApp voice notes. Used by 200+ Indian traders.'',\n  openGraph: {\n    title: ''InvoiceBot'',\n    description: ''GST invoices via WhatsApp — 10 seconds'',\n    url: ''https://invoicebot.io'',\n    siteName: ''InvoiceBot'',\n    images: [{ url: ''https://invoicebot.io/og-image.png'', width: 1200, height: 630 }],\n    type: ''website''\n  },\n  twitter: { card: ''summary_large_image'', title: ''InvoiceBot'', description: ''GST invoices via WhatsApp'' },\n  canonical: ''https://invoicebot.io''\n}"}
 ]'::jsonb,
 null, 870, false, true),

('cold-email-sequence',
 'Cold Email Sequence Writer',
 '5-email outbound sequence with personalization hooks',
 'Write a 5-email cold outreach sequence for B2B sales: first touch with specific insight, follow-up with social proof, value-add email with useful resource, bump, and break-up email. Conversion-optimized.',
 'marketing-growth', 'intermediate', false, 1299, null,
 ARRAY['cold-email','outbound','sales','B2B','email-sequence'],
 '[
   {"step":1,"title":"Generate email sequence","language":"typescript","code":"const sequence = await runSkill(''cold-email-sequence'', {\n  product: \"InvoiceBot\",\n  icp: \"Indian wholesale traders with 20+ employees\",\n  value: \"Reduces invoicing time from 2 hours to 10 minutes/day\",\n  sender: \"Aditya from InvoiceBot\",\n  personas: [{ role: \"Owner\", painPoint: \"Can''t keep up with invoice volume during peak season\" }]\n})"},
   {"step":2,"title":"Email 1 — First touch","language":"text","code":"Subject: Your invoice backlog during festival season\n\nHi {first_name},\n\nQuick observation: wholesale traders in {city} typically handle 3-4x normal invoice volume during Diwali season — most using WhatsApp + manual entries.\n\nWe built InvoiceBot for exactly this: send a WhatsApp voice note, get a GST-compliant PDF in 8 seconds. No new app to learn.\n\n{company_name} doing {product_category}? Worth a 10-min call?\n\n— Aditya\nPS: Works in Hindi and Gujarati too."},
   {"step":3,"title":"Email 3 — Value add","language":"text","code":"Subject: GST invoicing checklist for wholesale traders\n\nHi {first_name},\n\nPut together a quick checklist of the 7 most common GST invoice errors that trigger notices — based on 200 traders we''ve worked with.\n\n[Attach checklist PDF]\n\nHappy to walk through how to avoid these automatically. 10 minutes?\n\n— Aditya"}
 ]'::jsonb,
 null, 860, false, true),

('content-calendar',
 'Content Calendar Generator',
 '30-day content plan across LinkedIn, X, and YouTube',
 'Generate a 30-day content calendar for your product across LinkedIn, X (Twitter), and YouTube. Includes post types, hooks, content pillars, and a weekly theme. Designed for founder-led marketing.',
 'marketing-growth', 'intermediate', false, 999, null,
 ARRAY['content-marketing','social-media','LinkedIn','Twitter','calendar'],
 '[
   {"step":1,"title":"Generate calendar","language":"typescript","code":"const calendar = await runSkill(''content-calendar'', {\n  product: \"InvoiceBot\",\n  audience: \"Indian SMB founders and traders\",\n  pillars: [\"Product tutorials\", \"Customer stories\", \"GST tips\", \"Behind the build\"],\n  channels: [\"LinkedIn\", \"X\", \"YouTube\"],\n  postFrequency: { linkedin: 5, x: 7, youtube: 2 }\n})"},
   {"step":2,"title":"Week 1 plan","language":"json","code":"{\n  \"week1\": {\n    \"theme\": \"The problem we''re solving\",\n    \"posts\": [\n      { \"day\": \"Mon\", \"channel\": \"LinkedIn\", \"type\": \"Story\", \"hook\": \"I watched my uncle lose ₹2L because of an invoice dispute. Here''s what I built.\", \"pillar\": \"Behind the build\" },\n      { \"day\": \"Tue\", \"channel\": \"X\", \"type\": \"Thread\", \"hook\": \"7 GST invoice mistakes Indian traders make (and how to avoid them):\", \"pillar\": \"GST tips\" },\n      { \"day\": \"Thu\", \"channel\": \"YouTube\", \"type\": \"Demo\", \"hook\": \"Creating a GST invoice in 10 seconds via WhatsApp\", \"pillar\": \"Product tutorial\" }\n    ]\n  }\n}"}
 ]'::jsonb,
 null, 840, false, true),

('linkedin-post-writer',
 'LinkedIn Post Writer',
 'Viral LinkedIn posts using the hook-story-insight-CTA framework',
 'Write high-performing LinkedIn posts using proven viral frameworks: hook-story-insight-CTA, listicles, contrarian takes, and founder journey posts. Optimized for the LinkedIn algorithm.',
 'marketing-growth', 'beginner', true, 0, null,
 ARRAY['LinkedIn','social-media','content','copywriting','founder'],
 '[
   {"step":1,"title":"Write a LinkedIn post","language":"typescript","code":"const post = await runSkill(''linkedin-post'', {\n  type: \"story\",\n  topic: \"How we got first 100 paying customers with zero ad spend\",\n  audience: \"SaaS founders\",\n  cta: \"Share your first 100 story below\",\n  wordCount: 200\n})"},
   {"step":2,"title":"Generated post","language":"text","code":"We got our first 100 paying customers with ₹0 in ad spend.\n\nHere''s the exact playbook:\n\n1. We found 50 traders on IndiaMART who posted about invoice problems\n2. Sent a 30-second voice note DM (not a template)\n3. Offered 3 months free if they''d do a 20-min call\n4. 23 calls. 18 paid after free trial.\n\nThe key: we didn''t pitch. We asked what invoice pain felt like.\n\nEvery paying customer described the same 2 problems:\n→ Forgetting IGST vs CGST/SGST\n→ Customers asking for invoice at 11pm\n\nWe built exactly those 2 fixes first.\n\nThe product literally sold itself once they used it for a week.\n\nWhat did YOUR first 100 customers teach you about your product?\n👇"}
 ]'::jsonb,
 null, 880, true, true),

('twitter-thread-writer',
 'X (Twitter) Thread Writer',
 'Viral threads with strong hooks and engagement loops',
 'Write X/Twitter threads that drive engagement: strong opener hook, value-dense numbered points, embedded engagement questions, and a closing CTA. Includes thread structure for different goals.',
 'marketing-growth', 'beginner', true, 0, null,
 ARRAY['Twitter','X','thread','social-media','content','viral'],
 '[
   {"step":1,"title":"Write a thread","language":"typescript","code":"const thread = await runSkill(''twitter-thread'', {\n  topic: \"5 things I learned building a SaaS in India vs the US\",\n  audience: \"Indie hackers and startup founders\",\n  tweets: 8,\n  cta: \"Follow for more India-specific startup insights\"\n})"},
   {"step":2,"title":"Thread output","language":"text","code":"Tweet 1 (hook):\nBuilding a SaaS in India is completely different from building in the US.\nAfter 2 years doing both, here''s what nobody tells you:\n🧵\n\nTweet 2:\n1/ Payment infra is 3x harder.\nStripe doesn''t work here. Razorpay does, but international cards fail 20% of the time.\nYou will lose customers at checkout. Build a retry flow on day 1.\n\nTweet 3:\n2/ WhatsApp > email.\nEvery Indian SMB responds to WhatsApp in minutes.\nEmail? 3-5 day reply rate at best.\nIf your product doesn''t have WhatsApp-first onboarding, you''re losing 60% of SMB conversions."}
 ]'::jsonb,
 null, 850, false, true),

('producthunt-strategy',
 'ProductHunt Launch Strategy',
 'Day-of launch playbook: hunters, timing, comment templates',
 'Plan your ProductHunt launch: optimal launch day/time analysis, hunter outreach templates, maker comment strategy, community pre-launch warm-up checklist, and response templates for the day of.',
 'marketing-growth', 'intermediate', false, 1499, null,
 ARRAY['ProductHunt','launch','marketing','growth','SaaS'],
 '[
   {"step":1,"title":"Generate launch strategy","language":"typescript","code":"const strategy = await runSkill(''ph-launch-strategy'', {\n  product: \"InvoiceBot\",\n  targetAudience: \"Indian founders and makers\",\n  launchDate: \"2026-05-15\",\n  existingNetwork: \"200 Twitter followers, 500 LinkedIn connections\",\n  uniqueAngle: \"First WhatsApp-native GST invoice tool\"\n})"},
   {"step":2,"title":"Launch day checklist","language":"json","code":"{\n  \"pre-launch\": [\n    \"Post teaser on X/LinkedIn 3 days before\",\n    \"DM top 20 supporters with preview link\",\n    \"Schedule 10 testimonials to post at 12:01 AM PST\"\n  ],\n  \"day-of\": [\n    \"Go live at 12:01 AM PST (12:31 PM IST)\",\n    \"Post maker comment within 5 minutes of launch\",\n    \"Reply to every comment within 15 minutes all day\",\n    \"Post update at noon: ''50 upvotes! Here''s what users are saying...''\"\n  ],\n  \"makerCommentTemplate\": \"Hey PH! I built InvoiceBot after watching my uncle lose ₹2L in a payment dispute because he had no invoice. 8 months, 200 beta users, 94% retention later — we''re here. Try it free, no card needed. Happy to answer any questions!\"\n}"}
 ]'::jsonb,
 null, 870, false, true),

('referral-program-design',
 'Referral Program Designer',
 'Double-sided referral mechanics that actually convert',
 'Design a referral program for your SaaS: reward structure, referral link mechanics, email templates for sender and recipient, fraud prevention rules, and tracking implementation with PostHog.',
 'marketing-growth', 'intermediate', false, 999, null,
 ARRAY['referral','growth','viral','SaaS','customer-acquisition'],
 '[
   {"step":1,"title":"Design referral program","language":"typescript","code":"const program = await runSkill(''referral-program'', {\n  product: \"InvoiceBot\",\n  rewardType: \"credit\",\n  referrerReward: \"1 free month (₹299 credit)\",\n  refereeReward: \"30% off first month\",\n  targetCAC: 500,\n  expectedConversionRate: 0.15\n})"},
   {"step":2,"title":"Implementation plan","language":"json","code":"{\n  \"mechanics\": {\n    \"referrerGets\": \"₹299 credit when referred user pays first invoice\",\n    \"refereeGets\": \"30% off first month — applied at checkout\",\n    \"fraudPrevention\": [\"Same IP detection\", \"Same card detection\", \"Minimum 5 invoices before credit unlocks\"]\n  },\n  \"emailTemplates\": {\n    \"referralInvite\": \"Subject: I''m saving 2 hours/day on invoicing — thought you should know\",\n    \"referralConverted\": \"Subject: Your friend just saved ₹299 — your credit is live\"\n  },\n  \"implementation\": {\n    \"referralLink\": \"https://invoicebot.io/?ref={userId}\",\n    \"tracking\": \"utm_source=referral&utm_medium=friend&utm_campaign={userId}\"\n  }\n}"}
 ]'::jsonb,
 null, 820, false, true),

('hn-show-hn-post',
 'Show HN Post Writer',
 'Hacker News Show HN post that drives genuine engagement',
 'Write a Show HN post for your product: title that passes HN guidelines, opening paragraph that appeals to technical readers, honest description of what you built and why, and maker tips for the comments.',
 'marketing-growth', 'beginner', true, 0, null,
 ARRAY['HackerNews','Show-HN','launch','marketing','developers'],
 '[
   {"step":1,"title":"Write Show HN post","language":"typescript","code":"const post = await runSkill(''show-hn-post'', {\n  product: \"InvoiceBot\",\n  builtWith: [\"Next.js\", \"Supabase\", \"360dialog WhatsApp API\", \"Gemini\"],\n  uniqueTech: \"WhatsApp voice note → GST invoice via LLM in <10s\",\n  traction: \"200 beta users, ₹40k MRR\",\n  openSource: false\n})"},
   {"step":2,"title":"Show HN post","language":"text","code":"Title: Show HN: I built a WhatsApp bot that creates GST invoices from voice notes (200 users, ₹40k MRR)\n\nBody:\nHey HN,\n\nI''m Aditya. I built InvoiceBot after watching my uncle — a textile wholesaler in Surat — lose ₹2L because he had no invoice for a transaction that happened on WhatsApp at 11pm.\n\n90% of Indian B2B trade happens on WhatsApp. Nobody is going to switch to a desktop invoicing app.\n\nSo we built directly into WhatsApp:\n1. Seller sends a voice note: \"Sold 50 meters of fabric to Ramesh Bhai at 180 per meter, 18% GST\"\n2. Bot replies with a GST-compliant PDF invoice in 8 seconds\n3. Seller forwards it to the buyer\n\nTech stack: Next.js 15, Supabase, 360dialog WhatsApp API, Gemini 1.5 Flash for NLU.\n\nThe hardest part wasn''t the tech — it was handling the Indian name corpus and the variety of ways people describe quantities (''ek bori'' = 50kg for rice traders in UP).\n\nFeedback welcome, especially on the pricing page."}
 ]'::jsonb,
 null, 890, true, true),

('email-newsletter-writer',
 'Email Newsletter Writer',
 'Weekly newsletter that gets opened — subject lines and all',
 'Write a product newsletter issue: subject line variants (tested against 40% open rate benchmark), preview text, content sections, and unsubscribe-safe call-to-action. Designed for founder-led newsletters.',
 'marketing-growth', 'beginner', false, 699, null,
 ARRAY['newsletter','email-marketing','copywriting','growth','retention'],
 '[
   {"step":1,"title":"Write newsletter issue","language":"typescript","code":"const newsletter = await runSkill(''newsletter-writer'', {\n  product: \"InvoiceBot\",\n  issue: 12,\n  theme: \"How we reduced our invoice dispute rate by 80%\",\n  updates: [\"New: Hindi voice note support\", \"Fixed: IGST calculation bug for composite items\"],\n  audienceSize: 800\n})"},
   {"step":2,"title":"Newsletter output","language":"text","code":"Subject A: We reduced invoice disputes by 80% — here''s how\nSubject B: 80% fewer disputes. Same WhatsApp.\nPreview: The fix was embarrassingly simple...\n\n---\n\nHi {first_name},\n\nWe had a problem.\n\n12% of our users were getting payment disputes from buyers who ''didn''t receive'' the invoice.\n\nWe added read receipts. Disputes dropped to 2.3%.\n\nThe lesson: trust isn''t built with better invoices. It''s built with proof of delivery.\n\n→ Read receipt feature is live for all Pro users now.\n\n---\n\nWhat''s new this week:\n• Hindi voice notes: just say ''ek hazaar rupiye'' and we handle it\n• Bug fix: composite items with multiple GST slabs were miscalculated. Fixed in v1.4.2.\n\nUntil next week,\nAditya"}
 ]'::jsonb,
 null, 800, false, true),

('seo-blog-post-writer',
 'SEO Blog Post Writer',
 'Long-form content that ranks — outline, draft, internal links',
 'Write SEO-optimized long-form blog posts: keyword research recommendations, heading structure (H1/H2/H3), meta description, 1500-word draft, internal link suggestions, and FAQ schema markup.',
 'marketing-growth', 'intermediate', false, 1499, null,
 ARRAY['SEO','blog','content-marketing','long-form','keyword'],
 '[
   {"step":1,"title":"Generate blog post","language":"typescript","code":"const post = await runSkill(''seo-blog-post'', {\n  targetKeyword: \"how to create GST invoice in WhatsApp\",\n  searchIntent: \"how-to\",\n  product: \"InvoiceBot\",\n  wordCount: 1500,\n  internalLinks: [\"/features\", \"/pricing\", \"/blog/gst-invoice-format\"]\n})"},
   {"step":2,"title":"Post outline","language":"json","code":"{\n  \"h1\": \"How to Create a GST Invoice on WhatsApp (2026 Guide)\",\n  \"metaDescription\": \"Learn how to create GST-compliant invoices directly on WhatsApp in 3 steps. No app download needed. Works for CGST, SGST, and IGST.\",\n  \"outline\": [\n    { \"h2\": \"What is a GST Invoice?\", \"wordTarget\": 200 },\n    { \"h2\": \"Why WhatsApp for Invoicing?\", \"wordTarget\": 200 },\n    { \"h2\": \"Step-by-Step: Create GST Invoice via WhatsApp\", \"wordTarget\": 400 },\n    { \"h2\": \"Required Fields in a GST Invoice\", \"wordTarget\": 300 },\n    { \"h2\": \"CGST vs SGST vs IGST — Which Applies to You?\", \"wordTarget\": 200 },\n    { \"h2\": \"FAQ\", \"wordTarget\": 200 }\n  ],\n  \"faqSchema\": \"JSON-LD FAQ markup included\"\n}"}
 ]'::jsonb,
 null, 860, false, true),

('app-store-listing',
 'App Store Listing Copywriter',
 'ASO-optimized title, subtitle, and description for iOS/Android',
 'Write App Store and Google Play listing copy: title (30 chars), subtitle (30 chars), keyword list for ASO, short description (80 chars), full description with feature bullets, and 5 screenshot captions.',
 'marketing-growth', 'intermediate', false, 799, null,
 ARRAY['ASO','App-Store','Google-Play','mobile','copywriting'],
 '[
   {"step":1,"title":"Generate store listing","language":"typescript","code":"const listing = await runSkill(''app-store-listing'', {\n  appName: \"InvoiceBot\",\n  category: \"Business\",\n  topFeatures: [\"WhatsApp invoice creation\", \"GST compliant\", \"Voice notes\", \"PDF export\"],\n  targetKeywords: [\"gst invoice\", \"invoice maker\", \"billing app india\"],\n  platform: \"both\"\n})"},
   {"step":2,"title":"App Store copy","language":"json","code":"{\n  \"title\": \"InvoiceBot: GST Invoice Maker\",\n  \"subtitle\": \"Create invoices via WhatsApp\",\n  \"keywords\": \"gst invoice,invoice maker,billing,whatsapp invoice,tax invoice india,free invoice\",\n  \"shortDescription\": \"GST invoices in 10 sec via WhatsApp voice note. Free to try.\",\n  \"screenshotCaptions\": [\n    \"Send a voice note → get a GST invoice\",\n    \"CGST/SGST/IGST calculated automatically\",\n    \"PDF ready to forward to your buyer\",\n    \"All invoices in one place\",\n    \"Works in Hindi and Gujarati too\"\n  ]\n}"}
 ]'::jsonb,
 null, 790, false, true),

('growth-experiment-tracker',
 'Growth Experiment Tracker',
 'Structure, run, and analyze growth experiments systematically',
 'Design and document growth experiments: hypothesis template, success metric definition, sample size calculator, results analysis, and a decision framework (ship/kill/iterate). Inspired by GrowthBook methodology.',
 'marketing-growth', 'intermediate', false, 999, null,
 ARRAY['growth','experimentation','A/B-test','metrics','product-growth'],
 '[
   {"step":1,"title":"Define an experiment","language":"typescript","code":"const experiment = await runSkill(''growth-experiment'', {\n  hypothesis: \"Adding a ''Start Free — No Credit Card'' CTA on the pricing page will increase trial signups by 20%\",\n  metric: \"trial_signup_rate\",\n  baseline: 0.03,\n  minimumDetectableEffect: 0.20,\n  weeklyTraffic: 500\n})"},
   {"step":2,"title":"Experiment plan","language":"json","code":"{\n  \"id\": \"EXP-2026-012\",\n  \"hypothesis\": \"Adding no-CC CTA increases trial signups by 20%\",\n  \"primaryMetric\": \"trial_signup_rate\",\n  \"baselineRate\": 0.03,\n  \"targetRate\": 0.036,\n  \"sampleSizePerVariant\": 2847,\n  \"estimatedRuntime\": \"11.4 days at 500 visitors/week\",\n  \"guardrailMetrics\": [\"paid_conversion_rate\", \"revenue_per_visitor\"],\n  \"decisionCriteria\": {\n    \"ship\": \"p < 0.05 AND primary metric improved AND no guardrail regression\",\n    \"kill\": \"p < 0.05 AND primary metric declined\",\n    \"iterate\": \"not significant after 2x expected runtime\"\n  }\n}"}
 ]'::jsonb,
 null, 810, false, true)
ON CONFLICT (slug) DO NOTHING;
