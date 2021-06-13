
const scheduleHelper = require('../server/school');

class ScheduleController {

    async getSchedule(req, res) {

        const mssv = req.query.mssv;
        const pass = req.query.pass;
    
        if (!mssv || !pass) {
            return res.send('<p style="font-size:24px;">?mssv=&pass=</p>');
        }

        try {
            
            let subjectList = await scheduleHelper.getSchedule(mssv, pass);
            
            return res.json(subjectList);
    
        } catch (err) {
            res.send(err);
        }
    }

}

module.exports = new ScheduleController()
