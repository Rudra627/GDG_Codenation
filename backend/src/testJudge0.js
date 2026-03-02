const { executeCode } = require('./services/codeExecutionService');

async function test() {
  const ccode = '#include <stdio.h>\nint main() { printf("hi"); return 0; }';
  const ctestCase = [{ input: '', expected_output: 'hi' }];
  const res = await executeCode('c', 1, ccode, ctestCase);
  console.log('C:', res);
  
  const cppcode = '#include <iostream>\nusing namespace std;\nint main() { cout << "hi"; return 0; }';
  const rescpp = await executeCode('c++', 1, cppcode, ctestCase);
  console.log('C++:', rescpp);
  
  const javacode = 'import java.util.*;\npublic class Main {\npublic static void main(String[] args) {\n System.out.print("hi"); \n}\n}';
  const resjava = await executeCode('java', 1, javacode, ctestCase);
  console.log('Java:', resjava);
  
  const pycode = 'import sys\nprint("hi", end="")';
  const respy = await executeCode('python', 1, pycode, ctestCase);
  console.log('Python:', respy);
}

test();
