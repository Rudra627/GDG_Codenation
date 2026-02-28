const pool = require('./config/db');

async function migrateWrappers() {
    try {
        console.log("Starting wrapper migration...");

        // 1. Add Columns
        try {
            await pool.query('ALTER TABLE problems ADD COLUMN skeleton_code TEXT');
            console.log("Added skeleton_code column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("skeleton_code column already exists.");
            else throw e;
        }

        try {
            await pool.query('ALTER TABLE problems ADD COLUMN wrapper_code TEXT');
            console.log("Added wrapper_code column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("wrapper_code column already exists.");
            else throw e;
        }

        // 2. Seed Problem 1 (Two Sum) with Python wrappers
        const twoSumSkeleton = `def two_sum(nums, target):
    # Write your solution here
    pass`;

        const twoSumWrapper = `import sys
import json

{{USER_CODE}}

if __name__ == '__main__':
    try:
        input_data = sys.stdin.read().strip().split('\\n')
        if len(input_data) >= 2:
            nums = json.loads(input_data[0])
            target = int(input_data[1])
            result = two_sum(nums, target)
            print(json.dumps(result, separators=(',', ':')))
    except Exception as e:
        print(f"Error executing wrapper: {e}", file=sys.stderr)`;

        await pool.query(
            'UPDATE problems SET skeleton_code = ?, wrapper_code = ? WHERE title = ?',
            [twoSumSkeleton, twoSumWrapper, "Two Sum"]
        );
        console.log("Updated Two Sum with Python wrappers.");


        // 3. Seed Problem 2 (Reverse String) with Python wrappers
        const reverseStringSkeleton = `def reverse_string(s):
    """
    Do not return anything, modify s in-place instead.
    """
    # Write your solution here
    pass`;

        const reverseStringWrapper = `import sys
import json

{{USER_CODE}}

if __name__ == '__main__':
    try:
        input_data = sys.stdin.read().strip()
        if input_data:
            s_list = json.loads(input_data)
            reverse_string(s_list)
            print(json.dumps(s_list, separators=(',', ':')))
    except Exception as e:
        print(f"Error executing wrapper: {e}", file=sys.stderr)`;

        await pool.query(
            'UPDATE problems SET skeleton_code = ?, wrapper_code = ? WHERE title = ?',
            [reverseStringSkeleton, reverseStringWrapper, "Reverse String"]
        );
        console.log("Updated Reverse String with Python wrappers.");


        // 4. Seed Problem 3 (Valid Palindrome) with Python wrappers
        const palindromeSkeleton = `def is_palindrome(s: str) -> bool:
    # Write your solution here
    pass`;

        const palindromeWrapper = `import sys
import json

{{USER_CODE}}

if __name__ == '__main__':
    try:
        input_data = sys.stdin.read().strip()
        if input_data:
            # strip start and end quotes from string input
            s = input_data.strip('"')
            result = is_palindrome(s)
            # Output lowercase true/false to match json specification
            print("true" if result else "false")
    except Exception as e:
        print(f"Error executing wrapper: {e}", file=sys.stderr)`;

        await pool.query(
            'UPDATE problems SET skeleton_code = ?, wrapper_code = ? WHERE title = ?',
            [palindromeSkeleton, palindromeWrapper, "Valid Palindrome"]
        );
        console.log("Updated Valid Palindrome with Python wrappers.");

        console.log("Migration complete!");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit(0);
    }
}

migrateWrappers();
