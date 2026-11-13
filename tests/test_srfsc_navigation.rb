require 'yaml'
require 'liquid'

# Run with bundle exec ruby tests/test_srfsc_navigation.rb.
class SrfscNavigationTest
  module UrlFilters
    def relative_url(path)
      "#{@context.registers[:baseurl]}#{path}"
    end
  end
  Liquid::Template.register_filter(UrlFilters)

  def assert_includes(html, value)
    raise "Missing #{value}" unless html.include?(value)
  end

  def refute_includes(html, value)
    raise "Unexpected #{value}" if html.include?(value)
  end

  def setup
    @root = File.expand_path('..', __dir__)
    @config = YAML.load_file(File.join(@root, '_config.yml'))
    @template = Liquid::Template.parse(File.read(File.join(@root,
      '_projects/systems/srfsc/navigation/srfsc-nav.html')), error_mode: :strict)
  end

  def render(baseurl = '')
    @template.render!({'site' => @config, 'include' => {'active' => 'events'}},
      registers: {baseurl: baseurl})
  end

  def test_links_keep_baseurl_and_active_state
    html = render('/capstone2pages')
    assert_includes html, 'href="/capstone2pages/capstone/srfsc/app/events/" aria-current="page"'
    assert_includes html, 'Calendar &amp; Map'
    assert_includes html, 'data-profile-url="/capstone2pages/capstone/srfsc/app/profile/"'
    refute_includes html, '>Kanban</a>'
  end

  def test_config_changes_labels_destinations_and_kanban
    @config['srfsc_navigation']['links'] = [{'title' => 'Our activities', 'path' => 'activities/', 'active' => 'events'}]
    @config['srfsc_navigation']['kanban']['url'] = 'https://github.com/orgs/example/projects/1'
    html = render
    assert_includes html, 'href="/capstone/srfsc/app/activities/" aria-current="page">Our activities</a>'
    assert_includes html, 'href="https://github.com/orgs/example/projects/1" target="_blank" rel="noopener noreferrer">Kanban</a>'
    refute_includes html, 'Calendar &amp; Map'
  end
end

%w[test_links_keep_baseurl_and_active_state test_config_changes_labels_destinations_and_kanban].each do |name|
  test = SrfscNavigationTest.new
  test.setup
  test.public_send(name)
  puts "PASS #{name}"
end
