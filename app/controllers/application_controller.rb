class ApplicationController < ActionController::Base
  before_action :set_search

  def set_search
    @q = BagelShop.ransack(params[:q])
    @bagel_shops = @q.result(distinct: true).page(params[:page])
    gon.search_bagel_shops = @bagel_shops
  end
end
