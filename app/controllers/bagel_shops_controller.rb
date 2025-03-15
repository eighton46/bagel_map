class BagelShopsController < ApplicationController
  def index
    # @q = BagelShop.ransack(params[:q])
    # @bagel_shops = @q.result(distinct: true).page(params[:page])

    # `reset=true` が渡されたら全店舗情報を取得し直す
    if params[:reset]
      gon.reset_button_clicked = true # JS に「リセットが押された」ことを渡す
    else
      gon.reset_button_clicked = false
    end

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
