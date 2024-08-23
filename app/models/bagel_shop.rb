class BagelShop < ApplicationRecord
  validates :name, :latitude, :longitude, :place_id, presence: true, uniqueness: true
end
