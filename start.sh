#!/bin/sh

set ALARM_HIGH=off
set ALARM_LOW=off
set ALARM_TIMEAGO_URGENT=off
set ALARM_TIMEAGO_WARN=off
set ALARM_URGENT_HIGH=off
set ALARM_URGENT_LOW=off
set API_SECRET=7823465Oleg1
set AR2_CONE_FACTOR=2
set BASAL_RENDER=none
set CUSTOM_TITLE=Nightscout
set DEVICESTATUS_ADVANCED=true
set DISPLAY_UNITS=mmol
set ENABLE="basal bwp cage careportal cob rawbg sage iage treatmentnotify boluscalc profile delta food iob cors devicestatus upbat"
set IAGE_INFO=28700
set IAGE_URGENT=43200
set IAGE_WARN=28800
set LANGUAGE=ru
set MONGO_COLLECTION=entries
set MONGO_CONNECTION="mongodb://koloa:7823465@ds032579.mlab.com:32579/padshiy8angel"
set NIGHT_MODE=off
set PROFILE_MULTIPLE=off
set SCALE_Y=log
set SHOW_PLUGINS="careportal upbat"
set SHOW_RAWBG=never
set THEME=colors
set TIME_FORMAT=24
set UPBAT_ENABLE_ALERTS=false
set UPBAT_URGENT=20
set UPBAT_WARN=30

node server.js