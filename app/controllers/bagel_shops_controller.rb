class BagelShopsController < ApplicationController
  def index
    @bagel_shops = BagelShop.all.page(params[:page])
    gon.bagel_shops = @bagel_shops
    gon.api_key = ENV["GMAPS_API_KEY"]
  end
end
