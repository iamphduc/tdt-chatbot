const Schedule = require('../modules/Schedule');
const Score = require('../modules/Score');

class SettingController {
  // [GET] /setting
  async getSetting(req, res) {
    try {
      const { MSSV, PASS, CONFIG } = process.env;

      const [scheduleOptions, scoreOptions] = await Promise.all([
        Schedule.getScheduleSemester(MSSV, PASS),
        Score.getScoreSemester(MSSV, PASS),
      ]);

      const defaultSchedule = scheduleOptions.find((ele) => ele.isSelected);
      const defaultScore = scoreOptions[0];

      const { SCHEDULE: configSchedule, SCORE: configScore } = CONFIG
        ? JSON.parse(CONFIG)
        : {};

      setSemester(
        configSchedule || defaultSchedule.value,
        configScore || defaultScore.NameTable
      );
      console.log(process.env.SEMESTER_SCHEDULE, process.env.SEMESTER_SCORE);

      return res.render('setting', {
        scheduleOptions,
        scoreOptions,
        configSchedule,
        configScore,
      });
    } catch (error) {
      res.send(error);
    }
  }

  // [POST] /setting
  configurate(req, res) {
    const { configSchedule, configScore } = req.body;

    process.env.CONFIG = JSON.stringify({
      SCHEDULE: configSchedule,
      SCORE: configScore,
    });

    setSemester(configSchedule, configScore);
    console.log('SETTING_SUCCESS');
    console.log(process.env.SEMESTER_SCHEDULE, process.env.SEMESTER_SCORE);

    return res.status(200).json({ message: 'success' });
  }
}

function setSemester(schedule, score) {
  if (schedule) process.env.SEMESTER_SCHEDULE = schedule;
  if (score) process.env.SEMESTER_SCORE = score;
}

module.exports = new SettingController();
