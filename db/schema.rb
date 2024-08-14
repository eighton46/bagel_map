# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_08_14_070506) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "bagel_shops", force: :cascade do |t|
    t.string "name", null: false
    t.string "address"
    t.float "latitude", null: false
    t.float "longitude", null: false
    t.string "place_id", null: false
    t.string "opening_hours"
    t.string "photo_reference"
    t.float "rating"
    t.integer "user_ratings_total"
    t.string "website"
    t.string "formatted_phone_number"
    t.datetime "last_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
