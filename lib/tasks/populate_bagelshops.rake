
require 'csv' #csvファイルを操作するライブラリの読み込み
require 'open-uri' #open-uriライブラリを読み込んでいる
API_KEY = ENV['GMAPS_API_KEY'] #.envに記述しているAPIキーを代入

namespace :populate_bagelshops do
  desc '店舗情報が記載されたCSVファイルからPlaces APIを使用して詳細情報を抽出しデータベースに格納'
  task :get_and_save_details => :environment do
    #緯度、経度、店名からplace_idを取得するメソッド
    def get_place_id(lat, lng, shop_name)
      client = GooglePlaces::Client.new(API_KEY)
      spot = client.spots(lat, lng, :name => shop_name).first
      spot.place_id if spot
    end

    #place_idから詳細情報を取得するメソッド
    def get_detail_data(shop)
      lng, lat = shop['WKT'].scan(/[-\d.]+/).map(&:to_f)
      shop_name = shop['名前']
      place_id = get_place_id(lat, lng, shop_name)

      if place_id
        existing_shop = BagelShop.find_by(place_id: place_id) # データベース内を検索
        # place_idが存在すれば保存しない
        if existing_shop
          puts "**********"
          puts "既に保存済みです: #{shop_name}"
          return nil
        end

        #クエリーパラメータの作成
        place_detail_query = URI.encode_www_form(
          place_id: place_id,
          language: 'ja',
          key: API_KEY
        )
        #PlacesAPIのエンドポイントの作成
        place_detail_url = "https://maps.googleapis.com/maps/api/place/details/json?#{place_detail_query}"
        #APIから取得したデータをテキストデータ（JSON形式）で取得し、変数に格納
        place_detail_page = URI.open(place_detail_url, open_timeout: 20, read_timeout: 60).read
        #JSON形式のデータを、Rubyオブジェクトに変換
        place_detail_data = JSON.parse(place_detail_page)

        #取得したデータを保存するカラム名と同じキー名で、ハッシュ（result）に保存
        result = {}

        # 店名
        result[:name] = place_detail_data['result']['name']

        # 住所
        full_address = place_detail_data['result']['formatted_address']
        result[:address] = full_address.sub(/\A[^ ]+/, '')

        # 緯度
        result[:latitude] = place_detail_data['result']['geometry']['location']['lat']

        # 経度
        result[:longitude] = place_detail_data['result']['geometry']['location']['lng']

        # Google Places APIの一意識別子
        result[:place_id] = place_id

        # 開店時間
        result[:opening_hours] = place_detail_data['result']['opening_hours']['weekday_text'].join("\n") if place_detail_data['result']['opening_hours'].present?

        # 写真
        photos = place_detail_data['result']['photos'] if place_detail_data['result']['photos'].present?
        photo_references = []

        if photos.present?
          photos.take(5).each do |photo|
            photo_references << photo['photo_reference']
          end
          result[:photo_references] = photo_references.join(',') # リレーションで１対多の関連付けして、新しいテーブルに格納したほうがよいかも
        else
          nil
        end

        # 評価
        result[:rating] = place_detail_data['result']['rating']

        # レビュー総数
        result[:user_ratings_total] = place_detail_data['result']['user_ratings_total']

        # WEBサイト
        result[:website] = place_detail_data['result']['website']

        # 電話番号
        result[:formatted_phone_number] = place_detail_data['result']['formatted_phone_number']

        result

      else
        puts "**********"
        puts "#{shop_name}の詳細情報が見つかりませんでした。"
        nil
      end
    end

    #csvファイルを読み込む
    csv_file = 'lib/bagel_shop_in_kanto.csv'
    #csvファイルの繰り返し処理で実行しデータベースへ保存
    CSV.foreach(csv_file, headers: true) do |row|
      shop_data = get_detail_data(row)
      if shop_data
        shop = BagelShop.create!(shop_data)
        puts "----------"
        puts "#{row['名前']}を保存しました"
        puts "----------"
      else
        puts "#{row['名前']}の保存に失敗しました"
        puts "**********"
      end
    end
  end
end
