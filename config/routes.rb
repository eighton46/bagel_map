Rails.application.routes.draw do
  root 'static_pages#top'
  resources :bagel_shops, only: %i[index show]
  get 'privacy_policy', to: 'static_pages#privacy_policy'
end
