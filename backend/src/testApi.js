const axios = require('axios');
axios.post('http://localhost:5000/api/submissions/run', {
   problemId: 1,
   language: 'python',
   code: 'print("Hello World")'
}).then(r => console.log('SUCCESS', r.data)).catch(e => console.error('ERROR:', e.response ? e.response.data : e.message));
