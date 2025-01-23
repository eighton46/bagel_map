class ApplicationController < ActionController::Base
  before_action :set_search
  add_flash_types :success, :info, :warning, :danger

  def set_search
    @q = BagelShop.ransack(params[:q])
    @bagel_shops = @q.result(distinct: true).page(params[:page])

    return unless params[:search_button]

    if params[:q].present? && params[:q][:address_or_name_cont].blank?
      flash[:warning] = '検索ワードが入力されていません'
      redirect_back(fallback_location: root_path)
    elsif @bagel_shops.empty?
      flash[:warning] = '検索結果が見つかりませんでした'
      redirect_back(fallback_location: root_path)
    end

    gon.search_bagel_shops = @bagel_shops if params[:q].present?
  end
end
