Rails.application.routes.draw do
  root 'static_pages#top'
  resources :bagel_shops, only: %i[index show]
end
