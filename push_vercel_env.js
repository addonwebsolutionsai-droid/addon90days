const https = require('https');

// All env vars to push to Vercel
const ENV_VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://ithclsbnnkijdwtpsaja.supabase.co', target: ['production', 'preview', 'development'] },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aGNsc2JubmtpamR3dHBzYWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzk0ODIsImV4cCI6MjA5Mjk1NTQ4Mn0.t-cH21Ic_IXuDpZXBIytodj2mG6yNvWzWb_fw3cxNs8', target: ['production', 'preview', 'development'] },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aGNsc2JubmtpamR3dHBzYWphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3OTQ4MiwiZXhwIjoyMDkyOTU1NDgyfQ.zMKXK70QwHDRGCi3ekrJLOAQOEA_DZI1vlol6pRZbuo', target: ['production', 'preview', 'development'] },
  { key: 'ADMIN_API_KEY', value: 'addonweb_admin_bd831de51404ae2f2f8655e717d9b7e0', target: ['production', 'preview', 'development'] },
  { key: 'NEXT_PUBLIC_APP_URL', value: 'https://addon90days.vercel.app', target: ['production', 'preview', 'development'] },
];

// We need the Vercel project ID and team. Let me first find the project.
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

function vercelAPI(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function main() {
  if (!VERCEL_TOKEN) {
    console.error('Set VERCEL_TOKEN env var');
    process.exit(1);
  }

  // Find the project
  console.log('Looking up Vercel projects...');
  const projects = await vercelAPI('GET', '/v9/projects?limit=20');
  const project = projects.body.projects?.find(p => p.name === 'addon90days' || p.name?.includes('addon'));

  if (!project) {
    console.log('Available projects:', projects.body.projects?.map(p => p.name));
    console.error('Could not find addon90days project');
    return;
  }

  console.log(`Found project: ${project.name} (${project.id})`);

  for (const envVar of ENV_VARS) {
    process.stdout.write(`  Setting ${envVar.key}... `);
    const res = await vercelAPI('POST', `/v10/projects/${project.id}/env`, {
      key: envVar.key,
      value: envVar.value,
      type: 'encrypted',
      target: envVar.target,
    });
    if (res.status === 200 || res.status === 201) {
      console.log('✓');
    } else if (res.body.error?.code === 'ENV_ALREADY_EXISTS') {
      // Update it
      const existing = await vercelAPI('GET', `/v10/projects/${project.id}/env`);
      const match = existing.body.envs?.find(e => e.key === envVar.key);
      if (match) {
        const upd = await vercelAPI('PATCH', `/v10/projects/${project.id}/env/${match.id}`, {
          value: envVar.value,
          target: envVar.target,
        });
        console.log(upd.status === 200 ? '✓ (updated)' : `✗ update failed: ${JSON.stringify(upd.body)}`);
      }
    } else {
      console.log(`✗ ${JSON.stringify(res.body)}`);
    }
  }

  // Trigger redeploy
  console.log('\nTriggering redeploy...');
  const deploy = await vercelAPI('POST', `/v13/deployments`, {
    name: project.name,
    gitSource: { type: 'github', repoId: project.link?.repoId, ref: 'main' },
    projectId: project.id,
  });
  console.log(deploy.status < 300 ? `✓ Deploy started: ${deploy.body.url}` : `Deploy response: ${JSON.stringify(deploy.body).substring(0, 200)}`);
}

main().catch(console.error);
