class BagelShopsController < ApplicationController
  def index
    @bagel_shops = BagelShop.all.page(params[:page])
    gon.bagel_shops = BagelShop.all
    gon.api_key = ENV["GMAPS_API_KEY"]
  end

  def show
    @bagel_shop = BagelShop.find(params[:id])
    gon.bagel_shop = @bagel_shop

    if @bagel_shop.opening_hours.present?
      @opening_hours = @bagel_shop.opening_hours.split("\n")
    end
  end
end
