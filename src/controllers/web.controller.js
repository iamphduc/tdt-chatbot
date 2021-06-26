
const school = require('../classes/school');

class WebController {

    // [POST] /api/week
    async getSchedule(req, res) {
        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) return res.sendStatus(404);

        try {
            const subjectList = await school.getSchedule(mssv, pass);

            return res.json(subjectList);
        } catch (err) {
            res.send(err);
        }
    }

    // [POST] /api/week-next
    async getNextSchedule(req, res) {
        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) return res.sendStatus(404);

        try {
            const subjectList = await school.getSchedule(mssv, pass, true);
            
            return res.json(subjectList);
        } catch (err) {
            res.send(err);
        }
    }

    // [POST] /api/score
    async getScore(req, res) {
        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) return res.sendStatus(404);

        try {
            const score = await school.getScore(mssv, pass, undefined);
            
            return res.json(score);
        } catch (err) {
            res.send(err);
        }
    }
    
    // [POST] /api/score-total
    async getTotalScore(req, res) {
        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) return res.sendStatus(404);

        try {
            const totalScore = await school.getScore(mssv, pass, undefined, true);
            
            return res.json(totalScore);
        } catch (err) {
            res.send(err);
        }
    }

    // [ALL] /seting
    async setting(req, res) {
        try {
            // ===== POST ===== //
            const isSchedule = req.body.isSchedule;
            const isScore = req.body.isScore;
            const configSchedule = req.body.schedule;
            const configScore = req.body.score;

            if (Object.keys(req.body).length !== 0) {
                process.env.IS_SCHEDULE = isSchedule;
                process.env.IS_SCORE = isScore;
                process.env.SCHEDULE = configSchedule;
                process.env.SCORE = configScore;

                console.log('SETTING_SUCCESS');
                return;
            }

            // ===== GET ===== //
            const scheduleSemester = await school.getScheduleSemester(process.env.MSSV, process.env.PASS);
            const scoreSemester = await school.getScoreSemester(process.env.MSSV, process.env.PASS);

            res.render('setting', {
                scheduleSemester,
                scoreSemester,
                isSchedule: (process.env.IS_SCHEDULE == 'true') ? true : false,
                isScore: (process.env.IS_SCORE == 'true') ? true : false,
                configSchedule: process.env.SCHEDULE ? process.env.SCHEDULE : '',
                configScore: process.env.SCORE ? process.env.SCORE : '',
            });

        } catch (error) {
            res.send(error);
        }
    }

    // [GET] /test-get
    async testGet(req, res) {
        const mssv = req.query.mssv;
        const pass = req.query.pass;
    
        if (!mssv || !pass) return res.sendStatus(404);

        try {
            // let ret = await school.getSchedule(mssv, pass);

            // let ret = await school.getSchedule(mssv, pass, true);

            // let ret = await school.getScore(mssv, pass, undefined);
            
            // let ret = await school.getScore(mssv, pass, undefined, true);

            let ret = await school.getScoreSemester(mssv, pass);

            // let ret = await school.getScheduleSemester(mssv, pass);
            
            if (!ret) res.sendStatus(404);

            return res.json(ret);
        } catch (err) {
            res.send(err);
        }
    }
}

module.exports = new WebController()
