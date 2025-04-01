class ApplicationController < ActionController::Base
  before_action :set_search
  add_flash_types :success, :info, :warning, :danger

  def set_search
    @q = BagelShop.ransack(params[:q])
    search_bagel_shops = @q.result(distinct: true)
    @bagel_shops = @q.result(distinct: true).page(params[:page])

    if params[:q].present?
      gon.clear # gonのキャッシュを防ぐため、明示的にリセット
      gon.search_bagel_shops = search_bagel_shops
    end

    return unless params[:search_button]

    if params[:q][:address_or_name_cont].blank? && params[:q][:rating_gteq].blank? && params[:q][:user_ratings_total_gteq].blank? # 検索フォームに入力があったら
      flash[:warning] = '検索フォームが入力されていません'
      redirect_back(fallback_location: root_path)
    elsif @bagel_shops.empty? # 検索結果がなかったら
      flash[:warning] = '検索結果が見つかりませんでした'
      redirect_back(fallback_location: root_path)
    end
  end
end
