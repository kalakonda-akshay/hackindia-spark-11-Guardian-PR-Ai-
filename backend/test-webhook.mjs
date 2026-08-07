import crypto from 'crypto';

const payload = JSON.stringify({
  action: 'opened',
  pull_request: {
    number: 1,
    title: 'Test Webhook PR',
    state: 'open',
    html_url: 'https://github.com/mutagent/test/pull/1',
    user: { login: 'tester' }
  },
  repository: {
    id: 12345,
    name: 'test-repo',
    full_name: 'mutagent/test-repo',
    owner: { login: 'mutagent', id: 123 }
  }
});

const secret = '';
const hmac = crypto.createHmac('sha256', secret);
const digest = 'sha256=' + hmac.update(payload).digest('hex');

console.log('Sending payload with signature:', digest);

fetch('http://localhost:3001/api/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-github-event': 'pull_request',
    'x-hub-signature-256': digest
  },
  body: payload
}).then(res => {
  console.log('Response Status:', res.status);
  return res.text();
}).then(text => {
  console.log('Response Body:', text);
}).catch(err => {
  console.error('Error:', err.message);
});
