Rails.application.routes.draw do
  root 'static_pages#top'
  resources :bagel_shops, only: %i[index show]
  get 'privacy_policy', to: 'static_pages#privacy_policy'
  get 'terms_of_use', to: 'static_pages#terms_of_use'
  get 'search', to: 'application#set_search'
end
