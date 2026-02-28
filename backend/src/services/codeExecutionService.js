const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const https = require('https');

const TEMP_DIR = path.join(os.tmpdir(), 'codenation_exec');
const TIMEOUT_MS = 5000;

// Ensure temp dir exists on load
(async () => {
    try { await fs.mkdir(TEMP_DIR, { recursive: true }); } catch (_) {}
})();

// ─── Judge0 language IDs ────────────────────────────────────────────────────
const JUDGE0_LANG_IDS = {
    'c':   50,  // C (GCC 9.2.0)
    'c++': 54,  // C++ (GCC 9.2.0)
    'cpp': 54,
};

// ─── Native language configs ─────────────────────────────────────────────────
const getNativeConfig = (language) => {
    switch (language.toLowerCase()) {
        case 'python':
            return { filename: 'main.py', buildCmd: null, runCmd: 'python', runArgs: ['main.py'] };
        case 'javascript':
        case 'js':
            return { filename: 'main.js', buildCmd: null, runCmd: 'node', runArgs: ['main.js'] };
        case 'java':
            return { filename: 'Main.java', buildCmd: 'javac', buildArgs: ['Main.java'], runCmd: 'java', runArgs: ['Main'] };
        default:
            return null;
    }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toBase64 = (str) => Buffer.from(str || '').toString('base64');
const fromBase64 = (str) => str ? Buffer.from(str, 'base64').toString('utf8') : '';

/**
 * Submit a single test case to Judge0 CE and get the result.
 */
const runWithJudge0 = (langId, code, input) => {
    return new Promise((resolve) => {
        const body = JSON.stringify({
            source_code: toBase64(code),
            language_id: langId,
            stdin: toBase64(input || ''),
            cpu_time_limit: 5,
            wall_time_limit: 10,
        });

        const options = {
            hostname: 'ce.judge0.com',
            path: '/submissions?base64_encoded=true&wait=true',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    // status ids: 1=queued, 2=processing, 3=accepted, 4=wrong(NA), 5=TLE, 6=compile error, 7-12=runtime errors
                    const statusId = result.status?.id;
                    const stdout = fromBase64(result.stdout);
                    const stderr = fromBase64(result.stderr);
                    const compileOutput = fromBase64(result.compile_output);

                    if (statusId === 5) return resolve({ timedOut: true });
                    if (statusId === 6) return resolve({ compileError: compileOutput || stderr });
                    if (statusId >= 7 && statusId <= 12) return resolve({ runtimeError: stderr || compileOutput || 'Runtime Error' });
                    if (statusId === 3) return resolve({ stdout, time: parseFloat(result.time || '0') });
                    // fallback
                    return resolve({ stdout, runtimeError: stderr || null });
                } catch (e) {
                    resolve({ runtimeError: 'Failed to parse Judge0 response: ' + e.message });
                }
            });
        });

        req.on('error', (e) => resolve({ runtimeError: 'Judge0 connection error: ' + e.message }));
        req.setTimeout(12000, () => { req.destroy(); resolve({ timedOut: true }); });
        req.write(body);
        req.end();
    });
};

/**
 * Run a native process with stdin and capture output.
 */
const runProcess = (cmd, args, cwd, inputStr) => {
    return new Promise((resolve) => {
        let stdoutData = '';
        let stderrData = '';
        let timedOut = false;

        const child = spawn(cmd, args, { cwd, shell: process.platform === 'win32' });

        const timeoutHandle = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
            resolve({ timedOut: true });
        }, TIMEOUT_MS);

        child.stdout.on('data', (d) => { stdoutData += d.toString(); });
        child.stderr.on('data', (d) => { stderrData += d.toString(); });

        child.stdin.write(String(inputStr || ''));
        child.stdin.end();

        child.on('close', (code) => {
            if (timedOut) return;
            clearTimeout(timeoutHandle);
            resolve({ stdout: stdoutData, stderr: stderrData, exitCode: code });
        });

        child.on('error', (err) => {
            clearTimeout(timeoutHandle);
            if (!timedOut) resolve({ stderr: err.message, exitCode: -1 });
        });
    });
};

// ─── Main Export ─────────────────────────────────────────────────────────────
/**
 * Executes code against test cases.
 * Returns: { status, passed, total, runtime, compileError, runtimeError, actualOutput, expectedOutput, failedTestCase }
 */
exports.executeCode = async (language, problemId, code, testCases) => {
    if (!testCases || testCases.length === 0) {
        return { status: 'Accepted', passed: 0, total: 0, runtime: 0 };
    }

    const langLower = language.toLowerCase();
    const useJudge0 = langLower === 'c' || langLower === 'c++' || langLower === 'cpp';

    // ── Judge0 path (C / C++) ────────────────────────────────────────────────
    if (useJudge0) {
        const langId = JUDGE0_LANG_IDS[langLower];
        let passedCount = 0;
        let totalRuntime = 0;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = await runWithJudge0(langId, code, testCase.input);

            if (result.compileError) {
                return { status: 'Compile Error', passed: 0, total: testCases.length, compileError: result.compileError };
            }
            if (result.timedOut) {
                return { status: 'Time Limit Exceeded', passed: passedCount, total: testCases.length, failedTestCase: testCase };
            }
            if (result.runtimeError) {
                return { status: 'Runtime Error', passed: passedCount, total: testCases.length, failedTestCase: testCase, runtimeError: result.runtimeError };
            }

            const actualOutput = (result.stdout || '').trim().replace(/\r\n/g, '\n');
            const expectedOutput = (testCase.expected_output || '').trim().replace(/\r\n/g, '\n');

            if (actualOutput !== expectedOutput) {
                return {
                    status: 'Wrong Answer',
                    passed: passedCount,
                    total: testCases.length,
                    failedTestCase: testCase,
                    actualOutput,
                    expectedOutput,
                };
            }

            passedCount++;
            totalRuntime += result.time || 0;
        }

        return {
            status: 'Accepted',
            passed: passedCount,
            total: testCases.length,
            runtime: parseFloat((totalRuntime / testCases.length).toFixed(3)),
        };
    }

    // ── Native execution path (Python / JavaScript / Java) ──────────────────
    const config = getNativeConfig(langLower);
    if (!config) {
        return { status: 'System Error', passed: 0, total: testCases.length, runtimeError: `Unsupported language: ${language}` };
    }

    const executionId = crypto.randomUUID();
    const execDir = path.join(TEMP_DIR, executionId);

    try {
        await fs.mkdir(execDir, { recursive: true });
        await fs.writeFile(path.join(execDir, config.filename), code, 'utf8');

        // Compile step (Java)
        if (config.buildCmd) {
            const compile = await runProcess(config.buildCmd, config.buildArgs, execDir, '');
            if (compile.exitCode !== 0) {
                return { status: 'Compile Error', passed: 0, total: testCases.length, compileError: compile.stderr || 'Compilation failed.' };
            }
        }

        let passedCount = 0;
        let totalRuntime = 0;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const start = Date.now();
            const result = await runProcess(config.runCmd, config.runArgs, execDir, testCase.input);
            const duration = (Date.now() - start) / 1000;
            totalRuntime += duration;

            if (result.timedOut) {
                return { status: 'Time Limit Exceeded', passed: passedCount, total: testCases.length, failedTestCase: testCase };
            }
            if (result.exitCode !== 0) {
                return {
                    status: 'Runtime Error',
                    passed: passedCount,
                    total: testCases.length,
                    failedTestCase: testCase,
                    runtimeError: result.stderr || `Process exited with code ${result.exitCode}`,
                };
            }

            const actualOutput = (result.stdout || '').trim().replace(/\r\n/g, '\n');
            const expectedOutput = (testCase.expected_output || '').trim().replace(/\r\n/g, '\n');

            if (actualOutput !== expectedOutput) {
                return {
                    status: 'Wrong Answer',
                    passed: passedCount,
                    total: testCases.length,
                    failedTestCase: testCase,
                    actualOutput,
                    expectedOutput,
                };
            }

            passedCount++;
        }

        return {
            status: 'Accepted',
            passed: passedCount,
            total: testCases.length,
            runtime: parseFloat((totalRuntime / testCases.length).toFixed(3)),
        };

    } catch (error) {
        console.error('Execution Engine Error:', error);
        return { status: 'System Error', passed: 0, total: testCases.length, runtimeError: error.message };
    } finally {
        try { await fs.rm(execDir, { recursive: true, force: true }); } catch (_) {}
    }
};
