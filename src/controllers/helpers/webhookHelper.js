
class WebhookHelper {
    formatSchedule(schedule) {
        schedule = JSON.parse(schedule);

        let stringSchedule = schedule.map((ele) => {
            return `===== ${ele.date} =====\nMôn học: ${ele.subject}\nTiết: ${ele.period}\nNhóm: ${ele.group} - Tổ: ${ele.subGroup}\nPhòng: ${ele.room}`
        });

        return stringSchedule;
    }
}

module.exports = new WebhookHelper()
