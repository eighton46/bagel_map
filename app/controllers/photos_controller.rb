require 'open-uri'

class PhotosController < ApplicationController
  def show
    photo_reference = params[:ref]

    url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photo_reference=#{photo_reference}&key=#{ENV['GMAPS_API_KEY']}"

    begin
      image = URI.open(url)

      # 30日の間、キャッシュに保持する
      expires_in 30.days, public: true

      send_data image.read, type: image.content_type, disposition: 'inline'

    rescue OpenURI::HTTPError => e
      # エラーログを出力
      Rails.logger.error "Photo API error: #{e.message}"
      Rails.logger.error "URL attempted: #{url}"

      # 30日の間、キャッシュに保持する
      expires_in 30.days, public: true

      # 代替画像を表示
      fallback_path = Rails.root.join('public', 'images', 'no_image.jpg')
      send_file fallback_path, type: 'image/jpg', disposition: 'inline'
    end
  end
end
