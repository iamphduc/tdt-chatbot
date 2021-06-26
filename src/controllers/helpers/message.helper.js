
module.exports = {
    toScheduleMessage(schedule) {
        if (schedule.length == 0) return '';
    
        const readableSchedule = schedule.map((ele) => {
            return `===== ${ ele.date } =====\n` +
                (ele.note === '' ? `` : `-----> ${ ele.note }\n`) + 
                `Môn: ${ ele.subject }\n` +
                `Tiết: ${ ele.period }\n` +
                `Nhóm: ${ ele.group }` + (ele.subGroup == 0 ? `` : `  -  Tổ: ${ ele.subGroup }`) + `\n` +
                `Phòng: ${ ele.room }\n`
        });
    
        return readableSchedule;
    },

    toScoreMessage(score) {
        if (score.length == 0) return '';
    
        /* 
            "MSSV": "51900790",
            "MonHocID": "503073",
            "TenMH": "Lập trình web và ứng dụng",
            "TenMH_TA": "Web Programming and Applications",
            "Nhom_To": "23",
            "Diem1": "9.0",
            "Diem2": "10",
            "DiemThi1": "6.0",
            "DiemThi2": "",
            "DTB": "7.7",
            "SoTC": "3",
            "NgayCongBoDTB": "2021-06-18 18:43:55",
            "NgayCongBoDiemThi1": "2021-06-18 18:43:55",
            "NgayCongBoDiemThi2": "",
            "NgayCongBoDiem1": "2021-06-18 18:43:55",
            "NgayCongBoDiem2": "2021-04-12 16:56:41",
            "Diem1_1": "9.0",
            "NgayCongBoDiem1_1": "2021-06-04 20:21:55",
            "GhiChu": ""
        */
    
        /*
            "ID": 507447,
            "MSSV": "51900790",
            "LopID": "19050402",
            "NHHK": null,
            "DTBHocKy": "8.06",
            "TCDat": "14",
            "DTBTL": "7.93",
            "TCTL": "57"
        */
    
        const readableScore = score.map((ele, i) => {
            if (i+1 == score.length) {
                if (ele == null) 
                    return `=======|  [ GPA ]  |=======\n` +
                        `----->  Không có điểm \n`;
    
                return `=======|  [ GPA ]  |=======\n` +
                    `ĐTB học kỳ: ${ ele.DTBHocKy }\n` +
                    `Tín chỉ đạt: ${ ele.TCDat }\n` +
                    `ĐTB tích luỹ: ${ ele.DTBTL }\n` +
                    `Tín chỉ tích luỹ: ${ ele.TCTL }\n`;
            }
             
            return `=======|  [ ${ i+1 } ]  |=======\n` +
                `Môn: ${ ele.TenMH
                    .replace('Những kỹ năng thiết yếu cho sự phát triển bền vững - ', '')
                    .replace('Công nghệ thông tin', 'CNTT') }\n` +
                `Mã môn: ${ ele.MonHocID }\n` +
                `Nhóm: ${ ele.Nhom_To }  |  Tín chỉ: ${ ele.SoTC }\n` +
                `QT_1: ${ ele.Diem1 }  -  QT_2: ${ ele.Diem1_1 }\n` +
                `Giữa kỳ: ${ ele.Diem2 }  -  Cuối kỳ: ${ ele.DiemThi1 }\n` +
                `----->  ĐTB: ${ ele.DTB }  <-----\n` +
                `Ghi chú: ${ (ele.GhiChu == '') ? 'không' : ele.GhiChu }\n`
        });
    
        return readableScore;
    },
    
    toScoreTotalMessage(scoreTotal) {
        if (scoreTotal.length == 0) return '';
    
        /* 
            "MSSV": "51900790",
            "MonHocID": "302053",
            "TenMH": "Pháp luật đại cương",
            "TenMH_TA": "Introduction to Laws",
            "Nhom_To": null,
            "Diem1": null,
            "Diem2": null,
            "DiemThi1": null,
            "DiemThi2": null,
            "DTB": "8.2",
            "SoTC": "2",
            "NgayCongBoDTB": null,
            "NgayCongBoDiemThi1": null,
            "NgayCongBoDiemThi2": null,
            "NgayCongBoDiem1": null,
            "NgayCongBoDiem2": null,
            "Diem1_1": null,
            "NgayCongBoDiem1_1": null,
            "GhiChu": null
        */
    
        const readableScoreTotal = scoreTotal.map((ele, i) => {        
            return `=======|  [ ${ i+1 } ]  |=======\n` +
                `Môn: ${ ele.TenMH
                    .replace('Những kỹ năng thiết yếu cho sự phát triển bền vững - ', '')
                    .replace('Công nghệ thông tin', 'CNTT') }\n` +
                `Mã môn: ${ ele.MonHocID }\n` +
                `Tín chỉ: ${ ele.SoTC }\n` +
                `----->  ĐTB: ${ ele.DTB }  <-----\n`
        });
    
        return readableScoreTotal;
    }
}
