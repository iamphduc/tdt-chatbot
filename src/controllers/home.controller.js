
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
            
            return res.json(ret);
    
        } catch (err) {
            res.send(err);
        }
    }
}

module.exports = new ScheduleController()
