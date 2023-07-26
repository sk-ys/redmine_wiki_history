require_dependency File.expand_path('../lib/wiki_history/hooks.rb', __FILE__)

Redmine::Plugin.register :redmine_wiki_history do
  name 'Redmine Wiki History plugin'
  author 'sk-ys'
  description 'This is a plugin for Redmine'
  version '0.1.0'
  url 'https://github.com/sk-ys/redmine_wiki_history'
  author_url 'https://github.com/sk-ys'
end
