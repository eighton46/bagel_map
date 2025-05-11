require 'csv'
require 'open-uri'
API_KEY = ENV['GMAPS_API_KEY']

namespace :populate_bagelshops do
  desc 'CSVから店舗情報を取得しDBへ保存'
  task get_and_save_details: :environment do
    def get_place_id(lat, lng, shop_name)
      client = GooglePlaces::Client.new(API_KEY)
      spot = client.spots(lat, lng, name: shop_name).first
      spot&.place_id
    end

    def get_detail_data(shop)
      lng, lat = shop['WKT'].scan(/[-\d.]+/).map(&:to_f)
      shop_name = shop['名前']
      place_id = nil

      existing_shop = BagelShop.find_by(name: shop_name)
      if !existing_shop
        puts "店名からDBの店舗情報が見つかりません: #{shop_name}"
        place_id = get_place_id(lat, lng, shop_name)
        if place_id
          puts "店舗のplace_idが見つかりました: #{shop_name}, #{place_id}"
        else
          puts "⚠ place_id が見つかりません: #{shop_name}"
          return nil
        end
        existing_shop = BagelShop.find_by(place_id: place_id)
        if existing_shop
          puts "place_idからDBの店舗情報が見つかりました: #{shop_name}"
        else
          puts "place_idからDBの店舗情報が見つかりません: #{shop_name}"
        end
      else
        puts "店名からDBの店舗情報が見つかりました: #{shop_name}"
        place_id = existing_shop.place_id
      end

      if existing_shop && existing_shop.updated_at > 1.month.ago
        puts "保存済み（更新不要）: #{shop_name}"
        return nil
      end

      place_detail_query = URI.encode_www_form(
        place_id: place_id,
        language: 'ja',
        key: API_KEY
      )
      place_detail_url = "https://maps.googleapis.com/maps/api/place/details/json?#{place_detail_query}"

      begin
        place_detail_page = URI.open(place_detail_url, open_timeout: 20, read_timeout: 60).read
        place_detail_data = JSON.parse(place_detail_page)

        if !place_detail_data['result']
          puts "⚠ place_id に対する詳細情報が見つかりません: #{shop_name} (place_id: #{place_id})"
          return nil
        end
      rescue => e
        puts "⚠ API取得失敗: #{shop_name} (place_id: #{place_id}) - #{e.message}"
        raise e
      end

      result = {
        name: place_detail_data['result']['name'],
        address: place_detail_data['result']['formatted_address'].sub(/\A[^ ]+/, ''),
        latitude: place_detail_data['result']['geometry']['location']['lat'],
        longitude: place_detail_data['result']['geometry']['location']['lng'],
        place_id: place_id,
        opening_hours: place_detail_data['result']['opening_hours']&.[]('weekday_text')&.join("\n"),
        photo_references: place_detail_data['result']['photos']&.map { |p| p['photo_reference'] }&.take(5)&.join(','),
        rating: place_detail_data['result']['rating'],
        user_ratings_total: place_detail_data['result']['user_ratings_total'],
        website: place_detail_data['result']['website'],
        formatted_phone_number: place_detail_data['result']['formatted_phone_number']
      }

      [result, existing_shop]
    end

    csv_path = 'lib/bagel_shop_in_kanto.csv'
    original_lines = File.readlines(csv_path)
    updated_lines = []
    saved_count = 0
    updated_count = 0
    error_count = 0

    # コメント行以外を抽出してCSV解析用に使う
    valid_lines = original_lines.reject { |line| line.strip.start_with?('#') }
    csv = CSV.parse(valid_lines.join, headers: true)

    # 変換結果を行インデックス付きで保存
    results_by_name = {} # { "店舗名" => "処理済みCSV行（コメントアウト含む）" }

    csv.each do |row|
      shop_name = row['名前']

      begin
        shop_data, existing_shop = get_detail_data(row)

        if shop_data
          if existing_shop
            existing_shop.update!(shop_data)
            puts "☑ 更新完了: #{shop_name}"
            updated_count += 1
          else
            BagelShop.create!(shop_data)
            puts "☑ 保存完了: #{shop_name}"
            saved_count += 1
          end
        else
          puts "➡ スキップ: #{shop_name}"
        end

        results_by_name[shop_name] = row.to_csv
      rescue => e
        puts "⚠ エラー発生: #{shop_name} をコメントアウトします"
        results_by_name[shop_name] = '# ' + row.to_csv
        error_count += 1
      end

      puts "\n"
    end

    # original_linesを使って、元の構成＋処理結果を反映
    header = original_lines.first
    new_csv_lines = [header]

    original_lines[1..].each do |line|
      if line.strip.start_with?('#')
        new_csv_lines << line
        next
      end

      row = CSV.parse_line(line)
      name = row[1] # 「名前」列
      new_csv_lines << (results_by_name[name] || line) # 処理されていなければそのまま
    end

    File.write(csv_path, new_csv_lines.join)

    puts "\n処理完了"
    puts "保存件数: #{saved_count} 件"
    puts "更新件数: #{updated_count} 件"
    puts "コメントアウトされた行数: #{error_count} 行"
  end
end
