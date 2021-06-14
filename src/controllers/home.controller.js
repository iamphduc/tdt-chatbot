
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

}

module.exports = new ScheduleController()
