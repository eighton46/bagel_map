class BagelShop < ApplicationRecord
  serialize :photo_references, Array
  validates :name, :latitude, :longitude, :place_id, presence: true, uniqueness: true
end
