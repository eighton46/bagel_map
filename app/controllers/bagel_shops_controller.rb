class BagelShopsController < ApplicationController
  def index
    @bagel_shops = BagelShop.all
    gon.bagel_shops = @bagel_shops
    gon.api_key = ENV["GMAPS_API_KEY"]
  end
end
