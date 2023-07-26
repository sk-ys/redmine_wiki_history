class WikiHistory::Hooks < Redmine::Hook::ViewListener
  render_on :view_layouts_base_html_head, :partial => "wiki_history/base"
end