import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'family@example.com', password: 'password' });
    console.log('SUCCESS', res.data);
  } catch (e) {
    console.error('FAILED', e.response ? e.response.data : e.message);
  }
}

test();