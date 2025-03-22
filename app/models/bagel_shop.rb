class BagelShop < ApplicationRecord
  validates :name, :latitude, :longitude, :place_id, presence: true, uniqueness: true

  def self.ransackable_attributes(auth_object = nil)
    ["address", "name", "rating", "user_ratings_total"]
  end

  def self.ransackable_associations(auth_object = nil)
    []
  end
end
