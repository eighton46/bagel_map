class ApplicationController < ActionController::Base
  before_action :set_search

  def set_search
    @q = BagelShop.ransack(params[:q])
    @bagel_shops = @q.result(distinct: true).page(params[:page])
  end
end
