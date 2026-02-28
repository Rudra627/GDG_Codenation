const pool = require('../config/db');

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

// @desc  Get all templates for a problem (Admin, to show which langs have templates)
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
