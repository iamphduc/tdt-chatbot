# TDT Chatbot
This project is a Facebook chatbot that sends schedule and score scraped from TDTU Student Portal.

## Usage
### For those who have access to my Facebook page
Check [the screenshots below](#screenshots), especially **Help** and **Menu**.

### For those who clone this project
#### *Please remember to use it responsibly*
1. Create a ```.env``` and fill in the corresponding values.
```
PAGE_ACCESS_TOKEN=
VERIFY_TOKEN=
MSSV=
PASS=
```
2. Follow this guide: [https://developers.facebook.com/docs/messenger-platform/getting-started](https://developers.facebook.com/docs/messenger-platform/getting-started)
3. Make sure to set up Semester in ```http://localhost:5000/setting``` on your first run.

## Why did I do this project?
The main purpose is to practice scraping and make a Facebook chatbot. This app also makes my student life more convenient.

There is no harmful intention to TDTU Student Portal.

## Tool used
```Node v14.16.0``` and ```npm v6.14.11```, worth mentioning:
- request-promise 
- cheerio 
- express
- ejs

## Screenshots
Click on the image to view full size.

Help                                           | Menu                        
---------------------------------------------- | ---------------------------- 
<img src="screenshots/2_help.jpg" width=250 /> | <img src="screenshots/10_menu.jpg" width=250 />

Login                        | Week                        | Week next                        | Today
---------------------------- | --------------------------- | -------------------------------- | ------------------------------
![](screenshots/1_login.jpg) | ![](screenshots/3_week.jpg) | ![](screenshots/4_week-next.jpg) | ![](screenshots/5_weekday.jpg)

Score                        | Score all                        | Score list                        | Score -                       
---------------------------- | -------------------------------- | --------------------------------- | ----------------------------------- 
![](screenshots/6_score.jpg) | ![](screenshots/7_score-all.jpg) | ![](screenshots/8_score-list.jpg) | ![](screenshots/9_score-custom.jpg) 
