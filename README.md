# TDT Chatbot
This project is a Facebook chatbot which replies to predefined messages. 

It first scrapes data from Student Portal and then sends them to user through a Facebook page.

The page has been turned off for private use only. So sadly you can't find it!

## Purpose
The main purpose is to practice scraping and make a Facebook chatbot. There is no harmful intention to Student Portal.

## Usage
### For those who have access to my Facebook page
Check [the screenshots below](#screenshots), especially the **Help** one.

### For those who clone this project
1. Make sure to set up the Semester in the ```/setting``` page on your first run.
2. Create a ```.env``` file which contains ```PAGE_ACCESS_TOKEN=```, ```VERIFY_TOKEN=```, ```MSSV=```, ```PASS=```.
3. Create a Facebook page.
4. Use *ngrok* to run app locally or you can deploy on *heroku*.

Checkout this guide: [https://developers.facebook.com/docs/messenger-platform/getting-started/sample-experience](https://developers.facebook.com/docs/messenger-platform/getting-started/sample-experience)

## Tool used
```Node v14.16.0``` and ```npm v6.14.11```, others:
- request-promise 
- cheerio 
- express
- ejs

## Screenshots

Login                        | Help&nbsp;                  | Week                        | Week next                        | Today
---------------------------- | --------------------------- | --------------------------- | -------------------------------- | ------------------------------
![](screenshots/1_login.jpg) | ![](screenshots/2_help.jpg) | ![](screenshots/3_week.jpg) | ![](screenshots/4_week-next.jpg) | ![](screenshots/5_weekday.jpg)

Score                        | Score all                        | Score all                        | Score -&nbsp;                       | Score -&nbsp;
---------------------------- | -------------------------------- | -------------------------------- | ----------------------------------- | -----------------------------------
![](screenshots/6_score.jpg) | ![](screenshots/7_score-all.jpg) | ![](screenshots/8_score-all.jpg) | ![](screenshots/9_score-custom.jpg) | ![](screenshots/10_score-custom.jpg)
