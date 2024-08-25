class BagelShopsController < ApplicationController
  def index
    @bagel_shops = BagelShop.all
    gon.bagel_shops = @bagel_shops
  end
end
