#!/usr/bin/env ruby
require 'csv'
require 'json'
require 'spreadsheet'

def parse_election_results
  dump_dir = './election-data'
  parties  = ['gop', 'dem', 'lib', 'grn', 'npd', 'jp', 'psl']

  json = {}

  Dir.foreach(dump_dir) do |file|
    next if file[0] == '.'

    CSV.foreach(File.join(dump_dir, file), :col_sep => ';') do |row|
      row.map!{|c| c.nil? ? nil : c.downcase }

      next unless row[1] == 'p' && row[3] != '0'
      county_code = row[3].to_i

      json[county_code] = {}

      parties.each do |party|
        i = row.index(party)
        if i
          json[county_code][party] = (row[i + 1] || 0).to_i
        else
          json[county_code][party] = 0
        end
      end

    end
  end

  File.write("2012-election.json", json.to_json)
end


def parse_poverty_data()
  dump_dir = './poverty-data'
  json = {}

  Dir.foreach(dump_dir) do |file|
    next if file[0] == '.'

    sheet = Spreadsheet.open(File.join(dump_dir, file)).worksheet(0)
    parse_state = :search
    sheet.each do |row|
      next  if row[0] == nil && parse_state == :search
      break if row[0] == nil && parse_state == :consume

      case parse_state
      when :search
        next if row[0] == nil
        parse_state = :consume if row[0] == 'FIPS*'
      when :consume
        break if row[0] == nil
        id = row[0].to_i
        json[id] = row[6].to_f
      end
    end

  end

  File.write('2010-poverty.json', json.to_json)
end


def parse_race_data
  dump = './race-data/DEC_00_PL_QTPL_with_ann.csv'
  json = {}

  c2i = lambda do |cell|
    rc = cell.bytes.reduce(0) do |total, c|
      total *= 26;
      total += (c - 'A'.bytes.first + 1)
    end

    rc - 1
  end

  # CB - Two or more races
  # BX - Other
  # BT - Native Hawaiian / Pacific Islander
  # BP - Asian
  # BL - American Indian / Alaskan Native
  # BH - Black / African American
  # BD - White
  # AR - Hispanic / Latino
  map = {
    'AR' => 'hispanic',
    'BD' => 'white',
    'BH' => 'black',
    'BL' => 'native',
    'BP' => 'asian',
    'BT' => 'hawaiian',
    'BX' => 'other',
    'CB' => 'multi'
  }

  row_count = 0;
  CSV.foreach(dump) do |row|
    fips = row[1].to_i
    json[fips] = {}

    if row_count > 1
      map.each do |k, v|
        json[fips][v] = row[c2i.(k)].to_i
      end
    end
    row_count += 1

  end

  File.write("2000-race.json", json.to_json)
end

parse_election_results()
parse_poverty_data()
parse_race_data
