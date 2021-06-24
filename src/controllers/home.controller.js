
const school = require('../server/school');

class ScheduleController {

    // [POST] /api/current
    async getSchedule(req, res) {

        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) {
            return res.send('<p style="font-size:24px;">POST: mssv= & pass= </p>');
        }

        try {
            
            let subjectList = await school.getSchedule(mssv, pass);
            
            return res.json(subjectList);
    
        } catch (err) {
            res.send(err);
        }
    }

    // [POST] /api/next
    async getNextSchedule(req, res) {

        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) {
            return res.send('<p style="font-size:24px;">POST: mssv= & pass= </p>');
        }

        try {
            
            let subjectList = await school.getSchedule(mssv, pass, true);
            
            return res.json(subjectList);
    
        } catch (err) {
            res.send(err);
        }
    }

    // [POST] /api/score
    async getScore(req, res) {

        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) {
            return res.send('<p style="font-size:24px;">POST: mssv= & pass= </p>');
        }

        try {
            
            let score = await school.getScore(mssv, pass, undefined);
            
            return res.json(score);
    
        } catch (err) {
            res.send(err);
        }
    }
    
    // [POST] /api/score-total
    async getTotalScore(req, res) {

        const mssv = req.body.mssv;
        const pass = req.body.pass;
    
        if (!mssv || !pass) {
            return res.send('<p style="font-size:24px;">POST: mssv= & pass= </p>');
        }

        try {
            
            let totalScore = await school.getScore(mssv, pass, undefined, true);
            
            return res.json(totalScore);
    
        } catch (err) {
            res.send(err);
        }
    }

    // [GET/POST] /config
    async configSemmester(req, res) {
        try {

            // ===== POST ===== //
            let isSchedule = req.body.isSchedule;
            let isScore = req.body.isScore;
            let configSchedule = req.body.schedule;
            let configScore = req.body.score;

            if (Object.keys(req.body).length !== 0) {
                process.env.IS_SCHEDULE = isSchedule;
                process.env.IS_SCORE = isScore;
                process.env.SCHEDULE = configSchedule;
                process.env.SCORE = configScore;

                return;
            }

            // ===== GET ===== //
            let scheduleSemester = await school.getScheduleSemester(process.env.MSSV, process.env.PASS);
            let scoreSemester = await school.getScoreSemester(process.env.MSSV, process.env.PASS);

            res.render('config', {
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

    // [GET] /testing
    async testApi(req, res) {

        const mssv = req.query.mssv;
        const pass = req.query.pass;
    
        if (!mssv || !pass) {
            return res.send('<p style="font-size:24px;">GET: api= & mssv= & pass= </p>');
        }

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

module.exports = new ScheduleController()
