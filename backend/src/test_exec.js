// Smoke test — Python, JS, C, C++
const { executeCode } = require('./services/codeExecutionService');

const tc = [
    { id: 1, input: '3 5', expected_output: '8' },
    { id: 2, input: '10 20', expected_output: '30' },
];

async function runTests() {
    console.log('\n=== Python Accepted ===');
    let r = await executeCode('python', 1, 'import sys\na,b=map(int,sys.stdin.readline().split())\nprint(a+b)', tc);
    console.log(JSON.stringify(r));

    console.log('\n=== Python Wrong Answer ===');
    r = await executeCode('python', 1, 'import sys\na,b=map(int,sys.stdin.readline().split())\nprint(a-b)', tc);
    console.log(JSON.stringify(r));

    console.log('\n=== Python Runtime Error ===');
    r = await executeCode('python', 1, 'print(1/0)', tc);
    console.log(JSON.stringify(r));

    console.log('\n=== C++ Accepted (Judge0) ===');
    const cppCode = `#include<bits/stdc++.h>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b<<endl;return 0;}`;
    r = await executeCode('c++', 1, cppCode, tc);
    console.log(JSON.stringify(r));

    console.log('\n=== C Accepted (Judge0) ===');
    const cCode = `#include<stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}`;
    r = await executeCode('c', 1, cCode, tc);
    console.log(JSON.stringify(r));

    console.log('\n=== C++ Compile Error (Judge0) ===');
    r = await executeCode('c++', 1, 'this is not valid c++', tc);
    console.log(JSON.stringify(r));

    console.log('\nAll done.');
    process.exit(0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
