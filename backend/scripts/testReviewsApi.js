import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

async function run() {
  try {
    const fam = await API.post('/api/auth/login', { email: 'family@example.com', password: 'password' });
    console.log('Family login:', fam.data);
    API.defaults.headers.common['Authorization'] = `Bearer ${fam.data.token}`;
    const familyData = await API.get('/api/reviews/family');
    console.log('Family /reviews/family response:', familyData.data);

    // Helper
    const helperLogin = await API.post('/api/auth/login', { email: 'maria@example.com', password: 'password' });
    console.log('Helper login:', helperLogin.data);
    API.defaults.headers.common['Authorization'] = `Bearer ${helperLogin.data.token}`;
    const helperData = await API.get('/api/reviews/helper');
    console.log('Helper /reviews/helper response:', helperData.data);

  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

run();