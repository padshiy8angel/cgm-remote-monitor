#!/bin/sh

ALARM_HIGH=off export ALARM_HIGH
ALARM_LOW=off export ALARM_LOW
ALARM_TIMEAGO_URGENT=off export ALARM_TIMEAGO_URGENT
ALARM_TIMEAGO_WARN=off export ALARM_TIMEAGO_WARN
ALARM_URGENT_HIGH=off export ALARM_URGENT_HIGH
ALARM_URGENT_LOW=off export ALARM_URGENT_LOW
API_SECRET=7823465Oleg1 export API_SECRET
AR2_CONE_FACTOR=2 export AR2_CONE_FACTOR
BASAL_RENDER=none export BASAL_RENDER
CUSTOM_TITLE=Nightscout export CUSTOM_TITLE
DEVICESTATUS_ADVANCED=true export DEVICESTATUS_ADVANCED
DISPLAY_UNITS=mmol export DISPLAY_UNITS
ENABLE="basal bwp cage careportal cob rawbg sage iage treatmentnotify boluscalc profile delta food iob cors devicestatus upbat" export ENABLE
IAGE_INFO=28700 export IAGE_INFO
IAGE_URGENT=43200 export IAGE_URGENT
IAGE_WARN=28800 export IAGE_WARN
LANGUAGE=ru export LANGUAGE
MONGO_COLLECTION=entries export MONGO_COLLECTION
MONGO_CONNECTION="mongodb://koloa:7823465@ds032579.mlab.com:32579/padshiy8angel" export MONGO_CONNECTION
NIGHT_MODE=off export NIGHT_MODE
PROFILE_MULTIPLE=off export PROFILE_MULTIPLE
SCALE_Y=log export SCALE_Y
SHOW_PLUGINS="careportal upbat" export SHOW_PLUGINS
SHOW_RAWBG=never export SHOW_RAWBG
THEME=colors export THEME
TIME_FORMAT=24 export TIME_FORMAT
UPBAT_ENABLE_ALERTS=false export UPBAT_ENABLE_ALERTS
UPBAT_URGENT=20 export UPBAT_URGENT
UPBAT_WARN=30 export UPBAT_WARN

node server.js