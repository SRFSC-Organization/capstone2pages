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
    # Tests cover the standalone council nav (sidebar, Sign in inside it), not the live setting.
    @config['srfsc_navigation']['placement'] = 'sidebar'
    @config['srfsc_navigation'].delete('header_links')
    @config['srfsc_navigation'].delete('replace_site_header')
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

  def test_top_bar_can_replace_site_header
    @config['srfsc_navigation']['placement'] = 'top'
    @config['srfsc_navigation']['header_links'] = [{'title' => 'About', 'path' => 'about/'}]
    refute_includes render, 'id="srfsc-nav-account"'
    @config['srfsc_navigation']['replace_site_header'] = true
    html = render
    assert_includes html, 'srfsc-nav--replaces-header'
    assert_includes html, 'id="srfsc-nav-account"'
  end

  def test_section_sidebar_follows_config
    assert_includes render, 'data-srfsc-sections hidden'
    assert_includes render, 'aria-label="On this page"'
    @config['srfsc_navigation']['sections']['enabled'] = false
    refute_includes render, 'data-srfsc-sections'
  end

  def test_site_header_shows_header_links_and_srfsc_login
    header = Liquid::Template.parse(File.read(File.join(@root, '_includes/themes/minima/header.html')))
    config = YAML.load_file(File.join(@root, '_config.yml'))
    config['pages'] = [{'title' => 'Blog', 'path' => 'navigation/blog.md', 'url' => '/blog'}]
    html = header.render!({'site' => config, 'page' => {'url' => '/capstone/srfsc/app/events/'}},
      registers: {baseurl: ''})
    links = config['srfsc_navigation']['header_links']
    raise "Top bar has #{links.size} links; keep it to 4 plus Login" if links.size > 4
    assert_includes html, 'href="/capstone/srfsc/app/events/" aria-current="page">Calendar &amp; Map</a>'
    assert_includes html, 'id="loginArea" href="/capstone/srfsc/app/login/"'
    assert_includes html, '>Login</a>'
    # Signed in, srfscNav.js shows the member's name linking here: the settings page.
    assert_includes html, 'data-profile-url="/capstone/srfsc/app/settings/"'
    refute_includes html, '>Blog</a>'
    refute_includes html, 'assets/js/api/login.js'
    # SRFSC brand replaces the OCS logo: text mark by default, logo image once one is configured.
    config['srfsc_navigation']['logo'] = ''
    html = header.render!({'site' => config, 'page' => {}}, registers: {baseurl: ''})
    assert_includes html, 'class="srfsc-brand__name">SRFSC</span>'
    refute_includes html, '/images/logo.png'
    config['srfsc_navigation']['logo'] = '/images/srfsc/logo.png'
    html = header.render!({'site' => config, 'page' => {}}, registers: {baseurl: ''})
    assert_includes html, 'src="/images/srfsc/logo.png" alt="SRFSC logo"'
    refute_includes html, 'srfsc-brand__name'
  end

  def test_settings_page_has_account_and_every_preference_control
    page = File.read(File.join(@root, '_projects/systems/srfsc/navigation/settings.md'))
    assert_includes page, 'permalink: /capstone/srfsc/app/settings/'
    assert_includes page, 'id="srfsc-settings-display-name"'
    assert_includes page, '{% include projects/srfsc/srfsc-preferences.html %}'
    panel = File.read(File.join(@root, '_projects/systems/srfsc/navigation/srfsc-preferences.html'))
    # preferences.js reads every one of these by id and fails if one is missing.
    %w[pref-bg-color pref-text-color pref-accent-color pref-selection-color pref-font-family pref-font-size
       font-size-label pref-button-style pref-language pref-tts-voice pref-tts-rate pref-tts-pitch pref-tts-volume
       tts-rate-label tts-pitch-label tts-volume-label tts-test-btn tts-test-text save-preferences restore-styles
       preferences-status preset-themes custom-themes new-theme-name save-theme-btn
       pref-head-tracking-enabled].each { |id| assert_includes panel, %(id="#{id}") }
    refute_includes panel, 'id="ai-theme-form"'
  end

  def test_placement_switches_between_sidebar_and_top_bar
    assert_includes render, '<nav class="srfsc-nav srfsc-nav--sidebar"'
    @config['srfsc_navigation']['placement'] = 'top'
    html = render
    assert_includes html, '<nav class="srfsc-nav" aria-label'
    refute_includes html, 'srfsc-nav--sidebar'
    @config['srfsc_navigation']['placement'] = 'header'
    refute_includes render, '<nav class="srfsc-nav'
  end
end

%w[test_links_keep_baseurl_and_active_state test_config_changes_labels_destinations_and_kanban
   test_placement_switches_between_sidebar_and_top_bar test_top_bar_can_replace_site_header
   test_section_sidebar_follows_config test_site_header_shows_header_links_and_srfsc_login
   test_settings_page_has_account_and_every_preference_control].each do |name|
  test = SrfscNavigationTest.new
  test.setup
  test.public_send(name)
  puts "PASS #{name}"
end
