# TDT Chatbot

A messenger chatbot sends timetable and score scraped from TDTU Student Portal.

## Getting started

- Messenger platform: https://developers.facebook.com/docs/messenger-platform/getting-started

- Redis in WSL: https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-redis

- File `.env` 

```
PAGE_ACCESS_TOKEN=
VERIFY_TOKEN=
REDIS_URL=
MSSV=
PASS=
```

## Running the app

```bash
# Production
$ yarn build
$ yarn start

# Development
$ yarn dev
```

_Always set up Semester in `http://localhost:5000/setting` when your server starts._

## Screenshots

| Help                                             | Menu                                              |
| ------------------------------------------------ | ------------------------------------------------- |
| <img src="public/images/2_help.jpg" width=230 /> | <img src="public/images/10_menu.jpg" width=230 /> |

| Login                          | Week                          | Week next                          | Today                            |
| ------------------------------ | ----------------------------- | ---------------------------------- | -------------------------------- |
| ![](public/images/1_login.jpg) | ![](public/images/3_week.jpg) | ![](public/images/4_week-next.jpg) | ![](public/images/5_weekday.jpg) |

| Score                          | Score overall                      | Score list                          | Score -                               |
| ------------------------------ | ---------------------------------- | ----------------------------------- | ------------------------------------- |
| ![](public/images/6_score.jpg) | ![](public/images/7_score-all.jpg) | ![](public/images/8_score-list.jpg) | ![](public/images/9_score-custom.jpg) |
