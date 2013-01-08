#!/usr/bin/env bash

STATES="AK AL AR AZ CA CO CT DC DE FL GA HI IA ID IL IN KS KY LA MA MD ME MI MN MO MS MT NC ND NE NH NJ NM NV NY OH OK OR PA RI SC SD TN TX UT VA VT WA WI WV WY"
STATE_FIPS="01 02 04 05 06 08 09 10 11 12 13 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 44 45 46 47 48 49 50 51 53 54 55 56"

# election data
for state in $STATES ; do
  if [ ! -f "election-data/$state" ]; then
    wget "http://www.politico.com/mapdata/2012/$state.xml?cachebuster=20121111" -O "election-data/$state"
  fi
done

# poverty data
for fips in $STATE_FIPS ; do
  if [ ! -f "poverty-data/$fips" ]; then
    wget "http://www.ers.usda.gov/ReportExport.aspx?reportPath=/State_Fact_Sheets/PovertyReport&stat_year=2010&stat_type=0&fips_st=$fips&exportType=EXCEL&exportName=PovertyReport" -O "poverty-data/$fips"
  fi
done
