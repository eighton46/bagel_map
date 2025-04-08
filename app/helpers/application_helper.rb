module ApplicationHelper
  def page_title(title = '')
    base_title = 'Bagel Map'
    title.present? ? "#{title} | #{base_title}" : base_title
  end

  def default_meta_tags
    {
      site: 'BagelMap',
      title: 'ベーグル専門店がすぐ見つかる地図検索アプリ',
      reverse: true,
      charset: 'utf-8',
      description: 'BagelMapを使えば、美味しいベーグル専門店を地図上から簡単に検索できます。現在地から探す機能も搭載！',
      keywords: 'ベーグル,ベーグル専門店,パン屋,地図検索,現在地検索,東京,グルメ',
      canonical: request.original_url,
      separator: '|',
      og: {
        site_name: :site,
        title: :title,
        description: :description,
        type: 'website',
        url: request.original_url,
        image: image_url('ogp_bagel.png'),
        locale: 'ja_JP'
      },
      twitter: {
        card: 'summary_large_image',
        # site: '@', # Twitterアカウントがあれば記載
        image: image_url('ogp_bagel.png')
      }
    }
  end
end
