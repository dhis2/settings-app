require "normalize-scss"
require "compass"
require "breakpoint"
require "susy"

css_dir = "app/css"
sass_dir = "app/scss"

class CSSImporter < Sass::Importers::Filesystem
  def extensions
    super.merge('css' => :scss)
  end
end
sass_options = {:filesystem_importer => CSSImporter}