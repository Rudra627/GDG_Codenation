const pool = require('../config/db');

// ─── Auto-Generation Helpers ─────────────────────────────────────────────────

/**
 * Parse "nums: List[int], target: int" → [{name:'nums', type:'List[int]'}, ...]
 */
const parseParams = (paramsStr = '') => {
    if (!paramsStr.trim()) return [];
    return paramsStr.split(',').map(p => {
        const [nameRaw, typeRaw] = p.split(':');
        return {
            name: (nameRaw || '').trim(),
            type: (typeRaw || 'any').trim(),
        };
    }).filter(p => p.name);
};

/** Map a type hint to a C/C++ type */
const toCType = (t) => {
    const m = { 'int': 'int', 'float': 'float', 'double': 'double',
                 'str': 'char*', 'string': 'char*', 'bool': 'int',
                 'List[int]': 'int*', 'List[float]': 'float*' };
    return m[t] || 'void*';
};

/** Map a type hint to a Java type */
const toJavaType = (t) => {
    const m = { 'int': 'int', 'float': 'float', 'double': 'double',
                 'str': 'String', 'string': 'String', 'bool': 'boolean',
                 'List[int]': 'int[]', 'List[float]': 'double[]',
                 'List[str]': 'String[]' };
    return m[t] || 'Object';
};

/** JS stdin read expression for a type */
const jsRead = (type, lineExpr) => {
    if (type.startsWith('List[int]'))   return `${lineExpr}.trim().split(' ').map(Number)`;
    if (type.startsWith('List[float]')) return `${lineExpr}.trim().split(' ').map(Number)`;
    if (type.startsWith('List[str]'))   return `${lineExpr}.trim().split(' ')`;
    if (type === 'int')    return `parseInt(${lineExpr}.trim())`;
    if (type === 'float')  return `parseFloat(${lineExpr}.trim())`;
    if (type === 'double') return `parseFloat(${lineExpr}.trim())`;
    if (type === 'bool')   return `${lineExpr}.trim() === 'true'`;
    return `${lineExpr}.trim()`;
};

/** Python stdin read expression for a type */
const pyRead = (type, _name) => {
    if (type.startsWith('List[int]'))   return 'list(map(int, input().split()))';
    if (type.startsWith('List[float]')) return 'list(map(float, input().split()))';
    if (type.startsWith('List[str]'))   return 'input().split()';
    if (type === 'int')    return 'int(input())';
    if (type === 'float' || type === 'double') return 'float(input())';
    if (type === 'bool')   return 'input().strip().lower() == "true"';
    return 'input()';
};

/** Java Scanner read for a type */
const javaRead = (type) => {
    if (type.startsWith('List[int]') || type === 'int[]')
        return '{ String[] _t = sc.nextLine().trim().split(" "); int[] _a = new int[_t.length]; for(int _i=0;_i<_t.length;_i++) _a[_i]=Integer.parseInt(_t[_i]); }';
    if (type === 'int')    return 'sc.nextInt(); sc.nextLine();';
    if (type === 'float')  return 'sc.nextFloat(); sc.nextLine();';
    if (type === 'double') return 'sc.nextDouble(); sc.nextLine();';
    if (type === 'bool' || type === 'boolean') return 'Boolean.parseBoolean(sc.nextLine().trim());';
    return 'sc.nextLine().trim();';
};

// ─── Template generators ──────────────────────────────────────────────────────

const makeStarters = (fn, params, returnType) => {
    const paramList = params.map(p => p.name).join(', ');
    const javaParams = params.map(p => `${toJavaType(p.type)} ${p.name}`).join(', ');
    const cParams    = params.map(p => `${toCType(p.type)} ${p.name}`).join(', ');
    const javaRet    = toJavaType(returnType);

    return {
        python:
`def ${fn}(${paramList}):
    # Write your solution here
    pass`,

        javascript:
`/**
 * @param {${params.map(p=>`${p.type} ${p.name}`).join(', ')}} 
 * @return {${returnType}}
 */
function ${fn}(${paramList}) {
    // Write your solution here
}`,

        java:
`class Solution {
    public ${javaRet} ${fn}(${javaParams}) {
        // Write your solution here
        return ${javaRet === 'int' ? '0' : javaRet === 'boolean' ? 'false' : 'null'};
    }
}`,

        c:
`${toCType(returnType)} ${fn}(${cParams || 'void'}) {
    // Write your solution here
}`,

        'c++':
`${toCType(returnType)} ${fn}(${cParams || 'void'}) {
    // Write your solution here
}`,
    };
};

const makeDrivers = (fn, params) => {
    const pyReads = params.map(p => `${p.name} = ${pyRead(p.type, p.name)}`).join('\n');
    const pyArgs  = params.map(p => p.name).join(', ');

    const jsDecls = params.map((p, i) =>
        `const ${p.name} = ${jsRead(p.type, `rl()`)};`
    ).join('\n');
    const jsArgs = params.map(p => p.name).join(', ');

    // Java read block
    const javaDecls = params.map(p => {
        const jt = toJavaType(p.type);
        if (jt === 'int[]') {
            return `String[] _raw_${p.name} = sc.nextLine().trim().split(" ");\n        int[] ${p.name} = new int[_raw_${p.name}.length];\n        for(int _i=0;_i<_raw_${p.name}.length;_i++) ${p.name}[_i]=Integer.parseInt(_raw_${p.name}[_i]);`;
        }
        if (jt === 'String')  return `String ${p.name} = sc.nextLine().trim();`;
        if (jt === 'int')     return `int ${p.name} = Integer.parseInt(sc.nextLine().trim());`;
        if (jt === 'double')  return `double ${p.name} = Double.parseDouble(sc.nextLine().trim());`;
        if (jt === 'boolean') return `boolean ${p.name} = Boolean.parseBoolean(sc.nextLine().trim());`;
        return `String ${p.name} = sc.nextLine().trim(); // TODO: parse type`;
    }).join('\n        ');
    const javaArgs = params.map(p => p.name).join(', ');

    return {
        python:
`import sys
input = sys.stdin.readline

{{USER_CODE}}

${pyReads}
print(${fn}(${pyArgs}))`,

        javascript:
`const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
let _i = 0; const rl = () => lines[_i++];

{{USER_CODE}}

${jsDecls}
console.log(${fn}(${jsArgs}));`,

        java:
`import java.util.*;
public class Main {

{{USER_CODE}}

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution sol = new Solution();
        ${javaDecls}
        System.out.println(sol.${fn}(${javaArgs}));
    }
}`,

        c:
`#include <stdio.h>
#include <stdlib.h>

{{USER_CODE}}

int main() {
    // TODO: read input and call ${fn}()
    return 0;
}`,

        'c++':
`#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    // TODO: read input and call ${fn}()
    return 0;
}`,
    };
};

// ─── Exported: auto-generate templates for all languages ─────────────────────

/**
 * Called internally after problem creation.
 * Generates and saves starter+driver for all 5 languages.
 */
exports.autoGenerateTemplates = async (problemId, fnName, paramsStr, returnType = 'void') => {
    const params  = parseParams(paramsStr);
    const starters = makeStarters(fnName, params, returnType);
    const drivers  = makeDrivers(fnName, params);

    const langs = ['python', 'javascript', 'java', 'c', 'c++'];
    await Promise.all(langs.map(lang =>
        pool.query(
            `INSERT INTO problem_templates (problem_id, language, starter_code, driver_code)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE starter_code = VALUES(starter_code), driver_code = VALUES(driver_code), updated_at = NOW()`,
            [problemId, lang, starters[lang], drivers[lang]]
        )
    ));
};

// ─── Public CRUD endpoints (unchanged) ───────────────────────────────────────

// @desc  Get starter_code for a problem + language (public)
exports.getTemplate = async (req, res) => {
    try {
        const { id, language } = req.params;
        const [rows] = await pool.query(
            'SELECT starter_code, driver_code FROM problem_templates WHERE problem_id = ? AND language = ?',
            [id, language.toLowerCase()]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No template found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('[getTemplate]', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc  Save or update a template for a problem + language (Admin)
exports.saveTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { language, starter_code, driver_code } = req.body;

        if (!language || !starter_code || !driver_code) {
            return res.status(400).json({ message: 'language, starter_code, and driver_code are required.' });
        }

        if (!driver_code.includes('{{USER_CODE}}')) {
            return res.status(400).json({ message: 'driver_code must contain the {{USER_CODE}} placeholder.' });
        }

        await pool.query(
            `INSERT INTO problem_templates (problem_id, language, starter_code, driver_code)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE starter_code = VALUES(starter_code), driver_code = VALUES(driver_code), updated_at = NOW()`,
            [id, language.toLowerCase(), starter_code, driver_code]
        );

        res.status(200).json({ message: 'Template saved successfully.' });
    } catch (error) {
        console.error('[saveTemplate]', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc  Delete a template for a problem + language (Admin)
exports.deleteTemplate = async (req, res) => {
    try {
        const { id, language } = req.params;
        await pool.query(
            'DELETE FROM problem_templates WHERE problem_id = ? AND language = ?',
            [id, language.toLowerCase()]
        );
        res.status(200).json({ message: 'Template deleted.' });
    } catch (error) {
        console.error('[deleteTemplate]', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc  Get all templates for a problem (Admin)
exports.getAllTemplatesForProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT language, starter_code, driver_code FROM problem_templates WHERE problem_id = ?',
            [id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('[getAllTemplatesForProblem]', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
