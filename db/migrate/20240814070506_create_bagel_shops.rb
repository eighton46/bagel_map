class CreateBagelShops < ActiveRecord::Migration[7.1]
  def change
    create_table :bagel_shops do |t|
      t.string :name, null: false
      t.string :address
      t.float :latitude, null: false
      t.float :longitude, null: false
      t.string :place_id, null: false
      t.string :opening_hours
      t.string :photo_reference
      t.float :rating
      t.integer :user_ratings_total
      t.string :website
      t.string :formatted_phone_number
      t.datetime :last_updated_at

      t.timestamps
    end
  end
end
